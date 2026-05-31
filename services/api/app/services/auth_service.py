from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import hash_password, validate_password_strength, verify_password
from app.db.models import OAuthAccount, PasswordCredential, User


def normalize_email(email: str) -> str:
    return email.strip().lower()


async def create_user_with_password(
    db: AsyncSession, *, email: str, password: str, name: str | None
) -> User:
    normalized_email = normalize_email(email)
    try:
        validate_password_strength(password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    existing = await db.execute(select(User).where(User.email == normalized_email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account already exists")

    user = User(email=normalized_email, name=name, tier="free", status="active")
    db.add(user)
    await db.flush()
    db.add(PasswordCredential(user_id=user.id, password_hash=hash_password(password)))
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_with_password(db: AsyncSession, *, email: str, password: str) -> User:
    normalized_email = normalize_email(email)
    result = await db.execute(
        select(User)
        .options(selectinload(User.password_credential))
        .where(User.email == normalized_email, User.status == "active")
    )
    user = result.scalar_one_or_none()
    if not user or not user.password_credential:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not verify_password(password, user.password_credential.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user.last_login_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(user)
    return user


async def get_or_create_google_user(
    db: AsyncSession,
    *,
    google_sub: str,
    email: str,
    name: str | None,
    avatar_url: str | None,
    email_verified: bool,
) -> User:
    normalized_email = normalize_email(email)

    result = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == "google", OAuthAccount.provider_subject == google_sub
        )
    )
    oauth_account = result.scalar_one_or_none()
    if oauth_account:
        user_result = await db.execute(select(User).where(User.id == oauth_account.user_id))
        user = user_result.scalar_one()
        user.last_login_at = datetime.now(UTC)
        await db.commit()
        await db.refresh(user)
        return user

    user_result = await db.execute(select(User).where(User.email == normalized_email))
    user = user_result.scalar_one_or_none()
    if not user:
        user = User(
            email=normalized_email,
            name=name,
            avatar_url=avatar_url,
            tier="free",
            status="active",
            email_verified_at=datetime.now(UTC) if email_verified else None,
            last_login_at=datetime.now(UTC),
        )
        db.add(user)
        await db.flush()
    else:
        user.name = user.name or name
        user.avatar_url = user.avatar_url or avatar_url
        user.last_login_at = datetime.now(UTC)
        if email_verified and not user.email_verified_at:
            user.email_verified_at = datetime.now(UTC)

    db.add(
        OAuthAccount(
            user_id=user.id,
            provider="google",
            provider_subject=google_sub,
            email=normalized_email,
        )
    )
    await db.commit()
    await db.refresh(user)
    return user

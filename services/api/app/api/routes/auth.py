import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_session_token
from app.db.models import User
from app.db.session import get_db
from app.schemas.auth import LoginRequest, SignupRequest, UserResponse
from app.services.auth_service import (
    authenticate_with_password,
    create_user_with_password,
    get_or_create_google_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def user_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        tier=user.tier,
        status=user.status,
        emailVerified=bool(user.email_verified_at),
    )


def set_session_cookie(response: Response, user: User) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=create_session_token(user.id),
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.session_expire_minutes * 60,
    )


def set_oauth_state_cookie(response: Response, state: str) -> None:
    response.set_cookie(
        key="valenix_oauth_state",
        value=state,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=600,
    )


@router.post("/signup", response_model=UserResponse)
async def signup(payload: SignupRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user = await create_user_with_password(
        db, email=payload.email, password=payload.password, name=payload.name
    )
    set_session_cookie(response, user)
    return user_response(user)


@router.post("/login", response_model=UserResponse)
async def login(payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user = await authenticate_with_password(db, email=payload.email, password=payload.password)
    set_session_cookie(response, user)
    return user_response(user)


@router.get("/google/start")
async def google_start():
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth is not configured.",
        )

    state = secrets.token_urlsafe(32)
    params = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "online",
            "prompt": "select_account",
        }
    )
    response = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")
    set_oauth_state_cookie(response, state)
    return response


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    expected_state = request.cookies.get("valenix_oauth_state")
    if not code or not state or not expected_state or state != expected_state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth is not configured.",
        )

    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_response.raise_for_status()
        access_token = token_response.json()["access_token"]

        userinfo_response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        userinfo_response.raise_for_status()
        profile = userinfo_response.json()

    user = await get_or_create_google_user(
        db,
        google_sub=profile["sub"],
        email=profile["email"],
        name=profile.get("name"),
        avatar_url=profile.get("picture"),
        email_verified=bool(profile.get("email_verified")),
    )
    destination = "/chat" if user.status == "active" else "/waitlist"
    response = RedirectResponse(f"{settings.frontend_origin}{destination}")
    response.delete_cookie("valenix_oauth_state")
    set_session_cookie(response, user)
    return response


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return user_response(user)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(settings.session_cookie_name)
    return {"ok": True}

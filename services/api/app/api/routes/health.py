from fastapi import APIRouter, HTTPException, status
from redis.exceptions import RedisError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text

from app.core.redis import redis_client
from app.db.session import SessionLocal

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthz():
    return {"ok": True}


@router.get("/readyz")
async def readyz():
    checks = {"postgres": "ok", "redis": "ok"}
    try:
        async with SessionLocal() as session:
            await session.execute(text("select 1"))
    except SQLAlchemyError as exc:
        checks["postgres"] = "error"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={**checks, "error": str(exc)},
        ) from exc

    try:
        await redis_client.ping()
    except RedisError as exc:
        checks["redis"] = "error"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={**checks, "error": str(exc)},
        ) from exc

    return {"ok": True, "postgres": "ok", "redis": "ok"}

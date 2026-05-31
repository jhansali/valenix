from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Valenix"
    environment: str = "development"
    frontend_origin: str = "http://localhost:3000"
    database_url: str = "postgresql+asyncpg://valenix:valenix@localhost:5432/valenix"
    redis_url: str = "redis://localhost:6379/0"
    session_secret: str = "change-me"
    session_cookie_name: str = "valenix_session"
    session_expire_minutes: int = 60 * 24 * 7
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"
    ollama_base_url: str = ""
    ollama_model: str = "llama3.1:8b"
    ollama_timeout_seconds: float = 120.0

    model_config = SettingsConfigDict(env_file=(".env", "../../.env"), extra="ignore")


settings = Settings()

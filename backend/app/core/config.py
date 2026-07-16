from pydantic import BaseSettings


class Settings(BaseSettings):
    project_name: str = "SentinelAI"
    api_version: str = "v1"
    env_name: str = "development"
    debug: bool = True
    allowed_hosts: list[str] = ["*"]
    cors_origins: list[str] = ["*"]
    database_url: str = "sqlite:///./sentinelai.db"
    secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

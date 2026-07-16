import logging


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    logging.getLogger("uvicorn").handlers = logging.getLogger().handlers
    logging.getLogger("uvicorn.access").handlers = logging.getLogger().handlers

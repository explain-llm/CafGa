from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from src.rest import controller
from src.rest import study_controller
from src.services import setup_service
import logging
app = FastAPI(
    title="CafGa",
    description="Custom Assignments For Grouped Attributions",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://0.0.0.0:5173",
        "http://localhost:5173",
        "http://0.0.0.0:3000",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://cafga.ivia.ch",
        "http://backend.cafga.ivia.ch",
        "https://cafga.ivia.ch",
        "https://backend.cafga.ivia.ch",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(controller.router)
app.include_router(controller.health_router)
app.include_router(study_controller.router)


class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.getMessage().find("/health/") == -1 or record.getMessage().find(
            "/health"
        ) == -1


# Filter out /health
logging.getLogger("uvicorn.access").addFilter(EndpointFilter())

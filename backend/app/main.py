import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import meals

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

app = FastAPI(
    title="Meal Calendar API",
    description="API for managing weekly meal plans",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meals.router)


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

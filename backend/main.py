from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import config
from database import db
from routes.auth import router as auth_router
from routes.resume import router as resume_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    await db.connect()
    logger.info("Connected to database")

    yield

    # Shutdown
    await db.disconnect()
    logger.info("Disconnected from database")

# Create the main app
app = FastAPI(
    title="Resume Cleaner API",
    description="API for cleaning and processing resumes using AI",
    version="1.0.0",
    lifespan=lifespan
)

# Create a router with the /api prefix
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

# Include route modules
api_router.include_router(auth_router)
api_router.include_router(resume_router)

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=config.CORS_ORIGINS.split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Resume Cleaner API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
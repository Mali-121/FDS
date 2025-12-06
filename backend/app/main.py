from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import products
from app.db import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="High-Performance Data Table API",
    description="FastAPI backend for product data management",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router)


@app.get("/")
async def root():
    return {"message": "High-Performance Data Table API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}



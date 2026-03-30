from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
from routes import api

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stock Data Intelligence Dashboard API",
    description="API for collecting, processing and serving stock data",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Stock Data API"}

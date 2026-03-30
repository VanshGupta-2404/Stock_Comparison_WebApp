from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from models import schemas
from database.db import get_db
from services import stock_service
import cachetools.func
import pandas as pd
import math

router = APIRouter()

@cachetools.func.ttl_cache(maxsize=128, ttl=60 * 60)
def get_companies_cached():
    return stock_service.get_available_companies()

@router.get("/companies", response_model=List[str])
def get_companies():
    """Return list of available stock symbols"""
    return get_companies_cached()

@router.get("/data/{symbol}", response_model=List[schemas.StockDataResponse])
def get_stock_data(
    symbol: str, 
    days: int = Query(30, description="Number of days to fetch"), 
    db: Session = Depends(get_db)
):
    """Return last {days} days stock data"""
    if symbol not in stock_service.AVAILABLE_SYMBOLS:
        raise HTTPException(status_code=404, detail="Symbol not found")
        
    df = stock_service.get_stock_data(symbol, db, days=days)
    if df.empty:
        raise HTTPException(status_code=404, detail="Data not found for symbol")
        
    records = df.to_dict(orient="records")
    # Clean up any NaN or Infinity values that might cause JSON serialization errors
    for record in records:
        for key, value in record.items():
            if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
                record[key] = None
    return records

@router.get("/summary/{symbol}", response_model=schemas.SummaryResponse)
def get_stock_summary(symbol: str, db: Session = Depends(get_db)):
    """Return 52-week metrics and average closing price"""
    if symbol not in stock_service.AVAILABLE_SYMBOLS:
        raise HTTPException(status_code=404, detail="Symbol not found")
        
    summary = stock_service.get_summary(symbol, db)
    if not summary:
        raise HTTPException(status_code=404, detail="Data not found for symbol")
        
    return summary

@router.get("/compare", response_model=schemas.ComparisonResponse)
def compare_stocks(symbol1: str, symbol2: str, db: Session = Depends(get_db)):
    """Compare two stocks (returns, trends)"""
    print(f"Compare API hit: {symbol1}, {symbol2}")
    if symbol1 not in stock_service.AVAILABLE_SYMBOLS or symbol2 not in stock_service.AVAILABLE_SYMBOLS:
        raise HTTPException(status_code=404, detail="One or more symbols not found")
        
    comparison = stock_service.get_comparison(symbol1, symbol2, db)
    if not comparison:
        raise HTTPException(status_code=404, detail="Unable to compare symbols")
        
    return comparison

@router.get("/predict/{symbol}", response_model=schemas.MLPredictionResponse)
def predict_stock(symbol: str, db: Session = Depends(get_db)):
    """Basic ML prediction for next day"""
    if symbol not in stock_service.AVAILABLE_SYMBOLS:
        raise HTTPException(status_code=404, detail="Symbol not found")
        
    prediction = stock_service.predict_stock_price(symbol, db)
    return {
        "symbol": symbol,
        "predicted_next_close": prediction
    }

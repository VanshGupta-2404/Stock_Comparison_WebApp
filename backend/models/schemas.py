from pydantic import BaseModel
from datetime import date
from typing import List, Optional, Dict, Any

class StockDataResponse(BaseModel):
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: int
    daily_return: Optional[float] = None
    seven_day_ma: Optional[float] = None

class SummaryResponse(BaseModel):
    symbol: str
    fifty_two_week_high: float
    fifty_two_week_low: float
    average_closing_price: float

class ComparisonItem(BaseModel):
    symbol: str
    volatility: float
    trend: str

class ComparisonResponse(BaseModel):
    comparison: Dict[str, ComparisonItem]

class MLPredictionResponse(BaseModel):
    symbol: str
    predicted_next_close: float

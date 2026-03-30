import yfinance as yf
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any
from models.sql_models import StockData
from sklearn.linear_model import LinearRegression

AVAILABLE_SYMBOLS = ["INFY.NS", "TCS.NS", "RELIANCE.NS", "AAPL", "MSFT", "GOOGL", "AMZN"]

def get_available_companies() -> List[str]:
    return AVAILABLE_SYMBOLS

def fetch_and_store_data(symbol: str, db: Session, days: int = 365):
    """Fetches data from yfinance, processes it, and stores it in SQLite."""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    ticker = yf.Ticker(symbol)
    df = ticker.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))
    
    if df.empty:
        return
    
    df = df.ffill().bfill()
    df.reset_index(inplace=True)
    
    for _, row in df.iterrows():
        record_date = row['Date'].date() if hasattr(row['Date'], 'date') else row['Date']
        
        existing = db.query(StockData).filter_by(symbol=symbol, date=record_date).first()
        if not existing:
            new_record = StockData(
                symbol=symbol,
                date=record_date,
                open=float(row['Open']),
                high=float(row['High']),
                low=float(row['Low']),
                close=float(row['Close']),
                volume=int(row['Volume'])
            )
            db.add(new_record)
    
    db.commit()

def calculate_metrics(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    df['daily_return'] = (df['close'] - df['open']) / df['open']
    df['seven_day_ma'] = df['close'].rolling(window=7).mean()
    # Replace NaN with None for JSON serialization
    df = df.replace({np.nan: None})
    return df

def get_stock_data(symbol: str, db: Session, days: int = 30) -> pd.DataFrame:
    fetch_and_store_data(symbol, db, days=400)
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    records = db.query(StockData).filter(
        StockData.symbol == symbol,
    ).order_by(StockData.date.asc()).all()
    
    if not records:
        return pd.DataFrame()
        
    df = pd.DataFrame([{
        "date": r.date,
        "open": r.open,
        "high": r.high,
        "low": r.low,
        "close": r.close,
        "volume": r.volume
    } for r in records])
    
    df = calculate_metrics(df)
    
    # Filter only the requested days for return
    df = df[df['date'] >= start_date]
    return df

def get_summary(symbol: str, db: Session) -> Dict[str, Any]:
    df = get_stock_data(symbol, db, days=365)
    if df.empty:
        return {}
    
    recent_365 = df
    
    high_52 = float(recent_365['high'].max())
    low_52 = float(recent_365['low'].min())
    avg_close = float(recent_365['close'].mean())
    
    return {
        "symbol": symbol,
        "fifty_two_week_high": high_52,
        "fifty_two_week_low": low_52,
        "average_closing_price": avg_close
    }

def get_comparison(symbol1: str, symbol2: str, db: Session) -> Dict[str, Any]:
    df1 = get_stock_data(symbol1, db, days=90)
    df2 = get_stock_data(symbol2, db, days=90)
    
    if df1.empty or df2.empty:
        return {}
        
    volatility1 = float(df1['daily_return'].std()) if len(df1) > 1 else 0.0
    volatility2 = float(df2['daily_return'].std()) if len(df2) > 1 else 0.0
    
    trend1 = "Upward" if float(df1['close'].iloc[-1]) > float(df1['close'].iloc[0]) else "Downward"
    trend2 = "Upward" if float(df2['close'].iloc[-1]) > float(df2['close'].iloc[0]) else "Downward"

    return {
        "comparison": {
            symbol1: {
                "symbol": symbol1,
                "volatility": volatility1,
                "trend": trend1
            },
            symbol2: {
                "symbol": symbol2,
                "volatility": volatility2,
                "trend": trend2
            }
        }
    }

def predict_stock_price(symbol: str, db: Session) -> float:
    df = get_stock_data(symbol, db, days=90)
    if df.empty or len(df) < 5:
        return 0.0
        
    df['Day_Index'] = np.arange(len(df))
    X = df[['Day_Index']]
    y = df['close']
    
    model = LinearRegression()
    model.fit(X, y)
    
    next_day = pd.DataFrame([[len(df)]], columns=['Day_Index'])
    pred = model.predict(next_day)
    return float(pred[0])

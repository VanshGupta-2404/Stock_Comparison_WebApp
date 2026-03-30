from sqlalchemy import Column, Integer, String, Float, Date, UniqueConstraint
from database.db import Base

class StockData(Base):
    __tablename__ = "stock_data"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    date = Column(Date, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Integer)

    __table_args__ = (UniqueConstraint('symbol', 'date', name='uq_symbol_date'),)

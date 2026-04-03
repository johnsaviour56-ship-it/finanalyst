from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/finanalyst")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class FinancialRecord(Base):
    __tablename__ = "financial_records"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    year = Column(Integer)
    # Income Statement
    revenue = Column(Float)
    cost_of_goods_sold = Column(Float)
    gross_profit = Column(Float)
    operating_expenses = Column(Float)
    ebit = Column(Float)
    interest_expense = Column(Float)
    net_income = Column(Float)
    # Balance Sheet
    total_assets = Column(Float)
    current_assets = Column(Float)
    current_liabilities = Column(Float)
    total_liabilities = Column(Float)
    total_equity = Column(Float)
    inventory = Column(Float)
    # Cash Flow
    operating_cash_flow = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    year = Column(Integer)
    ratios = Column(JSON)
    score = Column(Float)
    prediction = Column(String)  # "Profitable", "Moderate", "High Risk"
    explanation = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models.db_models import get_db, FinancialRecord, AnalysisResult
from services.ml_model import predict

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class FinancialInput(BaseModel):
    company_name: str
    year: int
    revenue: Optional[float] = None
    cost_of_goods_sold: Optional[float] = None
    gross_profit: Optional[float] = None
    operating_expenses: Optional[float] = None
    ebit: Optional[float] = None
    interest_expense: Optional[float] = None
    net_income: Optional[float] = None
    total_assets: Optional[float] = None
    current_assets: Optional[float] = None
    current_liabilities: Optional[float] = None
    total_liabilities: Optional[float] = None
    total_equity: Optional[float] = None
    inventory: Optional[float] = None
    operating_cash_flow: Optional[float] = None


@router.post("/")
def analyze(data: FinancialInput, db: Session = Depends(get_db)):
    financial_dict = data.model_dump(exclude={"company_name", "year"})
    result = predict(financial_dict)

    # Persist record
    record = FinancialRecord(company_name=data.company_name, year=data.year, **financial_dict)
    db.add(record)

    analysis = AnalysisResult(
        company_name=data.company_name,
        year=data.year,
        ratios=result["ratios"],
        score=result["score"],
        prediction=result["prediction"],
        explanation=result["explanation"],
    )
    db.add(analysis)
    db.commit()

    return {"company_name": data.company_name, "year": data.year, **result}


@router.get("/history/{company_name}")
def get_history(company_name: str, db: Session = Depends(get_db)):
    records = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.company_name == company_name)
        .order_by(AnalysisResult.year)
        .all()
    )
    if not records:
        raise HTTPException(status_code=404, detail="No records found for this company")
    return [
        {
            "year": r.year,
            "score": r.score,
            "prediction": r.prediction,
            "ratios": r.ratios,
            "explanation": r.explanation,
        }
        for r in records
    ]

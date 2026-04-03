from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from models.db_models import get_db, AnalysisResult
from services.report_gen import generate_pdf_report

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/{company_name}/{year}")
def download_report(company_name: str, year: int, db: Session = Depends(get_db)):
    record = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.company_name == company_name, AnalysisResult.year == year)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")

    pdf_bytes = generate_pdf_report(
        company_name=record.company_name,
        year=record.year,
        ratios=record.ratios,
        score=record.score,
        prediction=record.prediction,
        explanation=record.explanation,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{company_name}_{year}_report.pdf"'},
    )

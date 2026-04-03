from fastapi import APIRouter, UploadFile, File, HTTPException
from services.parser import parse_file
from services.ml_model import predict

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/")
async def upload_financial_file(file: UploadFile = File(...)):
    allowed = {"pdf", "xlsx", "xls", "csv"}
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    try:
        financial_data = parse_file(file.filename, contents)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")

    if not financial_data:
        raise HTTPException(status_code=422, detail="No recognizable financial data found in file")

    result = predict(financial_data)
    return {
        "filename": file.filename,
        "extracted_data": financial_data,
        **result,
    }

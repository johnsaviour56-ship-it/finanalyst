"""
File parser for PDF, Excel, and CSV financial statements.
Attempts to extract key financial fields by scanning for known keywords.
"""

import io
import pandas as pd
import pdfplumber
from typing import Optional

# Map of field names to common label variations found in financial statements
FIELD_KEYWORDS = {
    "revenue": ["revenue", "total revenue", "net revenue", "net sales", "total sales"],
    "cost_of_goods_sold": ["cost of goods sold", "cogs", "cost of sales", "cost of revenue"],
    "gross_profit": ["gross profit", "gross income"],
    "operating_expenses": ["operating expenses", "total operating expenses", "opex"],
    "ebit": ["ebit", "operating income", "operating profit", "income from operations"],
    "interest_expense": ["interest expense", "interest charges"],
    "net_income": ["net income", "net profit", "net earnings", "profit after tax", "net loss"],
    "total_assets": ["total assets"],
    "current_assets": ["total current assets", "current assets"],
    "current_liabilities": ["total current liabilities", "current liabilities"],
    "total_liabilities": ["total liabilities"],
    "total_equity": ["total equity", "shareholders equity", "stockholders equity", "total stockholders equity"],
    "inventory": ["inventory", "inventories"],
    "operating_cash_flow": ["net cash from operating", "cash from operations", "operating activities", "net cash provided by operating"],
}


def _match_field(label: str) -> Optional[str]:
    label_lower = label.lower().strip()
    for field, keywords in FIELD_KEYWORDS.items():
        for kw in keywords:
            if kw in label_lower:
                return field
    return None


def _clean_number(val) -> Optional[float]:
    if val is None:
        return None
    s = str(val).replace(",", "").replace("$", "").replace("(", "-").replace(")", "").strip()
    try:
        return float(s)
    except ValueError:
        return None


def parse_csv(file_bytes: bytes) -> dict:
    df = pd.read_csv(io.BytesIO(file_bytes))
    return _extract_from_dataframe(df)


def parse_excel(file_bytes: bytes) -> dict:
    df = pd.read_excel(io.BytesIO(file_bytes), header=None)
    return _extract_from_dataframe(df)


def _extract_from_dataframe(df: pd.DataFrame) -> dict:
    result = {}
    for _, row in df.iterrows():
        row_vals = [str(v) for v in row.values]
        label = row_vals[0] if row_vals else ""
        field = _match_field(label)
        if field and field not in result:
            # Take the last numeric value in the row (most recent year)
            for val in reversed(row_vals[1:]):
                num = _clean_number(val)
                if num is not None:
                    result[field] = num
                    break
    return result


def parse_pdf(file_bytes: bytes) -> dict:
    result = {}
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if not row:
                        continue
                    label = str(row[0]) if row[0] else ""
                    field = _match_field(label)
                    if field and field not in result:
                        for val in reversed(row[1:]):
                            num = _clean_number(val)
                            if num is not None:
                                result[field] = num
                                break
    return result


def parse_file(filename: str, file_bytes: bytes) -> dict:
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        return parse_pdf(file_bytes)
    elif ext in ("xlsx", "xls"):
        return parse_excel(file_bytes)
    elif ext == "csv":
        return parse_csv(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

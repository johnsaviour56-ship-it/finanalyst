"""
Financial ratio calculations and profitability scoring.

Scoring formula (0-100):
  - Net Profit Margin (20pts): >15% = 20, 5-15% = 10, <5% = 0
  - ROA (15pts):               >10% = 15, 5-10% = 8,  <5% = 0
  - ROE (15pts):               >15% = 15, 8-15% = 8,  <8% = 0
  - Current Ratio (15pts):     >2   = 15, 1-2   = 8,  <1  = 0
  - Debt-to-Equity (15pts):    <1   = 15, 1-2   = 8,  >2  = 0
  - Asset Turnover (10pts):    >1   = 10, 0.5-1 = 5,  <0.5= 0
  - Operating CF positive(10pts): positive = 10, else = 0
"""

from typing import Optional


def safe_div(a, b, default=0.0):
    try:
        if b == 0 or b is None:
            return default
        return round(a / b, 4)
    except Exception:
        return default


def compute_ratios(data: dict) -> dict:
    rev = data.get("revenue", 0) or 0
    ni = data.get("net_income", 0) or 0
    ta = data.get("total_assets", 0) or 0
    te = data.get("total_equity", 0) or 0
    tl = data.get("total_liabilities", 0) or 0
    ca = data.get("current_assets", 0) or 0
    cl = data.get("current_liabilities", 0) or 0
    inv = data.get("inventory", 0) or 0
    ocf = data.get("operating_cash_flow", 0) or 0

    ratios = {
        "net_profit_margin": safe_div(ni, rev) * 100,
        "roa": safe_div(ni, ta) * 100,
        "roe": safe_div(ni, te) * 100,
        "current_ratio": safe_div(ca, cl),
        "quick_ratio": safe_div(ca - inv, cl),
        "debt_to_equity": safe_div(tl, te),
        "asset_turnover": safe_div(rev, ta),
        "operating_cf_positive": ocf > 0,
    }
    return ratios


def compute_score(ratios: dict) -> float:
    score = 0.0

    npm = ratios.get("net_profit_margin", 0)
    if npm >= 15:
        score += 20
    elif npm >= 5:
        score += 10

    roa = ratios.get("roa", 0)
    if roa >= 10:
        score += 15
    elif roa >= 5:
        score += 8

    roe = ratios.get("roe", 0)
    if roe >= 15:
        score += 15
    elif roe >= 8:
        score += 8

    cr = ratios.get("current_ratio", 0)
    if cr >= 2:
        score += 15
    elif cr >= 1:
        score += 8

    de = ratios.get("debt_to_equity", 999)
    if de < 1:
        score += 15
    elif de < 2:
        score += 8

    at = ratios.get("asset_turnover", 0)
    if at >= 1:
        score += 10
    elif at >= 0.5:
        score += 5

    if ratios.get("operating_cf_positive"):
        score += 10

    return round(score, 2)


def score_to_prediction(score: float) -> tuple[str, str]:
    if score >= 65:
        prediction = "Profitable"
        explanation = (
            f"Score {score}/100. Strong profitability margins, healthy liquidity, "
            "and positive cash flow indicate a financially sound company."
        )
    elif score >= 35:
        prediction = "Moderate"
        explanation = (
            f"Score {score}/100. Mixed financial signals. Some ratios are healthy "
            "but others suggest areas of concern. Monitor closely."
        )
    else:
        prediction = "High Risk"
        explanation = (
            f"Score {score}/100. Weak profitability, poor liquidity, or high leverage "
            "detected. Company faces significant financial risk."
        )
    return prediction, explanation

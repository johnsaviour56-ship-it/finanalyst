export interface FinancialData {
  revenue?: number;
  cost_of_goods_sold?: number;
  gross_profit?: number;
  operating_expenses?: number;
  ebit?: number;
  interest_expense?: number;
  net_income?: number;
  total_assets?: number;
  current_assets?: number;
  current_liabilities?: number;
  total_liabilities?: number;
  total_equity?: number;
  inventory?: number;
  operating_cash_flow?: number;
}

export interface RatioDetail {
  value: number | boolean;
  label: string;
  status: "good" | "warning" | "bad" | "neutral";
  insight: string;
}

export interface Ratios {
  net_profit_margin: number;
  roa: number;
  roe: number;
  current_ratio: number;
  quick_ratio: number;
  debt_to_equity: number;
  asset_turnover: number;
  operating_cf_positive: boolean;
}

export interface AnalysisResult {
  ratios: Ratios;
  ratioDetails: Record<string, RatioDetail>;
  score: number;
  prediction: "Profitable" | "Moderate" | "High Risk";
  explanation: string;
  reasons: string[];
  strengths: string[];
  weaknesses: string[];
}

function safeDiv(a: number, b: number): number {
  return !b ? 0 : a / b;
}

export function computeRatios(d: FinancialData): Ratios {
  const rev = d.revenue ?? 0;
  const ni = d.net_income ?? 0;
  const ta = d.total_assets ?? 0;
  const te = d.total_equity ?? 0;
  const tl = d.total_liabilities ?? 0;
  const ca = d.current_assets ?? 0;
  const cl = d.current_liabilities ?? 0;
  const inv = d.inventory ?? 0;
  const ocf = d.operating_cash_flow ?? 0;
  return {
    net_profit_margin: parseFloat((safeDiv(ni, rev) * 100).toFixed(2)),
    roa: parseFloat((safeDiv(ni, ta) * 100).toFixed(2)),
    roe: parseFloat((safeDiv(ni, te) * 100).toFixed(2)),
    current_ratio: parseFloat(safeDiv(ca, cl).toFixed(2)),
    quick_ratio: parseFloat(safeDiv(ca - inv, cl).toFixed(2)),
    debt_to_equity: parseFloat(safeDiv(tl, te).toFixed(2)),
    asset_turnover: parseFloat(safeDiv(rev, ta).toFixed(2)),
    operating_cf_positive: ocf > 0,
  };
}

function buildRatioDetails(r: Ratios): Record<string, RatioDetail> {
  const details: Record<string, RatioDetail> = {};

  // Net Profit Margin
  details.net_profit_margin = {
    value: r.net_profit_margin,
    label: "Net Profit Margin",
    status: r.net_profit_margin >= 15 ? "good" : r.net_profit_margin >= 5 ? "warning" : "bad",
    insight:
      r.net_profit_margin >= 15
        ? `NPM of ${r.net_profit_margin}% is strong — the company retains a healthy share of revenue as profit.`
        : r.net_profit_margin >= 5
        ? `NPM of ${r.net_profit_margin}% is acceptable but leaves room for improvement in cost control.`
        : r.net_profit_margin >= 0
        ? `NPM of ${r.net_profit_margin}% is very thin — costs are consuming nearly all revenue.`
        : `Negative NPM of ${r.net_profit_margin}% means the company is operating at a loss.`,
  };

  // ROA
  details.roa = {
    value: r.roa,
    label: "Return on Assets",
    status: r.roa >= 10 ? "good" : r.roa >= 5 ? "warning" : "bad",
    insight:
      r.roa >= 10
        ? `ROA of ${r.roa}% shows assets are being used very efficiently to generate profit.`
        : r.roa >= 5
        ? `ROA of ${r.roa}% is moderate — assets are generating some return but efficiency could improve.`
        : `ROA of ${r.roa}% is low, suggesting assets are underperforming or the company is asset-heavy relative to earnings.`,
  };

  // ROE
  details.roe = {
    value: r.roe,
    label: "Return on Equity",
    status: r.roe >= 15 ? "good" : r.roe >= 8 ? "warning" : "bad",
    insight:
      r.roe >= 15
        ? `ROE of ${r.roe}% is excellent — shareholders are getting strong returns on their investment.`
        : r.roe >= 8
        ? `ROE of ${r.roe}% is decent but below the typical 15% benchmark investors look for.`
        : `ROE of ${r.roe}% is weak — the company is not generating adequate returns for shareholders.`,
  };

  // Current Ratio
  details.current_ratio = {
    value: r.current_ratio,
    label: "Current Ratio",
    status: r.current_ratio >= 2 ? "good" : r.current_ratio >= 1 ? "warning" : "bad",
    insight:
      r.current_ratio >= 2
        ? `Current ratio of ${r.current_ratio} is healthy — the company can comfortably cover short-term obligations.`
        : r.current_ratio >= 1
        ? `Current ratio of ${r.current_ratio} is borderline — the company can meet obligations but has limited buffer.`
        : `Current ratio of ${r.current_ratio} is below 1, indicating potential liquidity problems and difficulty meeting short-term debts.`,
  };

  // Quick Ratio
  details.quick_ratio = {
    value: r.quick_ratio,
    label: "Quick Ratio",
    status: r.quick_ratio >= 1 ? "good" : r.quick_ratio >= 0.7 ? "warning" : "bad",
    insight:
      r.quick_ratio >= 1
        ? `Quick ratio of ${r.quick_ratio} is solid — liquid assets alone can cover current liabilities.`
        : r.quick_ratio >= 0.7
        ? `Quick ratio of ${r.quick_ratio} is slightly below ideal — the company may need to liquidate inventory to meet obligations.`
        : `Quick ratio of ${r.quick_ratio} is concerning — the company is heavily reliant on inventory to meet short-term debts.`,
  };

  // Debt-to-Equity
  details.debt_to_equity = {
    value: r.debt_to_equity,
    label: "Debt-to-Equity",
    status: r.debt_to_equity < 1 ? "good" : r.debt_to_equity < 2 ? "warning" : "bad",
    insight:
      r.debt_to_equity < 1
        ? `D/E ratio of ${r.debt_to_equity} is low — the company is primarily equity-financed with manageable debt.`
        : r.debt_to_equity < 2
        ? `D/E ratio of ${r.debt_to_equity} is moderate — debt levels are elevated but not alarming.`
        : `D/E ratio of ${r.debt_to_equity} is high — the company is heavily leveraged, increasing financial risk.`,
  };

  // Asset Turnover
  details.asset_turnover = {
    value: r.asset_turnover,
    label: "Asset Turnover",
    status: r.asset_turnover >= 1 ? "good" : r.asset_turnover >= 0.5 ? "warning" : "bad",
    insight:
      r.asset_turnover >= 1
        ? `Asset turnover of ${r.asset_turnover} is efficient — the company generates $${r.asset_turnover} in revenue per $1 of assets.`
        : r.asset_turnover >= 0.5
        ? `Asset turnover of ${r.asset_turnover} is moderate — revenue generation relative to assets could be improved.`
        : `Asset turnover of ${r.asset_turnover} is low — assets are not being used effectively to drive revenue.`,
  };

  // Operating Cash Flow
  details.operating_cf_positive = {
    value: r.operating_cf_positive,
    label: "Operating Cash Flow",
    status: r.operating_cf_positive ? "good" : "bad",
    insight: r.operating_cf_positive
      ? "Positive operating cash flow confirms the core business generates real cash, not just accounting profit."
      : "Negative operating cash flow is a red flag — the business is burning cash from operations, which is unsustainable.",
  };

  return details;
}

export function computeScore(r: Ratios): number {
  let score = 0;
  if (r.net_profit_margin >= 15) score += 20; else if (r.net_profit_margin >= 5) score += 10;
  if (r.roa >= 10) score += 15; else if (r.roa >= 5) score += 8;
  if (r.roe >= 15) score += 15; else if (r.roe >= 8) score += 8;
  if (r.current_ratio >= 2) score += 15; else if (r.current_ratio >= 1) score += 8;
  if (r.debt_to_equity < 1) score += 15; else if (r.debt_to_equity < 2) score += 8;
  if (r.asset_turnover >= 1) score += 10; else if (r.asset_turnover >= 0.5) score += 5;
  if (r.operating_cf_positive) score += 10;
  return score;
}

export function analyze(data: FinancialData): AnalysisResult {
  const ratios = computeRatios(data);
  const score = computeScore(ratios);
  const ratioDetails = buildRatioDetails(ratios);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const detail of Object.values(ratioDetails)) {
    if (detail.status === "good") strengths.push(detail.insight);
    else if (detail.status === "bad") weaknesses.push(detail.insight);
  }

  let prediction: AnalysisResult["prediction"];
  let explanation: string;
  const reasons: string[] = [];

  if (score >= 65) {
    prediction = "Profitable";
    explanation = `This company scores ${score}/100, placing it in the Profitable category. The financial data reflects a well-managed business with strong earnings quality and sound financial structure.`;
    reasons.push(`Score of ${score}/100 exceeds the 65-point profitability threshold.`);
    if (ratios.net_profit_margin >= 15) reasons.push(`Net profit margin of ${ratios.net_profit_margin}% demonstrates strong cost management.`);
    if (ratios.current_ratio >= 2) reasons.push(`Current ratio of ${ratios.current_ratio} confirms excellent short-term liquidity.`);
    if (ratios.operating_cf_positive) reasons.push("Positive operating cash flow validates that profits are backed by real cash generation.");
    if (ratios.debt_to_equity < 1) reasons.push(`Low debt-to-equity of ${ratios.debt_to_equity} indicates conservative and sustainable financing.`);
  } else if (score >= 35) {
    prediction = "Moderate";
    explanation = `This company scores ${score}/100, placing it in the Moderate category. While some financial metrics are healthy, others signal areas that need attention before the company can be considered financially strong.`;
    reasons.push(`Score of ${score}/100 falls in the moderate range (35–64).`);
    if (ratios.net_profit_margin < 10) reasons.push(`Net profit margin of ${ratios.net_profit_margin}% is below the 10% benchmark.`);
    if (ratios.current_ratio < 1.5) reasons.push(`Current ratio of ${ratios.current_ratio} provides limited liquidity buffer.`);
    if (ratios.debt_to_equity >= 1) reasons.push(`Debt-to-equity of ${ratios.debt_to_equity} indicates reliance on debt financing.`);
    if (!ratios.operating_cf_positive) reasons.push("Negative operating cash flow raises concerns about cash sustainability.");
  } else {
    prediction = "High Risk";
    explanation = `This company scores ${score}/100, placing it in the High Risk category. Multiple financial indicators point to serious concerns about profitability, liquidity, and financial stability.`;
    reasons.push(`Score of ${score}/100 falls below the 35-point risk threshold.`);
    if (ratios.net_profit_margin < 0) reasons.push(`Negative net profit margin of ${ratios.net_profit_margin}% means the company is losing money on operations.`);
    if (ratios.current_ratio < 1) reasons.push(`Current ratio of ${ratios.current_ratio} below 1.0 signals inability to cover short-term obligations.`);
    if (ratios.debt_to_equity >= 2) reasons.push(`High debt-to-equity of ${ratios.debt_to_equity} creates significant financial leverage risk.`);
    if (!ratios.operating_cf_positive) reasons.push("Negative operating cash flow indicates the core business is burning cash.");
    if (ratios.roa < 0) reasons.push(`Negative ROA of ${ratios.roa}% means assets are destroying rather than creating value.`);
  }

  return { ratios, ratioDetails, score, prediction, explanation, reasons, strengths, weaknesses };
}

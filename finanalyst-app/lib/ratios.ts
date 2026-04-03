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
  score: number;
  prediction: "Profitable" | "Moderate" | "High Risk";
  explanation: string;
}

function safeDiv(a: number, b: number): number {
  if (!b || b === 0) return 0;
  return a / b;
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

export function computeScore(r: Ratios): number {
  let score = 0;
  if (r.net_profit_margin >= 15) score += 20;
  else if (r.net_profit_margin >= 5) score += 10;
  if (r.roa >= 10) score += 15;
  else if (r.roa >= 5) score += 8;
  if (r.roe >= 15) score += 15;
  else if (r.roe >= 8) score += 8;
  if (r.current_ratio >= 2) score += 15;
  else if (r.current_ratio >= 1) score += 8;
  if (r.debt_to_equity < 1) score += 15;
  else if (r.debt_to_equity < 2) score += 8;
  if (r.asset_turnover >= 1) score += 10;
  else if (r.asset_turnover >= 0.5) score += 5;
  if (r.operating_cf_positive) score += 10;
  return score;
}

export function analyze(data: FinancialData): AnalysisResult {
  const ratios = computeRatios(data);
  const score = computeScore(ratios);
  let prediction: AnalysisResult["prediction"];
  let explanation: string;

  if (score >= 65) {
    prediction = "Profitable";
    explanation = `Score ${score}/100. Strong margins, healthy liquidity, and positive cash flow indicate a financially sound company.`;
  } else if (score >= 35) {
    prediction = "Moderate";
    explanation = `Score ${score}/100. Mixed signals — some ratios are healthy but others suggest areas of concern. Monitor closely.`;
  } else {
    prediction = "High Risk";
    explanation = `Score ${score}/100. Weak profitability, poor liquidity, or high leverage detected. Company faces significant financial risk.`;
  }

  return { ratios, score, prediction, explanation };
}

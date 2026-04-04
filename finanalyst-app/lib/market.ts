// Market data types and NGX ticker registry

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  marketCap: number;
  exchange: string;
  currency: string;
  high52w: number;
  low52w: number;
  pe: number | null;
  eps: number | null;
  dividendYield: number | null;
  beta: number | null;
}

export interface StockFundamentals {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  revenue: number | null;
  netIncome: number | null;
  totalAssets: number | null;
  totalEquity: number | null;
  totalDebt: number | null;
  currentAssets: number | null;
  currentLiabilities: number | null;
  operatingCashFlow: number | null;
  roe: number | null;
  roa: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  netProfitMargin: number | null;
  pe: number | null;
  eps: number | null;
  priceToBook: number | null;
  description: string;
}

export interface HistoricalPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  sma50: number | null;
  sma200: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  trend: "Bullish" | "Bearish" | "Sideways";
  volatility: number | null;
}

export interface StockPrediction {
  signal: "Undervalued" | "Overvalued" | "High Risk" | "Growth Opportunity" | "Neutral";
  confidence: number;
  reasons: string[];
}

// NGX-listed companies with Yahoo Finance tickers (append .LG for Lagos)
export const NGX_TICKERS: Record<string, string> = {
  DANGCEM: "DANGCEM.LG",
  MTNN: "MTNN.LG",
  AIRTELAFRI: "AIRTELAFRI.LG",
  GTCO: "GTCO.LG",
  ZENITHBANK: "ZENITHBANK.LG",
  ACCESS: "ACCESS.LG",
  UBA: "UBA.LG",
  FBNH: "FBNH.LG",
  STANBIC: "STANBIC.LG",
  FIDELITYBK: "FIDELITYBK.LG",
  NESTLE: "NESTLE.LG",
  UNILEVER: "UNILEVER.LG",
  FLOURMILL: "FLOURMILL.LG",
  BUACEMENT: "BUACEMENT.LG",
  LAFARGE: "WAPCO.LG",
  SEPLAT: "SEPLAT.LG",
  OANDO: "OANDO.LG",
  CONOIL: "CONOIL.LG",
  NB: "NB.LG",
  GUINNESS: "GUINNESS.LG",
  TRANSCORP: "TRANSCORP.LG",
  FGNSAVINGS: "FGNSAVINGS.LG",
  PRESCO: "PRESCO.LG",
  OKOMUOIL: "OKOMUOIL.LG",
  TOTAL: "TOTAL.LG",
  CUSTODIAN: "CUSTODIAN.LG",
  MANSARD: "MANSARD.LG",
  STERLINGBANK: "STERLING.LG",
  WEMA: "WEMABANK.LG",
  FCMB: "FCMB.LG",
};

export const NGX_SECTORS = [
  "Banking", "Oil & Gas", "Consumer Goods", "Cement/Construction",
  "Telecoms", "Insurance", "Agriculture", "Healthcare", "Technology",
];

// Compute technical indicators from historical data
export function computeTechnicals(history: HistoricalPoint[]): TechnicalIndicators {
  if (history.length < 14) {
    return { sma50: null, sma200: null, rsi: null, macd: null, macdSignal: null, trend: "Sideways", volatility: null };
  }

  const closes = history.map(h => h.close);

  const sma = (n: number) => {
    const slice = closes.slice(-n);
    return slice.length === n ? slice.reduce((a, b) => a + b, 0) / n : null;
  };

  const sma50 = sma(Math.min(50, closes.length));
  const sma200 = sma(Math.min(200, closes.length));

  // RSI (14-period)
  const gains: number[] = [], losses: number[] = [];
  for (let i = 1; i < Math.min(15, closes.length); i++) {
    const diff = closes[closes.length - i] - closes[closes.length - i - 1];
    if (diff > 0) gains.push(diff); else losses.push(Math.abs(diff));
  }
  const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / 14 : 0;
  const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / 14 : 0.001;
  const rs = avgGain / avgLoss;
  const rsi = parseFloat((100 - 100 / (1 + rs)).toFixed(2));

  // MACD (12/26 EMA diff simplified)
  const ema = (period: number) => {
    const k = 2 / (period + 1);
    let e = closes[0];
    for (let i = 1; i < closes.length; i++) e = closes[i] * k + e * (1 - k);
    return e;
  };
  const macd = parseFloat((ema(12) - ema(26)).toFixed(4));
  const macdSignal = parseFloat(ema(9).toFixed(4));

  // Volatility (std dev of daily returns)
  const returns = closes.slice(1).map((c, i) => (c - closes[i]) / closes[i]);
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  const volatility = parseFloat((Math.sqrt(variance) * Math.sqrt(252) * 100).toFixed(2));

  // Trend
  const current = closes[closes.length - 1];
  let trend: "Bullish" | "Bearish" | "Sideways" = "Sideways";
  if (sma50 && sma200) {
    if (current > sma50 && sma50 > sma200) trend = "Bullish";
    else if (current < sma50 && sma50 < sma200) trend = "Bearish";
  }

  return { sma50, sma200, rsi, macd, macdSignal, trend, volatility };
}

// AI-style prediction based on fundamentals + technicals
export function predictStock(
  fundamentals: Partial<StockFundamentals>,
  technicals: TechnicalIndicators,
  quote: Partial<StockQuote>
): StockPrediction {
  const reasons: string[] = [];
  let score = 50; // neutral baseline

  const pe = fundamentals.pe ?? quote.pe;
  const roe = fundamentals.roe;
  const debtToEquity = fundamentals.debtToEquity;
  const npm = fundamentals.netProfitMargin;
  const rsi = technicals.rsi;

  if (pe !== null && pe !== undefined) {
    if (pe < 10) { score += 15; reasons.push(`Low P/E of ${pe.toFixed(1)} suggests the stock may be undervalued.`); }
    else if (pe > 30) { score -= 15; reasons.push(`High P/E of ${pe.toFixed(1)} suggests the stock may be overvalued.`); }
    else reasons.push(`P/E of ${pe.toFixed(1)} is within a reasonable range.`);
  }

  if (roe !== null && roe !== undefined) {
    if (roe > 15) { score += 10; reasons.push(`Strong ROE of ${roe.toFixed(1)}% indicates efficient use of equity.`); }
    else if (roe < 5) { score -= 10; reasons.push(`Weak ROE of ${roe.toFixed(1)}% signals poor returns for shareholders.`); }
  }

  if (debtToEquity !== null && debtToEquity !== undefined) {
    if (debtToEquity > 2) { score -= 10; reasons.push(`High D/E of ${debtToEquity.toFixed(2)} increases financial risk.`); }
    else if (debtToEquity < 0.5) { score += 5; reasons.push(`Low D/E of ${debtToEquity.toFixed(2)} shows conservative financing.`); }
  }

  if (npm !== null && npm !== undefined) {
    if (npm > 15) { score += 10; reasons.push(`Net profit margin of ${npm.toFixed(1)}% is strong.`); }
    else if (npm < 0) { score -= 15; reasons.push(`Negative profit margin — company is currently unprofitable.`); }
  }

  if (rsi !== null) {
    if (rsi < 30) { score += 10; reasons.push(`RSI of ${rsi} indicates the stock is oversold — potential buying opportunity.`); }
    else if (rsi > 70) { score -= 10; reasons.push(`RSI of ${rsi} indicates the stock is overbought — caution advised.`); }
  }

  if (technicals.trend === "Bullish") { score += 10; reasons.push("Price trend is Bullish — above both 50-day and 200-day moving averages."); }
  else if (technicals.trend === "Bearish") { score -= 10; reasons.push("Price trend is Bearish — below both moving averages."); }

  let signal: StockPrediction["signal"];
  if (score >= 75) signal = "Undervalued";
  else if (score >= 60) signal = "Growth Opportunity";
  else if (score >= 45) signal = "Neutral";
  else if (score >= 30) signal = "Overvalued";
  else signal = "High Risk";

  return { signal, confidence: Math.min(Math.max(score, 0), 100), reasons };
}

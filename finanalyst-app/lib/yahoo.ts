/**
 * Yahoo Finance v8 API client — pure fetch, no external library.
 * Works in Next.js API routes and Vercel serverless functions.
 */

const BASE = "https://query1.finance.yahoo.com";
const BASE2 = "https://query2.finance.yahoo.com";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json",
};

async function yfFetch(url: string) {
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status} for ${url}`);
  return res.json();
}

export async function getQuote(ticker: string) {
  const url = `${BASE}/v8/finance/chart/${ticker}?interval=1d&range=1d`;
  const data = await yfFetch(url);
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No data for ${ticker}`);
  const meta = result.meta;
  return {
    ticker,
    name: meta.longName ?? meta.shortName ?? ticker,
    price: meta.regularMarketPrice ?? 0,
    previousClose: meta.chartPreviousClose ?? meta.regularMarketPrice ?? 0,
    change: (meta.regularMarketPrice ?? 0) - (meta.chartPreviousClose ?? meta.regularMarketPrice ?? 0),
    changePct: meta.chartPreviousClose
      ? (((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100)
      : 0,
    volume: meta.regularMarketVolume ?? 0,
    marketCap: meta.marketCap ?? 0,
    exchange: meta.exchangeName ?? "",
    currency: meta.currency ?? "NGN",
    high52w: meta.fiftyTwoWeekHigh ?? 0,
    low52w: meta.fiftyTwoWeekLow ?? 0,
  };
}

export async function getSummary(ticker: string) {
  const modules = "financialData,defaultKeyStatistics,summaryProfile,price";
  const url = `${BASE2}/v10/finance/quoteSummary/${ticker}?modules=${modules}`;
  const data = await yfFetch(url);
  const result = data?.quoteSummary?.result?.[0];
  if (!result) return null;

  const fd = result.financialData ?? {};
  const ks = result.defaultKeyStatistics ?? {};
  const sp = result.summaryProfile ?? {};
  const pr = result.price ?? {};

  return {
    name: pr.longName ?? pr.shortName ?? ticker,
    sector: sp.sector ?? "Unknown",
    industry: sp.industry ?? "Unknown",
    description: sp.longBusinessSummary ?? "",
    revenue: fd.totalRevenue?.raw ?? null,
    netIncome: fd.netIncomeToCommon?.raw ?? null,
    totalDebt: fd.totalDebt?.raw ?? null,
    operatingCashFlow: fd.operatingCashflow?.raw ?? null,
    roe: fd.returnOnEquity?.raw ? fd.returnOnEquity.raw * 100 : null,
    roa: fd.returnOnAssets?.raw ? fd.returnOnAssets.raw * 100 : null,
    debtToEquity: fd.debtToEquity?.raw ?? null,
    currentRatio: fd.currentRatio?.raw ?? null,
    netProfitMargin: fd.profitMargins?.raw ? fd.profitMargins.raw * 100 : null,
    pe: pr.trailingPE?.raw ?? null,
    eps: pr.epsTrailingTwelveMonths?.raw ?? null,
    priceToBook: ks.priceToBook?.raw ?? null,
    beta: ks.beta?.raw ?? null,
    dividendYield: pr.dividendYield?.raw ? pr.dividendYield.raw * 100 : null,
    marketCap: pr.marketCap?.raw ?? null,
  };
}

export async function getHistory(ticker: string, days = 365) {
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - days * 86400;
  const url = `${BASE}/v8/finance/chart/${ticker}?interval=1d&period1=${period1}&period2=${period2}`;
  const data = await yfFetch(url);
  const result = data?.chart?.result?.[0];
  if (!result) return [];

  const timestamps: number[] = result.timestamp ?? [];
  const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
  const opens: number[] = result.indicators?.quote?.[0]?.open ?? [];
  const highs: number[] = result.indicators?.quote?.[0]?.high ?? [];
  const lows: number[] = result.indicators?.quote?.[0]?.low ?? [];
  const volumes: number[] = result.indicators?.quote?.[0]?.volume ?? [];

  return timestamps.map((ts, i) => ({
    date: new Date(ts * 1000).toISOString().split("T")[0],
    open: opens[i] ?? 0,
    high: highs[i] ?? 0,
    low: lows[i] ?? 0,
    close: closes[i] ?? 0,
    volume: volumes[i] ?? 0,
  })).filter(p => p.close > 0);
}

export async function searchTicker(query: string) {
  const url = `${BASE2}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`;
  const data = await yfFetch(url);
  return (data?.finance?.result?.[0]?.quotes ?? []).filter((q: any) => q.quoteType === "EQUITY");
}

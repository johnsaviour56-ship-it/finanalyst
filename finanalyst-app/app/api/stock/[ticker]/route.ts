import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { computeTechnicals, predictStock, NGX_TICKERS } from "@/lib/market";
import type { StockFundamentals, StockQuote, HistoricalPoint } from "@/lib/market";

export async function GET(req: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    let ticker = params.ticker.toUpperCase();
    // Resolve NGX short codes to Yahoo Finance tickers
    if (NGX_TICKERS[ticker]) ticker = NGX_TICKERS[ticker];

    // Fetch quote + fundamentals in parallel
    const [quote, summary, history] = await Promise.allSettled([
      yahooFinance.quote(ticker),
      yahooFinance.quoteSummary(ticker, {
        modules: ["financialData", "defaultKeyStatistics", "summaryProfile", "incomeStatementHistory"],
      }),
      yahooFinance.historical(ticker, {
        period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        period2: new Date().toISOString().split("T")[0],
        interval: "1d",
      }),
    ]);

    const q = quote.status === "fulfilled" ? quote.value : null;
    const s = summary.status === "fulfilled" ? summary.value : null;
    const h = history.status === "fulfilled" ? history.value : [];

    if (!q) return NextResponse.json({ error: `Ticker "${ticker}" not found` }, { status: 404 });

    const fd = s?.financialData;
    const ks = s?.defaultKeyStatistics;
    const sp = s?.summaryProfile;

    const stockQuote: StockQuote = {
      ticker,
      name: q.longName ?? q.shortName ?? ticker,
      price: q.regularMarketPrice ?? 0,
      change: q.regularMarketChange ?? 0,
      changePct: q.regularMarketChangePercent ?? 0,
      volume: q.regularMarketVolume ?? 0,
      marketCap: q.marketCap ?? 0,
      exchange: q.exchange ?? "",
      currency: q.currency ?? "NGN",
      high52w: q.fiftyTwoWeekHigh ?? 0,
      low52w: q.fiftyTwoWeekLow ?? 0,
      pe: q.trailingPE ?? null,
      eps: q.epsTrailingTwelveMonths ?? null,
      dividendYield: q.dividendYield ? q.dividendYield * 100 : null,
      beta: ks?.beta ?? null,
    };

    const fundamentals: StockFundamentals = {
      ticker,
      name: stockQuote.name,
      sector: sp?.sector ?? "Unknown",
      industry: sp?.industry ?? "Unknown",
      description: sp?.longBusinessSummary ?? "",
      revenue: fd?.totalRevenue ?? null,
      netIncome: fd?.netIncomeToCommon ?? null,
      totalAssets: null,
      totalEquity: fd?.bookValue ? (fd.bookValue * (ks?.sharesOutstanding ?? 0)) : null,
      totalDebt: fd?.totalDebt ?? null,
      currentAssets: null,
      currentLiabilities: null,
      operatingCashFlow: fd?.operatingCashflow ?? null,
      roe: fd?.returnOnEquity ? fd.returnOnEquity * 100 : null,
      roa: fd?.returnOnAssets ? fd.returnOnAssets * 100 : null,
      debtToEquity: fd?.debtToEquity ?? null,
      currentRatio: fd?.currentRatio ?? null,
      netProfitMargin: fd?.profitMargins ? fd.profitMargins * 100 : null,
      pe: q.trailingPE ?? null,
      eps: q.epsTrailingTwelveMonths ?? null,
      priceToBook: ks?.priceToBook ?? null,
    };

    const historicalPoints: HistoricalPoint[] = (h as any[]).map((p: any) => ({
      date: new Date(p.date).toISOString().split("T")[0],
      open: p.open ?? 0,
      high: p.high ?? 0,
      low: p.low ?? 0,
      close: p.close ?? 0,
      volume: p.volume ?? 0,
    }));

    const technicals = computeTechnicals(historicalPoints);
    const prediction = predictStock(fundamentals, technicals, stockQuote);

    return NextResponse.json({
      quote: stockQuote,
      fundamentals,
      history: historicalPoints.slice(-90), // last 90 days for charts
      technicals,
      prediction,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { NGX_TICKERS, computeTechnicals, predictStock } from "@/lib/market";
import type { HistoricalPoint } from "@/lib/market";

export async function GET(req: NextRequest) {
  const tickersParam = req.nextUrl.searchParams.get("tickers");
  if (!tickersParam) return NextResponse.json({ error: "No tickers provided" }, { status: 400 });

  const tickers = tickersParam.split(",").map(t => {
    const upper = t.trim().toUpperCase();
    return NGX_TICKERS[upper] ?? upper;
  }).slice(0, 4); // max 4 companies

  try {
    const results = await Promise.allSettled(
      tickers.map(async (ticker) => {
        const [quote, summary, history] = await Promise.allSettled([
          yahooFinance.quote(ticker),
          yahooFinance.quoteSummary(ticker, { modules: ["financialData", "defaultKeyStatistics"] }),
          yahooFinance.historical(ticker, {
            period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            period2: new Date().toISOString().split("T")[0],
            interval: "1d",
          }),
        ]);

        const q = quote.status === "fulfilled" ? quote.value : null;
        const s = summary.status === "fulfilled" ? summary.value : null;
        const h = history.status === "fulfilled" ? history.value : [];
        const fd = s?.financialData;

        const historicalPoints: HistoricalPoint[] = (h as any[]).map((p: any) => ({
          date: new Date(p.date).toISOString().split("T")[0],
          open: p.open ?? 0, high: p.high ?? 0, low: p.low ?? 0,
          close: p.close ?? 0, volume: p.volume ?? 0,
        }));

        const technicals = computeTechnicals(historicalPoints);
        const fundamentals = {
          pe: q?.trailingPE ?? null,
          roe: fd?.returnOnEquity ? fd.returnOnEquity * 100 : null,
          debtToEquity: fd?.debtToEquity ?? null,
          netProfitMargin: fd?.profitMargins ? fd.profitMargins * 100 : null,
        };
        const prediction = predictStock(fundamentals, technicals, { pe: q?.trailingPE ?? null });

        return {
          ticker,
          name: q?.longName ?? q?.shortName ?? ticker,
          price: q?.regularMarketPrice ?? 0,
          changePct: q?.regularMarketChangePercent ?? 0,
          marketCap: q?.marketCap ?? 0,
          pe: q?.trailingPE ?? null,
          roe: fundamentals.roe,
          debtToEquity: fundamentals.debtToEquity,
          netProfitMargin: fundamentals.netProfitMargin,
          trend: technicals.trend,
          rsi: technicals.rsi,
          prediction: prediction.signal,
          confidence: prediction.confidence,
          history: historicalPoints.slice(-30).map(p => ({ date: p.date, close: p.close })),
        };
      })
    );

    const companies = results
      .filter(r => r.status === "fulfilled")
      .map(r => (r as PromiseFulfilledResult<any>).value);

    return NextResponse.json({ companies });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

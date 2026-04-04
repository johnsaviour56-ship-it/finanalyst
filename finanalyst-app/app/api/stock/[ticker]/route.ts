import { NextRequest, NextResponse } from "next/server";
import { getQuote, getSummary, getHistory } from "@/lib/yahoo";
import { computeTechnicals, predictStock, NGX_TICKERS } from "@/lib/market";

export async function GET(_req: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    let ticker = params.ticker.toUpperCase();
    if (NGX_TICKERS[ticker]) ticker = NGX_TICKERS[ticker];

    const [quote, summary, history] = await Promise.allSettled([
      getQuote(ticker),
      getSummary(ticker),
      getHistory(ticker, 365),
    ]);

    const q = quote.status === "fulfilled" ? quote.value : null;
    const s = summary.status === "fulfilled" ? summary.value : null;
    const h = history.status === "fulfilled" ? history.value : [];

    if (!q) return NextResponse.json({ error: `Ticker "${ticker}" not found` }, { status: 404 });

    const technicals = computeTechnicals(h);
    const fundamentals = {
      ticker,
      name: s?.name ?? q.name,
      sector: s?.sector ?? "Unknown",
      industry: s?.industry ?? "Unknown",
      description: s?.description ?? "",
      revenue: s?.revenue ?? null,
      netIncome: s?.netIncome ?? null,
      totalDebt: s?.totalDebt ?? null,
      operatingCashFlow: s?.operatingCashFlow ?? null,
      roe: s?.roe ?? null,
      roa: s?.roa ?? null,
      debtToEquity: s?.debtToEquity ?? null,
      currentRatio: s?.currentRatio ?? null,
      netProfitMargin: s?.netProfitMargin ?? null,
      pe: s?.pe ?? null,
      eps: s?.eps ?? null,
      priceToBook: s?.priceToBook ?? null,
    };

    const stockQuote = {
      ticker,
      name: q.name,
      price: q.price,
      change: q.change,
      changePct: q.changePct,
      volume: q.volume,
      marketCap: s?.marketCap ?? q.marketCap,
      exchange: q.exchange,
      currency: q.currency,
      high52w: q.high52w,
      low52w: q.low52w,
      pe: s?.pe ?? null,
      eps: s?.eps ?? null,
      dividendYield: s?.dividendYield ?? null,
      beta: s?.beta ?? null,
    };

    const prediction = predictStock(fundamentals, technicals, stockQuote);

    return NextResponse.json({
      quote: stockQuote,
      fundamentals,
      history: h.slice(-90),
      technicals,
      prediction,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

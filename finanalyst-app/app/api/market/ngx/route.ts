import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { NGX_TICKERS } from "@/lib/market";

// Fetch top NGX stocks overview
export async function GET() {
  try {
    const tickers = Object.values(NGX_TICKERS).slice(0, 20);

    const results = await Promise.allSettled(
      tickers.map(t => yahooFinance.quote(t))
    );

    const stocks = results
      .map((r, i) => {
        if (r.status !== "fulfilled") return null;
        const q = r.value;
        return {
          ticker: tickers[i],
          shortCode: Object.keys(NGX_TICKERS)[i],
          name: q.longName ?? q.shortName ?? tickers[i],
          price: q.regularMarketPrice ?? 0,
          change: q.regularMarketChange ?? 0,
          changePct: q.regularMarketChangePercent ?? 0,
          volume: q.regularMarketVolume ?? 0,
          marketCap: q.marketCap ?? 0,
          pe: q.trailingPE ?? null,
        };
      })
      .filter(Boolean);

    const gainers = [...stocks].sort((a, b) => (b!.changePct - a!.changePct)).slice(0, 5);
    const losers = [...stocks].sort((a, b) => (a!.changePct - b!.changePct)).slice(0, 5);
    const mostActive = [...stocks].sort((a, b) => (b!.volume - a!.volume)).slice(0, 5);

    return NextResponse.json({ stocks, gainers, losers, mostActive, updatedAt: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getQuote } from "@/lib/yahoo";
import { NGX_TICKERS } from "@/lib/market";

export async function GET() {
  try {
    const entries = Object.entries(NGX_TICKERS).slice(0, 20);

    const results = await Promise.allSettled(
      entries.map(([, yTicker]) => getQuote(yTicker))
    );

    const stocks = results
      .map((r, i) => {
        if (r.status !== "fulfilled") return null;
        const q = r.value;
        return {
          ticker: entries[i][1],
          shortCode: entries[i][0],
          name: q.name,
          price: q.price,
          change: q.change,
          changePct: q.changePct,
          volume: q.volume,
          marketCap: q.marketCap,
          pe: null,
        };
      })
      .filter(Boolean);

    const gainers = [...stocks].sort((a, b) => b!.changePct - a!.changePct).slice(0, 5);
    const losers = [...stocks].sort((a, b) => a!.changePct - b!.changePct).slice(0, 5);
    const mostActive = [...stocks].sort((a, b) => b!.volume - a!.volume).slice(0, 5);

    return NextResponse.json({ stocks, gainers, losers, mostActive, updatedAt: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

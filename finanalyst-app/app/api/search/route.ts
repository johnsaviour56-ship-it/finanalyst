import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { NGX_TICKERS } from "@/lib/market";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Check NGX tickers first
    const ngxMatches = Object.entries(NGX_TICKERS)
      .filter(([code]) => code.toLowerCase().includes(query.toLowerCase()))
      .map(([code, ticker]) => ({ ticker, shortCode: code, exchange: "NGX", name: code }));

    // Yahoo Finance search
    const search = await yahooFinance.search(query, { newsCount: 0 });
    const yahooResults = (search.quotes ?? [])
      .filter((q: any) => q.quoteType === "EQUITY")
      .slice(0, 8)
      .map((q: any) => ({
        ticker: q.symbol,
        name: q.longname ?? q.shortname ?? q.symbol,
        exchange: q.exchange ?? "",
        shortCode: q.symbol,
      }));

    const combined = [...ngxMatches, ...yahooResults].slice(0, 10);
    return NextResponse.json({ results: combined });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results: [] }, { status: 500 });
  }
}

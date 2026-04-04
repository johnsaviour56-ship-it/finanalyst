import { NextRequest, NextResponse } from "next/server";
import { searchTicker } from "@/lib/yahoo";
import { NGX_TICKERS } from "@/lib/market";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) return NextResponse.json({ results: [] });

  try {
    const ngxMatches = Object.entries(NGX_TICKERS)
      .filter(([code]) => code.toLowerCase().includes(query.toLowerCase()))
      .map(([code, ticker]) => ({ ticker, shortCode: code, exchange: "NGX", name: code }));

    const yahooResults = await searchTicker(query);
    const mapped = yahooResults.slice(0, 8).map((q: any) => ({
      ticker: q.symbol,
      name: q.longname ?? q.shortname ?? q.symbol,
      exchange: q.exchange ?? "",
      shortCode: q.symbol,
    }));

    return NextResponse.json({ results: [...ngxMatches, ...mapped].slice(0, 10) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results: [] }, { status: 500 });
  }
}

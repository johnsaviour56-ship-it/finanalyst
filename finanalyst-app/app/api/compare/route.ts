import { NextRequest, NextResponse } from "next/server";
import { getQuote, getSummary, getHistory } from "@/lib/yahoo";
import { NGX_TICKERS, computeTechnicals, predictStock } from "@/lib/market";

export async function GET(req: NextRequest) {
  const tickersParam = req.nextUrl.searchParams.get("tickers");
  if (!tickersParam) return NextResponse.json({ error: "No tickers provided" }, { status: 400 });

  const tickers = tickersParam.split(",").map(t => {
    const upper = t.trim().toUpperCase();
    return { display: upper, yahoo: NGX_TICKERS[upper] ?? upper };
  }).slice(0, 4);

  try {
    const results = await Promise.allSettled(
      tickers.map(async ({ display, yahoo }) => {
        const [quote, summary, history] = await Promise.allSettled([
          getQuote(yahoo),
          getSummary(yahoo),
          getHistory(yahoo, 90),
        ]);

        const q = quote.status === "fulfilled" ? quote.value : null;
        const s = summary.status === "fulfilled" ? summary.value : null;
        const h = history.status === "fulfilled" ? history.value : [];

        const technicals = computeTechnicals(h);
        const fundamentals = {
          pe: s?.pe ?? null,
          roe: s?.roe ?? null,
          debtToEquity: s?.debtToEquity ?? null,
          netProfitMargin: s?.netProfitMargin ?? null,
        };
        const prediction = predictStock(fundamentals, technicals, { pe: s?.pe ?? null });

        return {
          ticker: display,
          name: s?.name ?? q?.name ?? display,
          price: q?.price ?? 0,
          changePct: q?.changePct ?? 0,
          marketCap: s?.marketCap ?? q?.marketCap ?? 0,
          pe: s?.pe ?? null,
          roe: s?.roe ?? null,
          debtToEquity: s?.debtToEquity ?? null,
          netProfitMargin: s?.netProfitMargin ?? null,
          trend: technicals.trend,
          rsi: technicals.rsi,
          prediction: prediction.signal,
          confidence: prediction.confidence,
          history: h.slice(-30).map(p => ({ date: p.date, close: p.close })),
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

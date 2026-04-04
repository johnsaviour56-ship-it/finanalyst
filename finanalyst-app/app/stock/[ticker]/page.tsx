"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import Link from "next/link";

const SIGNAL_STYLES: Record<string, string> = {
  "Undervalued": "bg-green-100 text-green-800",
  "Growth Opportunity": "bg-blue-100 text-blue-800",
  "Neutral": "bg-gray-100 text-gray-700",
  "Overvalued": "bg-yellow-100 text-yellow-800",
  "High Risk": "bg-red-100 text-red-800",
};
const TREND_ICON: Record<string, string> = { Bullish: "📈", Bearish: "📉", Sideways: "➡️" };

function fmt(n: number | null) {
  if (n === null || n === undefined) return "—";
  if (Math.abs(n) >= 1e9) return `₦${(n/1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `₦${(n/1e6).toFixed(2)}M`;
  return n.toLocaleString();
}

export default function StockPage({ params }: { params: { ticker: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/stock/${params.ticker}`)
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [params.ticker]);

  if (loading) return (
    <div className="flex items-center gap-3 text-brand animate-pulse py-20 justify-center">
      <span className="text-2xl">📡</span><span>Loading {params.ticker}...</span>
    </div>
  );
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">⚠️ {error}</div>;
  if (!data) return null;

  const { quote, fundamentals, history, technicals, prediction } = data;
  const isUp = quote.changePct >= 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand">{quote.ticker}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${SIGNAL_STYLES[prediction.signal]}`}>
              {prediction.signal}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{quote.name}</p>
          <p className="text-xs text-gray-400">{fundamentals.sector} · {fundamentals.industry}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-gray-900">₦{quote.price.toFixed(2)}</div>
          <div className={`text-sm font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
            {isUp ? "▲" : "▼"} {Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePct).toFixed(2)}%)
          </div>
          <div className="text-xs text-gray-400 mt-1">{quote.currency} · {quote.exchange}</div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Market Cap", value: fmt(quote.marketCap) },
          { label: "P/E Ratio", value: quote.pe ? quote.pe.toFixed(1) : "—" },
          { label: "EPS", value: quote.eps ? `₦${quote.eps.toFixed(2)}` : "—" },
          { label: "Dividend Yield", value: quote.dividendYield ? `${quote.dividendYield.toFixed(2)}%` : "—" },
          { label: "52W High", value: `₦${quote.high52w.toFixed(2)}` },
          { label: "52W Low", value: `₦${quote.low52w.toFixed(2)}` },
          { label: "Beta", value: quote.beta ? quote.beta.toFixed(2) : "—" },
          { label: "Volume", value: quote.volume.toLocaleString() },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border p-3 shadow-sm">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className="font-bold text-gray-800 mt-0.5">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Price chart */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-brand">Price History (90 days)</h2>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            technicals.trend === "Bullish" ? "bg-green-100 text-green-700" :
            technicals.trend === "Bearish" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
          }`}>
            {TREND_ICON[technicals.trend]} {technicals.trend}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
            <Tooltip formatter={(v: number) => `₦${v.toFixed(2)}`} labelFormatter={l => `Date: ${l}`} />
            {technicals.sma50 && <ReferenceLine y={technicals.sma50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "SMA50", fontSize: 10 }} />}
            {technicals.sma200 && <ReferenceLine y={technicals.sma200} stroke="#8b5cf6" strokeDasharray="4 4" label={{ value: "SMA200", fontSize: 10 }} />}
            <Line type="monotone" dataKey="close" stroke="#1e3a5f" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Technicals + Fundamentals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="text-sm font-semibold text-brand mb-3">Technical Indicators</h2>
          {[
            { label: "RSI (14)", value: technicals.rsi, note: technicals.rsi < 30 ? "Oversold" : technicals.rsi > 70 ? "Overbought" : "Neutral" },
            { label: "MACD", value: technicals.macd?.toFixed(4) },
            { label: "SMA 50", value: technicals.sma50 ? `₦${technicals.sma50.toFixed(2)}` : "—" },
            { label: "SMA 200", value: technicals.sma200 ? `₦${technicals.sma200.toFixed(2)}` : "—" },
            { label: "Volatility (Ann.)", value: technicals.volatility ? `${technicals.volatility}%` : "—" },
          ].map(t => (
            <div key={t.label} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span className="text-gray-500">{t.label}</span>
              <span className="font-medium">{t.value ?? "—"} {t.note ? <span className="text-xs text-gray-400">({t.note})</span> : null}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="text-sm font-semibold text-brand mb-3">Fundamentals</h2>
          {[
            { label: "Revenue", value: fmt(fundamentals.revenue) },
            { label: "Net Income", value: fmt(fundamentals.netIncome) },
            { label: "ROE", value: fundamentals.roe ? `${fundamentals.roe.toFixed(1)}%` : "—" },
            { label: "ROA", value: fundamentals.roa ? `${fundamentals.roa.toFixed(1)}%` : "—" },
            { label: "Net Profit Margin", value: fundamentals.netProfitMargin ? `${fundamentals.netProfitMargin.toFixed(1)}%` : "—" },
            { label: "Debt/Equity", value: fundamentals.debtToEquity ? fundamentals.debtToEquity.toFixed(2) : "—" },
            { label: "Current Ratio", value: fundamentals.currentRatio ? fundamentals.currentRatio.toFixed(2) : "—" },
            { label: "Price/Book", value: fundamentals.priceToBook ? fundamentals.priceToBook.toFixed(2) : "—" },
          ].map(f => (
            <div key={f.label} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span className="text-gray-500">{f.label}</span>
              <span className="font-medium">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Prediction */}
      <div className={`rounded-2xl border-2 p-6 mb-6 ${SIGNAL_STYLES[prediction.signal]?.replace("text-", "border-").split(" ")[0]} bg-white`}>
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${SIGNAL_STYLES[prediction.signal]}`}>{prediction.signal}</span>
          <span className="text-sm text-gray-500">Confidence: {prediction.confidence}%</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Analysis Reasoning</h3>
        <ul className="space-y-1">
          {prediction.reasons.map((r: string, i: number) => (
            <li key={i} className="text-sm text-gray-600 flex gap-2"><span>→</span>{r}</li>
          ))}
        </ul>
      </div>

      {/* Company description */}
      {fundamentals.description && (
        <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-brand mb-2">About {quote.name}</h2>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{fundamentals.description}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/market" className="text-sm border border-brand text-brand px-4 py-2 rounded-lg hover:bg-blue-50 transition">
          ← Market Overview
        </Link>
        <Link href={`/compare?tickers=${params.ticker}`} className="text-sm bg-brand text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition">
          Compare with others
        </Link>
      </div>
    </div>
  );
}

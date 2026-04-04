"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Link from "next/link";

const COLORS = ["#1e3a5f", "#10b981", "#f59e0b", "#ef4444"];
const SIGNAL_STYLES: Record<string, string> = {
  "Undervalued": "text-green-600", "Growth Opportunity": "text-blue-600",
  "Neutral": "text-gray-600", "Overvalued": "text-yellow-600", "High Risk": "text-red-600",
};

function CompareContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("tickers") ?? "");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/compare?tickers=${encodeURIComponent(input)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (input) compare(); }, []);

  // Merge history for multi-line chart
  const chartData = data?.companies?.[0]?.history?.map((_: any, i: number) => {
    const point: any = { date: data.companies[0].history[i]?.date };
    data.companies.forEach((c: any) => { point[c.ticker] = c.history[i]?.close; });
    return point;
  }) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand mb-2">Compare Companies</h1>
      <p className="text-sm text-gray-500 mb-6">Enter up to 4 tickers separated by commas (e.g. DANGCEM, MTNN, GTCO)</p>

      <div className="flex gap-3 mb-6">
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="DANGCEM, MTNN, GTCO"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          onKeyDown={e => e.key === "Enter" && compare()} />
        <button onClick={compare} disabled={loading}
          className="bg-brand text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-900 transition disabled:opacity-50">
          {loading ? "Loading..." : "Compare"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">{error}</div>}

      {data?.companies && (
        <>
          {/* Price chart */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-brand mb-4">Price Trend (30 days)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                {data.companies.map((c: any, i: number) => (
                  <Line key={c.ticker} type="monotone" dataKey={c.ticker} stroke={COLORS[i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Metric</th>
                    {data.companies.map((c: any, i: number) => (
                      <th key={c.ticker} className="px-4 py-3 text-right" style={{ color: COLORS[i] }}>{c.ticker}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Price", key: "price", fmt: (v: number) => `₦${v?.toFixed(2)}` },
                    { label: "Change %", key: "changePct", fmt: (v: number) => `${v?.toFixed(2)}%` },
                    { label: "Market Cap", key: "marketCap", fmt: (v: number) => v >= 1e9 ? `₦${(v/1e9).toFixed(1)}B` : `₦${(v/1e6).toFixed(1)}M` },
                    { label: "P/E Ratio", key: "pe", fmt: (v: number) => v ? v.toFixed(1) : "—" },
                    { label: "ROE %", key: "roe", fmt: (v: number) => v ? `${v.toFixed(1)}%` : "—" },
                    { label: "Net Margin %", key: "netProfitMargin", fmt: (v: number) => v ? `${v.toFixed(1)}%` : "—" },
                    { label: "Debt/Equity", key: "debtToEquity", fmt: (v: number) => v ? v.toFixed(2) : "—" },
                    { label: "RSI", key: "rsi", fmt: (v: number) => v ? v.toFixed(1) : "—" },
                    { label: "Trend", key: "trend", fmt: (v: string) => v },
                  ].map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                      {data.companies.map((c: any) => (
                        <td key={c.ticker} className="px-4 py-3 text-right">{row.fmt(c[row.key])}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-blue-50">
                    <td className="px-4 py-3 font-semibold text-brand">AI Signal</td>
                    {data.companies.map((c: any) => (
                      <td key={c.ticker} className={`px-4 py-3 text-right font-semibold ${SIGNAL_STYLES[c.prediction]}`}>
                        {c.prediction}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual links */}
          <div className="flex flex-wrap gap-3">
            {data.companies.map((c: any, i: number) => (
              <Link key={c.ticker} href={`/stock/${c.ticker.replace(".LG","")}`}
                className="text-sm px-4 py-2 rounded-lg border-2 hover:bg-gray-50 transition font-medium"
                style={{ borderColor: COLORS[i], color: COLORS[i] }}>
                View {c.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return <Suspense><CompareContent /></Suspense>;
}

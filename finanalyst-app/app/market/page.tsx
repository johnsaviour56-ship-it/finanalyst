"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface StockRow {
  ticker: string; shortCode: string; name: string;
  price: number; change: number; changePct: number;
  volume: number; marketCap: number; pe: number | null;
}

function fmt(n: number) { return n >= 1e9 ? `₦${(n/1e9).toFixed(1)}B` : n >= 1e6 ? `₦${(n/1e6).toFixed(1)}M` : `₦${n.toLocaleString()}`; }
function pct(n: number) { return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`; }

export default function MarketPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "gainers" | "losers" | "active">("all");

  useEffect(() => {
    fetch("/api/market/ngx")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const displayed: StockRow[] = data
    ? tab === "gainers" ? data.gainers
    : tab === "losers" ? data.losers
    : tab === "active" ? data.mostActive
    : data.stocks
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand">NGX Market Overview</h1>
          <p className="text-sm text-gray-500">Nigerian Exchange Group — Live Data</p>
        </div>
        {data?.updatedAt && (
          <span className="text-xs text-gray-400">Updated: {new Date(data.updatedAt).toLocaleTimeString()}</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-brand animate-pulse py-12 justify-center">
          <span className="text-2xl">📡</span><span>Fetching live market data...</span>
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Stocks", value: data.stocks.length, icon: "📊" },
              { label: "Top Gainer", value: data.gainers[0] ? `${data.gainers[0].shortCode} ${pct(data.gainers[0].changePct)}` : "—", icon: "📈" },
              { label: "Top Loser", value: data.losers[0] ? `${data.losers[0].shortCode} ${pct(data.losers[0].changePct)}` : "—", icon: "📉" },
              { label: "Most Active", value: data.mostActive[0]?.shortCode ?? "—", icon: "🔥" },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl border p-4 shadow-sm">
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="text-xs text-gray-500">{c.label}</div>
                <div className="font-bold text-gray-800 text-sm mt-0.5">{c.value}</div>
              </div>
            ))}
          </div>

          {/* Gainers/Losers bar chart */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-brand mb-4">Top Movers (% Change)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[...data.gainers.slice(0,3), ...data.losers.slice(0,3)]}>
                <XAxis dataKey="shortCode" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                <Bar dataKey="changePct" radius={[4,4,0,0]}>
                  {[...data.gainers.slice(0,3), ...data.losers.slice(0,3)].map((s: StockRow, i: number) => (
                    <Cell key={i} fill={s.changePct >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabs + table */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="flex border-b">
              {(["all","gainers","losers","active"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-3 text-sm font-medium capitalize transition ${tab === t ? "border-b-2 border-brand text-brand" : "text-gray-500 hover:text-gray-700"}`}>
                  {t === "active" ? "Most Active" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Company</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Change</th>
                    <th className="px-4 py-3 text-right">Market Cap</th>
                    <th className="px-4 py-3 text-right">P/E</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((s: StockRow, i: number) => (
                    <tr key={s.ticker} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{s.shortCode}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[160px]">{s.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">₦{s.price.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${s.changePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {pct(s.changePct)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{fmt(s.marketCap)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{s.pe ? s.pe.toFixed(1) : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/stock/${s.shortCode}`}
                          className="text-xs bg-brand text-white px-3 py-1 rounded-full hover:bg-blue-900 transition">
                          Analyze
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

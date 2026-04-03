"use client";
import { useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PRED_COLOR: Record<string, string> = {
  Profitable: "text-green-600",
  Moderate: "text-yellow-600",
  "High Risk": "text-red-600",
};

export default function HistoryPage() {
  const [company, setCompany] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setError(null);
    try {
      const res = await axios.get(`${API}/api/analysis/history/${encodeURIComponent(company)}`);
      setData(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Not found");
      setData([]);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand mb-6">Company History</h1>
      <div className="flex gap-3 mb-6">
        <input
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Enter company name"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand"
          onKeyDown={e => e.key === "Enter" && search()}
        />
        <button onClick={search} className="bg-brand text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-900 transition">
          Search
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {data.length > 0 && (
        <>
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <h2 className="text-lg font-semibold text-brand mb-4">Score Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#1e3a5f" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {data.map((r) => (
              <div key={r.year} className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between">
                <div>
                  <span className="font-semibold">{r.year}</span>
                  <span className={`ml-3 text-sm font-medium ${PRED_COLOR[r.prediction] ?? ""}`}>{r.prediction}</span>
                  <p className="text-xs text-gray-500 mt-1">{r.explanation}</p>
                </div>
                <span className="text-2xl font-bold text-brand">{r.score}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

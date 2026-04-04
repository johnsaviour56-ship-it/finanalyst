"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell,
} from "recharts";
import type { Ratios } from "@/lib/ratios";
import { useState } from "react";

const RADAR_KEYS = [
  { key: "net_profit_margin", label: "NPM", max: 30 },
  { key: "roa", label: "ROA", max: 20 },
  { key: "roe", label: "ROE", max: 35 },
  { key: "current_ratio", label: "Liquidity", max: 4 },
  { key: "asset_turnover", label: "Efficiency", max: 2 },
];

const BAR_KEYS = [
  { key: "net_profit_margin", label: "NPM %", benchmark: 15 },
  { key: "roa", label: "ROA %", benchmark: 10 },
  { key: "roe", label: "ROE %", benchmark: 15 },
  { key: "current_ratio", label: "Current Ratio", benchmark: 2 },
  { key: "debt_to_equity", label: "D/E Ratio", benchmark: 1 },
  { key: "asset_turnover", label: "Asset Turnover", benchmark: 1 },
];

const COLORS = ["#1e3a5f", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function RatiosChart({ ratios }: { ratios: Ratios }) {
  const [view, setView] = useState<"radar" | "bar" | "benchmark">("radar");

  const radarData = RADAR_KEYS.map(({ key, label, max }) => {
    const raw = typeof ratios[key as keyof Ratios] === "number" ? (ratios[key as keyof Ratios] as number) : 0;
    return { subject: label, value: Math.min(Math.max(raw, 0), max), fullMark: max };
  });

  const barData = BAR_KEYS.map(({ key, label }) => ({
    name: label,
    value: typeof ratios[key as keyof Ratios] === "number" ? parseFloat((ratios[key as keyof Ratios] as number).toFixed(2)) : 0,
  }));

  const benchmarkData = BAR_KEYS.map(({ key, label, benchmark }) => ({
    name: label,
    actual: typeof ratios[key as keyof Ratios] === "number" ? parseFloat((ratios[key as keyof Ratios] as number).toFixed(2)) : 0,
    benchmark,
  }));

  return (
    <div className="mt-6 bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand">Visual Analysis</h2>
        <div className="flex gap-2">
          {(["radar", "bar", "benchmark"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                view === v ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {v === "radar" ? "🕸 Radar" : v === "bar" ? "📊 Bar" : "📈 vs Benchmark"}
            </button>
          ))}
        </div>
      </div>

      {view === "radar" && (
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <Radar name="Company" dataKey="value" stroke="#1e3a5f" fill="#1e3a5f" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      )}

      {view === "bar" && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === "benchmark" && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={benchmarkData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual" name="Your Company" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="benchmark" name="Benchmark" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

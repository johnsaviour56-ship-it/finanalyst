"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { Ratios } from "@/lib/ratios";

const KEYS = [
  { key: "net_profit_margin", label: "NPM", max: 30 },
  { key: "roa", label: "ROA", max: 20 },
  { key: "roe", label: "ROE", max: 35 },
  { key: "current_ratio", label: "Current", max: 4 },
  { key: "asset_turnover", label: "Turnover", max: 2 },
];

export default function RatiosChart({ ratios }: { ratios: Ratios }) {
  const data = KEYS.map(({ key, label, max }) => {
    const raw = typeof ratios[key as keyof Ratios] === "number" ? (ratios[key as keyof Ratios] as number) : 0;
    return { subject: label, value: Math.min(Math.max(raw, 0), max), fullMark: max };
  });

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-brand mb-3">Ratio Radar</h2>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar name="Ratios" dataKey="value" stroke="#1e3a5f" fill="#1e3a5f" fillOpacity={0.4} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

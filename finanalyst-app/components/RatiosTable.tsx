"use client";
import clsx from "clsx";
import type { RatioDetail } from "@/lib/ratios";

const statusStyles = {
  good: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  bad: "bg-red-100 text-red-800",
  neutral: "bg-gray-100 text-gray-700",
};
const statusIcons = { good: "✅", warning: "⚠️", bad: "❌", neutral: "ℹ️" };

export default function RatiosTable({ ratioDetails }: { ratioDetails: Record<string, RatioDetail> }) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-brand mb-3">Ratio Breakdown & Insights</h2>
      <div className="space-y-3">
        {Object.entries(ratioDetails).map(([key, detail]) => {
          const display =
            typeof detail.value === "boolean"
              ? detail.value ? "Yes" : "No"
              : `${(detail.value as number).toFixed(2)}${key.includes("margin") || key === "roa" || key === "roe" ? "%" : ""}`;
          return (
            <div key={key} className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800 text-sm">{detail.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">{display}</span>
                  <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", statusStyles[detail.status])}>
                    {statusIcons[detail.status]} {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{detail.insight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";
import clsx from "clsx";
import type { AnalysisResult } from "@/lib/ratios";

const styles: Record<string, string> = {
  Profitable: "from-green-50 to-emerald-100 border-green-400",
  Moderate: "from-yellow-50 to-amber-100 border-yellow-400",
  "High Risk": "from-red-50 to-rose-100 border-red-400",
};
const badges: Record<string, string> = {
  Profitable: "bg-green-500",
  Moderate: "bg-yellow-500",
  "High Risk": "bg-red-500",
};
const icons: Record<string, string> = {
  Profitable: "✅",
  Moderate: "⚠️",
  "High Risk": "🚨",
};

export default function ResultCard({ prediction, score, explanation, reasons, strengths, weaknesses }: AnalysisResult) {
  return (
    <div className={clsx("border-2 rounded-2xl p-6 mt-6 bg-gradient-to-br", styles[prediction] ?? "from-gray-50 to-gray-100 border-gray-300")}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icons[prediction]}</span>
          <div>
            <span className={clsx("text-white text-sm font-bold px-3 py-1 rounded-full", badges[prediction])}>
              {prediction}
            </span>
            <p className="text-xs text-gray-500 mt-1">Profitability Assessment</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black text-gray-800">{score}</div>
          <div className="text-xs text-gray-500">out of 100</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full bg-white/60 rounded-full h-3 mb-4">
        <div
          className={clsx("h-3 rounded-full transition-all", badges[prediction])}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-700 leading-relaxed mb-5">{explanation}</p>

      {/* Reasons */}
      {reasons.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Why this prediction?</h4>
          <ul className="space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-gray-400">→</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {strengths.length > 0 && (
          <div className="bg-white/70 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-green-700 mb-2">💪 Strengths</h4>
            <ul className="space-y-1">
              {strengths.map((s, i) => <li key={i} className="text-xs text-gray-600">{s}</li>)}
            </ul>
          </div>
        )}
        {weaknesses.length > 0 && (
          <div className="bg-white/70 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Weaknesses</h4>
            <ul className="space-y-1">
              {weaknesses.map((w, i) => <li key={i} className="text-xs text-gray-600">{w}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

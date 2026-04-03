"use client";
import clsx from "clsx";

interface Props {
  prediction: string;
  score: number;
  explanation: string;
  method?: string;
}

const colorMap: Record<string, string> = {
  Profitable: "bg-green-50 border-green-400 text-green-800",
  Moderate: "bg-yellow-50 border-yellow-400 text-yellow-800",
  "High Risk": "bg-red-50 border-red-400 text-red-800",
};

const badgeMap: Record<string, string> = {
  Profitable: "bg-green-500",
  Moderate: "bg-yellow-500",
  "High Risk": "bg-red-500",
};

export default function ResultCard({ prediction, score, explanation, method }: Props) {
  return (
    <div className={clsx("border-2 rounded-xl p-6 mt-6", colorMap[prediction] ?? "bg-gray-50 border-gray-300")}>
      <div className="flex items-center gap-3 mb-3">
        <span className={clsx("text-white text-sm font-bold px-3 py-1 rounded-full", badgeMap[prediction] ?? "bg-gray-400")}>
          {prediction}
        </span>
        <span className="text-2xl font-bold">{score} / 100</span>
        {method && <span className="text-xs text-gray-500 ml-auto">{method}</span>}
      </div>
      <p className="text-sm leading-relaxed">{explanation}</p>
    </div>
  );
}

"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import ResultCard from "@/components/ResultCard";
import RatiosTable from "@/components/RatiosTable";
import RatiosChart from "@/components/RatiosChart";
import DownloadReport from "@/components/DownloadReport";
import type { AnalysisResult } from "@/lib/ratios";

const FIELDS = [
  { name: "company_name", label: "Company Name", type: "text", required: true },
  { name: "revenue", label: "Revenue" },
  { name: "cost_of_goods_sold", label: "Cost of Goods Sold" },
  { name: "gross_profit", label: "Gross Profit" },
  { name: "operating_expenses", label: "Operating Expenses" },
  { name: "ebit", label: "EBIT" },
  { name: "interest_expense", label: "Interest Expense" },
  { name: "net_income", label: "Net Income" },
  { name: "total_assets", label: "Total Assets" },
  { name: "current_assets", label: "Current Assets" },
  { name: "current_liabilities", label: "Current Liabilities" },
  { name: "total_liabilities", label: "Total Liabilities" },
  { name: "total_equity", label: "Total Equity" },
  { name: "inventory", label: "Inventory" },
  { name: "operating_cash_flow", label: "Operating Cash Flow" },
];

export default function ManualPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyName = watch("company_name", "Company");

  const onSubmit = async (data: any) => {
    setLoading(true); setError(null);
    const payload: any = {};
    for (const f of FIELDS) {
      if (f.name === "company_name") continue;
      if (data[f.name]) payload[f.name] = parseFloat(data[f.name]);
    }
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      setResult(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand mb-6">Manual Data Entry</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-sm border">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              {...register(f.name, { required: f.required })}
              type={f.type ?? "number"}
              step="any"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder={f.type === "text" ? "" : "0.00"}
            />
            {errors[f.name] && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
        ))}
        <div className="md:col-span-2">
          <button type="submit" disabled={loading}
            className="bg-brand text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-900 transition disabled:opacity-50">
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}
      {result && (
        <>
          <ResultCard {...result} />
          <RatiosChart ratios={result.ratios} />
          <RatiosTable ratioDetails={result.ratioDetails} />
          <DownloadReport companyName={companyName} {...result} />
        </>
      )}
    </div>
  );
}

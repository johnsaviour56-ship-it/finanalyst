"use client";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import ResultCard from "@/components/ResultCard";
import RatiosTable from "@/components/RatiosTable";
import RatiosChart from "@/components/RatiosChart";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const FIELDS = [
  { name: "company_name", label: "Company Name", type: "text", required: true },
  { name: "year", label: "Fiscal Year", type: "number", required: true },
  { name: "revenue", label: "Revenue", type: "number" },
  { name: "cost_of_goods_sold", label: "Cost of Goods Sold", type: "number" },
  { name: "gross_profit", label: "Gross Profit", type: "number" },
  { name: "operating_expenses", label: "Operating Expenses", type: "number" },
  { name: "ebit", label: "EBIT", type: "number" },
  { name: "interest_expense", label: "Interest Expense", type: "number" },
  { name: "net_income", label: "Net Income", type: "number" },
  { name: "total_assets", label: "Total Assets", type: "number" },
  { name: "current_assets", label: "Current Assets", type: "number" },
  { name: "current_liabilities", label: "Current Liabilities", type: "number" },
  { name: "total_liabilities", label: "Total Liabilities", type: "number" },
  { name: "total_equity", label: "Total Equity", type: "number" },
  { name: "inventory", label: "Inventory", type: "number" },
  { name: "operating_cash_flow", label: "Operating Cash Flow", type: "number" },
];

export default function ManualPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/api/analysis/`, {
        ...data,
        year: parseInt(data.year),
        ...Object.fromEntries(
          FIELDS.filter(f => f.type === "number" && f.name !== "year")
            .map(f => [f.name, data[f.name] ? parseFloat(data[f.name]) : null])
        ),
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand mb-6">Manual Data Entry</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-sm border">
        {FIELDS.map(f => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              {...register(f.name, { required: f.required })}
              type={f.type}
              step="any"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder={f.type === "number" ? "0.00" : ""}
            />
            {errors[f.name] && <p className="text-red-500 text-xs mt-1">Required</p>}
          </div>
        ))}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-900 transition disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <>
          <ResultCard prediction={result.prediction} score={result.score} explanation={result.explanation} method={result.method} />
          <RatiosChart ratios={result.ratios} />
          <RatiosTable ratios={result.ratios} />
          <div className="mt-4">
            <a
              href={`${API}/api/reports/${result.company_name}/${result.year}`}
              target="_blank"
              className="inline-block bg-gray-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
            >
              Download PDF Report
            </a>
          </div>
        </>
      )}
    </div>
  );
}

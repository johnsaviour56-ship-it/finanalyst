"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import ResultCard from "@/components/ResultCard";
import RatiosTable from "@/components/RatiosTable";
import RatiosChart from "@/components/RatiosChart";
import DownloadReport from "@/components/DownloadReport";
import type { AnalysisResult } from "@/lib/ratios";

const DOC_TYPES = [
  { id: "income", label: "Income Statement", icon: "📈", desc: "Revenue, expenses, net income" },
  { id: "balance", label: "Balance Sheet", icon: "⚖️", desc: "Assets, liabilities, equity" },
  { id: "cashflow", label: "Cash Flow Statement", icon: "💵", desc: "Operating, investing, financing" },
  { id: "combined", label: "Combined / Full Report", icon: "📋", desc: "All statements in one file" },
  { id: "annual", label: "Annual Report", icon: "📅", desc: "Full year financial report" },
  { id: "audit", label: "Audited Financials", icon: "🔍", desc: "CPA-audited statements" },
];

export default function UploadPage() {
  const [docType, setDocType] = useState("combined");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setLoading(true); setError(null); setResult(null);
    setFilename(files[0].name);
    const form = new FormData();
    form.append("file", files[0]);
    form.append("docType", docType);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [docType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
      "text/csv": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-excel": [],
    },
    maxFiles: 1,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand mb-2">Upload Financial Statement</h1>
      <p className="text-gray-500 text-sm mb-6">Select your document type, then upload the file for instant analysis.</p>

      {/* Document type selector */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Select Document Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DOC_TYPES.map((dt) => (
            <button
              key={dt.id}
              onClick={() => setDocType(dt.id)}
              className={`text-left p-4 rounded-xl border-2 transition ${
                docType === dt.id
                  ? "border-brand bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="text-2xl mb-1">{dt.icon}</div>
              <div className="text-sm font-semibold text-gray-800">{dt.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{dt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
          isDragActive ? "border-brand bg-blue-50" : "border-gray-300 hover:border-brand hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">📂</div>
        <p className="text-gray-600 font-medium">
          {isDragActive ? "Drop it here..." : "Drag & drop your file here, or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-2">Supports PDF, Excel (.xlsx, .xls), and CSV — max 10MB</p>
        {docType && (
          <p className="text-xs text-brand mt-2 font-medium">
            Selected: {DOC_TYPES.find(d => d.id === docType)?.icon} {DOC_TYPES.find(d => d.id === docType)?.label}
          </p>
        )}
      </div>

      {loading && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="animate-spin text-xl">⚙️</div>
          <div>
            <p className="text-sm font-medium text-blue-800">Analyzing {filename}...</p>
            <p className="text-xs text-blue-600">Extracting data, computing ratios, generating insights</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
          <p className="text-xs text-red-500 mt-1">
            Make sure your file has labeled rows like "Revenue", "Net Income", "Total Assets", etc.
          </p>
        </div>
      )}

      {result && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
            <span>📄</span><span>{filename}</span>
            <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {DOC_TYPES.find(d => d.id === docType)?.label}
            </span>
          </div>
          <ResultCard {...result} />
          <RatiosChart ratios={result.ratios} />
          <RatiosTable ratioDetails={result.ratioDetails} />
          <DownloadReport companyName="Uploaded Company" {...result} />
        </div>
      )}
    </div>
  );
}

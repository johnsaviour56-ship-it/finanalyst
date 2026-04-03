"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import ResultCard from "@/components/ResultCard";
import RatiosTable from "@/components/RatiosTable";
import RatiosChart from "@/components/RatiosChart";
import DownloadReport from "@/components/DownloadReport";
import type { AnalysisResult } from "@/lib/ratios";

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setLoading(true); setError(null); setResult(null);
    const form = new FormData();
    form.append("file", files[0]);
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [], "text/csv": [], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], "application/vnd.ms-excel": [] },
    maxFiles: 1,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand mb-6">Upload Financial Statement</h1>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
          isDragActive ? "border-brand bg-blue-50" : "border-gray-300 hover:border-brand"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-500 text-sm">
          {isDragActive ? "Drop it here..." : "Drag & drop an Excel or CSV file, or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-2">Supported: .pdf, .xlsx, .xls, .csv</p>
      </div>

      {loading && <p className="mt-4 text-brand animate-pulse">Analyzing...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <>
          <ResultCard prediction={result.prediction} score={result.score} explanation={result.explanation} />
          <RatiosChart ratios={result.ratios} />
          <RatiosTable ratios={result.ratios} />
          <DownloadReport companyName="Uploaded Company" {...result} />
        </>
      )}
    </div>
  );
}

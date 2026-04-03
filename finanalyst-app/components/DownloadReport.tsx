"use client";
import type { AnalysisResult } from "@/lib/ratios";

interface Props extends AnalysisResult {
  companyName: string;
}

export default function DownloadReport({ companyName, ratios, score, prediction, explanation }: Props) {
  const handleDownload = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const colors: Record<string, [number, number, number]> = {
      Profitable: [22, 163, 74],
      Moderate: [234, 179, 8],
      "High Risk": [220, 38, 38],
    };
    const c = colors[prediction] ?? [100, 100, 100];

    doc.setFontSize(20);
    doc.setTextColor(30, 58, 95);
    doc.text("FinAnalyst – Financial Report", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Company: ${companyName}`, 14, 30);

    doc.setFontSize(14);
    doc.setTextColor(...c);
    doc.text(`Prediction: ${prediction}   |   Score: ${score}/100`, 14, 42);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(explanation, 180);
    doc.text(lines, 14, 52);

    const tableRows = [
      ["Net Profit Margin (%)", ratios.net_profit_margin.toFixed(2)],
      ["Return on Assets (%)", ratios.roa.toFixed(2)],
      ["Return on Equity (%)", ratios.roe.toFixed(2)],
      ["Current Ratio", ratios.current_ratio.toFixed(2)],
      ["Quick Ratio", ratios.quick_ratio.toFixed(2)],
      ["Debt-to-Equity", ratios.debt_to_equity.toFixed(2)],
      ["Asset Turnover", ratios.asset_turnover.toFixed(2)],
      ["Positive Operating Cash Flow", ratios.operating_cf_positive ? "Yes" : "No"],
    ];

    autoTable(doc, {
      startY: 65,
      head: [["Ratio", "Value"]],
      body: tableRows,
      headStyles: { fillColor: [30, 58, 95] },
      alternateRowStyles: { fillColor: [240, 244, 248] },
    });

    doc.save(`${companyName.replace(/\s+/g, "_")}_report.pdf`);
  };

  return (
    <button
      onClick={handleDownload}
      className="mt-6 inline-block bg-gray-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
    >
      Download PDF Report
    </button>
  );
}

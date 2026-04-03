"use client";

interface Ratios {
  net_profit_margin?: number;
  roa?: number;
  roe?: number;
  current_ratio?: number;
  quick_ratio?: number;
  debt_to_equity?: number;
  asset_turnover?: number;
  operating_cf_positive?: boolean;
}

const LABELS: Record<string, string> = {
  net_profit_margin: "Net Profit Margin (%)",
  roa: "Return on Assets (%)",
  roe: "Return on Equity (%)",
  current_ratio: "Current Ratio",
  quick_ratio: "Quick Ratio",
  debt_to_equity: "Debt-to-Equity",
  asset_turnover: "Asset Turnover",
  operating_cf_positive: "Positive Operating Cash Flow",
};

export default function RatiosTable({ ratios }: { ratios: Ratios }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <h2 className="text-lg font-semibold text-brand mb-3">Financial Ratios</h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-brand text-white">
            <th className="text-left px-4 py-2">Ratio</th>
            <th className="text-right px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(LABELS).map(([key, label], i) => {
            const val = ratios[key as keyof Ratios];
            const display =
              typeof val === "boolean"
                ? val ? "Yes" : "No"
                : typeof val === "number"
                ? val.toFixed(2)
                : "—";
            return (
              <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2">{label}</td>
                <td className="px-4 py-2 text-right font-mono">{display}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

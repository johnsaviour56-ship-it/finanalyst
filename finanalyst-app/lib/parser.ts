import * as XLSX from "xlsx";
import type { FinancialData } from "./ratios";

const FIELD_KEYWORDS: Record<keyof FinancialData, string[]> = {
  revenue: ["revenue", "total revenue", "net revenue", "net sales", "total sales"],
  cost_of_goods_sold: ["cost of goods sold", "cogs", "cost of sales"],
  gross_profit: ["gross profit", "gross income"],
  operating_expenses: ["operating expenses", "total operating expenses", "opex"],
  ebit: ["ebit", "operating income", "operating profit", "income from operations"],
  interest_expense: ["interest expense", "interest charges"],
  net_income: ["net income", "net profit", "net earnings", "profit after tax"],
  total_assets: ["total assets"],
  current_assets: ["total current assets", "current assets"],
  current_liabilities: ["total current liabilities", "current liabilities"],
  total_liabilities: ["total liabilities"],
  total_equity: ["total equity", "shareholders equity", "stockholders equity"],
  inventory: ["inventory", "inventories"],
  operating_cash_flow: ["net cash from operating", "cash from operations", "operating activities"],
};

function matchField(label: string): keyof FinancialData | null {
  const lower = label.toLowerCase().trim();
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return field as keyof FinancialData;
  }
  return null;
}

function cleanNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const s = String(val).replace(/,/g, "").replace(/\$/g, "").replace(/\(/g, "-").replace(/\)/g, "").trim();
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function extractFromText(text: string): FinancialData {
  const result: FinancialData = {};
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const numMatches = line.match(/[-]?\(?\d[\d,]*\.?\d*\)?/g);
    if (!numMatches) continue;
    const num = cleanNumber(numMatches[numMatches.length - 1]);
    if (num === null) continue;
    const field = matchField(line);
    if (field && !(field in result)) result[field] = num;
  }
  return result;
}

function parseExcelOrCsv(buffer: ArrayBuffer): FinancialData {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const result: FinancialData = {};
  for (const row of rows) {
    if (!row || !row[0]) continue;
    const field = matchField(String(row[0]));
    if (field && !(field in result)) {
      for (let i = row.length - 1; i >= 1; i--) {
        const num = cleanNumber(row[i]);
        if (num !== null) { result[field] = num; break; }
      }
    }
  }
  return result;
}

export async function parseFile(buffer: ArrayBuffer, filename: string): Promise<FinancialData> {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    // Dynamically import pdf-parse (server-side only)
    const pdfParse = (await import("pdf-parse")).default;
    const nodeBuffer = Buffer.from(buffer);
    const data = await pdfParse(nodeBuffer);
    return extractFromText(data.text);
  }

  return parseExcelOrCsv(buffer);
}

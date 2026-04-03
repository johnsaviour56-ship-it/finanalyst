import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/lib/parser";
import { analyze } from "@/lib/ratios";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      return NextResponse.json({ error: "Only CSV and Excel files supported" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const financialData = parseFile(buffer, file.name);

    if (Object.keys(financialData).length === 0) {
      return NextResponse.json({ error: "No recognizable financial data found in file" }, { status: 422 });
    }

    const result = analyze(financialData);
    return NextResponse.json({ extracted_data: financialData, ...result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

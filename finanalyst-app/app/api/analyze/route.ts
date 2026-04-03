import { NextRequest, NextResponse } from "next/server";
import { analyze } from "@/lib/ratios";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = analyze(data);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { runFollowUpScan } from "@/lib/scheduler";

export async function POST() {
  const result = await runFollowUpScan();
  return NextResponse.json(result);
}

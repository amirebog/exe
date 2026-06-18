import { NextResponse } from "next/server";
import { getEmailCount, getRoleStats } from "@/lib/redis";

export async function GET() {
  try {
    const [total, roles] = await Promise.all([getEmailCount(), getRoleStats()]);
    return NextResponse.json({ total, roles });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
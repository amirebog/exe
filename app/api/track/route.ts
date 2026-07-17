import { NextRequest, NextResponse } from "next/server";
import { trackVisit, getClientIp } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    await trackVisit(ip);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json(
      { error: "Failed to track visit" },
      { status: 500 }
    );
  }
}

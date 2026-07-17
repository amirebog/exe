import { NextResponse } from "next/server";
import { sendDailyReport } from "@/lib/telegram-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    await sendDailyReport();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending daily report:", error);
    return NextResponse.json(
      { error: "Failed to send daily report" },
      { status: 500 }
    );
  }
}

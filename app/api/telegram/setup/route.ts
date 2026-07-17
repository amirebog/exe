import { NextResponse } from "next/server";
import { setupBotWebhook, getWebhookStatus } from "@/lib/telegram/setup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET || process.env.SETUP_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getWebhookStatus();
  return NextResponse.json({ status });
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await setupBotWebhook();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

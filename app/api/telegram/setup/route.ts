import { NextResponse } from "next/server";
import { setupBotWebhook, getWebhookStatus } from "@/lib/telegram/setup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSetupSecret(): string {
  return (
    process.env.CRON_SECRET ||
    process.env.SETUP_SECRET ||
    process.env.TELEGRAM_BOT_TOKEN ||
    ""
  ).trim();
}

function isAuthorized(req: Request): boolean {
  const secret = getSetupSecret();
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  return Boolean(key && key === secret);
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        hint: "Use Authorization: Bearer <CRON_SECRET|SETUP_SECRET|BOT_TOKEN> or ?key=",
      },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  if (url.searchParams.get("action") === "setup") {
    const result = await setupBotWebhook();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
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

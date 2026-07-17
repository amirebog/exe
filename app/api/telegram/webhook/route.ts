import { webhookCallback } from "grammy";
import { getBot } from "@/lib/telegram-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = webhookCallback(getBot(), "std/http");

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  return handler(req);
}

export async function GET() {
  return Response.json({ status: "Telegram webhook is active" });
}

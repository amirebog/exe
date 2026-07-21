import { createWebhookHandler } from "@/lib/telegram/bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const handler = createWebhookHandler();
    return await handler(req);
  } catch (error) {
    console.error("Telegram webhook error:", error);
    // Always 200 to Telegram so it doesn't keep retrying bad updates forever
    // unless it's clearly an auth issue.
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.toLowerCase().includes("secret")) {
      return new Response("Unauthorized", { status: 401 });
    }
    return new Response("OK", { status: 200 });
  }
}

export async function GET() {
  return Response.json({
    status: "Telegram webhook is active",
    hint: "POST updates from Telegram land here. Use /api/telegram/setup to configure.",
  });
}

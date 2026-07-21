import { getSiteUrl, getBotToken } from "./utils";
import { BOT_COMMANDS } from "./commands";

export async function setupBotWebhook(): Promise<{
  ok: boolean;
  message: string;
}> {
  const token = getBotToken();
  const siteUrl = getSiteUrl();

  if (!token) {
    return { ok: false, message: "❌ TELEGRAM_BOT_TOKEN تنظیم نشده." };
  }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`;
  const secret = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim() || undefined;

  try {
    const { Bot } = await import("grammy");
    const bot = new Bot(token);

    await bot.api.setMyCommands(BOT_COMMANDS);

    await bot.api.setWebhook(webhookUrl, {
      drop_pending_updates: true,
      ...(secret ? { secret_token: secret } : {}),
      allowed_updates: ["message", "callback_query"],
    });

    const info = await bot.api.getWebhookInfo();

    return {
      ok: true,
      message: [
        "✅ <b>Webhook با موفقیت ست شد!</b>",
        "",
        `🔗 ${webhookUrl}`,
        `📬 صف: ${info.pending_update_count}`,
        secret ? "🔐 Secret token فعال است" : "🔓 بدون secret token",
        "",
        "حالا /start را بزنید.",
      ].join("\n"),
    };
  } catch (error) {
    console.error("Webhook setup failed:", error);
    return {
      ok: false,
      message: `❌ خطا در ست کردن webhook:\n${error instanceof Error ? error.message : "Unknown"}`,
    };
  }
}

export async function getWebhookStatus(): Promise<string> {
  const token = getBotToken();
  if (!token) return "❌ توکن تنظیم نشده";

  const { Bot } = await import("grammy");
  const bot = new Bot(token);
  const info = await bot.api.getWebhookInfo();

  if (!info.url) return "❌ Webhook ست نشده — /setup بزنید یا از API setup استفاده کنید";

  return [
    "✅ Webhook فعال",
    `🔗 ${info.url}`,
    `📬 صف: ${info.pending_update_count}`,
    info.last_error_message
      ? `⚠️ آخرین خطا: ${info.last_error_message}`
      : "",
    info.last_error_date
      ? `🕒 زمان خطا: ${new Date(info.last_error_date * 1000).toISOString()}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

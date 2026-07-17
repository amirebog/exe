import { getSiteUrl } from "./utils";
import { BOT_COMMANDS } from "./commands";

export async function setupBotWebhook(): Promise<{
  ok: boolean;
  message: string;
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const siteUrl = getSiteUrl();

  if (!token) {
    return { ok: false, message: "❌ TELEGRAM_BOT_TOKEN تنظیم نشده." };
  }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  try {
    const { Bot } = await import("grammy");
    const bot = new Bot(token);

    await bot.api.setMyCommands(BOT_COMMANDS);

    const webhookOpts: { url: string; secret_token?: string; drop_pending_updates?: boolean } = {
      url: webhookUrl,
      drop_pending_updates: true,
    };
    if (secret) webhookOpts.secret_token = secret;

    await bot.api.setWebhook(webhookUrl, webhookOpts);

    const info = await bot.api.getWebhookInfo();

    return {
      ok: true,
      message: [
        "✅ <b>Webhook با موفقیت ست شد!</b>",
        "",
        `🔗 ${webhookUrl}`,
        `📬 صف: ${info.pending_update_count}`,
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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return "❌ توکن تنظیم نشده";

  const { Bot } = await import("grammy");
  const bot = new Bot(token);
  const info = await bot.api.getWebhookInfo();

  if (!info.url) return "❌ Webhook ست نشده — /setup بزنید";

  return [
    "✅ Webhook فعال",
    `🔗 ${info.url}`,
    `📬 صف: ${info.pending_update_count}`,
    info.last_error_message
      ? `⚠️ آخرین خطا: ${info.last_error_message}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

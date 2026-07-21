import { Bot, webhookCallback } from "grammy";
import { registerHandlers } from "./handlers";
import { getBotToken } from "./utils";

let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    const token = getBotToken();
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }
    botInstance = new Bot(token);
    registerHandlers(botInstance);
  }
  return botInstance;
}

/** Fresh webhook handler for each request (safer on serverless). */
export function createWebhookHandler() {
  const secret = (process.env.TELEGRAM_WEBHOOK_SECRET || "").trim() || undefined;
  return webhookCallback(getBot(), "std/http", {
    ...(secret ? { secretToken: secret } : {}),
  });
}

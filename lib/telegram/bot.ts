import { Bot } from "grammy";
import { registerHandlers } from "./handlers";

let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    botInstance = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
    registerHandlers(botInstance);
  }
  return botInstance;
}

/**
 * Set Telegram webhook URL after deployment.
 * Usage: pnpm webhook:set
 */
import { readFileSync } from "fs";
import { join } from "path";

function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env file is optional if env vars are already set
  }
}

loadEnvFile();

const token = process.env.TELEGRAM_BOT_TOKEN;
const siteUrl = process.env.SITE_URL;

if (!token || !siteUrl) {
  console.error("Missing TELEGRAM_BOT_TOKEN or SITE_URL in .env");
  process.exit(1);
}

const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/telegram/webhook`;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

const body: Record<string, string> = { url: webhookUrl };
if (secret) body.secret_token = secret;

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const data = (await res.json()) as { ok: boolean; description?: string };
console.log(data);

if (!data.ok) {
  process.exit(1);
}

console.log(`Webhook set to: ${webhookUrl}`);

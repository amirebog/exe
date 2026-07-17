/**
 * Set Telegram webhook URL after deployment.
 * Usage: pnpm webhook:set
 */
import { readFileSync } from "fs";
import { join } from "path";
import { setupBotWebhook } from "../lib/telegram/setup";

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
    // optional
  }
}

loadEnvFile();

const result = await setupBotWebhook();
console.log(result.message);
process.exit(result.ok ? 0 : 1);

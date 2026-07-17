import { redis } from "@/lib/redis";

export interface BotSettings {
  notifyContacts: boolean;
  notifyVisits: boolean;
}

const SETTINGS_KEY = "bot:settings";

const DEFAULTS: BotSettings = {
  notifyContacts: true,
  notifyVisits: false,
};

export async function getBotSettings(): Promise<BotSettings> {
  const data = await redis.get<BotSettings>(SETTINGS_KEY);
  return { ...DEFAULTS, ...data };
}

export async function setBotSettings(
  patch: Partial<BotSettings>
): Promise<BotSettings> {
  const current = await getBotSettings();
  const next = { ...current, ...patch };
  await redis.set(SETTINGS_KEY, next);
  return next;
}

export async function toggleSetting(
  key: keyof BotSettings
): Promise<BotSettings> {
  const current = await getBotSettings();
  return setBotSettings({ [key]: !current[key] });
}

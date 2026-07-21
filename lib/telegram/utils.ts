export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getAdminId(): string {
  return (process.env.TELEGRAM_CHAT_ID || "").trim();
}

/** Check admin by Telegram user id (not chat id). */
export function isAdmin(userId: number | string | undefined | null): boolean {
  const adminId = getAdminId();
  if (!adminId || userId == null) return false;
  return String(userId) === adminId;
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getAdminChatId(): string {
  return getAdminId();
}

export function getSiteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://zyrixx.vercel.app"
  ).replace(/\/$/, "");
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
}

export function getBotToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN || "").trim();
}

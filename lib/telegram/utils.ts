export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function isAdmin(chatId: number | string): boolean {
  const adminId = process.env.TELEGRAM_CHAT_ID;
  if (!adminId) return false;
  return String(chatId) === adminId;
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
  return process.env.TELEGRAM_CHAT_ID!;
}

export function getSiteUrl(): string {
  return (process.env.SITE_URL || "https://zyrixx.vercel.app").replace(/\/$/, "");
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
}

import { getBotSettings } from "./settings";
import { getDailyReport, getContacts, getRoleStats } from "@/lib/redis";
import { getPortfolioItems } from "@/lib/portfolio";
import { escapeHtml, getAdminChatId, formatDate } from "./utils";
import { contactNotifyKeyboard } from "./keyboards";

async function bot() {
  const { getBot } = await import("./bot");
  return getBot();
}

export async function notifyNewContact(data: {
  email: string;
  contact: string;
  role: string;
}) {
  const settings = await getBotSettings();
  if (!settings.notifyContacts) return;

  const message = [
    "📩 <b>تماس جدید از سایت</b>",
    "",
    `👤 <b>نقش:</b> ${escapeHtml(data.role)}`,
    `📧 <b>ایمیل:</b> ${escapeHtml(data.email)}`,
    `📱 <b>تماس:</b> ${escapeHtml(data.contact)}`,
    "",
    `🕒 ${escapeHtml(formatDate(Date.now()))}`,
  ].join("\n");

  await (await bot()).api.sendMessage(getAdminChatId(), message, {
    parse_mode: "HTML",
    reply_markup: contactNotifyKeyboard(),
  });
}

export async function buildStatsMessage() {
  const data = await getDailyReport();
  const portfolioCount = (await getPortfolioItems()).length;
  const visitDelta = data.todayVisits - data.yesterdayVisits;

  return [
    "📊 <b>آمار لحظه‌ای سایت</b>",
    "",
    `🔄 کل بازدید: <b>${data.totalVisits.toLocaleString()}</b>`,
    `📅 امروز: <b>${data.todayVisits.toLocaleString()}</b>`,
    `👤 یکتا امروز: <b>${data.uniqueToday}</b>`,
    `📧 کل تماس‌ها: <b>${data.totalEmails}</b>`,
    `📬 تماس امروز: <b>${data.todayEmails}</b>`,
    `🖼 نمونه‌کار: <b>${portfolioCount}</b> مورد`,
    `📈 نسبت دیروز: ${visitDelta >= 0 ? "📈" : "📉"} <b>${Math.abs(visitDelta)}</b>`,
  ].join("\n");
}

export async function buildDailyReportMessage() {
  const data = await getDailyReport();
  const totalContacts = data.totalEmails;
  const visitDelta = data.todayVisits - data.yesterdayVisits;
  const portfolioCount = (await getPortfolioItems()).length;

  let message = `📊 <b>گزارش روزانه — ${escapeHtml(data.today)}</b>\n\n`;
  message += `🔄 کل بازدید: ${data.totalVisits.toLocaleString()}\n`;
  message += `📅 امروز: ${data.todayVisits.toLocaleString()}\n`;
  message += `👤 یکتا: ${data.uniqueToday}\n`;
  message += `📧 تماس جدید: ${data.todayEmails}\n`;
  message += `🖼 نمونه‌کار: ${portfolioCount}\n`;
  message += `📈 vs دیروز: ${visitDelta >= 0 ? "📈" : "📉"} ${Math.abs(visitDelta)}\n`;

  message += `\n👥 <b>نقش‌ها:</b>\n`;
  const roles = Object.entries(data.roleStats);
  if (roles.length === 0) {
    message += "   هنوز داده‌ای نیست\n";
  } else {
    for (const [role, count] of roles) {
      const pct =
        totalContacts > 0
          ? ((count / totalContacts) * 100).toFixed(1)
          : "0";
      message += `   • ${escapeHtml(role)}: ${count} (${pct}%)\n`;
    }
  }

  if (data.hourlyData) {
    const peakHours = data.hourlyData
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter((h) => h.count > 0);

    if (peakHours.length > 0) {
      message += `\n⏰ <b>ساعات پیک:</b>\n`;
      for (const { hour, count } of peakHours) {
        message += `   • ${hour}:00-${hour + 1}:00 → ${count} بازدید\n`;
      }
    }
  }

  message += `\n✅ ${escapeHtml(formatDate(Date.now()))}`;
  return message;
}

export async function buildRolesMessage() {
  const stats = await getRoleStats();
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  if (total === 0) return "👥 هنوز داده‌ای برای نقش‌ها وجود ندارد.";

  const lines = Object.entries(stats).map(([role, count]) => {
    const pct = ((count / total) * 100).toFixed(1);
    const bar = "█".repeat(Math.round(Number(pct) / 10)) || "▏";
    return `${bar} <b>${escapeHtml(role)}</b>: ${count} (${pct}%)`;
  });

  return ["👥 <b>توزیع نقش‌ها</b>", "", ...lines].join("\n");
}

export async function buildPeakHoursMessage() {
  const data = await getDailyReport();
  if (!data.hourlyData) return "⏰ داده‌ای موجود نیست.";

  const hours = data.hourlyData
    .map((count, hour) => ({ hour, count }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count);

  if (hours.length === 0) return "⏰ امروز هنوز بازدیدی ثبت نشده.";

  const lines = hours
    .slice(0, 8)
    .map(({ hour, count }) => `   ${hour}:00-${hour + 1}:00 → ${count} بازدید`);

  return ["⏰ <b>ساعات پربازدید امروز</b>", "", ...lines].join("\n");
}

export async function buildContactsMessage(limit: number) {
  const contacts = await getContacts(limit);
  if (contacts.length === 0) return "📬 هنوز تماسی ثبت نشده.";

  const lines = contacts.map(
    (c, i) =>
      `${i + 1}. <b>${escapeHtml(c.role)}</b>\n   📧 ${escapeHtml(c.email)}\n   📱 ${escapeHtml(c.contact)}\n   🕒 ${escapeHtml(formatDate(c.timestamp))}`
  );

  return [`📬 <b>آخرین ${contacts.length} تماس</b>`, "", ...lines].join("\n\n");
}

export async function buildContactsCsv() {
  const contacts = await getContacts(100);
  if (contacts.length === 0) return null;

  const header = "email,contact,role,timestamp\n";
  const rows = contacts
    .map(
      (c) =>
        `"${c.email}","${c.contact}","${c.role}","${new Date(c.timestamp).toISOString()}"`
    )
    .join("\n");

  return header + rows;
}

export async function sendDailyReport() {
  const message = await buildDailyReportMessage();
  await (await bot()).api.sendMessage(getAdminChatId(), message, {
    parse_mode: "HTML",
  });
}

export async function fetchTelegramFile(fileId: string) {
  const file = await (await bot()).api.getFile(fileId);
  if (!file.file_path) throw new Error("File path not found");

  const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch file from Telegram");

  return {
    buffer: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") || "image/jpeg",
  };
}

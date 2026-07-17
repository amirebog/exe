import { Bot, InlineKeyboard } from "grammy";
import { getDailyReport, getContacts } from "@/lib/redis";
import {
  addPortfolioItem,
  deletePortfolioItem,
  getPortfolioItems,
} from "@/lib/portfolio";
import {
  clearAdminSession,
  getAdminSession,
  setAdminSession,
} from "@/lib/admin-session";

// ─── Utils ───────────────────────────────────────────────────────────────────

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

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getAdminChatId(): string {
  return process.env.TELEGRAM_CHAT_ID!;
}

// ─── Bot singleton ───────────────────────────────────────────────────────────

let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    botInstance = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
    registerHandlers(botInstance);
  }
  return botInstance;
}

// ─── Outgoing messages (used by API routes) ──────────────────────────────────

export async function notifyNewContact(data: {
  email: string;
  contact: string;
  role: string;
}) {
  const message = [
    "📩 <b>New contact from site</b>",
    "",
    `👤 <b>Role:</b> ${escapeHtml(data.role)}`,
    `📧 <b>Email:</b> ${escapeHtml(data.email)}`,
    `📱 <b>Contact:</b> ${escapeHtml(data.contact)}`,
    "",
    `🕒 ${escapeHtml(
      new Date().toLocaleString("en-US", { timeZone: "UTC" })
    )} UTC`,
  ].join("\n");

  await getBot().api.sendMessage(getAdminChatId(), message, {
    parse_mode: "HTML",
  });
}

export async function sendDailyReport() {
  const data = await getDailyReport();
  const totalContacts = data.totalEmails;
  const visitDelta = data.todayVisits - data.yesterdayVisits;
  const portfolioCount = (await getPortfolioItems()).length;

  let message = `📊 <b>Daily Report - ${escapeHtml(data.today)}</b>\n\n`;
  message += `🔄 <b>Total Visits:</b> ${data.totalVisits.toLocaleString()}\n`;
  message += `📅 <b>Today:</b> ${data.todayVisits.toLocaleString()} visits\n`;
  message += `👤 <b>Unique Today:</b> ${data.uniqueToday}\n`;
  message += `📧 <b>New Contacts:</b> ${data.todayEmails}\n`;
  message += `🖼 <b>Portfolio Items:</b> ${portfolioCount}\n`;
  message += `📈 <b>vs Yesterday:</b> ${
    visitDelta > 0 ? "📈" : "📉"
  } ${Math.abs(visitDelta).toLocaleString()}\n`;

  message += `\n👥 <b>Roles:</b>\n`;
  if (Object.keys(data.roleStats).length === 0) {
    message += `   No data yet\n`;
  } else {
    for (const [role, count] of Object.entries(data.roleStats)) {
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
      message += `\n⏰ <b>Peak Hours:</b>\n`;
      for (const { hour, count } of peakHours) {
        message += `   • ${hour}:00-${hour + 1}:00: ${count}\n`;
      }
    }
  }

  message += `\n✅ ${escapeHtml(
    new Date().toLocaleString("en-US", { timeZone: "UTC" })
  )} UTC`;

  await getBot().api.sendMessage(getAdminChatId(), message, {
    parse_mode: "HTML",
  });
}

export async function fetchTelegramFile(fileId: string) {
  const file = await getBot().api.getFile(fileId);
  if (!file.file_path) throw new Error("File path not found");

  const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch file from Telegram");

  return {
    buffer: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") || "image/jpeg",
  };
}

// ─── Bot commands (incoming) ─────────────────────────────────────────────────

const HELP_TEXT = [
  "👋 <b>Zyrix Bot</b>",
  "",
  "<b>Portfolio:</b>",
  "/addwork — Add item (photo → title → link)",
  "/listworks — List all items",
  "/deletework &lt;id&gt; — Delete item",
  "",
  "<b>Site:</b>",
  "/stats — Live site statistics",
  "/contacts — Last 5 contacts",
  "/report — Send daily report now",
  "",
  "/cancel — Cancel current action",
].join("\n");

function registerHandlers(bot: Bot) {
  bot.command("start", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) {
      await ctx.reply("⛔ Admin only.");
      return;
    }
    await ctx.reply(HELP_TEXT, { parse_mode: "HTML" });
  });

  bot.command("help", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;
    await ctx.reply(HELP_TEXT, { parse_mode: "HTML" });
  });

  bot.command("cancel", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;
    await clearAdminSession(ctx.chat.id);
    await ctx.reply("Cancelled.");
  });

  // ── Stats ──

  bot.command("stats", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    const data = await getDailyReport();
    const portfolioCount = (await getPortfolioItems()).length;

    await ctx.reply(
      [
        "📊 <b>Live Stats</b>",
        "",
        `🔄 Visits: ${data.totalVisits.toLocaleString()}`,
        `📅 Today: ${data.todayVisits.toLocaleString()}`,
        `👤 Unique today: ${data.uniqueToday}`,
        `📧 Total contacts: ${data.totalEmails}`,
        `📬 New today: ${data.todayEmails}`,
        `🖼 Portfolio: ${portfolioCount} items`,
      ].join("\n"),
      { parse_mode: "HTML" }
    );
  });

  bot.command("contacts", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    const contacts = await getContacts(5);
    if (contacts.length === 0) {
      await ctx.reply("No contacts yet.");
      return;
    }

    const lines = contacts.map(
      (c, i) =>
        `${i + 1}. <b>${escapeHtml(c.role)}</b>\n   📧 ${escapeHtml(c.email)}\n   📱 ${escapeHtml(c.contact)}`
    );

    await ctx.reply(
      `📬 <b>Recent Contacts</b>\n\n${lines.join("\n\n")}`,
      { parse_mode: "HTML" }
    );
  });

  bot.command("report", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;
    await sendDailyReport();
    await ctx.reply("✅ Daily report sent.");
  });

  // ── Portfolio ──

  bot.command("addwork", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;
    await setAdminSession(ctx.chat.id, { step: "photo" });
    await ctx.reply("📸 Send a photo.\n/cancel to abort.");
  });

  bot.command("listworks", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    const items = await getPortfolioItems();
    if (items.length === 0) {
      await ctx.reply("No items yet. /addwork");
      return;
    }

    const lines = items.map(
      (item, i) =>
        `${i + 1}. <b>${escapeHtml(item.title)}</b>\n   ID: <code>${item.id}</code>\n   ${escapeHtml(item.link)}`
    );

    await ctx.reply(
      `📁 <b>Portfolio</b> (${items.length})\n\n${lines.join("\n\n")}`,
      { parse_mode: "HTML" }
    );
  });

  bot.command("deletework", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    const id = ctx.match?.trim();
    if (!id) {
      await ctx.reply("Usage: /deletework &lt;id&gt;", { parse_mode: "HTML" });
      return;
    }

    const deleted = await deletePortfolioItem(id);
    await ctx.reply(deleted ? `✅ Deleted: ${id}` : `❌ Not found: ${id}`);
  });

  bot.on("message:photo", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    const session = await getAdminSession(ctx.chat.id);
    if (!session || session.step !== "photo") return;

    const photo = ctx.message.photo.at(-1);
    if (!photo) return;

    await setAdminSession(ctx.chat.id, {
      step: "title",
      imageFileId: photo.file_id,
    });
    await ctx.reply("✏️ Send the title.");
  });

  bot.on("message:text", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    const text = ctx.message.text.trim();
    if (text.startsWith("/")) return;

    const session = await getAdminSession(ctx.chat.id);
    if (!session) return;

    if (session.step === "title") {
      if (text.length < 2) {
        await ctx.reply("Too short. Min 2 characters.");
        return;
      }
      await setAdminSession(ctx.chat.id, { ...session, step: "link", title: text });
      await ctx.reply("🔗 Send the project link (https://...)");
      return;
    }

    if (session.step === "link") {
      if (!isValidUrl(text)) {
        await ctx.reply("Invalid URL.");
        return;
      }
      if (!session.imageFileId || !session.title) {
        await clearAdminSession(ctx.chat.id);
        await ctx.reply("Session expired. /addwork");
        return;
      }

      const item = await addPortfolioItem({
        title: session.title,
        link: text,
        imageFileId: session.imageFileId,
      });

      await clearAdminSession(ctx.chat.id);

      await ctx.reply(
        `✅ <b>Added!</b>\n\n📝 ${escapeHtml(item.title)}\n🔗 ${escapeHtml(item.link)}\n🆔 <code>${item.id}</code>`,
        {
          parse_mode: "HTML",
          reply_markup: new InlineKeyboard().url("Open", text),
        }
      );
    }
  });
}

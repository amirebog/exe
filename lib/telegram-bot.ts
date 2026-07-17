import { Bot, InlineKeyboard } from "grammy";
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
import { escapeHtml, isAdmin, isValidUrl } from "@/lib/telegram-utils";

let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    botInstance = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
    registerHandlers(botInstance);
  }
  return botInstance;
}

function registerHandlers(bot: Bot) {
  bot.command("start", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) {
      await ctx.reply("This bot is for admin use only.");
      return;
    }

    await ctx.reply(
      [
        "👋 <b>Zyrix Admin Bot</b>",
        "",
        "<b>Commands:</b>",
        "/addwork — Add portfolio item (photo → title → link)",
        "/listworks — List all portfolio items",
        "/deletework &lt;id&gt; — Delete a portfolio item",
        "/cancel — Cancel current action",
      ].join("\n"),
      { parse_mode: "HTML" }
    );
  });

  bot.command("cancel", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;
    await clearAdminSession(ctx.chat.id);
    await ctx.reply("Action cancelled.");
  });

  bot.command("addwork", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    await setAdminSession(ctx.chat.id, { step: "photo" });
    await ctx.reply(
      "📸 Send a photo for the portfolio item.\nUse /cancel to abort."
    );
  });

  bot.command("listworks", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    const items = await getPortfolioItems();
    if (items.length === 0) {
      await ctx.reply("No portfolio items yet. Use /addwork to add one.");
      return;
    }

    const lines = items.map(
      (item, index) =>
        `${index + 1}. <b>${escapeHtml(item.title)}</b>\n   ID: <code>${item.id}</code>\n   ${escapeHtml(item.link)}`
    );

    await ctx.reply(
      `📁 <b>Portfolio Items</b> (${items.length})\n\n${lines.join("\n\n")}`,
      { parse_mode: "HTML" }
    );
  });

  bot.command("deletework", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    const id = ctx.match?.trim();
    if (!id) {
      await ctx.reply("Usage: /deletework <id>\nUse /listworks to see IDs.");
      return;
    }

    const deleted = await deletePortfolioItem(id);
    if (deleted) {
      await ctx.reply(`✅ Deleted portfolio item: ${id}`);
    } else {
      await ctx.reply(`❌ Item not found: ${id}`);
    }
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

    await ctx.reply("✏️ Now send the title / description for this work.");
  });

  bot.on("message:text", async (ctx) => {
    if (!isAdmin(ctx.chat.id)) return;

    const text = ctx.message.text.trim();
    if (text.startsWith("/")) return;

    const session = await getAdminSession(ctx.chat.id);
    if (!session) return;

    if (session.step === "title") {
      if (text.length < 2) {
        await ctx.reply("Title is too short. Please send at least 2 characters.");
        return;
      }

      await setAdminSession(ctx.chat.id, {
        ...session,
        step: "link",
        title: text,
      });

      await ctx.reply("🔗 Now send the project link (https://...)");
      return;
    }

    if (session.step === "link") {
      if (!isValidUrl(text)) {
        await ctx.reply("Invalid URL. Please send a valid http(s) link.");
        return;
      }

      if (!session.imageFileId || !session.title) {
        await clearAdminSession(ctx.chat.id);
        await ctx.reply("Session expired. Please start again with /addwork.");
        return;
      }

      const item = await addPortfolioItem({
        title: session.title,
        link: text,
        imageFileId: session.imageFileId,
      });

      await clearAdminSession(ctx.chat.id);

      const keyboard = new InlineKeyboard().url("Open project", text);

      await ctx.reply(
        `✅ <b>Portfolio item added!</b>\n\n📝 ${escapeHtml(item.title)}\n🔗 ${escapeHtml(item.link)}\n🆔 <code>${item.id}</code>`,
        { parse_mode: "HTML", reply_markup: keyboard }
      );
    }
  });
}

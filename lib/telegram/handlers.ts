import type { Bot, Context } from "grammy";
import { InputFile } from "grammy";
import {
  addPortfolioItem,
  deletePortfolioItem,
  getPortfolioItemByIndex,
  getPortfolioItems,
  updatePortfolioItem,
} from "@/lib/portfolio";
import {
  clearAdminSession,
  getAdminSession,
  setAdminSession,
} from "@/lib/admin-session";
import { getBotSettings, toggleSetting } from "./settings";
import {
  buildContactsMessage,
  buildContactsCsv,
  buildDailyReportMessage,
  buildPeakHoursMessage,
  buildRolesMessage,
  buildStatsMessage,
  sendDailyReport,
} from "./notify";
import {
  backToMainKeyboard,
  backToPortfolioKeyboard,
  cancelKeyboard,
  contactsMenuKeyboard,
  deleteConfirmKeyboard,
  editFieldKeyboard,
  mainMenuKeyboard,
  portfolioItemKeyboard,
  portfolioListKeyboard,
  portfolioMenuKeyboard,
  portfolioPickKeyboard,
  settingsMenuKeyboard,
  statsMenuKeyboard,
} from "./keyboards";
import { escapeHtml, isAdmin, isValidUrl, formatDate } from "./utils";
import { setupBotWebhook } from "./setup";

const WELCOME = [
  "👋 <b>ربات مدیریت Zyrix</b>",
  "",
  "از منوی زیر هر کاری می‌خواهید انجام دهید:",
  "",
  "📁 <b>نمونه‌کار</b> — افزودن، ویرایش، حذف",
  "📊 <b>آمار</b> — بازدید، تماس، گزارش",
  "📬 <b>تماس‌ها</b> — لیست و خروجی",
  "⚙️ <b>تنظیمات</b> — اعلان‌ها و webhook",
].join("\n");

async function guardAdmin(ctx: Context): Promise<boolean> {
  if (!ctx.chat) return false;
  if (!isAdmin(ctx.chat.id)) {
    await ctx.reply("⛔ فقط ادمین دسترسی دارد.");
    return false;
  }
  return true;
}

async function replyMainMenu(ctx: Context, text = WELCOME) {
  await ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: mainMenuKeyboard(),
  });
}

export function registerHandlers(bot: Bot) {
  bot.catch(async (err) => {
    console.error("Telegram bot error:", err);
  });

  // ── Commands ──────────────────────────────────────────────────────────────

  bot.command("start", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    await clearAdminSession(ctx.chat!.id);
    await replyMainMenu(ctx);
  });

  bot.command("menu", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    await clearAdminSession(ctx.chat!.id);
    await replyMainMenu(ctx, "🏠 <b>منوی اصلی</b>");
  });

  bot.command("help", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    await ctx.reply(WELCOME, {
      parse_mode: "HTML",
      reply_markup: mainMenuKeyboard(),
    });
  });

  bot.command("cancel", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    await clearAdminSession(ctx.chat!.id);
    await replyMainMenu(ctx, "❌ عملیات لغو شد.");
  });

  bot.command("stats", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    await ctx.reply(await buildStatsMessage(), {
      parse_mode: "HTML",
      reply_markup: statsMenuKeyboard(),
    });
  });

  bot.command("contacts", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    await ctx.reply(await buildContactsMessage(5), {
      parse_mode: "HTML",
      reply_markup: contactsMenuKeyboard(),
    });
  });

  bot.command("report", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    await sendDailyReport();
    await ctx.reply("✅ گزارش روزانه ارسال شد.", {
      reply_markup: backToMainKeyboard(),
    });
  });

  bot.command("addwork", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    await setAdminSession(ctx.chat!.id, { step: "photo" });
    await ctx.reply("📸 عکس نمونه‌کار را بفرستید.", {
      reply_markup: cancelKeyboard(),
    });
  });

  bot.command("listworks", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    await showPortfolioList(ctx);
  });

  bot.command("setup", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;
    const result = await setupBotWebhook();
    await ctx.reply(result.message, {
      parse_mode: "HTML",
      reply_markup: backToMainKeyboard(),
    });
  });

  // ── Callback queries (buttons) ────────────────────────────────────────────

  bot.on("callback_query:data", async (ctx) => {
    if (!(await guardAdmin(ctx))) {
      await ctx.answerCallbackQuery();
      return;
    }

    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();

    // Main menus
    if (data === "menu:main") {
      await clearAdminSession(ctx.chat!.id);
      await ctx.editMessageText(WELCOME, {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(),
      }).catch(() => replyMainMenu(ctx));
      return;
    }

    if (data === "menu:portfolio") {
      await clearAdminSession(ctx.chat!.id);
      await ctx.editMessageText("📁 <b>مدیریت نمونه‌کار</b>\n\nیک گزینه انتخاب کنید:", {
        parse_mode: "HTML",
        reply_markup: portfolioMenuKeyboard(),
      }).catch(() =>
        ctx.reply("📁 <b>مدیریت نمونه‌کار</b>", {
          parse_mode: "HTML",
          reply_markup: portfolioMenuKeyboard(),
        })
      );
      return;
    }

    if (data === "menu:stats") {
      await ctx.editMessageText(await buildStatsMessage(), {
        parse_mode: "HTML",
        reply_markup: statsMenuKeyboard(),
      }).catch(() =>
        ctx.reply(await buildStatsMessage(), {
          parse_mode: "HTML",
          reply_markup: statsMenuKeyboard(),
        })
      );
      return;
    }

    if (data === "menu:contacts") {
      await ctx.editMessageText("📬 <b>مدیریت تماس‌ها</b>", {
        parse_mode: "HTML",
        reply_markup: contactsMenuKeyboard(),
      }).catch(() =>
        ctx.reply("📬 <b>مدیریت تماس‌ها</b>", {
          parse_mode: "HTML",
          reply_markup: contactsMenuKeyboard(),
        })
      );
      return;
    }

    if (data === "menu:settings") {
      const settings = await getBotSettings();
      await ctx.editMessageText("⚙️ <b>تنظیمات ربات</b>", {
        parse_mode: "HTML",
        reply_markup: settingsMenuKeyboard(settings.notifyContacts),
      }).catch(() =>
        ctx.reply("⚙️ <b>تنظیمات</b>", {
          parse_mode: "HTML",
          reply_markup: settingsMenuKeyboard(settings.notifyContacts),
        })
      );
      return;
    }

    if (data === "menu:help") {
      await ctx.editMessageText(WELCOME, {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(),
      }).catch(() => replyMainMenu(ctx));
      return;
    }

    if (data === "action:cancel") {
      await clearAdminSession(ctx.chat!.id);
      await replyMainMenu(ctx, "❌ لغو شد.");
      return;
    }

    // Portfolio actions
    if (data === "port:add") {
      await setAdminSession(ctx.chat!.id, { step: "photo" });
      await ctx.reply("📸 عکس نمونه‌کار را بفرستید.", {
        reply_markup: cancelKeyboard(),
      });
      return;
    }

    if (data === "port:list") {
      await showPortfolioList(ctx, true);
      return;
    }

    if (data === "port:edit_list") {
      const items = await getPortfolioItems();
      if (items.length === 0) {
        await ctx.reply("📭 نمونه‌کاری وجود ندارد.", {
          reply_markup: backToPortfolioKeyboard(),
        });
        return;
      }
      await ctx.reply("✏️ کدام مورد را ویرایش کنید؟", {
        reply_markup: portfolioPickKeyboard(items, "port:edit"),
      });
      return;
    }

    if (data === "port:del_list") {
      const items = await getPortfolioItems();
      if (items.length === 0) {
        await ctx.reply("📭 نمونه‌کاری وجود ندارد.", {
          reply_markup: backToPortfolioKeyboard(),
        });
        return;
      }
      await ctx.reply("🗑 کدام مورد حذف شود؟", {
        reply_markup: portfolioPickKeyboard(items, "port:del"),
      });
      return;
    }

    if (data.startsWith("port:view:")) {
      const index = Number(data.split(":")[2]);
      await showPortfolioItem(ctx, index);
      return;
    }

    if (data.startsWith("port:edit:")) {
      const index = Number(data.split(":")[2]);
      await showEditMenu(ctx, index);
      return;
    }

    if (data.startsWith("port:edit_title:")) {
      const index = Number(data.split(":")[2]);
      const item = await getPortfolioItemByIndex(index);
      if (!item) return;
      await setAdminSession(ctx.chat!.id, {
        step: "edit_title",
        itemId: item.id,
      });
      await ctx.reply(`📝 عنوان جدید را بفرستید.\n\nفعلی: <b>${escapeHtml(item.title)}</b>`, {
        parse_mode: "HTML",
        reply_markup: cancelKeyboard(),
      });
      return;
    }

    if (data.startsWith("port:edit_link:")) {
      const index = Number(data.split(":")[2]);
      const item = await getPortfolioItemByIndex(index);
      if (!item) return;
      await setAdminSession(ctx.chat!.id, {
        step: "edit_link",
        itemId: item.id,
      });
      await ctx.reply(`🔗 لینک جدید را بفرستید.\n\nفعلی: ${escapeHtml(item.link)}`, {
        parse_mode: "HTML",
        reply_markup: cancelKeyboard(),
      });
      return;
    }

    if (data.startsWith("port:edit_photo:")) {
      const index = Number(data.split(":")[2]);
      const item = await getPortfolioItemByIndex(index);
      if (!item) return;
      await setAdminSession(ctx.chat!.id, {
        step: "edit_photo",
        itemId: item.id,
      });
      await ctx.reply("📸 عکس جدید را بفرستید.", {
        reply_markup: cancelKeyboard(),
      });
      return;
    }

    if (data.startsWith("port:del:") && !data.includes("confirm")) {
      const index = Number(data.split(":")[2]);
      const item = await getPortfolioItemByIndex(index);
      if (!item) {
        await ctx.reply("❌ مورد پیدا نشد.");
        return;
      }
      await ctx.reply(
        `🗑 مطمئنی «<b>${escapeHtml(item.title)}</b>» حذف شود؟`,
        {
          parse_mode: "HTML",
          reply_markup: deleteConfirmKeyboard(index),
        }
      );
      return;
    }

    if (data.startsWith("port:del_confirm:")) {
      const index = Number(data.split(":")[2]);
      const item = await getPortfolioItemByIndex(index);
      if (!item) {
        await ctx.reply("❌ مورد پیدا نشد.");
        return;
      }
      await deletePortfolioItem(item.id);
      await ctx.reply(`✅ «${escapeHtml(item.title)}» حذف شد.`, {
        parse_mode: "HTML",
        reply_markup: backToPortfolioKeyboard(),
      });
      return;
    }

    // Stats actions
    if (data === "stats:live") {
      await ctx.reply(await buildStatsMessage(), {
        parse_mode: "HTML",
        reply_markup: statsMenuKeyboard(),
      });
      return;
    }

    if (data === "stats:report") {
      await ctx.reply(await buildDailyReportMessage(), {
        parse_mode: "HTML",
        reply_markup: statsMenuKeyboard(),
      });
      return;
    }

    if (data === "stats:roles") {
      await ctx.reply(await buildRolesMessage(), {
        parse_mode: "HTML",
        reply_markup: statsMenuKeyboard(),
      });
      return;
    }

    if (data === "stats:peak") {
      await ctx.reply(await buildPeakHoursMessage(), {
        parse_mode: "HTML",
        reply_markup: statsMenuKeyboard(),
      });
      return;
    }

    // Contacts actions
    if (data === "contacts:5") {
      await ctx.reply(await buildContactsMessage(5), {
        parse_mode: "HTML",
        reply_markup: contactsMenuKeyboard(),
      });
      return;
    }

    if (data === "contacts:20") {
      await ctx.reply(await buildContactsMessage(20), {
        parse_mode: "HTML",
        reply_markup: contactsMenuKeyboard(),
      });
      return;
    }

    if (data === "contacts:csv") {
      const csv = await buildContactsCsv();
      if (!csv) {
        await ctx.reply("📭 تماسی برای خروجی وجود ندارد.");
        return;
      }
      await ctx.replyWithDocument(
        new InputFile(Buffer.from(csv, "utf-8"), "contacts.csv"),
        { caption: "📄 خروجی ۱۰۰ تماس آخر", reply_markup: contactsMenuKeyboard() }
      );
      return;
    }

    // Settings actions
    if (data === "settings:toggle_contacts") {
      const settings = await toggleSetting("notifyContacts");
      await ctx.editMessageText(
        `⚙️ <b>تنظیمات</b>\n\nاعلان تماس: ${settings.notifyContacts ? "✅ روشن" : "❌ خاموش"}`,
        {
          parse_mode: "HTML",
          reply_markup: settingsMenuKeyboard(settings.notifyContacts),
        }
      ).catch(() => {});
      return;
    }

    if (data === "settings:webhook") {
      const info = await bot.api.getWebhookInfo();
      const status = info.url
        ? `✅ متصل\n🔗 ${escapeHtml(info.url)}\n📬 صف: ${info.pending_update_count}`
        : "❌ Webhook ست نشده";
      await ctx.reply(`🔗 <b>وضعیت Webhook</b>\n\n${status}`, {
        parse_mode: "HTML",
        reply_markup: settingsMenuKeyboard((await getBotSettings()).notifyContacts),
      });
      return;
    }

    if (data === "settings:setup_webhook") {
      const result = await setupBotWebhook();
      await ctx.reply(result.message, {
        parse_mode: "HTML",
        reply_markup: settingsMenuKeyboard((await getBotSettings()).notifyContacts),
      });
      return;
    }
  });

  // ── Photo handler ─────────────────────────────────────────────────────────

  bot.on("message:photo", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;

    const session = await getAdminSession(ctx.chat!.id);
    if (!session) return;

    const photo = ctx.message.photo.at(-1);
    if (!photo) return;

    if (session.step === "photo") {
      await setAdminSession(ctx.chat!.id, {
        step: "title",
        imageFileId: photo.file_id,
      });
      await ctx.reply("✏️ عنوان / توضیح را بفرستید.", {
        reply_markup: cancelKeyboard(),
      });
      return;
    }

    if (session.step === "edit_photo" && session.itemId) {
      const updated = await updatePortfolioItem(session.itemId, {
        imageFileId: photo.file_id,
      });
      await clearAdminSession(ctx.chat!.id);
      if (updated) {
        await ctx.reply(`✅ عکس «${escapeHtml(updated.title)}» به‌روز شد.`, {
          parse_mode: "HTML",
          reply_markup: backToPortfolioKeyboard(),
        });
      }
    }
  });

  // ── Text handler (multi-step flows) ───────────────────────────────────────

  bot.on("message:text", async (ctx) => {
    if (!(await guardAdmin(ctx))) return;

    const text = ctx.message.text.trim();
    if (text.startsWith("/")) return;

    const session = await getAdminSession(ctx.chat!.id);
    if (!session) return;

    if (session.step === "title") {
      if (text.length < 2) {
        await ctx.reply("عنوان خیلی کوتاه است (حداقل ۲ حرف).");
        return;
      }
      await setAdminSession(ctx.chat!.id, {
        ...session,
        step: "link",
        title: text,
      });
      await ctx.reply("🔗 لینک پروژه را بفرستید (https://...)", {
        reply_markup: cancelKeyboard(),
      });
      return;
    }

    if (session.step === "link") {
      if (!isValidUrl(text)) {
        await ctx.reply("❌ لینک نامعتبر. باید با http:// یا https:// شروع شود.");
        return;
      }
      if (!session.imageFileId || !session.title) {
        await clearAdminSession(ctx.chat!.id);
        await ctx.reply("⏱ نشست منقضی شد. دوباره شروع کنید.");
        return;
      }

      const item = await addPortfolioItem({
        title: session.title,
        link: text,
        imageFileId: session.imageFileId,
      });
      await clearAdminSession(ctx.chat!.id);

      await ctx.replyWithPhoto(item.imageFileId, {
        caption: [
          "✅ <b>نمونه‌کار اضافه شد!</b>",
          "",
          `📝 ${escapeHtml(item.title)}`,
          `🔗 ${escapeHtml(item.link)}`,
          `🆔 <code>${item.id}</code>`,
          `🕒 ${escapeHtml(formatDate(item.createdAt))}`,
        ].join("\n"),
        parse_mode: "HTML",
        reply_markup: portfolioItemKeyboard(0, item.link),
      });
      return;
    }

    if (session.step === "edit_title" && session.itemId) {
      if (text.length < 2) {
        await ctx.reply("عنوان خیلی کوتاه است.");
        return;
      }
      const updated = await updatePortfolioItem(session.itemId, { title: text });
      await clearAdminSession(ctx.chat!.id);
      if (updated) {
        await ctx.reply(`✅ عنوان به «${escapeHtml(text)}» تغییر کرد.`, {
          parse_mode: "HTML",
          reply_markup: backToPortfolioKeyboard(),
        });
      }
      return;
    }

    if (session.step === "edit_link" && session.itemId) {
      if (!isValidUrl(text)) {
        await ctx.reply("❌ لینک نامعتبر.");
        return;
      }
      const updated = await updatePortfolioItem(session.itemId, { link: text });
      await clearAdminSession(ctx.chat!.id);
      if (updated) {
        await ctx.reply(`✅ لینک به‌روز شد.`, {
          reply_markup: backToPortfolioKeyboard(),
        });
      }
    }
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function showPortfolioList(ctx: Context, edit = false) {
  const items = await getPortfolioItems();
  if (items.length === 0) {
    const text = "📭 هنوز نمونه‌کاری اضافه نشده.\n\nاز «➕ افزودن» استفاده کنید.";
    if (edit) {
      await ctx.editMessageText(text, {
        reply_markup: backToPortfolioKeyboard(),
      }).catch(() =>
        ctx.reply(text, { reply_markup: backToPortfolioKeyboard() })
      );
    } else {
      await ctx.reply(text, { reply_markup: backToPortfolioKeyboard() });
    }
    return;
  }

  const text = `📁 <b>نمونه‌کارها</b> (${items.length} مورد)\n\nروی هر مورد کلیک کنید:`;
  const markup = portfolioListKeyboard(items);

  if (edit) {
    await ctx.editMessageText(text, {
      parse_mode: "HTML",
      reply_markup: markup,
    }).catch(() =>
      ctx.reply(text, { parse_mode: "HTML", reply_markup: markup })
    );
  } else {
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: markup });
  }
}

async function showPortfolioItem(ctx: Context, index: number) {
  const item = await getPortfolioItemByIndex(index);
  if (!item) {
    await ctx.reply("❌ مورد پیدا نشد.");
    return;
  }

  await ctx.replyWithPhoto(item.imageFileId, {
    caption: [
      `<b>${escapeHtml(item.title)}</b>`,
      `🔗 ${escapeHtml(item.link)}`,
      `🆔 <code>${item.id}</code>`,
      `🕒 ${escapeHtml(formatDate(item.createdAt))}`,
    ].join("\n"),
    parse_mode: "HTML",
    reply_markup: portfolioItemKeyboard(index, item.link),
  });
}

async function showEditMenu(ctx: Context, index: number) {
  const item = await getPortfolioItemByIndex(index);
  if (!item) {
    await ctx.reply("❌ مورد پیدا نشد.");
    return;
  }

  await ctx.reply(`✏️ ویرایش «<b>${escapeHtml(item.title)}</b>»\n\nچه چیزی تغییر کند؟`, {
    parse_mode: "HTML",
    reply_markup: editFieldKeyboard(index),
  });
}

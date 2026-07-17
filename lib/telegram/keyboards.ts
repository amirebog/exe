import { InlineKeyboard } from "grammy";
import { getSiteUrl } from "./utils";

export function mainMenuKeyboard() {
  return new InlineKeyboard()
    .text("📁 نمونه‌کارها", "menu:portfolio")
    .text("📊 آمار سایت", "menu:stats")
    .row()
    .text("📬 تماس‌ها", "menu:contacts")
    .text("⚙️ تنظیمات", "menu:settings")
    .row()
    .url("🌐 باز کردن سایت", getSiteUrl())
    .text("❓ راهنما", "menu:help");
}

export function portfolioMenuKeyboard() {
  return new InlineKeyboard()
    .text("➕ افزودن", "port:add")
    .text("📋 لیست", "port:list")
    .row()
    .text("✏️ ویرایش", "port:edit_list")
    .text("🗑 حذف", "port:del_list")
    .row()
    .text("⬅️ منوی اصلی", "menu:main");
}

export function statsMenuKeyboard() {
  return new InlineKeyboard()
    .text("📈 آمار لحظه‌ای", "stats:live")
    .text("📊 گزارش روزانه", "stats:report")
    .row()
    .text("👥 نقش‌ها", "stats:roles")
    .text("⏰ ساعات پیک", "stats:peak")
    .row()
    .text("⬅️ منوی اصلی", "menu:main");
}

export function contactsMenuKeyboard() {
  return new InlineKeyboard()
    .text("📬 ۵ تای آخر", "contacts:5")
    .text("📬 ۲۰ تای آخر", "contacts:20")
    .row()
    .text("📄 خروجی CSV", "contacts:csv")
    .row()
    .text("⬅️ منوی اصلی", "menu:main");
}

export function settingsMenuKeyboard(notifyContacts: boolean) {
  return new InlineKeyboard()
    .text(
      notifyContacts ? "🔔 اعلان تماس: روشن ✅" : "🔕 اعلان تماس: خاموش ❌",
      "settings:toggle_contacts"
    )
    .row()
    .text("🔗 وضعیت Webhook", "settings:webhook")
    .text("🔄 راه‌اندازی Webhook", "settings:setup_webhook")
    .row()
    .text("⬅️ منوی اصلی", "menu:main");
}

export function backToMainKeyboard() {
  return new InlineKeyboard().text("⬅️ منوی اصلی", "menu:main");
}

export function backToPortfolioKeyboard() {
  return new InlineKeyboard().text("⬅️ نمونه‌کارها", "menu:portfolio");
}

export function cancelKeyboard() {
  return new InlineKeyboard().text("❌ لغو", "action:cancel");
}

export function portfolioItemKeyboard(index: number, link: string) {
  return new InlineKeyboard()
    .url("🔗 باز کردن", link)
    .text("✏️ ویرایش", `port:edit:${index}`)
    .row()
    .text("🗑 حذف", `port:del:${index}`)
    .text("⬅️ بازگشت", "port:list");
}

export function editFieldKeyboard(index: number) {
  return new InlineKeyboard()
    .text("📝 عنوان", `port:edit_title:${index}`)
    .text("🔗 لینک", `port:edit_link:${index}`)
    .row()
    .text("📸 عکس", `port:edit_photo:${index}`)
    .row()
    .text("⬅️ بازگشت", `port:view:${index}`);
}

export function deleteConfirmKeyboard(index: number) {
  return new InlineKeyboard()
    .text("✅ بله، حذف کن", `port:del_confirm:${index}`)
    .text("❌ خیر", `port:view:${index}`);
}

export function portfolioListKeyboard(items: { title: string }[]) {
  const kb = new InlineKeyboard();
  items.slice(0, 8).forEach((item, i) => {
    const label = item.title.length > 20 ? item.title.slice(0, 20) + "…" : item.title;
    kb.text(`${i + 1}. ${label}`, `port:view:${i}`).row();
  });
  kb.text("⬅️ بازگشت", "menu:portfolio");
  return kb;
}

export function portfolioPickKeyboard(
  items: { title: string }[],
  prefix: "port:edit" | "port:del"
) {
  const kb = new InlineKeyboard();
  items.slice(0, 8).forEach((item, i) => {
    const label = item.title.length > 20 ? item.title.slice(0, 20) + "…" : item.title;
    kb.text(`${i + 1}. ${label}`, `${prefix}:${i}`).row();
  });
  kb.text("⬅️ بازگشت", "menu:portfolio");
  return kb;
}

export function contactNotifyKeyboard() {
  return new InlineKeyboard()
    .text("📬 مشاهده تماس‌ها", "contacts:5")
    .text("📊 آمار", "stats:live")
    .row()
    .text("🏠 منوی اصلی", "menu:main");
}

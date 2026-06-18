import { Bot, InlineKeyboard } from "grammy";
import { NextRequest, NextResponse } from "next/server";
import { getDailyReport, getStats, getEmails } from "@/lib/redis";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

async function buildStatsMessage(daily: boolean = false) {
  const data = daily ? await getDailyReport() : await getStats();

  let message = `📊 *Site Statistics*\n\n`;
  message += `🔄 *Total Visits:* ${data.totalVisits.toLocaleString()}\n`;
  message += `📅 *Today:* ${data.todayVisits.toLocaleString()} visits\n`;
  message += `👤 *Unique Visitors Today:* ${data.uniqueToday}\n`;

  if (daily) {
    message += `📧 *New Emails Today:* ${data.todayEmails}\n`;
    message += `📈 *Change vs Yesterday:* ${
      data.todayVisits - data.yesterdayVisits > 0 ? "📈" : "📉"
    } ${Math.abs(data.todayVisits - data.yesterdayVisits).toLocaleString()}\n`;
  }

  message += `\n👥 *Roles:*\n`;
  if (Object.keys(data.roleStats).length === 0) {
    message += `   No data yet\n`;
  } else {
    Object.entries(data.roleStats).forEach(([role, count]) => {
      const percentage = data.totalVisits > 0 
        ? ((count / data.totalVisits) * 100).toFixed(1) 
        : 0;
      message += `   • ${role}: ${count} (${percentage}%)\n`;
    });
  }

  if (daily && data.hourlyData) {
    message += `\n⏰ *Peak Hours Today:*\n`;
    const peakHours = data.hourlyData
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter((h) => h.count > 0);

    if (peakHours.length > 0) {
      peakHours.forEach(({ hour, count }) => {
        message += `   • ${hour}:00 - ${hour + 1}:00: ${count} visits\n`;
      });
    } else {
      message += `   No data yet\n`;
    }
  }

  message += `\n🕒 *Updated:* ${new Date().toLocaleString("en-US", {
    timeZone: "UTC",
  })} UTC`;

  return message;
}

bot.command("start", (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("📊 Daily Report", "daily_report")
    .text("📈 Live Stats", "live_stats")
    .row()
    .text("📧 Email List", "email_list")
    .text("🔄 Refresh", "refresh");

  ctx.reply(
    "👋 Welcome! I'm your site analytics bot.\n\n" +
      "Use the buttons below or type:\n" +
      "/stats - Get live statistics\n" +
      "/daily - Get daily report\n" +
      "/emails - Get recent emails",
    { reply_markup: keyboard }
  );
});

bot.command("stats", async (ctx) => {
  const message = await buildStatsMessage(false);
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("daily", async (ctx) => {
  const message = await buildStatsMessage(true);
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("emails", async (ctx) => {
  const emails = await getEmails(10);
  if (emails.length === 0) {
    await ctx.reply("📭 No emails collected yet.");
    return;
  }
  let message = "📧 *Recent Emails:*\n\n";
  emails.forEach((e, i) => {
    const date = new Date(e.timestamp).toLocaleString("en-US");
    message += `${i + 1}. ${e.email} (${e.role}) - ${date}\n`;
  });
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.callbackQuery("daily_report", async (ctx) => {
  await ctx.answerCallbackQuery();
  const message = await buildStatsMessage(true);
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.callbackQuery("live_stats", async (ctx) => {
  await ctx.answerCallbackQuery();
  const message = await buildStatsMessage(false);
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.callbackQuery("email_list", async (ctx) => {
  await ctx.answerCallbackQuery();
  const emails = await getEmails(10);
  if (emails.length === 0) {
    await ctx.reply("📭 No emails collected yet.");
    return;
  }
  let message = "📧 *Recent Emails:*\n\n";
  emails.forEach((e, i) => {
    const date = new Date(e.timestamp).toLocaleString("en-US");
    message += `${i + 1}. ${e.email} (${e.role}) - ${date}\n`;
  });
  await ctx.reply(message, { parse_mode: "Markdown" });
});

bot.callbackQuery("refresh", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("🔄 Refreshed! Use the buttons again.");
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Failed to handle webhook" },
      { status: 500 }
    );
  }
}
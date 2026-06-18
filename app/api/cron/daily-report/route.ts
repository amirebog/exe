import { Bot } from "grammy";
import { NextResponse } from "next/server";
import { getDailyReport } from "@/lib/redis";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function buildDailyMessage() {
  const data = await getDailyReport();

  let message = `📊 *Daily Report - ${data.today}*\n\n`;
  message += `🔄 *Total Visits:* ${data.totalVisits.toLocaleString()}\n`;
  message += `📅 *Today:* ${data.todayVisits.toLocaleString()} visits\n`;
  message += `👤 *Unique Visitors:* ${data.uniqueToday}\n`;
  message += `📧 *New Emails:* ${data.todayEmails}\n`;
  message += `📈 *Change vs Yesterday:* ${
    data.todayVisits - data.yesterdayVisits > 0 ? "📈" : "📉"
  } ${Math.abs(data.todayVisits - data.yesterdayVisits).toLocaleString()}\n`;

  message += `\n👥 *Role Distribution:*\n`;
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

  if (data.hourlyData) {
    const peakHours = data.hourlyData
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter((h) => h.count > 0);

    if (peakHours.length > 0) {
      message += `\n⏰ *Top 3 Peak Hours:*\n`;
      peakHours.forEach(({ hour, count }) => {
        message += `   • ${hour}:00 - ${hour + 1}:00: ${count} visits\n`;
      });
    }
  }

  message += `\n✅ *Report generated at:* ${new Date().toLocaleString(
    "en-US",
    { timeZone: "UTC" }
  )} UTC`;

  return message;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

    const message = await buildDailyMessage();
    await bot.api.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending daily report:", error);
    return NextResponse.json(
      { error: "Failed to send daily report" },
      { status: 500 }
    );
  }
}
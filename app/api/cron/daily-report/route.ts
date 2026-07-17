import { NextResponse } from "next/server";
import { getDailyReport } from "@/lib/redis";
import { getBot } from "@/lib/telegram-bot";
import { escapeHtml } from "@/lib/telegram-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

async function buildDailyMessage() {
  const data = await getDailyReport();
  const totalContacts = data.totalEmails;
  const visitDelta = data.todayVisits - data.yesterdayVisits;

  let message = `📊 <b>Daily Report - ${escapeHtml(data.today)}</b>\n\n`;
  message += `🔄 <b>Total Visits:</b> ${data.totalVisits.toLocaleString()}\n`;
  message += `📅 <b>Today:</b> ${data.todayVisits.toLocaleString()} visits\n`;
  message += `👤 <b>Unique Visitors:</b> ${data.uniqueToday}\n`;
  message += `📧 <b>New Contacts:</b> ${data.todayEmails}\n`;
  message += `📈 <b>Change vs Yesterday:</b> ${
    visitDelta > 0 ? "📈" : "📉"
  } ${Math.abs(visitDelta).toLocaleString()}\n`;

  message += `\n👥 <b>Role Distribution:</b>\n`;
  if (Object.keys(data.roleStats).length === 0) {
    message += `   No data yet\n`;
  } else {
    Object.entries(data.roleStats).forEach(([role, count]) => {
      const percentage =
        totalContacts > 0
          ? ((count / totalContacts) * 100).toFixed(1)
          : "0";
      message += `   • ${escapeHtml(role)}: ${count} (${percentage}%)\n`;
    });
  }

  if (data.hourlyData) {
    const peakHours = data.hourlyData
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter((h) => h.count > 0);

    if (peakHours.length > 0) {
      message += `\n⏰ <b>Top 3 Peak Hours:</b>\n`;
      peakHours.forEach(({ hour, count }) => {
        message += `   • ${hour}:00 - ${hour + 1}:00: ${count} visits\n`;
      });
    }
  }

  message += `\n✅ <b>Report generated at:</b> ${escapeHtml(
    new Date().toLocaleString("en-US", { timeZone: "UTC" })
  )} UTC`;

  return message;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const message = await buildDailyMessage();
    await getBot().api.sendMessage(CHAT_ID, message, {
      parse_mode: "HTML",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending daily report:", error);
    return NextResponse.json(
      { error: "Failed to send daily report" },
      { status: 500 }
    );
  }
}

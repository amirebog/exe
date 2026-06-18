import { Bot } from "grammy";
import { NextRequest, NextResponse } from "next/server";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, role } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }
    if (!role || typeof role !== "string") {
      return NextResponse.json(
        { error: "Please select a role" },
        { status: 400 }
      );
    }

    const message = `
📩 *New email collected from site*

👤 *Role:* ${role}
📧 *Email:* ${email}

🕒 *Time:* ${new Date().toLocaleString("en-US", { timeZone: "UTC" })}
    `;

    await bot.api.sendMessage(CHAT_ID, message, {
      parse_mode: "Markdown",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
    return NextResponse.json(
      { error: "Failed to submit email, please try again" },
      { status: 500 }
    );
  }
}
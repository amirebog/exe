import { NextRequest, NextResponse } from "next/server";
import { getBot } from "@/lib/telegram-bot";
import { getPortfolioItemById } from "@/lib/portfolio";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getPortfolioItemById(id);

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bot = getBot();
    const file = await bot.api.getFile(item.imageFileId);
    const filePath = file.file_path;

    if (!filePath) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imageRes.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error serving portfolio image:", error);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}

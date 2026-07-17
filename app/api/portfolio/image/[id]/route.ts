import { NextRequest, NextResponse } from "next/server";
import { getPortfolioItemById } from "@/lib/portfolio";
import { fetchTelegramFile } from "@/lib/telegram-bot";

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

    const { buffer, contentType } = await fetchTelegramFile(item.imageFileId);

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

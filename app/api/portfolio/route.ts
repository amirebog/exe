import { NextResponse } from "next/server";
import { getPortfolioItems } from "@/lib/portfolio";

export async function GET() {
  try {
    const items = await getPortfolioItems();

    const publicItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      link: item.link,
      imageUrl: `/api/portfolio/image/${item.id}`,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ items: publicItems });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

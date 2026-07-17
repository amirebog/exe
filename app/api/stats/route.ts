import { NextRequest, NextResponse } from "next/server";
import { getStats, getTodayEmails } from "@/lib/redis";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.STATS_SECRET;
  if (!secret) return true;

  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  const publicOnly = req.nextUrl.searchParams.get("public") === "1";

  if (!publicOnly && !isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [stats, todayEmails] = await Promise.all([
      getStats(),
      getTodayEmails(),
    ]);

    if (publicOnly) {
      return NextResponse.json({
        totalEmails: stats.totalEmails,
        roleStats: stats.roleStats,
      });
    }

    return NextResponse.json({
      ...stats,
      todayEmails,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

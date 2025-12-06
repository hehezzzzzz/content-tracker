import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { followerSnapshots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accountId = parseInt(id, 10);

    // Fetch all snapshots - client-side will handle filtering by time range
    const snapshots = await db
      .select()
      .from(followerSnapshots)
      .where(eq(followerSnapshots.accountId, accountId))
      .orderBy(followerSnapshots.recordedAt);

    return NextResponse.json(snapshots);
  } catch (error) {
    console.error("Failed to fetch snapshots:", error);
    return NextResponse.json(
      { error: "Failed to fetch snapshots" },
      { status: 500 }
    );
  }
}

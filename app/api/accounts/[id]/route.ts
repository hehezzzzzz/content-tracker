import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { accounts, followerSnapshots, posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accountId = parseInt(id, 10);

    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId));

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Get latest follower count
    const [latestSnapshot] = await db
      .select()
      .from(followerSnapshots)
      .where(eq(followerSnapshots.accountId, accountId))
      .orderBy(desc(followerSnapshots.recordedAt))
      .limit(1);

    // Get recent posts
    const recentPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.accountId, accountId))
      .orderBy(desc(posts.postedAt))
      .limit(10);

    // Get stats
    const allPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.accountId, accountId));

    const stats = {
      totalPosts: allPosts.length,
      totalLikes: allPosts.reduce((sum, p) => sum + p.likes, 0),
      totalComments: allPosts.reduce((sum, p) => sum + p.comments, 0),
      totalViews: account.totalViews ?? allPosts.reduce((sum, p) => sum + (p.views ?? 0), 0),
    };

    return NextResponse.json({
      account,
      latestFollowers: latestSnapshot?.count ?? null,
      recentPosts,
      stats,
    });
  } catch (error) {
    console.error("Failed to fetch account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accountId = parseInt(id, 10);

    // Delete account (cascades to related tables)
    await db.delete(accounts).where(eq(accounts.id, accountId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

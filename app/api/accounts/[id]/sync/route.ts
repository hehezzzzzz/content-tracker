import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { accounts, followerSnapshots, posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getChannelById, getChannelVideos } from "@/lib/api/youtube";

export async function POST(
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

    if (account.platform === "youtube") {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "YouTube API key not configured" },
          { status: 500 }
        );
      }

      if (!account.platformAccountId) {
        return NextResponse.json(
          { error: "No platform account ID" },
          { status: 400 }
        );
      }

      const channel = await getChannelById(account.platformAccountId, apiKey);
      if (!channel) {
        return NextResponse.json(
          { error: "Channel not found" },
          { status: 404 }
        );
      }

      // Record new follower count
      await db.insert(followerSnapshots).values({
        accountId,
        count: channel.stats.subscriberCount,
      });

      // Update account info
      await db
        .update(accounts)
        .set({
          displayName: channel.title,
          avatarUrl: channel.thumbnailUrl,
        })
        .where(eq(accounts.id, accountId));

      // Fetch and upsert recent videos
      const videos = await getChannelVideos(channel.id, apiKey, 10);
      for (const video of videos) {
        // Check if post exists
        const [existing] = await db
          .select()
          .from(posts)
          .where(eq(posts.platformPostId, video.id));

        if (existing) {
          // Update stats
          await db
            .update(posts)
            .set({
              likes: video.stats.likeCount,
              comments: video.stats.commentCount,
              views: video.stats.viewCount,
              fetchedAt: new Date(),
            })
            .where(eq(posts.id, existing.id));
        } else {
          // Insert new post
          await db.insert(posts).values({
            accountId,
            platformPostId: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            postedAt: new Date(video.publishedAt),
            likes: video.stats.likeCount,
            comments: video.stats.commentCount,
            views: video.stats.viewCount,
          });
        }
      }

      return NextResponse.json({
        success: true,
        subscriberCount: channel.stats.subscriberCount,
        videosUpdated: videos.length,
      });
    }

    return NextResponse.json(
      { error: "Sync not supported for this platform" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to sync account:", error);
    return NextResponse.json(
      { error: "Failed to sync account" },
      { status: 500 }
    );
  }
}

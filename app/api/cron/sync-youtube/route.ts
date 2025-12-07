import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { accounts, followerSnapshots, posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getChannelById, getAllChannelVideos } from "@/lib/api/youtube";

export const maxDuration = 60; // Allow up to 60 seconds for processing

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key not configured" },
        { status: 500 }
      );
    }

    // Get all YouTube accounts
    const youtubeAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.platform, "youtube"));

    const results = [];

    for (const account of youtubeAccounts) {
      if (!account.platformAccountId) {
        results.push({
          accountId: account.id,
          status: "skipped",
          reason: "No platform account ID",
        });
        continue;
      }

      try {
        const channel = await getChannelById(account.platformAccountId, apiKey);
        if (!channel) {
          results.push({
            accountId: account.id,
            status: "error",
            reason: "Channel not found",
          });
          continue;
        }

        // Record follower snapshot
        await db.insert(followerSnapshots).values({
          accountId: account.id,
          count: channel.stats.subscriberCount,
        });

        // Update account info
        await db
          .update(accounts)
          .set({
            displayName: channel.title,
            avatarUrl: channel.thumbnailUrl,
            totalViews: channel.stats.viewCount,
          })
          .where(eq(accounts.id, account.id));

        // Fetch and upsert recent videos
        const videos = await getAllChannelVideos(channel.id, apiKey);
        let videosUpdated = 0;

        for (const video of videos) {
          const [existing] = await db
            .select()
            .from(posts)
            .where(eq(posts.platformPostId, video.id));

          if (existing) {
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
            await db.insert(posts).values({
              accountId: account.id,
              platformPostId: video.id,
              title: video.title,
              thumbnailUrl: video.thumbnailUrl,
              postedAt: new Date(video.publishedAt),
              likes: video.stats.likeCount,
              comments: video.stats.commentCount,
              views: video.stats.viewCount,
            });
          }
          videosUpdated++;
        }

        results.push({
          accountId: account.id,
          status: "success",
          subscriberCount: channel.stats.subscriberCount,
          videosUpdated,
        });
      } catch (error) {
        console.error(`Failed to sync account ${account.id}:`, error);
        results.push({
          accountId: account.id,
          status: "error",
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      accounts: results,
    });
  } catch (error) {
    console.error("Cron sync failed:", error);
    return NextResponse.json(
      { error: "Cron sync failed" },
      { status: 500 }
    );
  }
}

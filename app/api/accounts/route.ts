import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { accounts, followerSnapshots, posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getChannelByHandle, getChannelVideos } from "@/lib/api/youtube";

export async function GET() {
  try {
    const allAccounts = await db.select().from(accounts).orderBy(accounts.createdAt);
    return NextResponse.json(allAccounts);
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, username } = body;

    if (!platform || !username) {
      return NextResponse.json(
        { error: "platform and username are required" },
        { status: 400 }
      );
    }

    // For YouTube, look up the channel
    if (platform === "youtube") {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "YouTube API key not configured" },
          { status: 500 }
        );
      }

      const channel = await getChannelByHandle(username, apiKey);
      if (!channel) {
        return NextResponse.json(
          { error: "YouTube channel not found" },
          { status: 404 }
        );
      }

      // Insert account
      const [newAccount] = await db
        .insert(accounts)
        .values({
          platform,
          username: channel.customUrl || channel.id,
          displayName: channel.title,
          avatarUrl: channel.thumbnailUrl,
          platformAccountId: channel.id,
        })
        .returning();

      // Record initial follower count
      await db.insert(followerSnapshots).values({
        accountId: newAccount.id,
        count: channel.stats.subscriberCount,
      });

      // Fetch and store recent videos
      const videos = await getChannelVideos(channel.id, apiKey, 10);
      if (videos.length > 0) {
        await db.insert(posts).values(
          videos.map((video) => ({
            accountId: newAccount.id,
            platformPostId: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            postedAt: new Date(video.publishedAt),
            likes: video.stats.likeCount,
            comments: video.stats.commentCount,
            views: video.stats.viewCount,
          }))
        );
      }

      return NextResponse.json(newAccount, { status: 201 });
    }

    // For other platforms, just create the account
    const [newAccount] = await db
      .insert(accounts)
      .values({
        platform,
        username,
        displayName: username,
      })
      .returning();

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error("Failed to create account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

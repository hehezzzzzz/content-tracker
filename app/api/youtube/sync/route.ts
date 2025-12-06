import { NextRequest, NextResponse } from "next/server";
import { getChannelById, getChannelVideos } from "@/lib/api/youtube";

export async function POST(request: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { channelId } = await request.json();

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId is required" },
        { status: 400 }
      );
    }

    const [channel, videos] = await Promise.all([
      getChannelById(channelId, apiKey),
      getChannelVideos(channelId, apiKey, 10),
    ]);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json({
      channel,
      videos,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("YouTube sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync channel data" },
      { status: 500 }
    );
  }
}

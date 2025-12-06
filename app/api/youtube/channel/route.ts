import { NextRequest, NextResponse } from "next/server";
import { getChannelByHandle, getChannelById } from "@/lib/api/youtube";

export async function GET(request: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API key not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const handle = searchParams.get("handle");
  const channelId = searchParams.get("channelId");

  if (!handle && !channelId) {
    return NextResponse.json(
      { error: "Either handle or channelId is required" },
      { status: 400 }
    );
  }

  try {
    const channel = handle
      ? await getChannelByHandle(handle, apiKey)
      : await getChannelById(channelId!, apiKey);

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel data" },
      { status: 500 }
    );
  }
}

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  hiddenSubscriberCount: boolean;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  thumbnailUrl: string;
  stats: YouTubeChannelStats;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  stats: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
}

export async function getChannelByHandle(
  handle: string,
  apiKey: string
): Promise<YouTubeChannel | null> {
  // Remove @ if present
  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;

  const params = new URLSearchParams({
    part: "snippet,statistics",
    forHandle: cleanHandle,
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
  const data = await res.json();

  if (!res.ok || !data.items?.length) {
    return null;
  }

  const channel = data.items[0];
  return {
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl,
    thumbnailUrl:
      channel.snippet.thumbnails.medium?.url ||
      channel.snippet.thumbnails.default?.url,
    stats: {
      subscriberCount: parseInt(channel.statistics.subscriberCount || "0", 10),
      viewCount: parseInt(channel.statistics.viewCount || "0", 10),
      videoCount: parseInt(channel.statistics.videoCount || "0", 10),
      hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount || false,
    },
  };
}

export async function getChannelById(
  channelId: string,
  apiKey: string
): Promise<YouTubeChannel | null> {
  const params = new URLSearchParams({
    part: "snippet,statistics",
    id: channelId,
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/channels?${params}`);
  const data = await res.json();

  if (!res.ok || !data.items?.length) {
    return null;
  }

  const channel = data.items[0];
  return {
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl,
    thumbnailUrl:
      channel.snippet.thumbnails.medium?.url ||
      channel.snippet.thumbnails.default?.url,
    stats: {
      subscriberCount: parseInt(channel.statistics.subscriberCount || "0", 10),
      viewCount: parseInt(channel.statistics.viewCount || "0", 10),
      videoCount: parseInt(channel.statistics.videoCount || "0", 10),
      hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount || false,
    },
  };
}

export async function getChannelVideos(
  channelId: string,
  apiKey: string,
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  // First get the uploads playlist ID
  const channelParams = new URLSearchParams({
    part: "contentDetails",
    id: channelId,
    key: apiKey,
  });

  const channelRes = await fetch(`${YOUTUBE_API_BASE}/channels?${channelParams}`);
  const channelData = await channelRes.json();

  if (!channelRes.ok || !channelData.items?.length) {
    return [];
  }

  const uploadsPlaylistId =
    channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Get videos from uploads playlist
  const playlistParams = new URLSearchParams({
    part: "snippet",
    playlistId: uploadsPlaylistId,
    maxResults: maxResults.toString(),
    key: apiKey,
  });

  const playlistRes = await fetch(
    `${YOUTUBE_API_BASE}/playlistItems?${playlistParams}`
  );
  const playlistData = await playlistRes.json();

  if (!playlistRes.ok || !playlistData.items?.length) {
    return [];
  }

  // Get video IDs
  const videoIds = playlistData.items.map(
    (item: { snippet: { resourceId: { videoId: string } } }) =>
      item.snippet.resourceId.videoId
  );

  // Get video statistics
  const videoParams = new URLSearchParams({
    part: "snippet,statistics",
    id: videoIds.join(","),
    key: apiKey,
  });

  const videoRes = await fetch(`${YOUTUBE_API_BASE}/videos?${videoParams}`);
  const videoData = await videoRes.json();

  if (!videoRes.ok || !videoData.items?.length) {
    return [];
  }

  return videoData.items.map(
    (video: {
      id: string;
      snippet: {
        title: string;
        description: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
        publishedAt: string;
      };
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
    }) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl:
        video.snippet.thumbnails.medium?.url ||
        video.snippet.thumbnails.default?.url,
      publishedAt: video.snippet.publishedAt,
      stats: {
        viewCount: parseInt(video.statistics.viewCount || "0", 10),
        likeCount: parseInt(video.statistics.likeCount || "0", 10),
        commentCount: parseInt(video.statistics.commentCount || "0", 10),
      },
    })
  );
}

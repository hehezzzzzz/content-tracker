export type Platform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "twitter"
  | "linkedin";

export interface Account {
  id?: number;
  platform: Platform;
  username: string;
  displayName: string;
  avatarUrl?: string;
  platformAccountId?: string; // e.g. YouTube channel ID
  createdAt: Date;
}

export interface FollowerSnapshot {
  id?: number;
  accountId: number;
  count: number;
  recordedAt: Date;
}

export interface Post {
  id?: number;
  accountId: number;
  platformPostId: string;
  title?: string;
  thumbnailUrl?: string;
  postedAt: Date;
  likes: number;
  comments: number;
  shares?: number;
  views?: number;
  fetchedAt: Date;
}

export interface Engagement {
  id?: number;
  accountId: number;
  postId?: number;
  type: "like" | "comment" | "share" | "view";
  authorUsername?: string;
  authorAvatarUrl?: string;
  content?: string;
  occurredAt: Date;
}

export const PLATFORM_CONFIG: Record<
  Platform,
  { label: string; color: string }
> = {
  youtube: { label: "YouTube", color: "#FF0000" },
  instagram: { label: "Instagram", color: "#E4405F" },
  tiktok: { label: "TikTok", color: "#000000" },
  twitter: { label: "Twitter", color: "#1DA1F2" },
  linkedin: { label: "LinkedIn", color: "#0A66C2" },
};

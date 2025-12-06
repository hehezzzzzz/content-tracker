"use client";

import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Eye, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@/lib/db/schema";
import type { Platform } from "@/lib/types";

interface RecentPostsProps {
  posts: Post[];
  platform: Platform;
}

function getPostUrl(platform: Platform, platformPostId: string): string {
  switch (platform) {
    case "youtube":
      return `https://www.youtube.com/watch?v=${platformPostId}`;
    case "instagram":
      return `https://www.instagram.com/p/${platformPostId}`;
    case "tiktok":
      return `https://www.tiktok.com/video/${platformPostId}`;
    case "twitter":
      return `https://twitter.com/i/status/${platformPostId}`;
    case "linkedin":
      return `https://www.linkedin.com/feed/update/${platformPostId}`;
    default:
      return "#";
  }
}

export function RecentPosts({ posts, platform }: RecentPostsProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No posts synced yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={getPostUrl(platform, post.platformPostId)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-4 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              {post.thumbnailUrl && (
                <img
                  src={post.thumbnailUrl}
                  alt={post.title ?? "Post thumbnail"}
                  className="h-16 w-16 rounded-md object-cover"
                />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {post.title && (
                    <p className="line-clamp-1 font-medium">{post.title}</p>
                  )}
                  <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.postedAt), {
                    addSuffix: true,
                  })}
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {post.comments.toLocaleString()}
                  </span>
                  {post.shares != null && (
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      {post.shares.toLocaleString()}
                    </span>
                  )}
                  {post.views != null && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

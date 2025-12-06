"use client";

import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Eye } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@/lib/db/schema";

interface RecentPostsProps {
  posts: Post[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
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
            <div
              key={post.id}
              className="flex gap-4 rounded-lg border p-3 transition-colors hover:bg-accent"
            >
              {post.thumbnailUrl && (
                <img
                  src={post.thumbnailUrl}
                  alt={post.title ?? "Post thumbnail"}
                  className="h-16 w-16 rounded-md object-cover"
                />
              )}
              <div className="flex-1 space-y-1">
                {post.title && (
                  <p className="line-clamp-1 font-medium">{post.title}</p>
                )}
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

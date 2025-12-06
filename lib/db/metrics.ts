import { db } from "./index";
import type { FollowerSnapshot, Post } from "../types";

export async function recordFollowerCount(
  accountId: number,
  count: number
): Promise<number> {
  return db.followerSnapshots.add({
    accountId,
    count,
    recordedAt: new Date(),
  });
}

export async function getFollowerHistory(
  accountId: number,
  days: number = 30
): Promise<FollowerSnapshot[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return db.followerSnapshots
    .where("[accountId+recordedAt]")
    .between([accountId, since], [accountId, new Date()])
    .toArray();
}

export async function getLatestFollowerCount(
  accountId: number
): Promise<number | null> {
  const latest = await db.followerSnapshots
    .where("accountId")
    .equals(accountId)
    .reverse()
    .sortBy("recordedAt");

  return latest[0]?.count ?? null;
}

export async function addPost(post: Omit<Post, "id">): Promise<number> {
  return db.posts.add(post as Post);
}

export async function getRecentPosts(
  accountId: number,
  limit: number = 10
): Promise<Post[]> {
  return db.posts
    .where("accountId")
    .equals(accountId)
    .reverse()
    .sortBy("postedAt")
    .then((posts) => posts.slice(0, limit));
}

export async function getAccountStats(accountId: number): Promise<{
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
}> {
  const posts = await db.posts.where("accountId").equals(accountId).toArray();

  return {
    totalPosts: posts.length,
    totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
    totalComments: posts.reduce((sum, p) => sum + p.comments, 0),
    totalViews: posts.reduce((sum, p) => sum + (p.views ?? 0), 0),
  };
}

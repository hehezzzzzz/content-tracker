import { db } from "./index";
import type { Platform } from "../types";

export async function seedDemoData() {
  const existingAccounts = await db.accounts.count();
  if (existingAccounts > 0) return;

  // Add demo accounts
  const accounts: Array<{
    platform: Platform;
    username: string;
    displayName: string;
  }> = [
    { platform: "youtube", username: "demo_channel", displayName: "Demo Channel" },
    { platform: "instagram", username: "demo_ig", displayName: "Demo Instagram" },
    { platform: "tiktok", username: "demo_tiktok", displayName: "Demo TikTok" },
  ];

  for (const acc of accounts) {
    const accountId = await db.accounts.add({
      ...acc,
      createdAt: new Date(),
    });

    // Add follower history (last 14 days)
    let followers = Math.floor(Math.random() * 10000) + 5000;
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      followers += Math.floor(Math.random() * 200) - 50;
      await db.followerSnapshots.add({
        accountId,
        count: Math.max(followers, 1000),
        recordedAt: date,
      });
    }

    // Add some demo posts
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 2);
      await db.posts.add({
        accountId,
        platformPostId: `post_${accountId}_${i}`,
        title: `Demo Post ${i + 1}`,
        postedAt: date,
        likes: Math.floor(Math.random() * 5000) + 100,
        comments: Math.floor(Math.random() * 500) + 10,
        shares: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 50000) + 1000,
        fetchedAt: new Date(),
      });
    }
  }
}

export async function clearAllData() {
  await db.transaction(
    "rw",
    [db.accounts, db.followerSnapshots, db.posts, db.engagements],
    async () => {
      await db.engagements.clear();
      await db.posts.clear();
      await db.followerSnapshots.clear();
      await db.accounts.clear();
    }
  );
}

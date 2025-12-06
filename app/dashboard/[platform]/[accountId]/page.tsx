"use client";

import { use } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import { Users, Heart, MessageCircle, Eye, Trash2 } from "lucide-react";

import { db } from "@/lib/db";
import { removeAccount } from "@/lib/db/accounts";
import { PLATFORM_CONFIG, type Platform } from "@/lib/types";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { FollowerChart } from "@/components/dashboard/follower-chart";
import { RecentPosts } from "@/components/dashboard/recent-posts";
import { Button } from "@/components/ui/button";

interface AccountPageProps {
  params: Promise<{
    platform: Platform;
    accountId: string;
  }>;
}

export default function AccountPage({ params }: AccountPageProps) {
  const { platform, accountId } = use(params);
  const router = useRouter();
  const id = parseInt(accountId, 10);

  const account = useLiveQuery(() => db.accounts.get(id), [id]);

  const followerHistory = useLiveQuery(async () => {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    return db.followerSnapshots
      .where("accountId")
      .equals(id)
      .filter((s) => new Date(s.recordedAt) >= since)
      .toArray();
  }, [id]);

  const posts = useLiveQuery(
    () =>
      db.posts
        .where("accountId")
        .equals(id)
        .reverse()
        .sortBy("postedAt")
        .then((p) => p.slice(0, 10)),
    [id]
  );

  const stats = useLiveQuery(async () => {
    const allPosts = await db.posts.where("accountId").equals(id).toArray();
    return {
      totalPosts: allPosts.length,
      totalLikes: allPosts.reduce((sum, p) => sum + p.likes, 0),
      totalComments: allPosts.reduce((sum, p) => sum + p.comments, 0),
      totalViews: allPosts.reduce((sum, p) => sum + (p.views ?? 0), 0),
    };
  }, [id]);

  const latestFollowers = followerHistory?.length
    ? followerHistory[followerHistory.length - 1]?.count
    : null;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to remove this account?")) {
      await removeAccount(id);
      router.push("/dashboard");
    }
  };

  if (!account) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const platformConfig = PLATFORM_CONFIG[platform];

  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {account.avatarUrl ? (
            <img
              src={account.avatarUrl}
              alt={account.displayName}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white"
              style={{ backgroundColor: platformConfig.color }}
            >
              {account.displayName[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{account.displayName}</h1>
            <p className="text-muted-foreground">
              {platformConfig.label} • @{account.username}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Followers"
          value={latestFollowers ?? "-"}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Total Likes"
          value={stats?.totalLikes ?? 0}
          icon={<Heart className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Total Comments"
          value={stats?.totalComments ?? 0}
          icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Total Views"
          value={stats?.totalViews ?? 0}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <FollowerChart
          data={followerHistory ?? []}
          color={platformConfig.color}
        />
        <RecentPosts posts={posts ?? []} />
      </div>
    </div>
  );
}

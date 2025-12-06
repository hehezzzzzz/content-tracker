"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Heart, MessageCircle, Eye, Trash2, RefreshCw } from "lucide-react";

import { fetchAccount, fetchSnapshots, deleteAccount, syncAccount } from "@/lib/api/client";
import { PLATFORM_CONFIG, type Platform } from "@/lib/types";
import type { Account, FollowerSnapshot, Post } from "@/lib/db/schema";
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

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [latestFollowers, setLatestFollowers] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
  });
  const [followerHistory, setFollowerHistory] = useState<FollowerSnapshot[]>([]);

  const loadData = async () => {
    try {
      const [accountData, snapshots] = await Promise.all([
        fetchAccount(id),
        fetchSnapshots(id, 30),
      ]);
      setAccount(accountData.account);
      setLatestFollowers(accountData.latestFollowers);
      setPosts(accountData.recentPosts);
      setStats(accountData.stats);
      setFollowerHistory(snapshots);
    } catch (error) {
      console.error("Failed to load account:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to remove this account?")) {
      await deleteAccount(id);
      router.push("/dashboard");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncAccount(id);
      await loadData();
    } catch (error) {
      console.error("Failed to sync:", error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !account) {
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Followers"
          value={latestFollowers ?? "-"}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Total Likes"
          value={stats.totalLikes}
          icon={<Heart className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Total Comments"
          value={stats.totalComments}
          icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Total Views"
          value={stats.totalViews}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <FollowerChart
          data={followerHistory}
          color={platformConfig.color}
        />
        <RecentPosts posts={posts} />
      </div>
    </div>
  );
}

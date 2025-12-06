import type { Account, FollowerSnapshot, Post } from "@/lib/db/schema";

const API_BASE = "/api";

export async function fetchAccounts(): Promise<Account[]> {
  const res = await fetch(`${API_BASE}/accounts`);
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

export async function fetchAccount(id: number): Promise<{
  account: Account;
  latestFollowers: number | null;
  recentPosts: Post[];
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
  };
}> {
  const res = await fetch(`${API_BASE}/accounts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch account");
  return res.json();
}

export async function createAccount(
  platform: string,
  username: string
): Promise<Account> {
  const res = await fetch(`${API_BASE}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, username }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create account");
  }
  return res.json();
}

export async function deleteAccount(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/accounts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete account");
}

export async function fetchSnapshots(
  accountId: number,
  days: number = 30
): Promise<FollowerSnapshot[]> {
  const res = await fetch(
    `${API_BASE}/accounts/${accountId}/snapshots?days=${days}`
  );
  if (!res.ok) throw new Error("Failed to fetch snapshots");
  return res.json();
}

export async function syncAccount(
  accountId: number
): Promise<{ success: boolean; subscriberCount?: number; videosUpdated?: number }> {
  const res = await fetch(`${API_BASE}/accounts/${accountId}/sync`, {
    method: "POST",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to sync account");
  }
  return res.json();
}

export async function lookupYouTubeChannel(handle: string) {
  const res = await fetch(
    `/api/youtube/channel?handle=${encodeURIComponent(handle)}`
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Channel not found");
  }
  return res.json();
}

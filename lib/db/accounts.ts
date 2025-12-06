import { db } from "./index";
import type { Account, Platform } from "../types";

export async function addAccount(
  platform: Platform,
  username: string,
  displayName: string,
  avatarUrl?: string,
  platformAccountId?: string
): Promise<number> {
  const id = await db.accounts.add({
    platform,
    username,
    displayName,
    avatarUrl,
    platformAccountId,
    createdAt: new Date(),
  });
  return id as number;
}

export async function removeAccount(id: number): Promise<void> {
  await db.transaction("rw", [db.accounts, db.followerSnapshots, db.posts, db.engagements], async () => {
    await db.engagements.where("accountId").equals(id).delete();
    await db.posts.where("accountId").equals(id).delete();
    await db.followerSnapshots.where("accountId").equals(id).delete();
    await db.accounts.delete(id);
  });
}

export async function getAccountsByPlatform(
  platform: Platform
): Promise<Account[]> {
  return db.accounts.where("platform").equals(platform).toArray();
}

export async function getAllAccounts(): Promise<Account[]> {
  return db.accounts.toArray();
}

export async function getAccount(id: number): Promise<Account | undefined> {
  return db.accounts.get(id);
}

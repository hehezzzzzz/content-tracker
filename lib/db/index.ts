import Dexie, { type EntityTable } from "dexie";
import type { Account, FollowerSnapshot, Post, Engagement } from "../types";

const db = new Dexie("ContentTrackerDB") as Dexie & {
  accounts: EntityTable<Account, "id">;
  followerSnapshots: EntityTable<FollowerSnapshot, "id">;
  posts: EntityTable<Post, "id">;
  engagements: EntityTable<Engagement, "id">;
};

db.version(1).stores({
  accounts: "++id, platform, username, [platform+username]",
  followerSnapshots: "++id, accountId, recordedAt, [accountId+recordedAt]",
  posts: "++id, accountId, platformPostId, postedAt, [accountId+postedAt]",
  engagements: "++id, accountId, postId, type, occurredAt",
});

export { db };

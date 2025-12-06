import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";

export const accounts = pgTable(
  "accounts",
  {
    id: serial("id").primaryKey(),
    platform: varchar("platform", { length: 50 }).notNull(),
    username: varchar("username", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    platformAccountId: varchar("platform_account_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("accounts_platform_idx").on(table.platform),
    index("accounts_platform_username_idx").on(table.platform, table.username),
  ]
);

export const followerSnapshots = pgTable(
  "follower_snapshots",
  {
    id: serial("id").primaryKey(),
    accountId: integer("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    count: bigint("count", { mode: "number" }).notNull(),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (table) => [
    index("follower_snapshots_account_idx").on(table.accountId),
    index("follower_snapshots_account_date_idx").on(
      table.accountId,
      table.recordedAt
    ),
  ]
);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    accountId: integer("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    platformPostId: varchar("platform_post_id", { length: 255 }).notNull(),
    title: text("title"),
    thumbnailUrl: text("thumbnail_url"),
    postedAt: timestamp("posted_at").notNull(),
    likes: bigint("likes", { mode: "number" }).default(0).notNull(),
    comments: bigint("comments", { mode: "number" }).default(0).notNull(),
    shares: bigint("shares", { mode: "number" }),
    views: bigint("views", { mode: "number" }),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  },
  (table) => [
    index("posts_account_idx").on(table.accountId),
    index("posts_account_posted_idx").on(table.accountId, table.postedAt),
  ]
);

export const engagements = pgTable(
  "engagements",
  {
    id: serial("id").primaryKey(),
    accountId: integer("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    postId: integer("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    type: varchar("type", { length: 50 }).notNull(),
    authorUsername: varchar("author_username", { length: 255 }),
    authorAvatarUrl: text("author_avatar_url"),
    content: text("content"),
    occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  },
  (table) => [index("engagements_account_idx").on(table.accountId)]
);

// Types derived from schema
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type FollowerSnapshot = typeof followerSnapshots.$inferSelect;
export type NewFollowerSnapshot = typeof followerSnapshots.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Engagement = typeof engagements.$inferSelect;
export type NewEngagement = typeof engagements.$inferInsert;

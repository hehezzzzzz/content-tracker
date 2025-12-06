"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { seedDemoData } from "@/lib/db/seed";
import { PLATFORM_CONFIG } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);

  const handleSeedDemo = async () => {
    await seedDemoData();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Track your social media content and performance across platforms.
      </p>

      {accounts?.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <h2 className="text-xl font-semibold">No accounts added yet</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Add your first social media account using the sidebar to start
            tracking.
          </p>
          <Button onClick={handleSeedDemo} variant="outline" className="mt-4">
            Load Demo Data
          </Button>
        </div>
      )}

      {accounts && accounts.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <a
              key={account.id}
              href={`/dashboard/${account.platform}/${account.id}`}
              className="rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                {account.avatarUrl ? (
                  <img
                    src={account.avatarUrl}
                    alt={account.displayName}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                    style={{
                      backgroundColor: PLATFORM_CONFIG[account.platform].color,
                    }}
                  >
                    {account.displayName[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium">{account.displayName}</div>
                  <div className="text-sm text-muted-foreground">
                    {PLATFORM_CONFIG[account.platform].label} • @{account.username}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

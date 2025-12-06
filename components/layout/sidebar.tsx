"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Youtube,
  Instagram,
  Music2,
  Linkedin,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { XLogo } from "@/components/icons/x-logo";

import { cn } from "@/lib/utils";
import { PLATFORM_CONFIG, type Platform } from "@/lib/types";
import { fetchAccounts } from "@/lib/api/client";
import type { Account } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AddAccountDialog } from "./add-account-dialog";

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music2,
  twitter: XLogo,
  linkedin: Linkedin,
};

const PLATFORMS: Platform[] = [
  "youtube",
  "instagram",
  "tiktok",
  "twitter",
  "linkedin",
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<Platform>>(
    new Set(PLATFORMS)
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  );
  const [accounts, setAccounts] = useState<Account[]>([]);

  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const accountsByPlatform = accounts.reduce(
    (acc, account) => {
      const platform = account.platform as Platform;
      if (!acc[platform]) {
        acc[platform] = [];
      }
      acc[platform].push(account);
      return acc;
    },
    {} as Record<Platform, Account[]>
  );

  const togglePlatform = (platform: Platform) => {
    setExpandedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  };

  const handleAccountAdded = () => {
    loadAccounts();
  };

  return (
    <>
      <aside className="flex h-screen w-64 flex-col border-r bg-card">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">CT</span>
            </div>
            <span className="font-semibold">Content Tracker</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {PLATFORMS.map((platform) => {
              const Icon = PLATFORM_ICONS[platform];
              const config = PLATFORM_CONFIG[platform];
              const platformAccounts = accountsByPlatform[platform] ?? [];
              const isExpanded = expandedPlatforms.has(platform);

              return (
                <div key={platform}>
                  <button
                    onClick={() => togglePlatform(platform)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    )}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Icon
                      className="h-4 w-4"
                      style={{ color: config.color }}
                    />
                    <span>{config.label}</span>
                  </button>

                  {isExpanded && platformAccounts.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {platformAccounts.map((account) => (
                        <Link
                          key={account.id}
                          href={`/dashboard/${platform}/${account.id}`}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                            pathname ===
                              `/dashboard/${platform}/${account.id}` &&
                              "bg-accent"
                          )}
                        >
                          {account.avatarUrl ? (
                            <img
                              src={account.avatarUrl}
                              alt={account.displayName}
                              className="h-5 w-5 rounded-full"
                            />
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">
                              {account.displayName[0]}
                            </div>
                          )}
                          <span className="truncate">{account.displayName}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              setSelectedPlatform(null);
              setAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>
      </aside>

      <AddAccountDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        defaultPlatform={selectedPlatform}
        onAccountAdded={handleAccountAdded}
      />
    </>
  );
}

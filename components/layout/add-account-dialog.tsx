"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccount, lookupYouTubeChannel } from "@/lib/api/client";
import { PLATFORM_CONFIG, type Platform } from "@/lib/types";
import type { YouTubeChannel } from "@/lib/api/youtube";

const PLATFORMS: Platform[] = [
  "youtube",
  "instagram",
  "tiktok",
  "twitter",
  "linkedin",
];

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPlatform?: Platform | null;
  onAccountAdded?: () => void;
}

export function AddAccountDialog({
  open,
  onOpenChange,
  defaultPlatform,
  onAccountAdded,
}: AddAccountDialogProps) {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>(
    defaultPlatform ?? "youtube"
  );
  const [username, setUsername] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // YouTube specific state
  const [youtubeChannel, setYoutubeChannel] = useState<YouTubeChannel | null>(
    null
  );

  const resetForm = () => {
    setUsername("");
    setYoutubeChannel(null);
    setError(null);
  };

  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
    resetForm();
  };

  const handleLookup = async () => {
    if (!username.trim()) return;

    setIsLookingUp(true);
    setError(null);
    setYoutubeChannel(null);

    try {
      if (platform === "youtube") {
        const channel = await lookupYouTubeChannel(username.trim());
        setYoutubeChannel(channel);
      } else {
        setError("Lookup not yet supported for this platform");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to look up account");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (platform === "youtube" && !youtubeChannel) {
      setError("Please look up the channel first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const account = await createAccount(platform, username.trim());
      onOpenChange(false);
      resetForm();
      onAccountAdded?.();
      router.push(`/dashboard/${platform}/${account.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLookup = platform === "youtube";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
            <DialogDescription>
              Add a social media account to track its performance.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={handlePlatformChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PLATFORM_CONFIG[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">
                {platform === "youtube" ? "Channel Handle" : "Username / Handle"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  placeholder={platform === "youtube" ? "@channelhandle" : "@username"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {showLookup && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleLookup}
                    disabled={isLookingUp || !username.trim()}
                  >
                    {isLookingUp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {youtubeChannel && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={youtubeChannel.thumbnailUrl}
                    alt={youtubeChannel.title}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{youtubeChannel.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {youtubeChannel.stats.subscriberCount.toLocaleString()} subscribers
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (showLookup && !youtubeChannel)}
            >
              {isSubmitting ? "Adding..." : "Add Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

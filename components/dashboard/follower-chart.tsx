"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, subWeeks, subMonths, subYears } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FollowerSnapshot } from "@/lib/db/schema";

type TimeRange = "7d" | "4w" | "3m" | "6m" | "1y" | "all";

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "4w", label: "Last 4 weeks" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "Lifetime" },
];

function getStartDate(range: TimeRange): Date | null {
  const now = new Date();
  switch (range) {
    case "7d":
      return subDays(now, 7);
    case "4w":
      return subWeeks(now, 4);
    case "3m":
      return subMonths(now, 3);
    case "6m":
      return subMonths(now, 6);
    case "1y":
      return subYears(now, 1);
    case "all":
      return null;
  }
}

interface FollowerChartProps {
  data: FollowerSnapshot[];
}

export function FollowerChart({ data }: FollowerChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3m");

  const chartData = useMemo(() => {
    const startDate = getStartDate(timeRange);

    // Sort all data first to find earliest date
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    return sortedData
      .filter((snapshot) => {
        if (!startDate) return true;
        // Compare dates only (ignore time) to avoid off-by-one issues
        const snapshotDate = new Date(snapshot.recordedAt);
        snapshotDate.setHours(0, 0, 0, 0);
        const compareDate = new Date(startDate);
        compareDate.setHours(0, 0, 0, 0);
        return snapshotDate >= compareDate;
      })
      .map((snapshot) => ({
        date: format(new Date(snapshot.recordedAt), "MMM d"),
        fullDate: format(new Date(snapshot.recordedAt), "MMM d, yyyy"),
        followers: snapshot.count,
      }));
  }, [data, timeRange]);

  // Calculate Y-axis domain based on filtered data with padding
  const yAxisDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const values = chartData.map((d) => d.followers);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    // More padding on the bottom (50%) than the top (10%)
    const bottomPadding = range * 0.5 || max * 0.1;
    const topPadding = range * 0.1 || max * 0.05;
    // Round to nice numbers
    const niceMin = Math.max(0, Math.floor((min - bottomPadding) / 10) * 10);
    const niceMax = Math.ceil((max + topPadding) / 10) * 10;
    return [niceMin, niceMax];
  }, [chartData]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follower Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No follower data yet. Data will appear after the first sync.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Follower Growth</CardTitle>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="followerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="50%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickMargin={8}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => value.toLocaleString()}
              width={60}
              domain={yAxisDomain}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              labelFormatter={(_, payload) => {
                if (payload?.[0]?.payload?.fullDate) {
                  return payload[0].payload.fullDate;
                }
                return "";
              }}
              formatter={(value: number) => [value.toLocaleString(), "Followers"]}
            />
            <Line
              type="monotone"
              dataKey="followers"
              stroke="url(#followerGradient)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "#F472B6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

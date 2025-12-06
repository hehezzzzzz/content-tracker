import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  change,
  icon,
  className,
}: MetricsCardProps) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {change !== undefined && (
          <p
            className={cn(
              "text-xs",
              change > 0
                ? "text-green-600"
                : change < 0
                  ? "text-red-600"
                  : "text-muted-foreground"
            )}
          >
            {change > 0 ? "+" : ""}
            {change.toLocaleString()} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  gradient?: string;
  delay?: number;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend = "neutral",
  gradient = "from-primary/20 to-primary/10",
  delay = 0,
}: StatsCardProps) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-muted-foreground",
  };

  return (
    <Card
      className={cn(
        "p-6 hover-scale animate-fade-in bg-gradient-to-br",
        gradient
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-background/50 backdrop-blur">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={cn("text-3xl font-bold", trendColors[trend])}>
          {value}
        </p>
      </div>
    </Card>
  );
};
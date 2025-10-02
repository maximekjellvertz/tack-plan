import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  motivationalText?: string;
  action: ReactNode;
}

export const EmptyStateCard = ({
  icon: Icon,
  title,
  description,
  motivationalText,
  action,
}: EmptyStateCardProps) => {
  return (
    <Card className="p-12 text-center animate-fade-in bg-gradient-to-br from-background to-muted/30">
      <div className="relative inline-block mb-4">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        <Icon className="w-16 h-16 text-primary mx-auto relative animate-scale-in" />
      </div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      {motivationalText && (
        <p className="text-muted-foreground mb-2 italic font-medium">
          "{motivationalText}"
        </p>
      )}
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      <div className="animate-scale-in" style={{ animationDelay: "200ms" }}>
        {action}
      </div>
    </Card>
  );
};
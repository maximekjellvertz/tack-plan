import { StatsCard } from "@/components/StatsCard";
import { Heart, Trophy, FileText, Award } from "lucide-react";

export const PreviewStatsCards = () => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 blur-[2px] opacity-60">
        <StatsCard
          title="Hästar"
          value={3}
          icon={Heart}
          trend="neutral"
          gradient="from-primary/20 to-primary/10"
          delay={0}
        />
        <StatsCard
          title="Tävlingar"
          value={12}
          icon={Trophy}
          trend="up"
          gradient="from-secondary/20 to-secondary/10"
          delay={100}
        />
        <StatsCard
          title="Hälsologgar"
          value={8}
          icon={FileText}
          trend="neutral"
          gradient="from-accent/20 to-accent/10"
          delay={200}
        />
        <StatsCard
          title="Märken"
          value={5}
          icon={Award}
          trend="up"
          gradient="from-primary/20 to-primary/10"
          delay={300}
        />
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-primary/95 text-primary-foreground px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm border-2 border-primary-foreground/20">
          <p className="font-bold text-sm text-center">EXEMPEL - Så här ser din statistik ut när du börjar använda appen!</p>
        </div>
      </div>
    </div>
  );
};

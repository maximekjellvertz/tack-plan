import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Target, Heart, Zap, Star } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface BadgeItem {
  id: string;
  badge_type: string;
  title: string;
  description: string | null;
  earned_date: string;
  is_manual: boolean;
}

interface BadgesGridProps {
  badges: BadgeItem[];
}

const getBadgeIcon = (type: string) => {
  switch (type) {
    case "first_competition":
      return Trophy;
    case "100_trainings":
      return Target;
    case "personal_best":
      return Star;
    case "health_champion":
      return Heart;
    case "consistency":
      return Zap;
    default:
      return Award;
  }
};

const getBadgeColor = (type: string) => {
  switch (type) {
    case "first_competition":
      return "from-yellow-500/20 to-yellow-600/20 text-yellow-600";
    case "100_trainings":
      return "from-blue-500/20 to-blue-600/20 text-blue-600";
    case "personal_best":
      return "from-purple-500/20 to-purple-600/20 text-purple-600";
    case "health_champion":
      return "from-green-500/20 to-green-600/20 text-green-600";
    case "consistency":
      return "from-orange-500/20 to-orange-600/20 text-orange-600";
    default:
      return "from-primary/20 to-secondary/20 text-primary";
  }
};

export const BadgesGrid = ({ badges }: BadgesGridProps) => {
  if (badges.length === 0) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
          <Award className="w-10 h-10 text-primary" />
        </div>
        <p className="text-foreground font-bold text-xl mb-3">Inga badges ännu</p>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Fortsätt träna, tävla och uppnå dina mål för att samla badges! 🏆
        </p>
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-background/50 rounded-full px-4 py-2">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-muted-foreground">Tävlingar</span>
          </div>
          <div className="flex items-center gap-2 bg-background/50 rounded-full px-4 py-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">Träningspass</span>
          </div>
          <div className="flex items-center gap-2 bg-background/50 rounded-full px-4 py-2">
            <Heart className="w-4 h-4 text-green-600" />
            <span className="text-sm text-muted-foreground">Hälsologgar</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge) => {
        const Icon = getBadgeIcon(badge.badge_type);
        return (
          <Card key={badge.id} className="p-4 hover:shadow-elevated transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getBadgeColor(badge.badge_type)} flex items-center justify-center mb-3`}>
                <Icon className="w-8 h-8" />
              </div>
              <h4 className="font-semibold mb-1">{badge.title}</h4>
              {badge.description && (
                <p className="text-xs text-muted-foreground mb-2">
                  {badge.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {format(new Date(badge.earned_date), "PP", { locale: sv })}
              </p>
              {badge.is_manual && (
                <Badge variant="outline" className="mt-2 text-xs">
                  Manuell
                </Badge>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

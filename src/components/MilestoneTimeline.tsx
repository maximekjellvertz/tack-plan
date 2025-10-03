import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Trash2, Star, Award, Medal, Target, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  achieved_date: string;
  icon: string;
  milestone_type: string;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onDelete?: (milestoneId: string) => void;
}

export const MilestoneTimeline = ({ milestones, onDelete }: MilestoneTimelineProps) => {
  const getIconForMilestone = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      star: Star,
      award: Award,
      medal: Medal,
      target: Target,
      sparkles: Sparkles,
    };
    return icons[iconName?.toLowerCase()] || Trophy;
  };

  const getGradientForIndex = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-primary/20 to-secondary/20",
      "bg-gradient-to-br from-secondary/20 to-accent/20",
      "bg-gradient-to-br from-accent/20 to-primary/20",
      "bg-gradient-to-br from-primary/20 to-accent/20",
    ];
    return gradients[index % gradients.length];
  };

  if (milestones.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-muted/50 to-muted/30">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <p className="text-foreground font-semibold mb-2">Inga milstolpar än</p>
        <p className="text-sm text-muted-foreground">
          Milstolpar skapas automatiskt när mål uppnås
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {milestones.map((milestone, index) => {
        const Icon = getIconForMilestone(milestone.icon);
        const gradient = getGradientForIndex(index);
        
        return (
          <div key={milestone.id} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full ${gradient} flex items-center justify-center shadow-lg hover-scale transition-all`}>
                <Icon className="w-6 h-6 text-primary" />
              </div>
              {index < milestones.length - 1 && (
                <div className="w-0.5 flex-1 bg-gradient-to-b from-border to-transparent mt-2" />
              )}
            </div>
            <Card className={`flex-1 p-5 mb-2 ${gradient} border-2 hover:shadow-lg transition-all hover-scale`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-lg text-foreground">{milestone.title}</h4>
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {milestone.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/50 rounded-full px-3 py-1 w-fit">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(milestone.achieved_date), "PPP", { locale: sv })}
                  </div>
                </div>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(milestone.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

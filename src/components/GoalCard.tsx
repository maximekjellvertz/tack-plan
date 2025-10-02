import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, Pencil, Trash2, CheckCircle2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string | null;
    target_date: string | null;
    progress_percent: number;
    is_completed: boolean;
    goal_type: string;
    auto_calculate: boolean;
  };
  onUpdate: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export const GoalCard = ({ goal, onUpdate, onDelete, onComplete }: GoalCardProps) => {
  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case "competition":
        return "bg-primary/10 text-primary";
      case "training":
        return "bg-secondary/10 text-secondary";
      case "health":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case "competition":
        return "Tävling";
      case "training":
        return "Träning";
      case "health":
        return "Hälsa";
      default:
        return "Övrigt";
    }
  };

  return (
    <Card className={`p-6 transition-all hover:shadow-md ${goal.is_completed ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30' : 'hover:border-primary/30'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${getGoalTypeColor(goal.goal_type)} transition-transform hover:scale-110`}>
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`text-lg font-semibold ${goal.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                {goal.title}
              </h4>
              {goal.is_completed && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Klart!</span>
                </div>
              )}
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className={getGoalTypeColor(goal.goal_type)}>
                {getGoalTypeLabel(goal.goal_type)}
              </Badge>
              {goal.target_date && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(goal.target_date), "PPP", { locale: sv })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!goal.is_completed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onComplete(goal.id)}
              title="Markera som klar"
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(goal.id)}
            title="Radera mål"
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!goal.is_completed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Framsteg mot mål</span>
            <span className="font-bold text-primary">{goal.progress_percent}%</span>
          </div>
          <Progress value={goal.progress_percent} className="h-3" />
          {goal.auto_calculate && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Beräknas automatiskt från träningar och tävlingar
              </p>
            </div>
          )}
          {!goal.auto_calculate && (
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdate(goal.id, Math.max(0, goal.progress_percent - 10))}
                className="flex-1 hover:bg-primary/10 hover:border-primary/30"
              >
                -10%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdate(goal.id, Math.min(100, goal.progress_percent + 10))}
                className="flex-1 hover:bg-primary/10 hover:border-primary/30"
              >
                +10%
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

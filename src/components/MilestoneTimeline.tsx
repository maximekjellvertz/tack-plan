import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Trash2 } from "lucide-react";
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
  if (milestones.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Inga milstolpar än</p>
        <p className="text-sm text-muted-foreground mt-1">
          Milstolpar skapas automatiskt när mål uppnås
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => (
        <div key={milestone.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            {index < milestones.length - 1 && (
              <div className="w-0.5 h-full bg-border mt-2" />
            )}
          </div>
          <Card className="flex-1 p-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{milestone.title}</h4>
                {milestone.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {milestone.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(milestone.achieved_date), "PPP", { locale: sv })}
                </div>
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(milestone.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

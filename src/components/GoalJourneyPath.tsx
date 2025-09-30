import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress_percent: number;
  is_completed: boolean;
  goal_type: string;
}

interface GoalJourneyPathProps {
  goals: Goal[];
  onGoalClick?: (goal: Goal) => void;
}

const HoofPrint = ({ isCompleted, isActive }: { isCompleted: boolean; isActive: boolean }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    className={`transition-all duration-500 ${
      isCompleted
        ? "drop-shadow-[0_0_12px_hsl(var(--primary))]"
        : isActive
        ? "opacity-60"
        : "opacity-30"
    }`}
  >
    <g transform="translate(20, 20)">
      {/* Main hoof shape */}
      <ellipse
        cx="0"
        cy="2"
        rx="8"
        ry="10"
        fill={isCompleted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        className="transition-all duration-500"
      />
      {/* Frog (center part) */}
      <ellipse
        cx="0"
        cy="4"
        rx="4"
        ry="6"
        fill={isCompleted ? "hsl(var(--primary-foreground))" : "hsl(var(--background))"}
        opacity="0.6"
      />
    </g>
  </svg>
);

const HorseIcon = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 50 50"
    className="animate-pulse"
  >
    <g transform="translate(25, 25)">
      {/* Horse head silhouette */}
      <path
        d="M-8,-12 Q-10,-8 -10,-4 L-10,8 Q-10,12 -6,12 L6,12 Q10,12 10,8 L10,-4 Q10,-8 8,-12 Q6,-14 2,-14 L-2,-14 Q-6,-14 -8,-12 Z"
        fill="hsl(var(--primary))"
        className="drop-shadow-md"
      />
      {/* Ear */}
      <path
        d="M-4,-14 L-2,-18 L0,-14 Z"
        fill="hsl(var(--primary))"
      />
      {/* Eye */}
      <circle
        cx="2"
        cy="-6"
        r="2"
        fill="hsl(var(--primary-foreground))"
      />
      {/* Mane */}
      <path
        d="M-8,-10 Q-12,-8 -12,-4 L-10,-4 Q-10,-8 -8,-10 Z"
        fill="hsl(var(--primary))"
        opacity="0.7"
      />
    </g>
  </svg>
);

export const GoalJourneyPath = ({ goals, onGoalClick }: GoalJourneyPathProps) => {
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.target_date && b.target_date) {
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
    }
    return 0;
  });

  // Calculate overall progress
  const totalProgress = goals.length > 0
    ? goals.reduce((sum, goal) => sum + goal.progress_percent, 0) / goals.length
    : 0;

  const getGoalTypeColor = (type: string) => {
    switch (type) {
      case "competition":
        return "bg-primary/10 text-primary border-primary/20";
      case "training":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "health":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
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

  if (goals.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Inga aktiva mål än. Skapa ditt första mål för att starta resan!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Journey Path */}
      <Card className="p-8 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Progress indicator */}
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Din resa</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold">{Math.round(totalProgress)}%</span>
              <span className="text-sm text-muted-foreground">genomfört</span>
            </div>
          </div>

          {/* Path container */}
          <div className="relative">
            {/* Trail line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-1000"
              style={{ width: `${totalProgress}%` }}
            />

            {/* Goals as checkpoints */}
            <div className="relative flex justify-between items-center py-8">
              {sortedGoals.map((goal, index) => {
                const position = (index / (sortedGoals.length - 1 || 1)) * 100;
                const isActive = totalProgress >= position;

                return (
                  <div
                    key={goal.id}
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => onGoalClick?.(goal)}
                  >
                    <HoofPrint isCompleted={goal.is_completed} isActive={isActive} />
                    <div className="mt-2 text-center max-w-[120px]">
                      <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                        {goal.title}
                      </p>
                      {goal.target_date && (
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(goal.target_date), "d MMM", { locale: sv })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Horse position */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out"
              style={{ left: `${totalProgress}%` }}
            >
              <HorseIcon />
            </div>
          </div>
        </div>
      </Card>

      {/* Goals list below */}
      <div className="grid gap-4">
        {sortedGoals.map((goal) => (
          <Card
            key={goal.id}
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
              goal.is_completed ? "bg-muted/50" : ""
            }`}
            onClick={() => onGoalClick?.(goal)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-semibold ${goal.is_completed ? "line-through text-muted-foreground" : ""}`}>
                    {goal.title}
                  </h4>
                  <Badge variant="outline" className={getGoalTypeColor(goal.goal_type)}>
                    {getGoalTypeLabel(goal.goal_type)}
                  </Badge>
                </div>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Framsteg: {goal.progress_percent}%</span>
                  {goal.target_date && (
                    <span>Mål: {format(new Date(goal.target_date), "PPP", { locale: sv })}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {goal.is_completed ? (
                  <Badge className="bg-primary">Klar!</Badge>
                ) : (
                  <Badge variant="outline">{goal.progress_percent}%</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

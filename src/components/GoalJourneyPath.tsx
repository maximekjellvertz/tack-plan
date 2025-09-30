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
  onToggleComplete?: (goalId: string, currentStatus: boolean) => void;
}

const HorseshoeIcon = ({ isCompleted }: { isCompleted: boolean }) => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 50 50"
    className={`transition-all duration-500 cursor-pointer hover:scale-110 ${
      isCompleted
        ? "drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]"
        : "opacity-80"
    }`}
  >
    <g transform="translate(25, 25)">
      {/* Horseshoe shape */}
      <path
        d="M-15,-5 Q-15,-15 -5,-18 Q0,-19 5,-18 Q15,-15 15,-5 L15,10 Q15,12 13,12 L10,12 Q8,12 8,10 L8,-3 Q8,-10 3,-12 Q0,-13 -3,-12 Q-8,-10 -8,-3 L-8,10 Q-8,12 -10,12 L-13,12 Q-15,12 -15,10 Z"
        fill={isCompleted ? "#FFD700" : "#C0C0C0"}
        stroke={isCompleted ? "#FFA500" : "#808080"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Nail holes */}
      <circle cx="-10" cy="-8" r="1.5" fill={isCompleted ? "#B8860B" : "#606060"} />
      <circle cx="-10" cy="0" r="1.5" fill={isCompleted ? "#B8860B" : "#606060"} />
      <circle cx="-10" cy="8" r="1.5" fill={isCompleted ? "#B8860B" : "#606060"} />
      <circle cx="10" cy="-8" r="1.5" fill={isCompleted ? "#B8860B" : "#606060"} />
      <circle cx="10" cy="0" r="1.5" fill={isCompleted ? "#B8860B" : "#606060"} />
      <circle cx="10" cy="8" r="1.5" fill={isCompleted ? "#B8860B" : "#606060"} />
    </g>
  </svg>
);

const GallopingHorseIcon = () => (
  <svg
    width="70"
    height="60"
    viewBox="0 0 70 60"
    className="animate-bounce drop-shadow-lg"
  >
    <g transform="translate(35, 30)">
      {/* Head */}
      <path
        d="M-15,-8 Q-18,-5 -18,-2 L-18,2 Q-18,4 -16,4 L-12,4 Q-10,4 -10,2 L-10,-2 Q-10,-5 -12,-8 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary))"
        strokeWidth="1"
      />
      {/* Ear */}
      <path
        d="M-14,-8 L-13,-12 L-11,-8 Z"
        fill="hsl(var(--primary))"
      />
      {/* Eye */}
      <circle cx="-13" cy="-4" r="1" fill="hsl(var(--background))" />
      
      {/* Neck curved */}
      <path
        d="M-10,-6 Q-8,-8 -4,-10 Q0,-11 2,-10"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Mane flowing */}
      <path
        d="M-8,-8 Q-10,-12 -12,-10 M-6,-9 Q-8,-13 -10,-11 M-4,-10 Q-6,-14 -8,-12"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      
      {/* Body */}
      <ellipse
        cx="8"
        cy="-4"
        rx="12"
        ry="7"
        fill="hsl(var(--primary))"
      />
      
      {/* Front leg raised */}
      <path
        d="M2,2 L0,8"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Front leg extended */}
      <path
        d="M6,2 L10,10"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Back leg extended back */}
      <path
        d="M12,2 L18,8"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Back leg raised */}
      <path
        d="M16,2 L16,6"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Tail flowing */}
      <path
        d="M18,-6 Q22,-4 24,-2 Q26,0 28,3"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M18,-5 Q23,-2 26,2"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  </svg>
);

export const GoalJourneyPath = ({ goals, onGoalClick, onToggleComplete }: GoalJourneyPathProps) => {
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.target_date && b.target_date) {
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
    }
    return 0;
  });

  // Calculate progress based on completed goals
  const completedGoals = goals.filter(g => g.is_completed).length;
  const horseProgress = goals.length > 0 
    ? (completedGoals / goals.length) * 100 
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
            <p className="text-sm text-muted-foreground mb-2">Din målresa</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-semibold">{completedGoals} / {goals.length} mål klara</span>
            </div>
          </div>

          {/* Path container */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-1/2 left-12 right-12 h-1 bg-muted -translate-y-1/2" />
            
            {/* Progress line */}
            <div 
              className="absolute top-1/2 left-12 h-1 bg-primary -translate-y-1/2 transition-all duration-1000 ease-out"
              style={{ 
                width: `calc(${horseProgress}% * (100% - 96px) / 100)`,
              }}
            />

            {/* Horse that moves along the path */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-20"
              style={{ 
                left: `calc(48px + ${horseProgress}% * (100% - 96px) / 100)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <GallopingHorseIcon />
            </div>

            {/* Goals as checkpoints */}
            <div className="relative flex justify-between items-center py-8 px-4">
              {sortedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex flex-col items-center group z-10"
                >
                  <div
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete?.(goal.id, goal.is_completed);
                    }}
                    title={goal.is_completed ? "Markera som ej klar" : "Markera som klar"}
                  >
                    <HorseshoeIcon isCompleted={goal.is_completed} />
                  </div>
                  <div className="mt-2 text-center max-w-[120px]">
                    <p 
                      className={`text-xs font-medium truncate transition-colors cursor-pointer ${
                        goal.is_completed 
                          ? "text-yellow-600 dark:text-yellow-400" 
                          : "group-hover:text-primary"
                      }`}
                      onClick={() => onGoalClick?.(goal)}
                    >
                      {goal.title}
                    </p>
                    {goal.target_date && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(goal.target_date), "d MMM", { locale: sv })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
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

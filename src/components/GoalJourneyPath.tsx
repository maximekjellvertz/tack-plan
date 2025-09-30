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
    width="90"
    height="80"
    viewBox="0 0 120 100"
    className="drop-shadow-xl"
  >
    <g transform="translate(60, 50)" stroke="hsl(var(--primary))" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Flowing mane on tail */}
      <path d="M 48,-8 Q 52,-6 54,-2 Q 56,2 58,8" strokeWidth="2.5" />
      <path d="M 49,-6 Q 54,-2 56,4" strokeWidth="2" opacity="0.6" />
      <path d="M 50,-4 Q 55,0 57,6" strokeWidth="1.5" opacity="0.4" />
      
      {/* Body - elegant curve */}
      <ellipse cx="18" cy="-8" rx="18" ry="11" stroke="hsl(var(--primary))" strokeWidth="2.5" />
      
      {/* Neck - flowing line */}
      <path d="M 0,-12 Q -8,-16 -18,-16" strokeWidth="3" />
      
      {/* Head - elegant profile */}
      <path d="M -18,-16 Q -24,-16 -26,-12 L -26,-4 Q -26,-2 -24,0" strokeWidth="2.5" />
      
      {/* Ear */}
      <path d="M -20,-16 L -19,-20 L -17,-16" strokeWidth="2" />
      
      {/* Nostril */}
      <circle cx="-25" cy="-2" r="1" fill="hsl(var(--primary))" />
      
      {/* Eye */}
      <circle cx="-22" cy="-10" r="1.5" fill="hsl(var(--primary))" />
      
      {/* Mane flowing back */}
      <path d="M -16,-14 Q -18,-18 -20,-16" strokeWidth="1.5" opacity="0.7" />
      <path d="M -12,-13 Q -14,-17 -16,-15" strokeWidth="1.5" opacity="0.7" />
      <path d="M -8,-14 Q -10,-18 -12,-16" strokeWidth="1.5" opacity="0.7" />
      
      {/* Front leg extended forward (galloping) */}
      <path d="M 6,2 Q 4,12 6,22" strokeWidth="3" />
      
      {/* Front leg tucked */}
      <path d="M 12,2 Q 13,8 12,14" strokeWidth="3" />
      
      {/* Back leg extended back (power) */}
      <path d="M 28,2 Q 34,10 40,18" strokeWidth="3" />
      
      {/* Back leg tucked */}
      <path d="M 32,2 Q 33,6 32,12" strokeWidth="3" />
      
      {/* Hoof details - small curves at leg ends */}
      <path d="M 5,22 L 7,22" strokeWidth="2" />
      <path d="M 11,14 L 13,14" strokeWidth="2" />
      <path d="M 39,18 L 41,18" strokeWidth="2" />
      <path d="M 31,12 L 33,12" strokeWidth="2" />
      
      {/* Dust/movement lines */}
      <path d="M 8,24 L 14,26" strokeWidth="1" opacity="0.4" />
      <path d="M 12,26 L 18,28" strokeWidth="1" opacity="0.3" />
      <path d="M 36,20 L 42,22" strokeWidth="1" opacity="0.4" />
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

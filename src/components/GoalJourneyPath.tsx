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
    width="80"
    height="70"
    viewBox="0 0 100 100"
    className="drop-shadow-xl"
    style={{ animation: 'bounce 1s ease-in-out infinite' }}
  >
    <g transform="translate(50, 50)">
      {/* Flowing mane */}
      <path
        d="M-20,-15 Q-25,-18 -28,-15 Q-30,-20 -32,-18 Q-28,-22 -25,-20"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      
      {/* Head - elegant profile */}
      <path
        d="M-25,-12 Q-28,-10 -28,-6 L-28,-2 Q-28,2 -25,3 L-20,3 Q-18,3 -18,0 L-18,-8 Q-18,-12 -22,-14 Z"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
      />
      
      {/* Ear pointed */}
      <path
        d="M-22,-14 L-21,-18 L-19,-14 Z"
        fill="hsl(var(--primary))"
      />
      
      {/* Eye */}
      <circle cx="-23" cy="-8" r="1.5" fill="hsl(var(--background))" />
      
      {/* Nostril */}
      <circle cx="-26" cy="-2" r="0.8" fill="hsl(var(--background))" opacity="0.5" />
      
      {/* Elegant curved neck */}
      <path
        d="M-18,-10 Q-12,-14 -4,-16 Q4,-18 10,-16"
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Body - dynamic shape */}
      <ellipse
        cx="15"
        cy="-8"
        rx="16"
        ry="10"
        fill="hsl(var(--primary))"
      />
      
      {/* Front leg - extended forward (galloping) */}
      <path
        d="M5,0 Q3,8 5,16"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Front leg - tucked under */}
      <path
        d="M10,0 Q11,4 10,8"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Back leg - extended back (power) */}
      <path
        d="M20,0 Q24,6 28,12"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Back leg - tucked */}
      <path
        d="M24,0 Q25,2 24,6"
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Flowing tail - elegant curves */}
      <path
        d="M28,-10 Q34,-8 38,-4 Q40,0 42,6"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M28,-8 Q35,-4 38,2 Q40,6 42,10"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M29,-6 Q36,-2 40,4"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.4"
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

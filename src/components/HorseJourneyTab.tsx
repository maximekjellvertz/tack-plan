import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { EditGoalDialog } from "@/components/EditGoalDialog";
import { GoalJourneyPath } from "@/components/GoalJourneyPath";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { BadgesGrid } from "@/components/BadgesGrid";
import { EmptyStateCard } from "@/components/EmptyStateCard";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress_percent: number;
  is_completed: boolean;
  goal_type: string;
  auto_calculate: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  achieved_date: string;
  milestone_type: string;
  icon: string;
}

interface Badge {
  id: string;
  title: string;
  description: string | null;
  badge_type: string;
  icon: string;
  earned_date: string;
  is_manual: boolean;
}

interface HorseJourneyTabProps {
  goals: Goal[];
  milestones: Milestone[];
  badges: Badge[];
  loadingJourney: boolean;
  onAddGoal: (goal: any) => void;
  onUpdateGoal: (goalId: string, updates: any) => void;
  onToggleGoalComplete: (goalId: string, currentStatus: boolean) => void;
  onDeleteGoal: (goalId: string) => void;
  onDeleteMilestone: (milestoneId: string) => void;
}

export const HorseJourneyTab = ({
  goals,
  milestones,
  badges,
  loadingJourney,
  onAddGoal,
  onUpdateGoal,
  onToggleGoalComplete,
  onDeleteGoal,
  onDeleteMilestone,
}: HorseJourneyTabProps) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const activeGoals = goals.filter((g) => !g.is_completed);

  return (
    <div className="animate-fade-in">
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">Aktiva mål</TabsTrigger>
          <TabsTrigger value="milestones">Milstolpar</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Aktiva mål</h3>
            </div>
            <AddGoalDialog onAdd={onAddGoal} />
          </div>

          {activeGoals.length === 0 ? (
            <EmptyStateCard
              icon={Target}
              title="Inga aktiva mål"
              motivationalText="Drömmar blir verklighet när de blir mål"
              description="Lägg till ett mål för att komma igång med din resa!"
              action={<AddGoalDialog onAdd={onAddGoal} />}
            />
          ) : (
            <div className="animate-fade-in">
              <GoalJourneyPath
                goals={activeGoals}
                onToggleComplete={onToggleGoalComplete}
                onDelete={onDeleteGoal}
                onGoalClick={(goal) => setEditingGoal(goal as Goal)}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="milestones" className="mt-6 animate-fade-in">
          <MilestoneTimeline
            milestones={milestones}
            onDelete={onDeleteMilestone}
          />
        </TabsContent>

        <TabsContent value="badges" className="mt-6 animate-fade-in">
          <BadgesGrid badges={badges} />
        </TabsContent>
      </Tabs>

      {editingGoal && (
        <EditGoalDialog
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
          goal={editingGoal}
          onUpdate={onUpdateGoal}
        />
      )}
    </div>
  );
};
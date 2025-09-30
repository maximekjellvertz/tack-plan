import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoalCard } from "@/components/GoalCard";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { Loader2 } from "lucide-react";

interface Goal {
  id: string;
  horse_id: string;
  horse_name: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress_percent: number;
  is_completed: boolean;
  goal_type: string;
  auto_calculate: boolean;
}

interface Horse {
  id: string;
  name: string;
}

const Goals = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorse, setSelectedHorse] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHorses();
    fetchGoals();
  }, []);

  const fetchHorses = async () => {
    try {
      const { data, error } = await supabase
        .from("horses")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setHorses(data || []);
    } catch (error) {
      console.error("Error fetching horses:", error);
    }
  };

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("goals")
        .select(`
          *,
          horses!inner(name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const goalsWithHorseNames = data?.map((goal: any) => ({
        ...goal,
        horse_name: goal.horses?.name || "Okänd häst",
      })) || [];

      setGoals(goalsWithHorseNames);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta mål",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (newGoal: any) => {
    if (selectedHorse === "all" || !selectedHorse) {
      toast({
        title: "Välj en häst",
        description: "Du måste välja en häst för att lägga till mål",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("goals")
        .insert({
          user_id: user.id,
          horse_id: selectedHorse,
          ...newGoal,
        });

      if (error) throw error;

      toast({
        title: "Mål tillagt!",
        description: "Målet har skapats",
      });

      fetchGoals();
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        title: "Fel",
        description: "Kunde inte lägga till mål",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ progress_percent: progress })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Framsteg uppdaterat!",
        description: `Framsteg satt till ${progress}%`,
      });

      fetchGoals();
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera framsteg",
        variant: "destructive",
      });
    }
  };

  const handleCompleteGoal = async (id: string) => {
    try {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;

      // Mark goal as completed
      const { error: goalError } = await supabase
        .from("goals")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          progress_percent: 100,
        })
        .eq("id", id);

      if (goalError) throw goalError;

      // Create milestone
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: milestoneError } = await supabase
        .from("milestones")
        .insert({
          user_id: user.id,
          horse_id: goal.horse_id,
          goal_id: id,
          title: goal.title,
          description: goal.description,
          achieved_date: new Date().toISOString().split("T")[0],
          milestone_type: "goal_completed",
        });

      if (milestoneError) throw milestoneError;

      toast({
        title: "Grattis!",
        description: "Målet är klart och har lagts till som milstolpe",
      });

      fetchGoals();
    } catch (error) {
      console.error("Error completing goal:", error);
      toast({
        title: "Fel",
        description: "Kunde inte markera mål som klart",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Mål raderat!",
        description: "Målet har tagits bort",
      });

      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Fel",
        description: "Kunde inte radera mål",
        variant: "destructive",
      });
    }
  };

  const filteredGoals = selectedHorse === "all" 
    ? goals 
    : goals.filter((g) => g.horse_id === selectedHorse);

  const activeGoals = filteredGoals.filter((g) => !g.is_completed);
  const completedGoals = filteredGoals.filter((g) => g.is_completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Mål & Milstolpar</h1>
          </div>
          <p className="text-muted-foreground">Sätt mål och följ din hästs resa</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Select value={selectedHorse} onValueChange={setSelectedHorse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Välj häst" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla hästar</SelectItem>
              {horses.map((horse) => (
                <SelectItem key={horse.id} value={horse.id}>
                  {horse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedHorse !== "all" && <AddGoalDialog onAdd={handleAddGoal} />}
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              <TrendingUp className="w-4 h-4 mr-2" />
              Aktiva mål ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <Award className="w-4 h-4 mr-2" />
              Avklarade ({completedGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeGoals.length === 0 ? (
              <Card className="p-8 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Inga aktiva mål</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Lägg till ett mål för att komma igång!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <div key={goal.id}>
                    <p className="text-sm text-muted-foreground mb-2">{goal.horse_name}</p>
                    <GoalCard
                      goal={goal}
                      onUpdate={handleUpdateProgress}
                      onDelete={handleDeleteGoal}
                      onComplete={handleCompleteGoal}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedGoals.length === 0 ? (
              <Card className="p-8 text-center">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Inga avklarade mål än</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedGoals.map((goal) => (
                  <div key={goal.id}>
                    <p className="text-sm text-muted-foreground mb-2">{goal.horse_name}</p>
                    <GoalCard
                      goal={goal}
                      onUpdate={handleUpdateProgress}
                      onDelete={handleDeleteGoal}
                      onComplete={handleCompleteGoal}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Goals;

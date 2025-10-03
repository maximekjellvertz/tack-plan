import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Award, TrendingUp, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoalCard } from "@/components/GoalCard";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { Loader2 } from "lucide-react";
import { useBadgeManager } from "@/hooks/useBadgeManager";

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
  const [userId, setUserId] = useState<string>();
  const { checkBadges } = useBadgeManager(userId);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
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

      // Check for new badges
      checkBadges();

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
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <Target className="w-10 h-10 text-primary relative" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Mål & Milstolpar</h1>
              <p className="text-sm text-muted-foreground mt-1">Sätt mål och följ din hästs resa mot nya höjder</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <Select value={selectedHorse} onValueChange={setSelectedHorse}>
            <SelectTrigger className="w-[240px] border-2 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="🎯 Välj häst" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🏇 Alla hästar</SelectItem>
              {horses.map((horse) => (
                <SelectItem key={horse.id} value={horse.id}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    {horse.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedHorse !== "all" && <AddGoalDialog onAdd={handleAddGoal} />}
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/50">
            <TabsTrigger 
              value="active"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all hover:scale-[1.02] py-3"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Aktiva mål</span>
                <span className="text-xs opacity-80">{activeGoals.length} pågående</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all hover:scale-[1.02] py-3"
            >
              <Award className="w-4 h-4 mr-2" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">Avklarade</span>
                <span className="text-xs opacity-80">{completedGoals.length} uppnådda</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeGoals.length === 0 ? (
              <Card className="p-12 text-center animate-fade-in bg-gradient-to-br from-background to-muted/30 border-2 border-dashed">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative flex items-center justify-center">
                    <Target className="w-16 h-16 text-primary" />
                    <Sparkles className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Sätt ditt första mål!</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {selectedHorse === "all" 
                    ? "Välj en häst för att börja sätta inspirerande mål"
                    : "Skapa mål och följ din hästs utveckling mot nya framgångar"
                  }
                </p>
                {selectedHorse !== "all" && (
                  <div className="space-y-3 text-left max-w-sm mx-auto mb-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">Följ framsteg mot tävlingar och milstolpar</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">Få automatiska uppdateringar baserat på träning</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">Fira varje framgång med din häst</p>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal, index) => (
                  <div 
                    key={goal.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">{goal.horse_name}</p>
                    </div>
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
              <Card className="p-12 text-center animate-fade-in bg-gradient-to-br from-background to-muted/30 border-2 border-dashed">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <Award className="w-16 h-16 text-primary relative" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Här blir det snart fullt av framgångar!</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  När du når dina mål dyker de upp här. Varje klarat mål blir en milstolpe i din hästs resa.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  "Varje steg framåt är värt att fira" 🏆
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedGoals.map((goal, index) => (
                  <div 
                    key={goal.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">{goal.horse_name}</p>
                    </div>
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

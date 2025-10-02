import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { HorseHeader } from "@/components/HorseHeader";
import { HorseOverviewTab } from "@/components/HorseOverviewTab";
import { HorseTrainingTab } from "@/components/HorseTrainingTab";
import { HorseCompetitionsTab } from "@/components/HorseCompetitionsTab";
import { HorseHealthTab } from "@/components/HorseHealthTab";
import { HorseJourneyTab } from "@/components/HorseJourneyTab";
import { HorsePersonalityCard } from "@/components/HorsePersonalityCard";

interface Competition {
  id: number;
  name: string;
  date: string;
  location: string;
  discipline: string;
  class: string;
  notes: string;
  status: "upcoming" | "completed";
  result?: string;
}

interface TrainingSession {
  id: number;
  type: string;
  date: string;
  duration: string;
  intensity: string;
  notes: string;
}

interface HealthLog {
  id: string;
  horse_name: string;
  event: string;
  created_at: string;
  severity: string;
  status: string;
  treatment: string;
  notes: string | null;
  images: any;
}

interface Horse {
  id: string;
  name: string;
  breed: string;
  age: number;
  discipline: string;
  level: string;
  color: string;
  registration_number?: string | null;
  microchip?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  competitions_this_year?: number | null;
  placements?: number | null;
  training_sessions?: number | null;
  vet_visits?: number | null;
  personality_trait?: string | null;
  fun_fact?: string | null;
}

const HorseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [horse, setHorse] = useState<Horse | null>(null);
  const [loading, setLoading] = useState(true);

  // Competitions state
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const upcomingCompetitions = competitions.filter(c => c.status === "upcoming");
  const completedCompetitions = competitions.filter(c => c.status === "completed");

  // Training sessions state
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const sortedTrainingSessions = [...trainingSessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Health logs state
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loadingHealthLogs, setLoadingHealthLogs] = useState(true);

  // Goals, milestones and badges state
  const [goals, setGoals] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loadingJourney, setLoadingJourney] = useState(true);

  // Fetch horse data
  const fetchHorse = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('horses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setHorse(data);
      }
    } catch (error) {
      console.error('Error fetching horse:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta häst",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorse();
  }, [id, toast]);

  // Fetch health logs
  useEffect(() => {
    const fetchHealthLogs = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('health_logs')
          .select('*')
          .eq('horse_id', id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setHealthLogs(data || []);
      } catch (error) {
        console.error('Error fetching health logs:', error);
      } finally {
        setLoadingHealthLogs(false);
      }
    };

    if (horse) {
      fetchHealthLogs();
    }

    // Set up realtime subscription for health logs
    const channel = supabase
      .channel('horse-health-logs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_logs',
          filter: `horse_id=eq.${id}`
        },
        () => {
          fetchHealthLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, horse]);

  // Fetch journey data (goals, milestones, badges)
  useEffect(() => {
    const fetchJourneyData = async () => {
      if (!id) return;

      try {
        // Fetch goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('horse_id', id)
          .order('created_at', { ascending: false });

        if (goalsError) throw goalsError;
        setGoals(goalsData || []);

        // Fetch milestones
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('*')
          .eq('horse_id', id)
          .order('achieved_date', { ascending: false });

        if (milestonesError) throw milestonesError;
        setMilestones(milestonesData || []);

        // Fetch badges
        const { data: badgesData, error: badgesError } = await supabase
          .from('badges')
          .select('*')
          .eq('horse_id', id)
          .order('earned_date', { ascending: false });

        if (badgesError) throw badgesError;
        setBadges(badgesData || []);
      } catch (error) {
        console.error('Error fetching journey data:', error);
      } finally {
        setLoadingJourney(false);
      }
    };

    if (horse) {
      fetchJourneyData();
    }

    // Set up realtime subscriptions
    const goalsChannel = supabase
      .channel('horse-goals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `horse_id=eq.${id}`
        },
        () => {
          fetchJourneyData();
        }
      )
      .subscribe();

    const milestonesChannel = supabase
      .channel('horse-milestones')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
          filter: `horse_id=eq.${id}`
        },
        () => {
          fetchJourneyData();
        }
      )
      .subscribe();

    const badgesChannel = supabase
      .channel('horse-badges')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'badges',
          filter: `horse_id=eq.${id}`
        },
        () => {
          fetchJourneyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(milestonesChannel);
      supabase.removeChannel(badgesChannel);
    };
  }, [id, horse]);

  // Handlers for competitions
  const handleAddCompetition = (newComp: Omit<Competition, 'id' | 'status' | 'result'>) => {
    const competition: Competition = {
      ...newComp,
      id: Date.now(),
      status: new Date(newComp.date) > new Date() ? "upcoming" : "completed",
    };
    setCompetitions([competition, ...competitions]);
  };

  // Handlers for training sessions
  const handleAddTrainingSession = (newSession: Omit<TrainingSession, 'id'>) => {
    const session: TrainingSession = {
      ...newSession,
      id: Date.now(),
    };
    setTrainingSessions([session, ...trainingSessions]);
  };

  // Handlers for health logs
  const handleAddHealthLog = async (newLog: Omit<HealthLog, 'id' | 'created_at' | 'status' | 'horse_name'>) => {
    if (!horse) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('health_logs')
        .insert({
          user_id: user.id,
          horse_id: horse.id,
          horse_name: horse.name,
          event: newLog.event,
          severity: newLog.severity,
          treatment: newLog.treatment,
          notes: newLog.notes,
          images: newLog.images || [],
          status: 'Pågående',
        });

      if (error) throw error;

      toast({
        title: "Hälsologg tillagd!",
        description: `Hälsologg för ${horse.name} har skapats`,
      });
    } catch (error) {
      console.error('Error adding health log:', error);
      toast({
        title: "Fel",
        description: "Kunde inte lägga till hälsologg",
        variant: "destructive",
      });
    }
  };

  const handleUpdateHealthLog = async (id: string, updates: Partial<HealthLog>) => {
    try {
      const { error } = await supabase
        .from('health_logs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Hälsologg uppdaterad!",
        description: "Hälsologgen har uppdaterats",
      });
    } catch (error) {
      console.error('Error updating health log:', error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera hälsologg",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHealthLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Hälsologg raderad!",
        description: "Hälsologgen har raderats",
      });
    } catch (error) {
      console.error('Error deleting health log:', error);
      toast({
        title: "Fel",
        description: "Kunde inte radera hälsologg",
        variant: "destructive",
      });
    }
  };

  // Handlers for goals
  const handleAddGoal = async (newGoal: any) => {
    if (!horse) {
      console.error('No horse found');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        toast({
          title: "Fel",
          description: "Du måste vara inloggad",
          variant: "destructive",
        });
        return;
      }

      const goalData = {
        user_id: user.id,
        horse_id: horse.id,
        title: newGoal.title,
        description: newGoal.description || null,
        target_date: newGoal.target_date ? newGoal.target_date.toISOString().split('T')[0] : null,
        goal_type: newGoal.goal_type || 'custom',
        auto_calculate: newGoal.auto_calculate !== undefined ? newGoal.auto_calculate : true,
      };

      const { data, error } = await supabase
        .from('goals')
        .insert(goalData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Immediately refresh goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('horse_id', horse.id)
        .order('created_at', { ascending: false });
      
      if (goalsData) {
        setGoals(goalsData);
      }

      toast({
        title: "Mål tillagt!",
        description: `Mål för ${horse.name} har skapats`,
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Fel",
        description: error instanceof Error ? error.message : "Kunde inte lägga till mål",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: any) => {
    if (!horse) return;

    try {
      const updateData = {
        title: updates.title,
        description: updates.description || null,
        target_date: updates.target_date ? updates.target_date.toISOString().split('T')[0] : null,
        goal_type: updates.goal_type,
        auto_calculate: updates.auto_calculate,
      };

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', goalId);

      if (error) throw error;

      // Immediately refresh goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('horse_id', horse.id)
        .order('created_at', { ascending: false });
      
      if (goalsData) {
        setGoals(goalsData);
      }

      toast({
        title: "Mål uppdaterat!",
        description: "Målet har uppdaterats",
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera mål",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGoalProgress = async (id: string, progress: number) => {
    if (!horse) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .update({ progress_percent: progress })
        .eq('id', id);

      if (error) throw error;

      // Immediately refresh goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('horse_id', horse.id)
        .order('created_at', { ascending: false });
      
      if (goalsData) {
        setGoals(goalsData);
      }

      toast({
        title: "Framsteg uppdaterat!",
        description: `Framsteg satt till ${progress}%`,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera framsteg",
        variant: "destructive",
      });
    }
  };

  const handleToggleGoalComplete = async (goalId: string, currentStatus: boolean) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal || !horse) {
        console.error('Goal or horse not found', { goal, horse });
        return;
      }

      if (currentStatus) {
        // Mark as incomplete
        const { error } = await supabase
          .from('goals')
          .update({
            is_completed: false,
            completed_at: null,
          })
          .eq('id', goalId);

        if (error) {
          console.error('Error updating goal to incomplete:', error);
          throw error;
        }

        toast({
          title: "Uppdaterat",
          description: "Målet har markerats som ej klart",
        });
      } else {
        // Mark as completed
        const { error: goalError } = await supabase
          .from('goals')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
            progress_percent: 100,
          })
          .eq('id', goalId);

        if (goalError) {
          console.error('Error updating goal to complete:', goalError);
          throw goalError;
        }

        // Create milestone (only if it doesn't exist)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if milestone already exists
          const { data: existingMilestone } = await supabase
            .from('milestones')
            .select('id')
            .eq('goal_id', goalId)
            .maybeSingle();

          if (!existingMilestone) {
            const { error: milestoneError } = await supabase
              .from('milestones')
              .insert({
                user_id: user.id,
                horse_id: horse.id,
                goal_id: goalId,
                title: goal.title,
                description: goal.description,
                achieved_date: new Date().toISOString().split('T')[0],
                milestone_type: 'goal_completed',
              });

            if (milestoneError) {
              console.error('Error creating milestone:', milestoneError);
            }
          }
        }

        toast({
          title: "Grattis! 🎉",
          description: "Målet är klart och har lagts till som milstolpe",
        });
      }
      
      // Force refresh the goals and milestones data
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('horse_id', horse.id)
        .order('created_at', { ascending: false });
      
      if (goalsData) {
        setGoals(goalsData);
      }

      // Refresh milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('horse_id', horse.id)
        .order('achieved_date', { ascending: false });
      
      if (milestonesData) {
        setMilestones(milestonesData);
      }
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera målets status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!horse) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      // Immediately refresh goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('horse_id', horse.id)
        .order('created_at', { ascending: false });
      
      if (goalsData) {
        setGoals(goalsData);
      }

      toast({
        title: "Mål raderat!",
        description: "Målet har tagits bort",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Fel",
        description: "Kunde inte radera mål",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!horse) return;
    
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;

      // Immediately refresh milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('horse_id', horse.id)
        .order('achieved_date', { ascending: false });
      
      if (milestonesData) {
        setMilestones(milestonesData);
      }

      toast({
        title: "Milstolpe raderad!",
        description: "Milstolpen har tagits bort",
      });
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast({
        title: "Fel",
        description: "Kunde inte radera milstolpe",
        variant: "destructive",
      });
    }
  };

  const handleUpdateHorse = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('horses')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (data) setHorse(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!horse) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">Häst hittades inte</h2>
          <Button onClick={() => navigate("/horses")}>Tillbaka till mina hästar</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 animate-fade-in hover-scale"
          onClick={() => navigate("/horses")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till mina hästar
        </Button>

        <HorseHeader horse={horse} />

        <div className="mb-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <HorsePersonalityCard 
            horseId={horse.id}
            horseName={horse.name}
            breed={horse.breed}
            level={horse.level}
            personalityTrait={horse.personality_trait}
            funFact={horse.fun_fact}
            onUpdate={fetchHorse}
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 animate-fade-in">
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="training">Träning</TabsTrigger>
            <TabsTrigger value="competitions">Tävlingar</TabsTrigger>
            <TabsTrigger value="health">Hälsa</TabsTrigger>
            <TabsTrigger value="journey">Resa & Mål</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <HorseOverviewTab horse={horse} onUpdate={handleUpdateHorse} />
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <HorseTrainingTab
              horseName={horse.name}
              trainingSessions={trainingSessions}
              sortedTrainingSessions={sortedTrainingSessions}
              onAddTrainingSession={handleAddTrainingSession}
            />
          </TabsContent>

          <TabsContent value="competitions" className="mt-6">
            <HorseCompetitionsTab
              horseName={horse.name}
              competitions={competitions}
              upcomingCompetitions={upcomingCompetitions}
              completedCompetitions={completedCompetitions}
              onAddCompetition={handleAddCompetition}
            />
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <HorseHealthTab
              horseName={horse.name}
              healthLogs={healthLogs}
              loadingHealthLogs={loadingHealthLogs}
              onAddHealthLog={handleAddHealthLog}
              onUpdateHealthLog={handleUpdateHealthLog}
              onDeleteHealthLog={handleDeleteHealthLog}
            />
          </TabsContent>

          <TabsContent value="journey" className="mt-6">
            <HorseJourneyTab
              goals={goals}
              milestones={milestones}
              badges={badges}
              loadingJourney={loadingJourney}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onToggleGoalComplete={handleToggleGoalComplete}
              onDeleteGoal={handleDeleteGoal}
              onDeleteMilestone={handleDeleteMilestone}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HorseDetails;
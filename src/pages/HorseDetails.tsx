import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Calendar, Activity, FileText, Trophy, MapPin, Clock, AlertCircle, CheckCircle, Image as ImageIcon, Target } from "lucide-react";
import { AddCompetitionToHorseDialog } from "@/components/AddCompetitionToHorseDialog";
import { AddTrainingSessionDialog } from "@/components/AddTrainingSessionDialog";
import { AddHealthLogToHorseDialog } from "@/components/AddHealthLogToHorseDialog";
import { HealthLogDetailsDialog } from "@/components/HealthLogDetailsDialog";
import { UpdateHealthLogDialog } from "@/components/UpdateHealthLogDialog";
import { EditHorseInfoDialog } from "@/components/EditHorseInfoDialog";
import { EditHorseStatsDialog } from "@/components/EditHorseStatsDialog";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { GoalCard } from "@/components/GoalCard";
import { GoalJourneyPath } from "@/components/GoalJourneyPath";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { BadgesGrid } from "@/components/BadgesGrid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
}

const HorseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [horse, setHorse] = useState<Horse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchHorse();
  }, [id, toast]);

  // Competitions - empty by default, users add their own or sync from TDB
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  const handleAddCompetition = (newComp: Omit<Competition, 'id' | 'status' | 'result'>) => {
    const competition: Competition = {
      ...newComp,
      id: Date.now(),
      status: new Date(newComp.date) > new Date() ? "upcoming" : "completed",
    };
    setCompetitions([competition, ...competitions]);
  };

  const upcomingCompetitions = competitions.filter(c => c.status === "upcoming");
  const completedCompetitions = competitions.filter(c => c.status === "completed");

  // Training sessions - empty by default, users add their own
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);

  const handleAddTrainingSession = (newSession: Omit<TrainingSession, 'id'>) => {
    const session: TrainingSession = {
      ...newSession,
      id: Date.now(),
    };
    setTrainingSessions([session, ...trainingSessions]);
  };

  const sortedTrainingSessions = [...trainingSessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Fetch health logs from database
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loadingHealthLogs, setLoadingHealthLogs] = useState(true);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Lätt":
        return "bg-secondary";
      case "Medel":
        return "bg-primary";
      case "Allvarlig":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pågående":
        return <Clock className="w-4 h-4" />;
      case "Klar":
        return <CheckCircle className="w-4 h-4" />;
      case "Uppmärksamhet":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const sortedHealthLogs = [...healthLogs].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Goals, milestones and badges state
  const [goals, setGoals] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loadingJourney, setLoadingJourney] = useState(true);

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

      console.log('Adding goal:', newGoal);

      const goalData = {
        user_id: user.id,
        horse_id: horse.id,
        title: newGoal.title,
        description: newGoal.description || null,
        target_date: newGoal.target_date ? newGoal.target_date.toISOString().split('T')[0] : null,
        goal_type: newGoal.goal_type || 'custom',
        auto_calculate: newGoal.auto_calculate !== undefined ? newGoal.auto_calculate : true,
      };

      console.log('Goal data to insert:', goalData);

      const { data, error } = await supabase
        .from('goals')
        .insert(goalData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Goal created:', data);

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

  const handleUpdateGoalProgress = async (id: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ progress_percent: progress })
        .eq('id', id);

      if (error) throw error;

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

  const handleCompleteGoal = async (goalId: string) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal || !horse) return;

      // Mark goal as completed
      const { error: goalError } = await supabase
        .from('goals')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          progress_percent: 100,
        })
        .eq('id', goalId);

      if (goalError) throw goalError;

      // Create milestone
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      if (milestoneError) throw milestoneError;

      toast({
        title: "Grattis!",
        description: "Målet är klart och har lagts till som milstolpe",
      });
    } catch (error) {
      console.error('Error completing goal:', error);
      toast({
        title: "Fel",
        description: "Kunde inte markera mål som klart",
        variant: "destructive",
      });
    }
  };

  const handleToggleGoalComplete = async (goalId: string, currentStatus: boolean) => {
    console.log('Toggle goal complete:', { goalId, currentStatus });
    
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal || !horse) {
        console.error('Goal or horse not found', { goal, horse });
        return;
      }

      if (currentStatus) {
        // Mark as incomplete
        console.log('Marking goal as incomplete');
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

        console.log('Goal marked as incomplete successfully');
        toast({
          title: "Uppdaterat",
          description: "Målet har markerats som ej klart",
        });
      } else {
        // Mark as completed
        console.log('Marking goal as complete');
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

        console.log('Goal marked as complete successfully');

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
            console.log('Creating milestone for goal');
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
            } else {
              console.log('Milestone created successfully');
            }
          } else {
            console.log('Milestone already exists');
          }
        }

        toast({
          title: "Grattis! 🎉",
          description: "Målet är klart och har lagts till som milstolpe",
        });
      }
      
      // Force refresh the goals data
      console.log('Refreshing goals data...');
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('horse_id', horse.id)
        .order('created_at', { ascending: false });
      
      if (goalsData) {
        console.log('Goals refreshed:', goalsData);
        setGoals(goalsData);
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
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

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

  const activeGoals = goals.filter((g) => !g.is_completed);

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
        <Card className="p-8 text-center">
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
          className="mb-6"
          onClick={() => navigate("/horses")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till mina hästar
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
              <Heart className="w-16 h-16 text-primary/40" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">{horse.name}</h1>
                <Badge variant="secondary">{horse.level}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ras</p>
                  <p className="font-medium">{horse.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ålder</p>
                  <p className="font-medium">{horse.age} år</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gren</p>
                  <p className="font-medium">{horse.discipline}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Färg</p>
                  <p className="font-medium">{horse.color}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="training">Träning</TabsTrigger>
            <TabsTrigger value="competitions">Tävlingar</TabsTrigger>
            <TabsTrigger value="health">Hälsa</TabsTrigger>
            <TabsTrigger value="journey">Resa & Mål</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Grundläggande information</h3>
                  <EditHorseInfoDialog 
                    horseId={horse.id}
                    currentData={{
                      registration_number: horse.registration_number,
                      microchip: horse.microchip,
                      birth_date: horse.birth_date,
                      gender: horse.gender,
                    }}
                    onUpdate={async () => {
                      const { data } = await supabase
                        .from('horses')
                        .select('*')
                        .eq('id', id)
                        .maybeSingle();
                      if (data) setHorse(data);
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registreringsnummer:</span>
                    <span className="font-medium">{horse.registration_number || "Ej angivet"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mikrochip:</span>
                    <span className="font-medium">{horse.microchip || "Ej angivet"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Födelsedatum:</span>
                    <span className="font-medium">{horse.birth_date || "Ej angivet"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kön:</span>
                    <span className="font-medium">{horse.gender || "Ej angivet"}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Statistik</h3>
                  <EditHorseStatsDialog 
                    horseId={horse.id}
                    currentData={{
                      competitions_this_year: horse.competitions_this_year,
                      placements: horse.placements,
                      training_sessions: horse.training_sessions,
                      vet_visits: horse.vet_visits,
                    }}
                    onUpdate={async () => {
                      const { data } = await supabase
                        .from('horses')
                        .select('*')
                        .eq('id', id)
                        .maybeSingle();
                      if (data) setHorse(data);
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tävlingar i år:</span>
                    <span className="font-medium">{horse.competitions_this_year || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Placeringar:</span>
                    <span className="font-medium">{horse.placements || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Träningspass:</span>
                    <span className="font-medium">{horse.training_sessions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Veterinärbesök:</span>
                    <span className="font-medium">{horse.vet_visits || 0}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Träningshistorik</h3>
              </div>
              <AddTrainingSessionDialog horseName={horse.name} onAdd={handleAddTrainingSession} />
            </div>

            {/* Training Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Pass denna vecka</p>
                <p className="text-2xl font-bold">{trainingSessions.filter(s => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(s.date) >= weekAgo;
                }).length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Pass denna månad</p>
                <p className="text-2xl font-bold">{trainingSessions.filter(s => {
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return new Date(s.date) >= monthAgo;
                }).length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Totalt pass</p>
                <p className="text-2xl font-bold">{trainingSessions.length}</p>
              </Card>
            </div>

            {/* Training Sessions List */}
            {sortedTrainingSessions.length > 0 ? (
              <div className="space-y-4">
                {sortedTrainingSessions.map((session) => (
                  <Card key={session.id} className="p-5 hover:shadow-elevated transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-semibold text-lg">{session.type}</h5>
                          {session.intensity && (
                            <Badge variant={
                              session.intensity === "Hög" ? "default" : 
                              session.intensity === "Medel" ? "secondary" : 
                              "outline"
                            }>
                              {session.intensity}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{session.date}</span>
                          </div>
                          {session.duration && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{session.duration}</span>
                            </div>
                          )}
                          {session.notes && (
                            <p className="text-muted-foreground mt-2">{session.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Inga träningspass än</h4>
                <p className="text-muted-foreground mb-6">
                  Börja logga träningspass för {horse.name} för att följa utveckling och planera träning.
                </p>
                <AddTrainingSessionDialog horseName={horse.name} onAdd={handleAddTrainingSession} />
              </Card>
            )}
          </TabsContent>

          <TabsContent value="competitions" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Tävlingsschema</h3>
              </div>
              <AddCompetitionToHorseDialog horseName={horse.name} onAdd={handleAddCompetition} />
            </div>

            {/* Upcoming Competitions */}
            {upcomingCompetitions.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4">Kommande tävlingar ({upcomingCompetitions.length})</h4>
                <div className="space-y-4">
                  {upcomingCompetitions.map((comp) => (
                    <Card key={comp.id} className="p-5 hover:shadow-elevated transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-lg mb-1">{comp.name}</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{comp.date}</span>
                              </div>
                              {comp.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span>{comp.location}</span>
                                </div>
                              )}
                              {comp.class && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{comp.class}</Badge>
                                  {comp.discipline && <Badge variant="outline">{comp.discipline}</Badge>}
                                </div>
                              )}
                              {comp.notes && (
                                <p className="text-muted-foreground mt-2">{comp.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Competitions */}
            {completedCompetitions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Tidigare tävlingar ({completedCompetitions.length})</h4>
                <div className="space-y-4">
                  {completedCompetitions.map((comp) => (
                    <Card key={comp.id} className="p-5 hover:shadow-elevated transition-shadow border-muted">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h5 className="font-semibold text-lg">{comp.name}</h5>
                              {comp.result && (
                                <Badge className="bg-secondary">{comp.result}</Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{comp.date}</span>
                              </div>
                              {comp.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span>{comp.location}</span>
                                </div>
                              )}
                              {comp.class && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{comp.class}</Badge>
                                  {comp.discipline && <Badge variant="outline">{comp.discipline}</Badge>}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {competitions.length === 0 && (
              <Card className="p-12 text-center">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Inga tävlingar än</h4>
                <p className="text-muted-foreground mb-6">
                  Lägg till kommande tävlingar för {horse.name} för att planera träning och hålla koll på scheman.
                </p>
                <AddCompetitionToHorseDialog horseName={horse.name} onAdd={handleAddCompetition} />
              </Card>
            )}
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Hälsojournal</h3>
              </div>
              <AddHealthLogToHorseDialog horseName={horse.name} onAdd={handleAddHealthLog} />
            </div>

            {/* Health Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pågående</p>
                    <p className="text-2xl font-bold">
                      {healthLogs.filter(log => log.status === "Pågående").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avslutade</p>
                    <p className="text-2xl font-bold">
                      {healthLogs.filter(log => log.status === "Klar").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-secondary" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Totalt händelser</p>
                    <p className="text-2xl font-bold">{healthLogs.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
              </Card>
            </div>

            {/* Health Log Entries */}
            {sortedHealthLogs.length > 0 ? (
              <div className="space-y-4">
                {sortedHealthLogs.map((log) => (
                  <Card key={log.id} className="p-6 hover:shadow-elevated transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-foreground">{log.event}</h3>
                              <Badge className={getSeverityColor(log.severity)}>
                                {log.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.created_at).toLocaleDateString('sv-SE')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="text-sm font-medium text-foreground">{log.status}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div>
                            <p className="text-sm font-medium text-foreground mb-1">Behandling:</p>
                            <p className="text-sm text-muted-foreground">{log.treatment}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground mb-1">Anteckningar:</p>
                            <p className="text-sm text-muted-foreground">{log.notes}</p>
                          </div>
                          {log.images && log.images.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Bilder ({log.images.length})
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                {log.images.map((img, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={img}
                                    alt={`${log.event} bild ${imgIndex + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-border hover:scale-105 transition-transform cursor-pointer"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:w-40">
                        <HealthLogDetailsDialog log={log} onDelete={handleDeleteHealthLog} />
                        {log.status === "Pågående" && (
                          <UpdateHealthLogDialog log={log} onUpdate={handleUpdateHealthLog} />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Inga hälsohändelser än</h4>
                <p className="text-muted-foreground mb-6">
                  Börja dokumentera hälsohändelser för {horse.name} för att spåra symptom och behandlingar.
                </p>
                <AddHealthLogToHorseDialog horseName={horse.name} onAdd={handleAddHealthLog} />
              </Card>
            )}
          </TabsContent>

          <TabsContent value="journey" className="mt-6">
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
                  <AddGoalDialog onAdd={handleAddGoal} />
                </div>

                {activeGoals.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Inga aktiva mål</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Lägg till ett mål för att komma igång!
                    </p>
                  </Card>
                ) : (
                  <GoalJourneyPath 
                    goals={activeGoals} 
                    onToggleComplete={handleToggleGoalComplete}
                  />
                )}
              </TabsContent>

              <TabsContent value="milestones" className="mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">Milstolpar</h3>
                </div>
                <MilestoneTimeline milestones={milestones} />
              </TabsContent>

              <TabsContent value="badges" className="mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">Badges</h3>
                </div>
                <BadgesGrid badges={badges} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HorseDetails;

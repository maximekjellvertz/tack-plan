import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, TrendingUp, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AddHorseDialog } from "@/components/AddHorseDialog";
import { EditHorseDialog } from "@/components/EditHorseDialog";
import { supabase } from "@/integrations/supabase/client";
import { ProgressRing } from "@/components/ProgressRing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Horse {
  id: string;
  name: string;
  breed: string;
  age: number;
  discipline: string;
  level: string;
  color: string;
  image_url?: string | null;
}

interface HorseStats {
  trainingProgress: number;
  healthScore: number;
}

const Horses = () => {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [horseStats, setHorseStats] = useState<{ [key: string]: HorseStats }>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchHorses();
    }
  }, [user]);

  const fetchHorses = async () => {
    try {
      const { data, error } = await supabase
        .from("horses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setHorses(data || []);

      // Fetch stats for each horse
      if (data) {
        const statsPromises = data.map(async (horse: any) => {
          // Get health logs count (recent issues)
          const { count: healthIssues } = await supabase
            .from("health_logs")
            .select("*", { count: "exact", head: true })
            .eq("horse_id", horse.id)
            .neq("status", "completed");

          // Calculate progress based on training sessions stored in horses table (out of 50 goal)
          const trainingProgress = Math.min(((horse.training_sessions || 0) / 50) * 100, 100);
          // Calculate health score (100 - issues * 10, minimum 0)
          const healthScore = Math.max(100 - (healthIssues || 0) * 10, 0);

          return {
            horseId: horse.id,
            stats: { trainingProgress, healthScore }
          };
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap = statsResults.reduce((acc, { horseId, stats }) => {
          acc[horseId] = stats;
          return acc;
        }, {} as { [key: string]: HorseStats });

        setHorseStats(statsMap);
      }
    } catch (error) {
      console.error("Error fetching horses:", error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta hästar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHorse = async (horseId: string, horseName: string) => {
    try {
      const { error } = await supabase
        .from("horses")
        .delete()
        .eq("id", horseId);

      if (error) throw error;

      toast({
        title: "Hästen borttagen",
        description: `${horseName} har tagits bort`,
      });

      fetchHorses();
    } catch (error) {
      console.error("Error deleting horse:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort hästen",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Mina hästar</h1>
            <p className="text-muted-foreground">
              Hantera dina hästars profiler och information
            </p>
          </div>
          <AddHorseDialog onHorseAdded={fetchHorses} />
        </div>

        {horses.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-24 w-24 text-muted-foreground/40 mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">Inga hästar än</h3>
            <p className="text-muted-foreground mb-6">
              Lägg till din första häst för att komma igång
            </p>
            <AddHorseDialog onHorseAdded={fetchHorses} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {horses.map((horse, index) => {
              const stats = horseStats[horse.id] || { trainingProgress: 0, healthScore: 0 };
              return (
                <Card 
                  key={horse.id} 
                  className="overflow-hidden hover:shadow-elevated transition-all hover-scale animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-40 md:h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                    {horse.image_url ? (
                      <img
                        src={horse.image_url}
                        alt={horse.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Heart className="w-24 h-24 text-primary/40" />
                    )}
                    {/* Progress Rings */}
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-1 md:gap-2 bg-background/80 backdrop-blur-sm p-1.5 md:p-2 rounded-lg">
                      <div className="relative w-[50px] h-[50px] md:w-[60px] md:h-[60px]">
                        <ProgressRing progress={stats.trainingProgress} size={50} strokeWidth={4} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        </div>
                      </div>
                      <div className="relative w-[50px] h-[50px] md:w-[60px] md:h-[60px]">
                        <ProgressRing 
                          progress={stats.healthScore} 
                          size={50}
                          strokeWidth={4}
                          color="hsl(var(--secondary))"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Activity className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                        </div>
                      </div>
                    </div>
                  </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground">{horse.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Badge variant="secondary">{horse.level}</Badge>
                      <EditHorseDialog horse={horse} onHorseUpdated={fetchHorses} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ta bort häst?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Är du säker på att du vill ta bort {horse.name}? Detta går inte att ångra.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Avbryt</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteHorse(horse.id, horse.name)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Ta bort
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ras:</span>
                      <span className="text-foreground font-medium">{horse.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ålder:</span>
                      <span className="text-foreground font-medium">{horse.age} år</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gren:</span>
                      <span className="text-foreground font-medium">{horse.discipline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Färg:</span>
                      <span className="text-foreground font-medium">{horse.color}</span>
                    </div>
                  </div>
                  <Link to={`/horses/${horse.id}`}>
                    <Button className="w-full" variant="outline">
                      Visa detaljer
                    </Button>
                  </Link>
                  
                  {/* Stats summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-border">
                    <div className="text-center">
                      <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-muted-foreground">Träning</p>
                      <p className="font-semibold text-foreground">{stats.trainingProgress}%</p>
                    </div>
                    <div className="text-center">
                      <Activity className="w-4 h-4 text-secondary mx-auto mb-1" />
                      <p className="text-muted-foreground">Hälsa</p>
                      <p className="font-semibold text-foreground">{stats.healthScore}%</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Horses;

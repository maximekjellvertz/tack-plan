import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AddHorseDialog } from "@/components/AddHorseDialog";
import { supabase } from "@/integrations/supabase/client";
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
}

const Horses = () => {
  const [horses, setHorses] = useState<Horse[]>([]);
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
            {horses.map((horse) => (
              <Card key={horse.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Heart className="w-24 h-24 text-primary/40" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-foreground">{horse.name}</h3>
                    <Badge variant="secondary">{horse.level}</Badge>
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
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Horses;

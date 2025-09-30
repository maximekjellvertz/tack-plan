import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, FileText, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-horse.jpg";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCompetitions();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(3);

      if (error) throw error;

      setCompetitions(data || []);
    } catch (error) {
      console.error("Error fetching competitions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Elegant horse in countryside" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Hoofprints
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Every horse writes a story, we're here to keep it
            </p>
            <Link to="/horses">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Kom igång
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card shadow-elevated hover:shadow-lg transition-shadow">
            <Heart className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-2xl font-bold text-foreground">3</h3>
            <p className="text-muted-foreground">Hästar</p>
          </Card>
          <Card className="p-6 bg-card shadow-elevated hover:shadow-lg transition-shadow">
            <Calendar className="w-8 h-8 text-secondary mb-3" />
            <h3 className="text-2xl font-bold text-foreground">
              {loading ? "..." : competitions.length}
            </h3>
            <p className="text-muted-foreground">Kommande tävlingar</p>
          </Card>
          <Card className="p-6 bg-card shadow-elevated hover:shadow-lg transition-shadow">
            <FileText className="w-8 h-8 text-accent mb-3" />
            <h3 className="text-2xl font-bold text-foreground">12</h3>
            <p className="text-muted-foreground">Loggade händelser</p>
          </Card>
          <Card className="p-6 bg-card shadow-elevated hover:shadow-lg transition-shadow">
            <Bell className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-2xl font-bold text-foreground">2</h3>
            <p className="text-muted-foreground">Påminnelser</p>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upcoming Competitions */}
          <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Kommande tävlingar</h2>
              <Link to="/competitions">
                <Button variant="ghost" size="sm">Se alla</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="p-4 bg-background rounded-lg border border-border text-center">
                  <p className="text-muted-foreground">Laddar tävlingar...</p>
                </div>
              ) : competitions.length === 0 ? (
                <div className="p-4 bg-background rounded-lg border border-border text-center">
                  <p className="text-muted-foreground">Inga kommande tävlingar</p>
                  <Link to="/competitions">
                    <Button variant="link" size="sm" className="mt-2">
                      Anslut TDB för att synka tävlingar
                    </Button>
                  </Link>
                </div>
              ) : (
                competitions.map((comp) => (
                  <div key={comp.id} className="p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">{comp.name}</p>
                        <p className="text-sm text-muted-foreground">{comp.discipline}</p>
                      </div>
                      <span className="text-sm text-primary font-medium">{comp.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Health Logs */}
          <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Senaste loggarna</h2>
              <Link to="/health-log">
                <Button variant="ghost" size="sm">Se alla</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { horse: "Thunder", event: "Munsår", date: "2025-09-28", severity: "Lätt" },
                { horse: "Storm", event: "Vaccination", date: "2025-09-25", severity: "Normal" },
                { horse: "Luna", event: "Hovbesiktning", date: "2025-09-20", severity: "Normal" },
              ].map((log, i) => (
                <div key={i} className="p-4 bg-background rounded-lg border border-border hover:border-secondary transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{log.horse}</p>
                      <p className="text-sm text-muted-foreground">{log.event}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-secondary font-medium">{log.date}</span>
                      <p className="text-xs text-muted-foreground">{log.severity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Allt du behöver på ett ställe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Hästprofiler</h3>
              <p className="text-muted-foreground">
                Hantera dina hästars information, träningsscheman och mål
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Tävlingskalender</h3>
              <p className="text-muted-foreground">
                Sök och filtrera tävlingar, lägg till i din kalender
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Hälsologg</h3>
              <p className="text-muted-foreground">
                Dokumentera symptom, behandlingar och få påminnelser
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

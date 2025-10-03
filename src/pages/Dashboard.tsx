import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, FileText, Bell, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-horse.jpg";
import { DailyTipCard } from "@/components/DailyTipCard";
import { WeeklySummary } from "@/components/WeeklySummary";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    horses: 0,
    competitions: 0,
    healthLogs: 0,
    reminders: 0,
  });
  const [recentHealthLogs, setRecentHealthLogs] = useState<any[]>([]);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [horsesRes, competitionsRes, healthLogsRes, remindersRes, recentLogsRes] = await Promise.all([
        supabase.from("horses").select("id", { count: "exact", head: true }),
        supabase.from("competitions")
          .select("*", { count: "exact" })
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(3),
        supabase.from("health_logs").select("id", { count: "exact", head: true }),
        supabase.from("reminders")
          .select("id", { count: "exact", head: true })
          .eq("completed", false),
        supabase.from("health_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      setStats({
        horses: horsesRes.count || 0,
        competitions: competitionsRes.count || 0,
        healthLogs: healthLogsRes.count || 0,
        reminders: remindersRes.count || 0,
      });

      setUpcomingCompetitions(competitionsRes.data || []);
      setRecentHealthLogs(recentLogsRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Välkommen tillbaka!
            </h1>
            <p className="text-xl text-white/90 mb-2 drop-shadow-md">
              {user?.email}
            </p>
            <p className="text-lg text-white/80 mb-8 drop-shadow-md">
              Här är en översikt av dina hästar och aktiviteter
            </p>
            <Link to="/horses">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Gå till mina hästar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card shadow-elevated hover:shadow-lg transition-all hover-scale animate-fade-in group" style={{ animationDelay: "0ms" }}>
            <Heart className="w-8 h-8 text-primary mb-3 transition-transform group-hover:scale-110" />
            <h3 className="text-3xl font-bold text-foreground transition-all group-hover:text-primary">
              {loading ? "..." : stats.horses}
            </h3>
            <p className="text-muted-foreground">Hästar</p>
            <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-full animate-pulse" />
            </div>
          </Card>
          <Card className="p-6 bg-card shadow-elevated hover:shadow-lg transition-all hover-scale animate-fade-in group" style={{ animationDelay: "100ms" }}>
            <Calendar className="w-8 h-8 text-secondary mb-3 transition-transform group-hover:scale-110" />
            <h3 className="text-3xl font-bold text-foreground transition-all group-hover:text-secondary">
              {loading ? "..." : stats.competitions}
            </h3>
            <p className="text-muted-foreground">Kommande tävlingar</p>
            <div className="mt-2 h-1 bg-secondary/20 rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full w-full animate-pulse" />
            </div>
          </Card>
          <Card className="p-6 bg-card shadow-elevated hover:shadow-lg transition-all hover-scale animate-fade-in group" style={{ animationDelay: "200ms" }}>
            <FileText className="w-8 h-8 text-accent mb-3 transition-transform group-hover:scale-110" />
            <h3 className="text-3xl font-bold text-foreground transition-all group-hover:text-accent">
              {loading ? "..." : stats.healthLogs}
            </h3>
            <p className="text-muted-foreground">Loggade händelser</p>
            <div className="mt-2 h-1 bg-accent/20 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full w-full animate-pulse" />
            </div>
          </Card>
          <Card className="p-6 bg-card shadow-elevated hover:shadow-lg transition-all hover-scale animate-fade-in group" style={{ animationDelay: "300ms" }}>
            <Bell className="w-8 h-8 text-primary mb-3 transition-transform group-hover:scale-110" />
            <h3 className="text-3xl font-bold text-foreground transition-all group-hover:text-primary">
              {loading ? "..." : stats.reminders}
            </h3>
            <p className="text-muted-foreground">Aktiva påminnelser</p>
            <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-full animate-pulse" />
            </div>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        {/* Weekly Summary - Larger and more prominent */}
        <div className="mb-12">
          <WeeklySummary />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Daily Tip */}
          <div className="lg:col-span-1">
            <DailyTipCard />
          </div>
          {/* Upcoming Competitions */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-card to-muted/30 hover-scale animate-fade-in h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground glow-text">Kommande tävlingar</h2>
              <Link to="/competitions">
                <Button variant="ghost" size="sm" className="hover-scale">Se alla</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="p-4 bg-background rounded-lg border border-border text-center">
                  <p className="text-muted-foreground">Laddar tävlingar...</p>
                </div>
              ) : upcomingCompetitions.length === 0 ? (
                <div className="p-4 bg-background rounded-lg border border-border text-center">
                  <p className="text-muted-foreground">Inga kommande tävlingar</p>
                  <Link to="/competitions">
                    <Button variant="link" size="sm" className="mt-2">
                      Anslut TDB för att synka tävlingar
                    </Button>
                  </Link>
                </div>
              ) : (
                upcomingCompetitions.map((comp, index) => (
                  <div 
                    key={comp.id} 
                    className="p-4 bg-background rounded-lg border border-border hover:border-primary transition-all hover-scale animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
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
          </div>

          {/* Recent Health Logs */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gradient-to-br from-card to-muted/30 hover-scale animate-fade-in h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground glow-text">Senaste loggarna</h2>
              <Link to="/health-log">
                <Button variant="ghost" size="sm" className="hover-scale">Se alla</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="p-4 bg-background rounded-lg border border-border text-center">
                  <p className="text-muted-foreground">Laddar loggar...</p>
                </div>
              ) : recentHealthLogs.length === 0 ? (
                <div className="p-4 bg-background rounded-lg border border-border text-center">
                  <p className="text-muted-foreground">Inga hälsologgar än</p>
                  <Link to="/health-log">
                    <Button variant="link" size="sm" className="mt-2">
                      Skapa din första logg
                    </Button>
                  </Link>
                </div>
              ) : (
                recentHealthLogs.map((log, index) => (
                  <div 
                    key={log.id} 
                    className="p-4 bg-background rounded-lg border border-border hover:border-secondary transition-all hover-scale animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">{log.horse_name}</p>
                        <p className="text-sm text-muted-foreground">{log.event}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-secondary font-medium">
                          {new Date(log.created_at).toLocaleDateString('sv-SE')}
                        </span>
                        <p className="text-xs text-muted-foreground">{log.severity}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            </Card>
          </div>
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

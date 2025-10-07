import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, FileText, Bell, TrendingUp, Award, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-horse.jpg";
import { DailyTipCard } from "@/components/DailyTipCard";
import { TodaysScheduleCard } from "@/components/TodaysScheduleCard";
import { useBadgeManager } from "@/hooks/useBadgeManager";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { useAcceptInvitations } from "@/hooks/useAcceptInvitations";
import { useDashboardPreferences } from "@/hooks/useDashboardPreferences";
import { DashboardCustomizeDialog } from "@/components/DashboardCustomizeDialog";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    horses: 0,
    competitions: 0,
    healthLogs: 0,
    reminders: 0,
    badges: 0,
  });
  const { checkBadges } = useBadgeManager(user?.id);
  useAcceptInvitations();
  const [recentHealthLogs, setRecentHealthLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const navigate = useNavigate();
  const { widgets, loading: prefsLoading, updatePreference, isWidgetVisible } = useDashboardPreferences(user?.id);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = () => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

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
      const [horsesRes, competitionsRes, healthLogsRes, remindersRes, recentLogsRes, badgesRes] = await Promise.all([
        supabase.from("horses").select("id", { count: "exact", head: true }),
        supabase.from("competitions")
          .select("id", { count: "exact", head: true })
          .gte("date", new Date().toISOString().split("T")[0]),
        supabase.from("health_logs").select("id", { count: "exact", head: true }),
        supabase.from("reminders")
          .select("id", { count: "exact", head: true })
          .eq("completed", false),
        supabase.from("health_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase.from("badges").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        horses: horsesRes.count || 0,
        competitions: competitionsRes.count || 0,
        healthLogs: healthLogsRes.count || 0,
        reminders: remindersRes.count || 0,
        badges: badgesRes.count || 0,
      });

      setRecentHealthLogs(recentLogsRes.data || []);
      
      // Check for new badges when dashboard loads
      if (user) {
        checkBadges();
      }
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
      <OnboardingDialog open={showOnboarding} onComplete={handleOnboardingComplete} />
      <DashboardCustomizeDialog
        open={showCustomize}
        onOpenChange={setShowCustomize}
        widgets={widgets}
        onToggleWidget={updatePreference}
      />
      
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
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
            <h1 className="text-3xl md:text-6xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">
              Välkommen tillbaka!
            </h1>
            <p className="text-base md:text-xl text-white/90 mb-2 drop-shadow-md">
              {user?.email}
            </p>
            <p className="text-sm md:text-lg text-white/80 mb-6 md:mb-8 drop-shadow-md">
              Här är en översikt av dina hästar och aktiviteter
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/horses">
                <Button size="default" className="md:h-11 md:px-8 bg-primary hover:bg-primary/90">
                  Gå till mina hästar
                </Button>
              </Link>
              <Button
                size="default"
                variant="outline"
                className="md:h-11 md:px-8 bg-background/80 backdrop-blur"
                onClick={() => setShowCustomize(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Anpassa Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      {isWidgetVisible("quick_stats") && (
      <section className="max-w-7xl mx-auto px-4 -mt-12 md:-mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Link to="/horses" className="block">
            <Card className="p-4 md:p-6 bg-card shadow-elevated hover:shadow-lg transition-all hover-scale animate-fade-in group cursor-pointer" style={{ animationDelay: "0ms" }}>
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-primary mb-2 md:mb-3 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground transition-all group-hover:text-primary">
                {loading ? "..." : stats.horses}
              </h3>
              <p className="text-muted-foreground">Hästar</p>
              <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-full animate-pulse" />
              </div>
            </Card>
          </Link>
          <Link to="/competitions" className="block">
            <Card className="p-4 md:p-6 bg-card shadow-elevated hover:shadow-lg transition-all hover-scale animate-fade-in group cursor-pointer" style={{ animationDelay: "100ms" }}>
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-secondary mb-2 md:mb-3 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground transition-all group-hover:text-secondary">
                {loading ? "..." : stats.competitions}
              </h3>
              <p className="text-muted-foreground">Kommande tävlingar</p>
              <div className="mt-2 h-1 bg-secondary/20 rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full w-full animate-pulse" />
              </div>
            </Card>
          </Link>
          <Link to="/health-log" className="block">
            <Card className="p-4 md:p-6 bg-card shadow-elevated hover:shadow-lg transition-all hover-scale animate-fade-in group cursor-pointer" style={{ animationDelay: "200ms" }}>
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-accent mb-2 md:mb-3 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground transition-all group-hover:text-accent">
                {loading ? "..." : stats.healthLogs}
              </h3>
              <p className="text-muted-foreground">Loggade händelser</p>
              <div className="mt-2 h-1 bg-accent/20 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full w-full animate-pulse" />
              </div>
            </Card>
          </Link>
          <Link to="/badges" className="block">
            <Card className="p-4 md:p-6 bg-card shadow-elevated hover:shadow-lg transition-all hover-scale animate-fade-in group cursor-pointer" style={{ animationDelay: "300ms" }}>
              <Award className="w-6 h-6 md:w-8 md:h-8 text-primary mb-2 md:mb-3 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground transition-all group-hover:text-primary">
                {loading ? "..." : stats.badges}
              </h3>
              <p className="text-muted-foreground">Tjänade badges</p>
              <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-full animate-pulse" />
              </div>
            </Card>
          </Link>
          <Link to="/reminders" className="block">
            <Card className="p-4 md:p-6 bg-card shadow-elevated hover:shadow-lg transition-all hover-scale animate-fade-in group cursor-pointer" style={{ animationDelay: "400ms" }}>
              <Bell className="w-6 h-6 md:w-8 md:h-8 text-primary mb-2 md:mb-3 transition-transform group-hover:scale-110" />
              <h3 className="text-2xl md:text-3xl font-bold text-foreground transition-all group-hover:text-primary">
                {loading ? "..." : stats.reminders}
              </h3>
              <p className="text-muted-foreground">Aktiva påminnelser</p>
              <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-full animate-pulse" />
              </div>
            </Card>
          </Link>
        </div>
      </section>
      )}

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Todays Schedule */}
          {isWidgetVisible("todays_schedule") && (
          <div>
            <TodaysScheduleCard />
          </div>
          )}
          
          {/* Daily Tip */}
          {isWidgetVisible("daily_tip") && (
          <div>
            <DailyTipCard />
          </div>
          )}

          {/* Recent Health Logs */}
          {isWidgetVisible("recent_health_logs") && (
          <div>
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
          )}
        </div>
      </section>

      {/* Features Section */}
      {isWidgetVisible("features_section") && (
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
      )}
    </div>
  );
};

export default Dashboard;

import { Card } from "@/components/ui/card";
import { Activity, Trophy, Bell, Award, TrendingUp, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyStats {
  healthLogs: number;
  upcomingCompetitions: number;
  completedReminders: number;
  newBadges: number;
  completedGoals: number;
}

export const WeeklySummary = () => {
  const [stats, setStats] = useState<WeeklyStats>({
    healthLogs: 0,
    upcomingCompetitions: 0,
    completedReminders: 0,
    newBadges: 0,
    completedGoals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyStats();
  }, []);

  const fetchWeeklyStats = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();
      
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const sevenDaysFromNowISO = sevenDaysFromNow.toISOString().split("T")[0];

      const today = new Date().toISOString().split("T")[0];

      // Health logs from last 7 days
      const { count: healthCount } = await supabase
        .from("health_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgoISO);

      // Competitions in next 7 days
      const { count: compCount } = await supabase
        .from("competitions")
        .select("*", { count: "exact", head: true })
        .gte("date", today)
        .lte("date", sevenDaysFromNowISO);

      // Completed reminders from last 7 days
      const { count: remindersCount } = await supabase
        .from("reminders")
        .select("*", { count: "exact", head: true })
        .eq("completed", true)
        .gte("updated_at", sevenDaysAgoISO);

      // New badges from last 7 days
      const { count: badgesCount } = await supabase
        .from("badges")
        .select("*", { count: "exact", head: true })
        .gte("earned_date", sevenDaysAgoISO);

      // Completed goals from last 7 days
      const { count: goalsCount } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true })
        .eq("is_completed", true)
        .gte("completed_at", sevenDaysAgoISO);

      setStats({
        healthLogs: healthCount || 0,
        upcomingCompetitions: compCount || 0,
        completedReminders: remindersCount || 0,
        newBadges: badgesCount || 0,
        completedGoals: goalsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      icon: Activity,
      label: "Hälsologgar",
      value: stats.healthLogs,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Trophy,
      label: "Kommande tävlingar",
      value: stats.upcomingCompetitions,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Check,
      label: "Avklarade påminnelser",
      value: stats.completedReminders,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Award,
      label: "Nya badges",
      value: stats.newBadges,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: TrendingUp,
      label: "Slutförda mål",
      value: stats.completedGoals,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mb-4" />
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/20 hover-scale animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Veckans sammanfattning</h3>
          <p className="text-sm text-muted-foreground">Senaste 7 dagarna & kommande vecka</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`p-4 rounded-lg ${item.bgColor} hover-scale animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Icon className={`w-6 h-6 ${item.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground mb-1">{item.value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{item.label}</p>
            </div>
          );
        })}
      </div>

      {stats.healthLogs === 0 &&
        stats.upcomingCompetitions === 0 &&
        stats.completedReminders === 0 &&
        stats.newBadges === 0 &&
        stats.completedGoals === 0 && (
          <p className="text-center text-muted-foreground mt-4 italic">
            Ingen aktivitet denna vecka - dags att sätta igång! 🚀
          </p>
        )}
    </Card>
  );
};

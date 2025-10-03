import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { celebrateGoalCompletion } from "@/lib/confetti";

interface BadgeCheck {
  badge_type: string;
  title: string;
  description: string;
  icon: string;
  checkFunction: () => Promise<boolean>;
}

export const useBadgeManager = (userId: string | undefined) => {
  const awardBadge = async (badgeType: string, title: string, description: string, icon: string, horseId?: string) => {
    if (!userId) return;

    // Check if badge already exists
    const { data: existing } = await supabase
      .from("badges")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_type", badgeType)
      .maybeSingle();

    if (existing) return; // Already has this badge

    // Award the badge
    const { error } = await supabase
      .from("badges")
      .insert({
        user_id: userId,
        badge_type: badgeType,
        title,
        description,
        icon,
        horse_id: horseId,
        earned_date: new Date().toISOString(),
        is_manual: false,
      });

    if (!error) {
      celebrateGoalCompletion();
      toast.success("🎉 Ny badge tjänad!", {
        description: `${title} - ${description}`,
        duration: 5000,
      });
    }
  };

  const checkBadges = async () => {
    if (!userId) return;

    const badges: BadgeCheck[] = [
      // Seriösa & mål-fokuserade badges
      {
        badge_type: "first_goal",
        title: "🎯 Målmedveten",
        description: "Satt och klarat ditt första mål",
        icon: "target",
        checkFunction: async () => {
          const { count } = await supabase
            .from("goals")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_completed", true);
          return (count ?? 0) >= 1;
        },
      },
      {
        badge_type: "first_competition",
        title: "🏆 Tävlingstart",
        description: "Loggat din första tävling",
        icon: "trophy",
        checkFunction: async () => {
          const { count } = await supabase
            .from("competitions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
          return (count ?? 0) >= 1;
        },
      },
      {
        badge_type: "health_champion",
        title: "🩺 Hälsokollare",
        description: "Loggat 5 hälsokontroller",
        icon: "heart",
        checkFunction: async () => {
          const { count } = await supabase
            .from("health_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
          return (count ?? 0) >= 5;
        },
      },
      {
        badge_type: "first_horse",
        title: "🐎 Resan börjar",
        description: "Lagt till din första häst",
        icon: "award",
        checkFunction: async () => {
          const { count } = await supabase
            .from("horses")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
          return (count ?? 0) >= 1;
        },
      },
      // Tränings-badges med nivåer
      {
        badge_type: "training_bronze",
        title: "🏋️ Träningshjälte - Brons",
        description: "Loggat 10 träningspass",
        icon: "zap",
        checkFunction: async () => {
          const { count } = await supabase
            .from("training_sessions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
          return (count ?? 0) >= 10;
        },
      },
      {
        badge_type: "training_silver",
        title: "🏋️ Träningshjälte - Silver",
        description: "Loggat 50 träningspass",
        icon: "zap",
        checkFunction: async () => {
          const { count } = await supabase
            .from("training_sessions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
          return (count ?? 0) >= 50;
        },
      },
      {
        badge_type: "training_gold",
        title: "🏋️ Träningshjälte - Guld",
        description: "Loggat 100 träningspass",
        icon: "zap",
        checkFunction: async () => {
          const { count } = await supabase
            .from("training_sessions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
          return (count ?? 0) >= 100;
        },
      },
      // Motiverande badges
      {
        badge_type: "first_step",
        title: "🌟 Små steg, stora drömmar",
        description: "Första gången du skriver en logg",
        icon: "star",
        checkFunction: async () => {
          const [training, health] = await Promise.all([
            supabase
              .from("training_sessions")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId),
            supabase
              .from("health_logs")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId),
          ]);
          return ((training.count ?? 0) + (health.count ?? 0)) >= 1;
        },
      },
      {
        badge_type: "best_friend",
        title: "❤️ Bästa vän",
        description: "Skrivit in personlig text om din häst",
        icon: "heart",
        checkFunction: async () => {
          const { data } = await supabase
            .from("horses")
            .select("fun_fact, personality_trait")
            .eq("user_id", userId);
          return (data || []).some(h => h.fun_fact || h.personality_trait);
        },
      },
      {
        badge_type: "consistent",
        title: "🔄 Konsekvent",
        description: "Loggat varje vecka i en månad",
        icon: "award",
        checkFunction: async () => {
          // Check if there are logs in the last 4 weeks (simplified check)
          const fourWeeksAgo = new Date();
          fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
          
          const { data } = await supabase
            .from("training_sessions")
            .select("date")
            .eq("user_id", userId)
            .gte("date", fourWeeksAgo.toISOString().split("T")[0])
            .order("date", { ascending: true });

          if (!data || data.length < 4) return false;

          // Check if there's at least one log per week
          const weeks = new Set();
          data.forEach(session => {
            const date = new Date(session.date);
            const weekNumber = Math.floor((date.getTime() - fourWeeksAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
            weeks.add(weekNumber);
          });

          return weeks.size >= 4;
        },
      },
      {
        badge_type: "first_progress",
        title: "✨ Första framstegen",
        description: "Markerat ett mål som avklarat",
        icon: "star",
        checkFunction: async () => {
          const { count } = await supabase
            .from("goals")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_completed", true);
          return (count ?? 0) >= 1;
        },
      },
      // Streak badges
      {
        badge_type: "streak_7",
        title: "⏱️ Streakmaster - 7 dagar",
        description: "Loggat något varje dag i 7 dagar",
        icon: "zap",
        checkFunction: async () => {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const { data } = await supabase
            .from("training_sessions")
            .select("date")
            .eq("user_id", userId)
            .gte("date", sevenDaysAgo.toISOString().split("T")[0]);

          if (!data) return false;

          const uniqueDates = new Set(data.map(s => s.date));
          return uniqueDates.size >= 7;
        },
      },
      {
        badge_type: "streak_14",
        title: "⏱️ Streakmaster - 14 dagar",
        description: "Loggat något varje dag i 14 dagar",
        icon: "zap",
        checkFunction: async () => {
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

          const { data } = await supabase
            .from("training_sessions")
            .select("date")
            .eq("user_id", userId)
            .gte("date", fourteenDaysAgo.toISOString().split("T")[0]);

          if (!data) return false;

          const uniqueDates = new Set(data.map(s => s.date));
          return uniqueDates.size >= 14;
        },
      },
      {
        badge_type: "competition_5",
        title: "🏆 Tävlingsrutin - 5 tävlingar",
        description: "Deltagit i 5 tävlingar",
        icon: "trophy",
        checkFunction: async () => {
          const { count } = await supabase
            .from("competitions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
          return (count ?? 0) >= 5;
        },
      },
      {
        badge_type: "competition_10",
        title: "🏆 Tävlingsrutin - 10 tävlingar",
        description: "Deltagit i 10 tävlingar",
        icon: "trophy",
        checkFunction: async () => {
          const { count } = await supabase
            .from("competitions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);
          return (count ?? 0) >= 10;
        },
      },
    ];

    // Check all badges
    for (const badge of badges) {
      try {
        const shouldAward = await badge.checkFunction();
        if (shouldAward) {
          await awardBadge(badge.badge_type, badge.title, badge.description, badge.icon);
        }
      } catch (error) {
        console.error(`Error checking badge ${badge.badge_type}:`, error);
      }
    }
  };

  return { checkBadges, awardBadge };
};

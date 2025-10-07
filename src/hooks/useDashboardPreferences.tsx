import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DashboardWidget {
  id: string;
  label: string;
  description: string;
  isVisible: boolean;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: "quick_stats",
    label: "Snabbstatistik",
    description: "Visar översikt över hästar, tävlingar, och mer",
    isVisible: true,
  },
  {
    id: "todays_schedule",
    label: "Dagens schema",
    description: "Visar dagens planerade aktiviteter från kalendern",
    isVisible: true,
  },
  {
    id: "daily_tip",
    label: "Dagens tips",
    description: "Daglig inspiration och tips",
    isVisible: true,
  },
  {
    id: "recent_health_logs",
    label: "Senaste loggarna",
    description: "Visar de senaste hälsologgarna",
    isVisible: true,
  },
  {
    id: "features_section",
    label: "Funktioner",
    description: "Översikt över appens funktioner",
    isVisible: true,
  },
];

export const useDashboardPreferences = (userId: string | undefined) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("dashboard_preferences")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      if (data && data.length > 0) {
        // Merge with defaults
        const updatedWidgets = DEFAULT_WIDGETS.map((widget) => {
          const pref = data.find((p) => p.widget_id === widget.id);
          return pref
            ? { ...widget, isVisible: pref.is_visible }
            : widget;
        });
        setWidgets(updatedWidgets);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (widgetId: string, isVisible: boolean) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("dashboard_preferences")
        .upsert({
          user_id: userId,
          widget_id: widgetId,
          is_visible: isVisible,
          display_order: 0,
        }, {
          onConflict: "user_id,widget_id"
        });

      if (error) throw error;

      setWidgets((prev) =>
        prev.map((w) =>
          w.id === widgetId ? { ...w, isVisible } : w
        )
      );

      toast({
        title: "Inställningar sparade",
        description: "Dina dashboard-inställningar har uppdaterats.",
      });
    } catch (error) {
      console.error("Error updating preference:", error);
      toast({
        title: "Fel",
        description: "Kunde inte spara inställningarna.",
        variant: "destructive",
      });
    }
  };

  const isWidgetVisible = (widgetId: string) => {
    const widget = widgets.find((w) => w.id === widgetId);
    return widget?.isVisible ?? true;
  };

  return {
    widgets,
    loading,
    updatePreference,
    isWidgetVisible,
  };
};

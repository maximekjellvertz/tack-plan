import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface ScheduleItem {
  id: string;
  horse_name: string;
  activity_type: string;
  time: string;
  duration: number | null;
  notes: string | null;
}

export const TodaysScheduleCard = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysSchedule();
  }, []);

  const fetchTodaysSchedule = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("daily_schedule")
        .select("*")
        .eq("date", today)
        .order("time", { ascending: true });

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/30 hover-scale animate-fade-in h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground glow-text">
            Dagens schema
          </h2>
        </div>
        <Link to="/calendar">
          <Button variant="ghost" size="sm" className="hover-scale">
            Se kalender
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-muted-foreground">Laddar schema...</p>
          </div>
        ) : schedule.length === 0 ? (
          <div className="p-4 bg-background rounded-lg border border-border text-center">
            <p className="text-muted-foreground">Inga aktiviteter idag</p>
            <Link to="/calendar">
              <Button variant="link" size="sm" className="mt-2">
                Lägg till aktivitet
              </Button>
            </Link>
          </div>
        ) : (
          schedule.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-background rounded-lg border border-border hover:border-primary transition-all hover-scale animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {item.time.slice(0, 5)}
                    </span>
                    {item.duration && (
                      <span className="text-xs text-muted-foreground">
                        ({item.duration} min)
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-foreground">
                    {item.horse_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.activity_type}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

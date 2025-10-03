import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Heart, Activity, Bell, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, isSameDay } from "date-fns";
import { sv } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  type: "competition" | "health" | "reminder";
  title: string;
  date: Date;
  description?: string;
  horseName?: string;
  severity?: string;
  status?: string;
}

interface Horse {
  id: string;
  name: string;
}

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState<string>("all");
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
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
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchHorses();
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [selectedHorseId, user]);

  const fetchHorses = async () => {
    try {
      const { data, error } = await supabase
        .from("horses")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setHorses(data || []);
    } catch (error) {
      console.error("Error fetching horses:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const allEvents: CalendarEvent[] = [];

      // Fetch competitions
      let competitionsQuery = supabase
        .from("competitions")
        .select("id, name, date, location, discipline");

      const { data: competitions, error: compError } = await competitionsQuery;
      if (compError) throw compError;

      competitions?.forEach((comp) => {
        allEvents.push({
          id: comp.id,
          type: "competition",
          title: comp.name,
          date: new Date(comp.date),
          description: `${comp.discipline} - ${comp.location}`,
        });
      });

      // Fetch health logs
      let healthQuery = supabase
        .from("health_logs")
        .select("id, event, created_at, horse_name, severity, status");

      if (selectedHorseId !== "all") {
        healthQuery = healthQuery.eq("horse_id", selectedHorseId);
      }

      const { data: healthLogs, error: healthError } = await healthQuery;
      if (healthError) throw healthError;

      healthLogs?.forEach((log) => {
        allEvents.push({
          id: log.id,
          type: "health",
          title: log.event,
          date: new Date(log.created_at),
          horseName: log.horse_name,
          severity: log.severity,
          status: log.status,
        });
      });

      // Fetch reminders
      let remindersQuery = supabase
        .from("reminders")
        .select("id, title, date, description, horse_name, completed");

      if (selectedHorseId !== "all") {
        remindersQuery = remindersQuery.eq("horse_id", selectedHorseId);
      }

      const { data: reminders, error: remindersError } = await remindersQuery;
      if (remindersError) throw remindersError;

      reminders?.forEach((reminder) => {
        allEvents.push({
          id: reminder.id,
          type: "reminder",
          title: reminder.title,
          date: new Date(reminder.date),
          description: reminder.description || undefined,
          horseName: reminder.horse_name || undefined,
          status: reminder.completed ? "completed" : "pending",
        });
      });

      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta kalenderhändelser",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (selectedDate: Date) => {
    const dayEvents = events.filter((event) =>
      isSameDay(event.date, selectedDate)
    );
    setSelectedDayEvents(dayEvents);
    setDate(selectedDate);
    if (dayEvents.length > 0) {
      setDialogOpen(true);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "competition":
        return <Trophy className="w-4 h-4" />;
      case "health":
        return <Activity className="w-4 h-4" />;
      case "reminder":
        return <Bell className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "competition":
        return "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 hover:from-primary/30 hover:to-primary/20";
      case "health":
        return "bg-gradient-to-br from-destructive/20 to-destructive/10 border-destructive/30 hover:from-destructive/30 hover:to-destructive/20";
      case "reminder":
        return "bg-gradient-to-br from-accent/20 to-accent/10 border-accent/30 hover:from-accent/30 hover:to-accent/20";
      default:
        return "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30";
    }
  };

  const datesWithEvents = events.map((event) => event.date);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Laddar kalender...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CalendarIcon className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold text-foreground glow-text">Kalender</h1>
          </div>
          <p className="text-muted-foreground text-lg mb-6">
            Se alla dina tävlingar, hälsohändelser och påminnelser
          </p>
          <div className="flex justify-center">
            <Select value={selectedHorseId} onValueChange={setSelectedHorseId}>
              <SelectTrigger className="w-[280px] bg-card border-2 h-12 text-base font-semibold z-50">
                <SelectValue placeholder="Filtrera per häst" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-card">
                <SelectItem value="all">Alla hästar</SelectItem>
                {horses.map((horse) => (
                  <SelectItem key={horse.id} value={horse.id}>
                    {horse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Legend & Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 hover-scale shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Tävlingar</h3>
            </div>
            <p className="text-4xl font-bold text-primary">
              {events.filter((e) => e.type === "competition").length}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent border-2 border-destructive/30 hover-scale shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-destructive/20 border border-destructive/30">
                <Activity className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Hälsologgar</h3>
            </div>
            <p className="text-4xl font-bold text-destructive">
              {events.filter((e) => e.type === "health").length}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-2 border-accent/30 hover-scale shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-accent/20 border border-accent/30">
                <Bell className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Påminnelser</h3>
            </div>
            <p className="text-4xl font-bold text-accent-foreground">
              {events.filter((e) => e.type === "reminder").length}
            </p>
          </Card>
        </div>

        {/* Calendar & Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Card */}
          <Card className="p-8 bg-gradient-to-br from-card via-card to-primary/5 border-2 shadow-2xl hover:shadow-3xl transition-all backdrop-blur-sm h-fit">
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && handleDayClick(newDate)}
                onDayClick={handleDayClick}
                className="rounded-2xl pointer-events-auto"
                modifiers={{
                  hasEvent: datesWithEvents,
                }}
                modifiersClassNames={{
                  hasEvent: "bg-gradient-to-br from-primary/50 to-primary/30 font-bold ring-2 ring-primary shadow-lg hover:ring-4 hover:shadow-xl transition-all",
                }}
              />
            </div>
          </Card>

          {/* Events Card */}
          <Card className="p-8 bg-gradient-to-br from-card via-card to-accent/5 border-2 shadow-2xl backdrop-blur-sm">
            {selectedDayEvents.length > 0 ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Händelser {date && format(date, "d MMMM yyyy", { locale: sv })}
                  </h3>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {selectedDayEvents.map((event) => (
                    <Card
                      key={event.id}
                      className={`p-5 border-2 hover-scale transition-all shadow-md hover:shadow-lg ${getEventColor(event.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-lg bg-background/50 shrink-0">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base mb-2">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          {event.horseName && (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background/50 w-fit">
                              <Heart className="w-3 h-3 text-primary" />
                              <p className="text-xs font-semibold text-foreground">
                                {event.horseName}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Inga händelser</h3>
                <p className="text-muted-foreground">
                  Välj ett datum i kalendern för att se händelser
                </p>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Calendar;

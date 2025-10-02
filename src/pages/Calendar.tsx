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
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "health":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "reminder":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 glow-text">Kalender</h1>
            <p className="text-muted-foreground">
              Se alla dina tävlingar, hälsohändelser och påminnelser
            </p>
          </div>
          <Select value={selectedHorseId} onValueChange={setSelectedHorseId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrera per häst" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla hästar</SelectItem>
              {horses.map((horse) => (
                <SelectItem key={horse.id} value={horse.id}>
                  {horse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2 p-6">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && handleDayClick(newDate)}
              onDayClick={handleDayClick}
              className="rounded-md pointer-events-auto"
              modifiers={{
                hasEvent: datesWithEvents,
              }}
              modifiersClassNames={{
                hasEvent: "bg-primary/20 font-bold",
              }}
            />
          </Card>

          {/* Legend & Stats */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Färgkodning</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="text-sm">Tävlingar</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-sm">Hälsohändelser</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-sm">Påminnelser</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Statistik</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Totalt händelser</span>
                  <span className="font-bold">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tävlingar</span>
                  <span className="font-bold text-blue-600">
                    {events.filter((e) => e.type === "competition").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hälsologgar</span>
                  <span className="font-bold text-red-600">
                    {events.filter((e) => e.type === "health").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Påminnelser</span>
                  <span className="font-bold text-green-600">
                    {events.filter((e) => e.type === "reminder").length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Day Events Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Händelser för {date && format(date, "PPP", { locale: sv })}
              </DialogTitle>
              <DialogDescription>
                {selectedDayEvents.length} händelse(r) denna dag
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {selectedDayEvents.map((event) => (
                <Card
                  key={event.id}
                  className={`p-4 border ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getEventIcon(event.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{event.title}</h4>
                      {event.horseName && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <Heart className="w-3 h-3 inline mr-1" />
                          {event.horseName}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {event.severity && (
                        <Badge variant="outline" className="mt-2">
                          {event.severity}
                        </Badge>
                      )}
                      {event.status && (
                        <Badge variant="outline" className="mt-2 ml-2">
                          {event.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;

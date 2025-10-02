import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Plus, Calendar, Pill, Heart, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { sv } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  date: string;
  horse_name: string | null;
  type: string;
  completed: boolean;
  recurring: boolean | null;
}

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    horse: "",
  });

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
      fetchReminders();
    }
  }, [user]);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date) {
      toast.error("Fyll i titel och datum");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("reminders").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        horse_name: formData.horse || null,
        type: "custom",
        completed: false,
      });

      if (error) throw error;

      await fetchReminders();
      toast.success("Påminnelse skapad!");
      
      setFormData({ title: "", description: "", date: "", horse: "" });
      setOpen(false);
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast.error("Kunde inte skapa påminnelse");
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) throw error;

      await fetchReminders();
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error("Kunde inte uppdatera påminnelse");
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchReminders();
      toast.success("Påminnelse borttagen");
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error("Kunde inte ta bort påminnelse");
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Idag";
    if (isTomorrow(date)) return "Imorgon";
    if (isPast(date)) return "Försenad";
    return format(date, "d MMM", { locale: sv });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "treatment":
        return <Pill className="w-4 h-4" />;
      case "vaccination":
        return <Heart className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const activeCount = reminders.filter(r => !r.completed).length;
  const overdueCount = reminders.filter(r => !r.completed && isPast(new Date(r.date))).length;
  const todayCount = reminders.filter(r => !r.completed && isToday(new Date(r.date))).length;

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
            <h1 className="text-4xl font-bold text-foreground mb-2">Påminnelser</h1>
            <p className="text-muted-foreground">
              Håll koll på behandlingar och viktiga datum
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Sparkles className="w-4 h-4 mr-2" />
                Ny påminnelse
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Skapa påminnelse
                </DialogTitle>
                <DialogDescription className="text-base">
                  Lägg till en egen påminnelse för behandlingar eller viktiga datum
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddReminder} className="space-y-6 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold">Titel *</Label>
                  <Input
                    id="title"
                    placeholder="T.ex. Ge kortison"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-base font-semibold">Datum *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horse" className="text-base">Häst (valfritt)</Label>
                    <Input
                      id="horse"
                      placeholder="T.ex. Thunder"
                      value={formData.horse}
                      onChange={(e) => setFormData({ ...formData, horse: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Beskrivning</Label>
                  <Textarea
                    id="description"
                    placeholder="Lägg till detaljer..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                    Avbryt
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Skapa påminnelse
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Aktiva</p>
                <p className="text-3xl font-bold text-foreground">{activeCount}</p>
              </div>
              <Bell className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Idag</p>
                <p className="text-3xl font-bold text-foreground">{todayCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-secondary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Försenade</p>
                <p className="text-3xl font-bold text-foreground">{overdueCount}</p>
              </div>
              <Bell className="w-8 h-8 text-destructive" />
            </div>
          </Card>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {sortedReminders.length === 0 && (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Inga påminnelser än
              </h3>
              <p className="text-muted-foreground mb-4">
                Skapa påminnelser för behandlingar eller lägg till dem automatiskt från hälsologgen
              </p>
            </Card>
          )}
          
          {sortedReminders.map((reminder) => {
            const isOverdue = !reminder.completed && isPast(new Date(reminder.date));
            
            return (
              <Card 
                key={reminder.id} 
                className={`p-4 transition-all ${
                  reminder.completed ? 'opacity-60' : ''
                } ${isOverdue ? 'border-destructive/50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggleComplete(reminder.id, reminder.completed)}
                    className={reminder.completed ? 'bg-secondary text-secondary-foreground' : ''}
                  >
                    {reminder.completed ? <Check className="w-4 h-4" /> : getTypeIcon(reminder.type)}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${reminder.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {reminder.title}
                        </h3>
                        {reminder.horse_name && (
                          <p className="text-sm text-muted-foreground">{reminder.horse_name}</p>
                        )}
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isOverdue ? "destructive" : isToday(new Date(reminder.date)) ? "default" : "secondary"}
                        >
                          {getDateLabel(reminder.date)}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteReminder(reminder.id)}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <div className="flex gap-4">
            <Bell className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Tips för påminnelser
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Lägg till en behandling med duration i hälsologgen för automatiska dagliga påminnelser</li>
                <li>• Skapa egna påminnelser för vaccinationer, hovslagare, tandläkare etc.</li>
                <li>• Markera som klara när du utfört uppgiften</li>
                <li>• Ta bort påminnelser du inte längre behöver</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reminders;

// Export function to add reminders from other components
export const addTreatmentReminders = async (
  horse: string,
  treatment: string,
  startDate: string,
  durationDays: number
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reminders = [];
    for (let i = 0; i < durationDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      reminders.push({
        user_id: user.id,
        title: treatment,
        description: `Dag ${i + 1} av ${durationDays}`,
        date: date.toISOString().split('T')[0],
        horse_name: horse,
        type: "treatment",
        completed: false,
      });
    }

    const { error } = await supabase.from("reminders").insert(reminders);

    if (error) throw error;
    
    toast.success(`${durationDays} påminnelser skapade!`, {
      description: `Dagliga påminnelser för ${treatment}`,
    });
  } catch (error) {
    console.error("Error creating reminders:", error);
    toast.error("Kunde inte skapa påminnelser");
  }
};

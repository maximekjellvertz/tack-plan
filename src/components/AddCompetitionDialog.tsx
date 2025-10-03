import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, CalendarIcon, Sparkles, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface AddCompetitionDialogProps {
  onAdd: (competition: {
    name: string;
    date: string;
    location: string;
    discipline: string;
    horse_id?: string;
    time?: string;
    organizer?: string;
    website?: string;
    email?: string;
    phone?: string;
  }) => void;
}

export const AddCompetitionDialog = ({ onAdd }: AddCompetitionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [horses, setHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    discipline: "Hoppning",
    horse_id: "",
    time: "",
    organizer: "",
    website: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (open) {
      fetchHorses();
    }
  }, [open]);

  const fetchHorses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("horses")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      setHorses(data || []);
    } catch (error) {
      console.error("Error fetching horses:", error);
      toast({
        title: "Kunde inte hämta hästar",
        description: "Försök igen senare",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !selectedDate || !formData.location) {
      return;
    }

    onAdd({
      name: formData.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      location: formData.location,
      discipline: formData.discipline,
      horse_id: formData.horse_id || undefined,
      time: formData.time,
      organizer: formData.organizer,
      website: formData.website,
      email: formData.email,
      phone: formData.phone,
    });

    // Reset form
    setFormData({
      name: "",
      location: "",
      discipline: "Hoppning",
      horse_id: "",
      time: "",
      organizer: "",
      website: "",
      email: "",
      phone: "",
    });
    setSelectedDate(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Lägg till tävling
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-muted/30">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Lägg till tävling</DialogTitle>
              <DialogDescription>
                Fyll i information om tävlingen nedan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {/* Info about TDB sync */}
        <div className="mb-6 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border-2 border-dashed">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Tips!</h3>
              <p className="text-sm text-muted-foreground">
                För att automatiskt importera dina anmälda tävlingar från TDB, använd <strong>TDB-inställningar</strong> knappen uppe till höger på Tävlingssidan.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name" className="text-sm font-semibold">Tävlingsnamn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="T.ex. Vår Open"
                className="border-2 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-semibold">Häst (valfritt)</Label>
              <Select
                value={formData.horse_id}
                onValueChange={(value) => setFormData({ ...formData, horse_id: value })}
              >
                <SelectTrigger className="border-2">
                  <SelectValue placeholder={loading ? "Laddar hästar..." : "Välj häst (valfritt)"} />
                </SelectTrigger>
                <SelectContent>
                  {horses.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id}>
                      {horse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Datum *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-2",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: sv }) : "Välj datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={sv}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-semibold">Tid</Label>
              <Input
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="T.ex. 09:00"
                className="border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location" className="text-sm font-semibold">Plats *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="T.ex. Stockholm Ridsportklubb"
                className="border-2 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="discipline" className="text-sm font-semibold">Gren</Label>
              <Select
                value={formData.discipline}
                onValueChange={(value) => setFormData({ ...formData, discipline: value })}
              >
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoppning">Hoppning</SelectItem>
                  <SelectItem value="Dressyr">Dressyr</SelectItem>
                  <SelectItem value="Fälttävlan">Fälttävlan</SelectItem>
                  <SelectItem value="Körning">Körning</SelectItem>
                  <SelectItem value="Distans">Distans</SelectItem>
                  <SelectItem value="Voltige">Voltige</SelectItem>
                  <SelectItem value="Working Equitation">Working Equitation</SelectItem>
                  <SelectItem value="Islandshäst">Islandshäst</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Ytterligare information (valfritt)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizer" className="text-sm font-semibold">Arrangör</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  placeholder="T.ex. Stockholm Ridsportklubb"
                  className="border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="070-123 45 67"
                  className="border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tavling@exempel.se"
                  className="border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-semibold">Webbsida</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  className="border-2 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name || !selectedDate || !formData.location}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Lägg till tävling
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Sparkles, Zap, Target, Heart, Mountain, Wind, Footprints, Coffee, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { celebrateGoalCompletion } from "@/lib/confetti";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AddTrainingSessionDialogProps {
  horseName: string;
  onAdd: (session: {
    type: string;
    date: string;
    duration: string;
    intensity: string;
    notes: string;
  }) => void;
}

const motivationalQuotes = [
  { text: "Varje träningspass är ett steg framåt", icon: Target },
  { text: "Tillsammans bygger ni framgång", icon: Heart },
  { text: "Dokumentera er resa - minnen för livet", icon: Sparkles },
  { text: "Liten framsteg är också framsteg", icon: Footprints },
  { text: "Er dedikation gör skillnad", icon: Zap },
  { text: "Varje pass gör er starkare", icon: Mountain },
];

const trainingTypes = [
  { value: "ridning", label: "Ridning", icon: Wind },
  { value: "longe", label: "Longering", icon: Target },
  { value: "hoppning", label: "Hoppträning", icon: Zap },
  { value: "dressyr", label: "Dressyrträning", icon: Sparkles },
  { value: "terrangritt", label: "Terrängriding", icon: Mountain },
  { value: "kondition", label: "Konditionsträning", icon: Heart },
  { value: "markarbete", label: "Markarbete", icon: Footprints },
  { value: "vila", label: "Vilodag", icon: Coffee },
  { value: "ovrigt", label: "Övrigt", icon: Plus },
];

export const AddTrainingSessionDialog = ({ horseName, onAdd }: AddTrainingSessionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    type: "",
    date: "",
    duration: "",
    intensity: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setQuote(randomQuote);
      // Set today as default
      const today = new Date();
      setSelectedDate(today);
      setFormData(prev => ({ ...prev, date: format(today, "yyyy-MM-dd") }));
    }
  }, [open]);

  const setQuickDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    setSelectedDate(date);
    setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.date) {
      toast.error("Fyll i träningstyp och datum");
      return;
    }

    onAdd(formData);
    
    celebrateGoalCompletion();
    
    toast.success("Fantastiskt! 🎉", {
      description: `${formData.type} loggat för ${horseName}. Varje pass räknas!`,
    });

    setFormData({
      type: "",
      date: "",
      duration: "",
      intensity: "",
      notes: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Lägg till träning
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Logga träningspass</DialogTitle>
          <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <quote.icon className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground italic">{quote.text}</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base">Vad gjorde ni idag? *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger id="type" className="h-11">
                <SelectValue placeholder="Välj typ av träning" />
              </SelectTrigger>
              <SelectContent>
                {trainingTypes.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-base">När? *</Label>
            
            {/* Quick date buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(0)}
                className="flex-1 h-9"
              >
                <Zap className="w-3 h-3 mr-1" />
                Idag
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(1)}
                className="flex-1 h-9"
              >
                Igår
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(2)}
                className="flex-1 h-9"
              >
                I förrgår
              </Button>
            </div>

            {/* Calendar picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "d MMMM yyyy", { locale: sv })
                  ) : (
                    <span>Välj datum</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={sv}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-base">Hur länge?</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="45 min, 1 timme, 30 min..."
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensity" className="text-base">Intensitet</Label>
            <Select value={formData.intensity} onValueChange={(value) => setFormData({ ...formData, intensity: value })}>
              <SelectTrigger id="intensity" className="h-11">
                <SelectValue placeholder="Hur intensivt var det?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lätt">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span>Lätt - Lugn och avslappnad</span>
                  </div>
                </SelectItem>
                <SelectItem value="Medel">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Medel - Bra arbetspuls</span>
                  </div>
                </SelectItem>
                <SelectItem value="Hög">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <span>Hög - Riktigt intensiv</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base">Hur gick det?</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Vad gjorde ni? Hur mådde hästen? Några framsteg eller utmaningar? Skriv fritt..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">💡 Det du skriver idag kan hjälpa dig att förstå din häst bättre imorgon</p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Sparkles className="w-4 h-4 mr-2" />
              Logga pass
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

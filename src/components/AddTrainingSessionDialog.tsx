import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Sparkles, Zap, Target, Heart, Mountain, Wind, Footprints, Coffee } from "lucide-react";
import { toast } from "sonner";
import { celebrateGoalCompletion } from "@/lib/confetti";

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
    }
  }, [open]);

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({ ...formData, date: today });
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
      <DialogContent className="max-w-md">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="date" className="text-base">När? *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={setToday}
                className="text-xs h-7"
              >
                <Zap className="w-3 h-3 mr-1" />
                Idag
              </Button>
            </div>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="h-11"
            />
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
            <p className="text-xs text-muted-foreground">💡 Dessa anteckningar blir värdefulla minnen</p>
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

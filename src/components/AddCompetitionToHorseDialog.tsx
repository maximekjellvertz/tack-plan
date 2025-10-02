import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, CalendarIcon, Trophy, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { celebrateGoalCompletion } from "@/lib/confetti";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AddCompetitionDialogProps {
  horseName: string;
  onAdd: (competition: {
    name: string;
    date: string;
    location: string;
    discipline: string;
    class: string;
    notes: string;
  }) => void;
}

export const AddCompetitionToHorseDialog = ({ horseName, onAdd }: AddCompetitionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    discipline: "",
    class: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      const today = new Date();
      setSelectedDate(today);
      setFormData(prev => ({ ...prev, date: format(today, "yyyy-MM-dd") }));
    }
  }, [open]);

  const setQuickDate = (daysAhead: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
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
    
    if (!formData.name || !formData.date) {
      toast.error("Fyll i tävlingsnamn och datum");
      return;
    }

    onAdd(formData);
    
    celebrateGoalCompletion();
    
    toast.success("Tävling tillagd! 🏆", {
      description: `${formData.name} - nu är ni redo att tävla!`,
    });

    setFormData({
      name: "",
      date: "",
      location: "",
      discipline: "",
      class: "",
      notes: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Lägg till tävling
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Planera tävling</DialogTitle>
          <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <Trophy className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground italic">Varje tävling är en chans att glänsa</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">Tävlingsnamn *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="T.ex. Hopptävling Strömsholm"
              className="h-11"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">När? *</Label>
            
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
                onClick={() => setQuickDate(7)}
                className="flex-1 h-9"
              >
                Om en vecka
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(30)}
                className="flex-1 h-9"
              >
                Om en månad
              </Button>
            </div>

            <Popover modal={false}>
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
              <PopoverContent 
                className="w-auto p-0 z-[100]" 
                align="start" 
                side="right"
                sideOffset={8}
                avoidCollisions={true}
                collisionPadding={10}
              >
                <div className="max-h-[350px] overflow-y-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={sv}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-base">Plats</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="T.ex. Strömsholm"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discipline" className="text-base">Gren</Label>
            <Select value={formData.discipline} onValueChange={(value) => setFormData({ ...formData, discipline: value })}>
              <SelectTrigger id="discipline" className="h-11">
                <SelectValue placeholder="Välj gren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoppning">Hoppning</SelectItem>
                <SelectItem value="dressyr">Dressyr</SelectItem>
                <SelectItem value="fälttävlan">Fälttävlan</SelectItem>
                <SelectItem value="körning">Körning</SelectItem>
                <SelectItem value="distans">Distans</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class" className="text-base">Klass</Label>
            <Input
              id="class"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              placeholder="T.ex. Medel A, 110 cm"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base">Anteckningar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Anmälningsinfo, förberedelsenoteringar..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Sparkles className="w-4 h-4 mr-2" />
              Spara tävling
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

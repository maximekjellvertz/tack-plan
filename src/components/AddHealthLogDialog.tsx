import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Upload, X, Heart, CalendarIcon, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { addTreatmentReminders } from "@/pages/Reminders";
import { supabase } from "@/integrations/supabase/client";
import { celebrateGoalCompletion } from "@/lib/confetti";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

const severities = ["Lätt", "Medel", "Allvarlig", "Normal"];

interface AddHealthLogDialogProps {
  onLogAdded?: () => void;
}

export const AddHealthLogDialog = ({ onLogAdded }: AddHealthLogDialogProps) => {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    horse: "",
    event: "",
    severity: "",
    treatment: "",
    notes: "",
    treatmentDays: "",
    date: "",
  });

  useEffect(() => {
    if (open) {
      fetchHorses();
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Bilden är för stor. Max 5MB per bild.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.horse || !formData.event) {
      toast.error("Fyll i häst och händelse");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const selectedHorse = horses.find(h => h.id === formData.horse);
      if (!selectedHorse) return;

      const { error } = await supabase.from("health_logs").insert({
        user_id: user.id,
        horse_id: formData.horse,
        horse_name: selectedHorse.name,
        event: formData.event,
        severity: formData.severity || "Lätt",
        treatment: formData.treatment,
        notes: formData.notes,
        images: images.length > 0 ? images : [],
        status: "Pågående",
      });

      if (error) throw error;

      // Create reminders if treatment days specified
      if (formData.treatmentDays && parseInt(formData.treatmentDays) > 0) {
        const days = parseInt(formData.treatmentDays);
        const today = new Date().toISOString().split('T')[0];
        await addTreatmentReminders(
          selectedHorse.name,
          formData.treatment || formData.event,
          today,
          days,
          selectedHorse.id
        );
      }
      
      celebrateGoalCompletion();
      
      toast.success("Händelse sparad! 💚", {
        description: `${formData.event} för ${selectedHorse.name} - du tar hand om din häst väl!`,
      });

      // Reset form
      setFormData({
        horse: "",
        event: "",
        severity: "",
        treatment: "",
        notes: "",
        treatmentDays: "",
        date: "",
      });
      setImages([]);
      setOpen(false);

      if (onLogAdded) {
        onLogAdded();
      }
    } catch (error) {
      console.error("Error adding health log:", error);
      toast.error("Kunde inte spara hälsologg");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Ny händelse
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Dokumentera hälsohändelse</DialogTitle>
          <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <Heart className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground italic">Din hästs hälsa är det viktigaste</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Horse Selection */}
          <div className="space-y-2">
            <Label htmlFor="horse" className="text-base">Häst *</Label>
            <Select value={formData.horse} onValueChange={(value) => setFormData({ ...formData, horse: value })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Välj häst" />
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

          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="text-base">När hände det? *</Label>
            
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
                onClick={() => setQuickDate(7)}
                className="flex-1 h-9"
              >
                För en vecka sedan
              </Button>
            </div>

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
              <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={5}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={sv}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="event" className="text-base">Händelse *</Label>
            <Input
              id="event"
              placeholder="T.ex. Munsår, Vaccination, Hovbesiktning..."
              value={formData.event}
              onChange={(e) => setFormData({ ...formData, event: e.target.value })}
              className="h-11"
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity" className="text-base">Svårighetsgrad</Label>
            <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Välj svårighetsgrad" />
              </SelectTrigger>
              <SelectContent>
                {severities.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {severity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Treatment */}
          <div className="space-y-2">
            <Label htmlFor="treatment" className="text-base">Behandling</Label>
            <Input
              id="treatment"
              placeholder="T.ex. Salva 2x/dag, Antibiotika, Kortison..."
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="h-11"
            />
          </div>

          {/* Treatment Duration */}
          <div className="space-y-2">
            <Label htmlFor="treatmentDays" className="text-base">Antal dagar behandling (valfritt)</Label>
            <Input
              id="treatmentDays"
              type="number"
              min="1"
              max="365"
              placeholder="T.ex. 6 för 6 dagars behandling"
              value={formData.treatmentDays}
              onChange={(e) => setFormData({ ...formData, treatmentDays: e.target.value })}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Skapa automatiska dagliga påminnelser för behandlingen
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base">Anteckningar</Label>
            <Textarea
              id="notes"
              placeholder="Beskriv symptom, plats på kroppen, observationer..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Bilder</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Klicka för att ladda upp bilder
                </p>
                <p className="text-xs text-muted-foreground">
                  Max 5MB per bild. Stöder JPG, PNG, WEBP
                </p>
              </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Sparkles className="w-4 h-4 mr-2" />
              Spara händelse
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

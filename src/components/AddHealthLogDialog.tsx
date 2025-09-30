import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { addTreatmentReminders } from "@/pages/Reminders";
import { supabase } from "@/integrations/supabase/client";

const severities = ["Lätt", "Medel", "Allvarlig", "Normal"];

interface AddHealthLogDialogProps {
  onLogAdded?: () => void;
}

export const AddHealthLogDialog = ({ onLogAdded }: AddHealthLogDialogProps) => {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    horse: "",
    event: "",
    severity: "",
    treatment: "",
    notes: "",
    treatmentDays: "",
  });

  useEffect(() => {
    if (open) {
      fetchHorses();
    }
  }, [open]);

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
          days
        );
      }
      
      toast.success("Hälsologg sparad!", {
        description: `${formData.event} för ${selectedHorse.name} har dokumenterats`,
      });

      // Reset form
      setFormData({
        horse: "",
        event: "",
        severity: "",
        treatment: "",
        notes: "",
        treatmentDays: "",
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
          <DialogTitle>Lägg till hälsohändelse</DialogTitle>
          <DialogDescription>
            Dokumentera symptom, behandling och bifoga bilder
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Horse Selection */}
          <div className="space-y-2">
            <Label htmlFor="horse">Häst *</Label>
            <Select value={formData.horse} onValueChange={(value) => setFormData({ ...formData, horse: value })}>
              <SelectTrigger>
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

          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="event">Händelse *</Label>
            <Input
              id="event"
              placeholder="T.ex. Munsår, Vaccination, Hovbesiktning..."
              value={formData.event}
              onChange={(e) => setFormData({ ...formData, event: e.target.value })}
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Svårighetsgrad</Label>
            <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
              <SelectTrigger>
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
            <Label htmlFor="treatment">Behandling</Label>
            <Input
              id="treatment"
              placeholder="T.ex. Salva 2x/dag, Antibiotika, Kortison..."
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            />
          </div>

          {/* Treatment Duration */}
          <div className="space-y-2">
            <Label htmlFor="treatmentDays">Antal dagar behandling (valfritt)</Label>
            <Input
              id="treatmentDays"
              type="number"
              min="1"
              max="365"
              placeholder="T.ex. 6 för 6 dagars behandling"
              value={formData.treatmentDays}
              onChange={(e) => setFormData({ ...formData, treatmentDays: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Skapa automatiska dagliga påminnelser för behandlingen
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea
              id="notes"
              placeholder="Beskriv symptom, plats på kroppen, observationer..."
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Spara händelse
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

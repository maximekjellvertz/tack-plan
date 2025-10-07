import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface AddDailyScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  horses: Array<{ id: string; name: string }>;
  onScheduleAdded: () => void;
}

export const AddDailyScheduleDialog = ({
  open,
  onOpenChange,
  selectedDate,
  horses,
  onScheduleAdded,
}: AddDailyScheduleDialogProps) => {
  const [selectedHorse, setSelectedHorse] = useState<string>("");
  const [activityType, setActivityType] = useState<string>("Ridning");
  const [time, setTime] = useState<string>("10:00");
  const [duration, setDuration] = useState<string>("45");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHorse) {
      toast.error("Välj en häst");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Inte inloggad");

      const horse = horses.find((h) => h.id === selectedHorse);
      if (!horse) throw new Error("Häst hittades inte");

      // Get user's full name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("daily_schedule").insert({
        user_id: user.id,
        horse_id: selectedHorse,
        horse_name: horse.name,
        activity_type: activityType,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: time,
        duration: parseInt(duration),
        notes: notes || null,
        created_by_name: profile?.full_name || "Okänd användare",
      });

      if (error) throw error;

      toast.success("Schemaaktivitet tillagd!");
      onScheduleAdded();
      onOpenChange(false);
      
      // Reset form
      setSelectedHorse("");
      setActivityType("Ridning");
      setTime("10:00");
      setDuration("45");
      setNotes("");
    } catch (error: any) {
      console.error("Error adding schedule:", error);
      toast.error(error.message || "Kunde inte lägga till schemaaktivitet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till schemaaktivitet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="horse">Häst</Label>
            <Select value={selectedHorse} onValueChange={setSelectedHorse}>
              <SelectTrigger id="horse">
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

          <div>
            <Label htmlFor="activityType">Aktivitet</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id="activityType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ridning">Ridning</SelectItem>
                <SelectItem value="Longering">Longering</SelectItem>
                <SelectItem value="Markarbete">Markarbete</SelectItem>
                <SelectItem value="Promenad">Promenad</SelectItem>
                <SelectItem value="Skötsel">Skötsel</SelectItem>
                <SelectItem value="Veterinär">Veterinär</SelectItem>
                <SelectItem value="Hovslagare">Hovslagare</SelectItem>
                <SelectItem value="Övrigt">Övrigt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="time">Tid</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="duration">Varaktighet (minuter)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="45"
            />
          </div>

          <div>
            <Label htmlFor="notes">Anteckningar (valfritt)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ytterligare information..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Lägger till..." : "Lägg till"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

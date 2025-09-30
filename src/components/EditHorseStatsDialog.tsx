import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";

interface EditHorseStatsDialogProps {
  horseId: string;
  currentData: {
    competitions_this_year?: number | null;
    placements?: number | null;
    training_sessions?: number | null;
    vet_visits?: number | null;
  };
  onUpdate?: () => void;
}

export const EditHorseStatsDialog = ({ horseId, currentData, onUpdate }: EditHorseStatsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    competitions_this_year: currentData.competitions_this_year || 0,
    placements: currentData.placements || 0,
    training_sessions: currentData.training_sessions || 0,
    vet_visits: currentData.vet_visits || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("horses")
        .update({
          competitions_this_year: formData.competitions_this_year,
          placements: formData.placements,
          training_sessions: formData.training_sessions,
          vet_visits: formData.vet_visits,
          updated_at: new Date().toISOString(),
        })
        .eq("id", horseId);

      if (error) throw error;

      toast({
        title: "Statistik uppdaterad!",
        description: "Hästens statistik har uppdaterats",
      });

      setOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating horse stats:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera statistiken",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Redigera statistik</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="competitions_this_year">Tävlingar i år</Label>
            <Input
              id="competitions_this_year"
              type="number"
              min="0"
              value={formData.competitions_this_year}
              onChange={(e) => setFormData({ ...formData, competitions_this_year: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="placements">Placeringar</Label>
            <Input
              id="placements"
              type="number"
              min="0"
              value={formData.placements}
              onChange={(e) => setFormData({ ...formData, placements: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="training_sessions">Träningspass</Label>
            <Input
              id="training_sessions"
              type="number"
              min="0"
              value={formData.training_sessions}
              onChange={(e) => setFormData({ ...formData, training_sessions: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_visits">Veterinärbesök</Label>
            <Input
              id="vet_visits"
              type="number"
              min="0"
              value={formData.vet_visits}
              onChange={(e) => setFormData({ ...formData, vet_visits: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Uppdaterar..." : "Spara ändringar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

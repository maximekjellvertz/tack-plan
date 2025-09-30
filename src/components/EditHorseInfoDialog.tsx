import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";

interface EditHorseInfoDialogProps {
  horseId: string;
  currentData: {
    registration_number?: string | null;
    microchip?: string | null;
    birth_date?: string | null;
    gender?: string | null;
  };
  onUpdate?: () => void;
}

export const EditHorseInfoDialog = ({ horseId, currentData, onUpdate }: EditHorseInfoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    registration_number: currentData.registration_number || "",
    microchip: currentData.microchip || "",
    birth_date: currentData.birth_date || "",
    gender: currentData.gender || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("horses")
        .update({
          registration_number: formData.registration_number || null,
          microchip: formData.microchip || null,
          birth_date: formData.birth_date || null,
          gender: formData.gender || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", horseId);

      if (error) throw error;

      toast({
        title: "Information uppdaterad!",
        description: "Hästens information har uppdaterats",
      });

      setOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating horse info:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera informationen",
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
          <DialogTitle>Redigera grundläggande information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="registration_number">Registreringsnummer</Label>
            <Input
              id="registration_number"
              placeholder="T.ex. SE-12345"
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="microchip">Mikrochip</Label>
            <Input
              id="microchip"
              placeholder="T.ex. 752098100123"
              value={formData.microchip}
              onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Födelsedatum</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Kön</Label>
            <Input
              id="gender"
              placeholder="T.ex. Valack, Sto, Hingst"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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

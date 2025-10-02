import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Sparkles, FileText } from "lucide-react";

interface EditHorseInfoDialogProps {
  horseId: string;
  currentData: {
    registration_number?: string | null;
    microchip?: string | null;
    birth_date?: string | null;
    gender?: string | null;
    diet_feed?: string | null;
    diet_supplements?: string | null;
    diet_restrictions?: string | null;
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
    diet_feed: currentData.diet_feed || "",
    diet_supplements: currentData.diet_supplements || "",
    diet_restrictions: currentData.diet_restrictions || "",
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
          diet_feed: formData.diet_feed || null,
          diet_supplements: formData.diet_supplements || null,
          diet_restrictions: formData.diet_restrictions || null,
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
        <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Redigera grundläggande information
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration_number" className="text-base">Registreringsnummer</Label>
              <Input
                id="registration_number"
                placeholder="T.ex. SE-12345"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="microchip" className="text-base">Mikrochip</Label>
              <Input
                id="microchip"
                placeholder="T.ex. 752098100123"
                value={formData.microchip}
                onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_date" className="text-base">Födelsedatum</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-base">Kön</Label>
              <Input
                id="gender"
                placeholder="T.ex. Valack, Sto, Hingst"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diet_feed" className="text-base font-semibold">Standardfoder</Label>
            <Input
              id="diet_feed"
              placeholder="T.ex. Havre, hösilage, pellets"
              value={formData.diet_feed}
              onChange={(e) => setFormData({ ...formData, diet_feed: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diet_supplements" className="text-base font-semibold">Kosttillägg</Label>
            <Input
              id="diet_supplements"
              placeholder="T.ex. Vitaminer, mineraler, tillskott"
              value={formData.diet_supplements}
              onChange={(e) => setFormData({ ...formData, diet_supplements: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diet_restrictions" className="text-base font-semibold">Allergier/Specialkost</Label>
            <Input
              id="diet_restrictions"
              placeholder="T.ex. Glutenintolerans, ingen sockerbetor"
              value={formData.diet_restrictions}
              onChange={(e) => setFormData({ ...formData, diet_restrictions: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Avbryt
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? "Uppdaterar..." : "Spara ändringar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil } from "lucide-react";

interface EditHorseDialogProps {
  horse: {
    id: string;
    name: string;
    breed: string;
    age: number;
    discipline: string;
    level: string;
    color: string;
  };
  onHorseUpdated?: () => void;
}

export const EditHorseDialog = ({ horse, onHorseUpdated }: EditHorseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: horse.name,
    breed: horse.breed,
    age: horse.age,
    discipline: horse.discipline,
    level: horse.level,
    color: horse.color,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Du måste vara inloggad");
      }

      const { error } = await supabase
        .from("horses")
        .update({
          name: formData.name,
          breed: formData.breed || "Okänd",
          age: formData.age || 0,
          discipline: formData.discipline || "Okänd",
          level: formData.level || "Lätt",
          color: formData.color || "Okänd",
          updated_at: new Date().toISOString(),
        })
        .eq("id", horse.id);

      if (error) throw error;

      toast({
        title: "Hästen uppdaterad!",
        description: `${formData.name} har uppdaterats`,
      });

      setOpen(false);
      onHorseUpdated?.();
    } catch (error) {
      console.error("Error updating horse:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera hästen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Redigera häst</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Namn *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Ras</Label>
            <Input
              id="breed"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Ålder</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discipline">Gren</Label>
            <Input
              id="discipline"
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Nivå</Label>
            <Input
              id="level"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Färg</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Uppdaterar..." : "Uppdatera häst"}
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

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddHorseDialogProps {
  onHorseAdded?: () => void;
}

export const AddHorseDialog = ({ onHorseAdded }: AddHorseDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    discipline: "",
    level: "Lätt",
    color: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Fel",
          description: "Du måste vara inloggad för att lägga till en häst",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("horses").insert({
        user_id: user.id,
        name: formData.name,
        breed: formData.breed,
        age: parseInt(formData.age),
        discipline: formData.discipline,
        level: formData.level,
        color: formData.color,
      });

      if (error) throw error;

      toast({
        title: "Häst tillagd!",
        description: `${formData.name} har lagts till i dina hästar.`,
      });
      
      setOpen(false);
      setFormData({
        name: "",
        breed: "",
        age: "",
        discipline: "",
        level: "Lätt",
        color: "",
      });
      
      if (onHorseAdded) {
        onHorseAdded();
      }
    } catch (error) {
      console.error("Error adding horse:", error);
      toast({
        title: "Fel",
        description: "Kunde inte lägga till hästen",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Lägg till häst
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till ny häst</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Namn *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="T.ex. Thunder"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Ras *</Label>
            <Input
              id="breed"
              required
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              placeholder="T.ex. Svensk Varmblod"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Ålder *</Label>
            <Input
              id="age"
              type="number"
              required
              min="1"
              max="40"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="T.ex. 8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discipline">Gren *</Label>
            <Input
              id="discipline"
              required
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
              placeholder="T.ex. Hoppning, Dressyr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Nivå</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
              <SelectTrigger id="level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lätt">Lätt</SelectItem>
                <SelectItem value="Medel">Medel</SelectItem>
                <SelectItem value="Avancerad">Avancerad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Färg</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="T.ex. Brun, Svart, Grå"
            />
          </div>

          <Button type="submit" className="w-full">
            Spara häst
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

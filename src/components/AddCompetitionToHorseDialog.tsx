import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    discipline: "",
    class: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date) {
      toast.error("Fyll i tävlingsnamn och datum");
      return;
    }

    onAdd(formData);
    
    toast.success("Tävling tillagd!", {
      description: `${formData.name} har lagts till för ${horseName}`,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till tävling för {horseName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tävlingsnamn *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="T.ex. Hopptävling Strömsholm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Datum *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Plats</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="T.ex. Strömsholm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discipline">Gren</Label>
            <Select value={formData.discipline} onValueChange={(value) => setFormData({ ...formData, discipline: value })}>
              <SelectTrigger id="discipline">
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
            <Label htmlFor="class">Klass</Label>
            <Input
              id="class"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              placeholder="T.ex. Medel A, 110 cm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anteckningar</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="T.ex. anmälan stänger 2025-10-01"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Spara tävling
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

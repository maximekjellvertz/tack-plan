import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface AddTrainingSessionDialogProps {
  horseName: string;
  onAdd: (session: {
    type: string;
    date: string;
    duration: string;
    intensity: string;
    notes: string;
  }) => void;
}

export const AddTrainingSessionDialog = ({ horseName, onAdd }: AddTrainingSessionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    date: "",
    duration: "",
    intensity: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.date) {
      toast.error("Fyll i träningstyp och datum");
      return;
    }

    onAdd(formData);
    
    toast.success("Träningspass tillagt!", {
      description: `${formData.type} har lagts till för ${horseName}`,
    });

    setFormData({
      type: "",
      date: "",
      duration: "",
      intensity: "",
      notes: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Lägg till träning
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till träningspass för {horseName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Träningstyp *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Välj träningstyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ridning">Ridning</SelectItem>
                <SelectItem value="longe">Longering</SelectItem>
                <SelectItem value="hoppning">Hoppträning</SelectItem>
                <SelectItem value="dressyr">Dressyrträning</SelectItem>
                <SelectItem value="terrangritt">Terrängriding</SelectItem>
                <SelectItem value="kondition">Konditionsträning</SelectItem>
                <SelectItem value="markarbete">Markarbete</SelectItem>
                <SelectItem value="vila">Vilodag</SelectItem>
                <SelectItem value="ovrigt">Övrigt</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="duration">Tid</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="T.ex. 45 min, 1 timme"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intensity">Intensitet</Label>
            <Select value={formData.intensity} onValueChange={(value) => setFormData({ ...formData, intensity: value })}>
              <SelectTrigger id="intensity">
                <SelectValue placeholder="Välj intensitet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lätt">Lätt</SelectItem>
                <SelectItem value="medel">Medel</SelectItem>
                <SelectItem value="hög">Hög</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="T.ex. fokus på sidogång, bra framsteg..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Spara träning
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

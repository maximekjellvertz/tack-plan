import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AddCompetitionDialogProps {
  onAdd: (competition: {
    name: string;
    date: string;
    location: string;
    discipline: string;
    time?: string;
    organizer?: string;
    website?: string;
    email?: string;
    phone?: string;
  }) => void;
}

export const AddCompetitionDialog = ({ onAdd }: AddCompetitionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    discipline: "Hoppning",
    time: "",
    organizer: "",
    website: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !selectedDate || !formData.location) {
      return;
    }

    onAdd({
      name: formData.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      location: formData.location,
      discipline: formData.discipline,
      time: formData.time,
      organizer: formData.organizer,
      website: formData.website,
      email: formData.email,
      phone: formData.phone,
    });

    // Reset form
    setFormData({
      name: "",
      location: "",
      discipline: "Hoppning",
      time: "",
      organizer: "",
      website: "",
      email: "",
      phone: "",
    });
    setSelectedDate(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Lägg till tävling
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lägg till tävling</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tävlingsnamn *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="T.ex. Vår Open"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Datum *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: sv }) : "Välj datum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={sv}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Tid</Label>
            <Input
              id="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="T.ex. 09:00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Plats *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="T.ex. Stockholm Ridsportklubb"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discipline">Gren</Label>
            <Select
              value={formData.discipline}
              onValueChange={(value) => setFormData({ ...formData, discipline: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hoppning">Hoppning</SelectItem>
                <SelectItem value="Dressyr">Dressyr</SelectItem>
                <SelectItem value="Fälttävlan">Fälttävlan</SelectItem>
                <SelectItem value="Körning">Körning</SelectItem>
                <SelectItem value="Distans">Distans</SelectItem>
                <SelectItem value="Voltige">Voltige</SelectItem>
                <SelectItem value="Working Equitation">Working Equitation</SelectItem>
                <SelectItem value="Islandshäst">Islandshäst</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer">Arrangör</Label>
            <Input
              id="organizer"
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              placeholder="T.ex. Stockholm Ridsportklubb"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Webbsida</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tavling@exempel.se"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="070-123 45 67"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={!formData.name || !selectedDate || !formData.location}>
              Lägg till
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AddGoalDialogProps {
  onAdd: (goal: {
    title: string;
    description: string;
    target_date: Date | undefined;
    goal_type: string;
    auto_calculate: boolean;
  }) => void;
}

export const AddGoalDialog = ({ onAdd }: AddGoalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState<Date>();
  const [goalType, setGoalType] = useState("custom");
  const [autoCalculate, setAutoCalculate] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) return;

    onAdd({
      title,
      description,
      target_date: targetDate,
      goal_type: goalType,
      auto_calculate: autoCalculate,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setTargetDate(undefined);
    setGoalType("custom");
    setAutoCalculate(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nytt mål
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lägg till nytt mål</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="T.ex. Starta 1.20 i februari"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv målet..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Måltyp</Label>
              <Select value={goalType} onValueChange={setGoalType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="competition">Tävling</SelectItem>
                  <SelectItem value="training">Träning</SelectItem>
                  <SelectItem value="health">Hälsa</SelectItem>
                  <SelectItem value="custom">Övrigt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Måldatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "PPP", { locale: sv }) : "Välj datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="auto">Automatisk progress</Label>
              <p className="text-sm text-muted-foreground">
                Beräkna framsteg automatiskt från träningar och tävlingar
              </p>
            </div>
            <Switch
              id="auto"
              checked={autoCalculate}
              onCheckedChange={setAutoCalculate}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="flex-1">
              Lägg till mål
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

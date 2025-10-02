import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: {
    id: string;
    title: string;
    description: string | null;
    target_date: string | null;
    goal_type: string;
    auto_calculate: boolean;
  };
  onUpdate: (goalId: string, updates: {
    title: string;
    description: string;
    target_date: Date | undefined;
    goal_type: string;
    auto_calculate: boolean;
  }) => void;
}

export const EditGoalDialog = ({ open, onOpenChange, goal, onUpdate }: EditGoalDialogProps) => {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || "");
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal.target_date ? new Date(goal.target_date) : undefined
  );
  const [goalType, setGoalType] = useState(goal.goal_type);
  const [autoCalculate, setAutoCalculate] = useState(goal.auto_calculate);

  useEffect(() => {
    setTitle(goal.title);
    setDescription(goal.description || "");
    setTargetDate(goal.target_date ? new Date(goal.target_date) : undefined);
    setGoalType(goal.goal_type);
    setAutoCalculate(goal.auto_calculate);
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) return;

    onUpdate(goal.id, {
      title,
      description,
      target_date: targetDate,
      goal_type: goalType,
      auto_calculate: autoCalculate,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl animate-scale-in">
        <DialogHeader>
          <DialogTitle>Redigera mål</DialogTitle>
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
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="flex-1">
              Spara ändringar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
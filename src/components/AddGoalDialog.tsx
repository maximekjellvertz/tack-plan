import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, Target, Sparkles, Zap } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { celebrateGoalCompletion } from "@/lib/confetti";
import { toast } from "sonner";

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

  useEffect(() => {
    if (open) {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      setTargetDate(oneMonthFromNow);
    }
  }, [open]);

  const setQuickDate = (monthsAhead: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsAhead);
    setTargetDate(date);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Fyll i en titel för ditt mål");
      return;
    }

    onAdd({
      title,
      description,
      target_date: targetDate,
      goal_type: goalType,
      auto_calculate: autoCalculate,
    });

    celebrateGoalCompletion();
    
    toast.success("Mål skapat! 🎯", {
      description: "Nu är det dags att jobba mot ditt mål!",
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
        <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <Sparkles className="w-4 h-4 mr-2" />
          Nytt mål
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sätt ett nytt mål</DialogTitle>
          <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <Target className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground italic">Stora framsteg börjar med tydliga mål</p>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="T.ex. Starta 1.20 i februari"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base">Beskrivning</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv ditt mål och vad det betyder för dig..."
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Måltyp</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger className="h-11">
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

          <div className="space-y-3">
            <Label className="text-base">Måldatum</Label>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(1)}
                className="flex-1 h-9"
              >
                <Zap className="w-3 h-3 mr-1" />
                Om en månad
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(3)}
                className="flex-1 h-9"
              >
                Om 3 månader
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(6)}
                className="flex-1 h-9"
              >
                Om 6 månader
              </Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "d MMMM yyyy", { locale: sv }) : "Välj datum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                  locale={sv}
                />
              </PopoverContent>
            </Popover>
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
            <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Sparkles className="w-4 h-4 mr-2" />
              Lägg till mål
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

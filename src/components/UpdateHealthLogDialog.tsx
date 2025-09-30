import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface HealthLog {
  id: number;
  horse: string;
  event: string;
  date: string;
  severity: string;
  status: string;
  treatment: string;
  notes: string;
  images?: string[];
}

interface UpdateHealthLogDialogProps {
  log: HealthLog;
  onUpdate: (id: number, updates: Partial<HealthLog>) => void;
}

const statuses = ["Pågående", "Klar", "Uppmärksamhet"];
const severities = ["Lätt", "Medel", "Allvarlig"];

export const UpdateHealthLogDialog = ({ log, onUpdate }: UpdateHealthLogDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    severity: log.severity,
    status: log.status,
    treatment: log.treatment,
    notes: log.notes,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onUpdate(log.id, formData);
    
    toast.success("Hälsologg uppdaterad!", {
      description: `${log.event} för ${log.horse} har uppdaterats`,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-secondary">
          Uppdatera
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Uppdatera hälsohändelse</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {log.event} - {log.horse}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Svårighetsgrad</Label>
            <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {severities.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {severity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Behandling</Label>
            <Input
              id="treatment"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="T.ex. Salva 2x/dag"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Lägg till nya observationer..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Spara ändringar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

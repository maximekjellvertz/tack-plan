import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit } from "lucide-react";

interface SharedAccess {
  id: string;
  collaborator_email: string;
  role: "viewer" | "editor" | "manager";
  access_type: "full_account" | "specific_horses";
  horse_ids: string[] | null;
  status: "pending" | "active" | "revoked";
}

interface EditSharedAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horses: Array<{ id: string; name: string }>;
  sharedAccess: SharedAccess | null;
  onSuccess: () => void;
}

export const EditSharedAccessDialog = ({ 
  open, 
  onOpenChange, 
  horses, 
  sharedAccess,
  onSuccess 
}: EditSharedAccessDialogProps) => {
  const [role, setRole] = useState<"viewer" | "editor" | "manager">("viewer");
  const [accessType, setAccessType] = useState<"full_account" | "specific_horses">("full_account");
  const [selectedHorses, setSelectedHorses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sharedAccess) {
      setRole(sharedAccess.role);
      setAccessType(sharedAccess.access_type);
      setSelectedHorses(sharedAccess.horse_ids || []);
    }
  }, [sharedAccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sharedAccess) return;

    if (accessType === "specific_horses" && selectedHorses.length === 0) {
      toast.error("Välj minst en häst");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        role,
        access_type: accessType,
        horse_ids: accessType === "specific_horses" ? selectedHorses : null,
      };

      const { error } = await supabase
        .from("shared_access")
        .update(updateData)
        .eq("id", sharedAccess.id);

      if (error) throw error;

      toast.success("Åtkomst uppdaterad!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating access:", error);
      toast.error("Kunde inte uppdatera åtkomst");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHorse = (horseId: string) => {
    setSelectedHorses(prev =>
      prev.includes(horseId)
        ? prev.filter(id => id !== horseId)
        : [...prev, horseId]
    );
  };

  if (!sharedAccess) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-primary" />
            Redigera tillgång
          </DialogTitle>
          <DialogDescription>
            Ändra behörigheter för {sharedAccess.collaborator_email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Behörighet</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Viewer</span>
                    <span className="text-xs text-muted-foreground">Kan bara se data</span>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Editor</span>
                    <span className="text-xs text-muted-foreground">Kan redigera data</span>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Manager</span>
                    <span className="text-xs text-muted-foreground">Kan redigera och ta bort</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessType">Tillgång till</Label>
            <Select value={accessType} onValueChange={(value: any) => setAccessType(value)}>
              <SelectTrigger id="accessType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_account">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Hela kontot</span>
                    <span className="text-xs text-muted-foreground">Alla hästar och data</span>
                  </div>
                </SelectItem>
                <SelectItem value="specific_horses">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Specifika hästar</span>
                    <span className="text-xs text-muted-foreground">Välj vilka hästar</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {accessType === "specific_horses" && (
            <div className="space-y-2">
              <Label>Välj hästar</Label>
              <div className="border rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {horses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Inga hästar tillgängliga</p>
                ) : (
                  horses.map((horse) => (
                    <div key={horse.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${horse.id}`}
                        checked={selectedHorses.includes(horse.id)}
                        onCheckedChange={() => toggleHorse(horse.id)}
                      />
                      <label
                        htmlFor={`edit-${horse.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {horse.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uppdaterar..." : "Uppdatera"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
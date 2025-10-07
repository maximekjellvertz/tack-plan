import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ShareAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  horses: Array<{ id: string; name: string }>;
}

export const ShareAccessDialog = ({ open, onOpenChange, onSuccess, horses }: ShareAccessDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor" | "manager">("viewer");
  const [accessType, setAccessType] = useState<"full_account" | "specific_horses">("full_account");
  const [selectedHorses, setSelectedHorses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Du måste vara inloggad");
        return;
      }

      // Validate email
      if (!email || !email.includes("@")) {
        toast.error("Ange en giltig e-postadress");
        return;
      }

      // Validate horse selection for specific_horses access
      if (accessType === "specific_horses" && selectedHorses.length === 0) {
        toast.error("Välj minst en häst");
        return;
      }

      const { error } = await supabase.from("shared_access").insert({
        owner_id: user.id,
        collaborator_email: email.toLowerCase().trim(),
        role,
        access_type: accessType,
        horse_ids: accessType === "specific_horses" ? selectedHorses : null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Inbjudan skickad!");
      setEmail("");
      setRole("viewer");
      setAccessType("full_account");
      setSelectedHorses([]);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sharing access:", error);
      toast.error("Kunde inte dela tillgång: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleHorse = (horseId: string) => {
    setSelectedHorses(prev =>
      prev.includes(horseId)
        ? prev.filter(id => id !== horseId)
        : [...prev, horseId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dela tillgång till ditt konto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-postadress</Label>
            <Input
              id="email"
              type="email"
              placeholder="namn@exempel.se"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Behörighetsnivå</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div>
                    <div className="font-medium">Viewer</div>
                    <div className="text-xs text-muted-foreground">Kan endast se data</div>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div>
                    <div className="font-medium">Editor</div>
                    <div className="text-xs text-muted-foreground">Kan se och redigera data</div>
                  </div>
                </SelectItem>
                <SelectItem value="manager">
                  <div>
                    <div className="font-medium">Manager</div>
                    <div className="text-xs text-muted-foreground">Kan se, redigera och ta bort data</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accessType">Tillgång till</Label>
            <Select value={accessType} onValueChange={(value: any) => setAccessType(value)}>
              <SelectTrigger id="accessType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_account">
                  <div>
                    <div className="font-medium">Hela kontot</div>
                    <div className="text-xs text-muted-foreground">Tillgång till alla hästar och data</div>
                  </div>
                </SelectItem>
                <SelectItem value="specific_horses">
                  <div>
                    <div className="font-medium">Specifika hästar</div>
                    <div className="text-xs text-muted-foreground">Välj vilka hästar de ska se</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {accessType === "specific_horses" && (
            <div className="space-y-2">
              <Label>Välj hästar</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {horses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Inga hästar tillgängliga</p>
                ) : (
                  horses.map((horse) => (
                    <div key={horse.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`horse-${horse.id}`}
                        checked={selectedHorses.includes(horse.id)}
                        onCheckedChange={() => toggleHorse(horse.id)}
                      />
                      <label
                        htmlFor={`horse-${horse.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {horse.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Skicka inbjudan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

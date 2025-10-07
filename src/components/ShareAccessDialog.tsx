import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, UserPlus } from "lucide-react";

interface ShareAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horses: Array<{ id: string; name: string }>;
  onSuccess: () => void;
}

export const ShareAccessDialog = ({ open, onOpenChange, horses, onSuccess }: ShareAccessDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor" | "manager">("viewer");
  const [accessType, setAccessType] = useState<"full_account" | "specific_horses">("full_account");
  const [selectedHorses, setSelectedHorses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Ange en e-postadress");
      return;
    }

    if (accessType === "specific_horses" && selectedHorses.length === 0) {
      toast.error("Välj minst en häst");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Inte inloggad");

      const { error } = await supabase
        .from("shared_access")
        .insert({
          owner_id: user.id,
          collaborator_email: email.trim().toLowerCase(),
          role,
          access_type: accessType,
          horse_ids: accessType === "specific_horses" ? selectedHorses : null,
          status: "pending"
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
      toast.error(error.message || "Kunde inte skicka inbjudan");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Dela tillgång
          </DialogTitle>
          <DialogDescription>
            Bjud in någon att få tillgång till dina hästar och data
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-postadress</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="namn@exempel.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

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
                        id={horse.id}
                        checked={selectedHorses.includes(horse.id)}
                        onCheckedChange={() => toggleHorse(horse.id)}
                      />
                      <label
                        htmlFor={horse.id}
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
              {isSubmitting ? "Skickar..." : "Skicka inbjudan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

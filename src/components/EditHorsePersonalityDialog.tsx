import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditHorsePersonalityDialogProps {
  horseId: string;
  currentPersonalityTrait?: string | null;
  currentFunFact?: string | null;
  onUpdate: () => void;
}

const personalityTraits = [
  { value: "brave", label: "Modig", description: "Älskar utmaningar och nya äventyr" },
  { value: "loving", label: "Kärleksfull", description: "Vill alltid vara nära sina favoritmänniskor" },
  { value: "playful", label: "Lekfull", description: "Ser möjligheter till lek överallt" },
  { value: "ambitious", label: "Ambitiös", description: "Strävar alltid efter att göra sitt bästa" },
  { value: "calm", label: "Lugn", description: "Behåller sinneslugnet i alla situationer" },
  { value: "energetic", label: "Energisk", description: "Alltid redo för action" },
  { value: "curious", label: "Nyfiken", description: "Vill utforska allt och alla" },
  { value: "gentle", label: "Mild", description: "Extra försiktig och ömsint" }
];

export const EditHorsePersonalityDialog = ({
  horseId,
  currentPersonalityTrait,
  currentFunFact,
  onUpdate,
}: EditHorsePersonalityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [personalityTrait, setPersonalityTrait] = useState(currentPersonalityTrait || "");
  const [funFact, setFunFact] = useState(currentFunFact || "");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("horses")
        .update({
          personality_trait: personalityTrait || null,
          fun_fact: funFact || null,
        })
        .eq("id", horseId);

      if (error) throw error;

      toast({
        title: "Uppdaterat!",
        description: "Personlighet och fakta har sparats",
      });

      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating horse personality:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera personlighet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Redigera
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redigera personlighet & fakta</DialogTitle>
          <DialogDescription>
            Lägg till unika egenskaper och kul fakta om din häst
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personality">Personlighetsdrag</Label>
            <Select value={personalityTrait} onValueChange={setPersonalityTrait}>
              <SelectTrigger>
                <SelectValue placeholder="Välj personlighetsdrag" />
              </SelectTrigger>
              <SelectContent>
                {personalityTraits.map((trait) => (
                  <SelectItem key={trait.value} value={trait.value}>
                    <div>
                      <div className="font-medium">{trait.label}</div>
                      <div className="text-xs text-muted-foreground">{trait.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funFact">Kul fakta</Label>
            <Textarea
              id="funFact"
              placeholder="T.ex. 'älskar äpplen', 'blir extra energisk av regn', 'har en favorit äpple-smak'"
              value={funFact}
              onChange={(e) => setFunFact(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {funFact.length}/200 tecken
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sparar..." : "Spara"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

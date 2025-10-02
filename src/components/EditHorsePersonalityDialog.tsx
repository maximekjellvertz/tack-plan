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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Sparkles, Heart } from "lucide-react";
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
  { value: "gentle", label: "Mild", description: "Extra försiktig och ömsint" },
  { value: "custom", label: "Annan/Egen", description: "Skriv in ett eget personlighetsdrag" }
];

export const EditHorsePersonalityDialog = ({
  horseId,
  currentPersonalityTrait,
  currentFunFact,
  onUpdate,
}: EditHorsePersonalityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if current trait is a predefined one
  const isPredefined = personalityTraits.some(t => t.value === currentPersonalityTrait);
  const [selectedOption, setSelectedOption] = useState(
    isPredefined ? currentPersonalityTrait || "" : "custom"
  );
  const [customTrait, setCustomTrait] = useState(
    !isPredefined ? currentPersonalityTrait || "" : ""
  );
  const [funFact, setFunFact] = useState(currentFunFact || "");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalPersonalityTrait = selectedOption === "custom" ? customTrait : selectedOption;
      
      const { error } = await supabase
        .from("horses")
        .update({
          personality_trait: finalPersonalityTrait || null,
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
        <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
          <Pencil className="h-4 w-4 mr-2" />
          Redigera
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Redigera personlighet & fakta
          </DialogTitle>
          <DialogDescription className="text-base">
            Lägg till unika egenskaper och kul fakta om din häst
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label htmlFor="personality" className="text-base font-semibold">Personlighetsdrag</Label>
            <Select value={selectedOption} onValueChange={setSelectedOption}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="✨ Välj personlighetsdrag" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {personalityTraits.map((trait) => (
                  <SelectItem key={trait.value} value={trait.value} className="cursor-pointer">
                    <div>
                      <div className="font-medium">{trait.label}</div>
                      <div className="text-xs text-muted-foreground">{trait.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedOption === "custom" && (
              <div className="mt-3">
                <Input
                  id="customTrait"
                  placeholder="Skriv in eget personlighetsdrag"
                  value={customTrait}
                  onChange={(e) => setCustomTrait(e.target.value)}
                  className="h-11"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {customTrait.length}/50 tecken
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="funFact" className="text-base font-semibold">Kul fakta</Label>
            <Textarea
              id="funFact"
              placeholder="T.ex. 'älskar äpplen', 'blir extra energisk av regn', 'har en favorit äpple-smak'"
              value={funFact}
              onChange={(e) => setFunFact(e.target.value)}
              rows={3}
              maxLength={200}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {funFact.length}/200 tecken
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Avbryt
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? "Sparar..." : "Spara"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

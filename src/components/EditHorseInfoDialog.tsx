import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Sparkles, FileText, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EditHorseInfoDialogProps {
  horseId: string;
  currentData: {
    registration_number?: string | null;
    microchip?: string | null;
    birth_date?: string | null;
    gender?: string | null;
    diet_feed?: string | null;
    diet_supplements?: string | null;
    diet_restrictions?: string | null;
  };
  onUpdate?: () => void;
}

export const EditHorseInfoDialog = ({ horseId, currentData, onUpdate }: EditHorseInfoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    currentData.birth_date ? new Date(currentData.birth_date) : undefined
  );
  
  const [formData, setFormData] = useState({
    registration_number: currentData.registration_number || "",
    microchip: currentData.microchip || "",
    gender: currentData.gender || "",
    diet_feed: currentData.diet_feed || "",
    diet_supplements: currentData.diet_supplements || "",
    diet_restrictions: currentData.diet_restrictions || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("horses")
        .update({
          registration_number: formData.registration_number || null,
          microchip: formData.microchip || null,
          birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : null,
          gender: formData.gender || null,
          diet_feed: formData.diet_feed || null,
          diet_supplements: formData.diet_supplements || null,
          diet_restrictions: formData.diet_restrictions || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", horseId);

      if (error) throw error;

      toast({
        title: "Information uppdaterad!",
        description: "Hästens information har uppdaterats",
      });

      setOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating horse info:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera informationen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Redigera grundläggande information
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Identifikation */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Identifikation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_number" className="text-sm font-medium">Registreringsnummer</Label>
                <Input
                  id="registration_number"
                  placeholder="SE-12345"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="microchip" className="text-sm font-medium">Mikrochip</Label>
                <Input
                  id="microchip"
                  placeholder="752098100123"
                  value={formData.microchip}
                  onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Födelsedatum</Label>
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 w-full justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? format(birthDate, "d MMMM yyyy", { locale: sv }) : "Välj datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 bg-background border-2 shadow-xl z-[100]" 
                    align="start"
                    side="bottom"
                    avoidCollisions={true}
                    collisionPadding={10}
                  >
                    <div className="max-h-[350px] overflow-y-auto">
                      <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        locale={sv}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">Kön</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Välj kön" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="Valack">Valack</SelectItem>
                    <SelectItem value="Sto">Sto</SelectItem>
                    <SelectItem value="Hingst">Hingst</SelectItem>
                    <SelectItem value="Hingståre">Hingståre</SelectItem>
                    <SelectItem value="Kastrat">Kastrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Kost & Näring */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Kost & Näring</h3>
            <div className="space-y-2">
              <Label htmlFor="diet_feed" className="text-sm font-medium">Standardfoder</Label>
              <Input
                id="diet_feed"
                placeholder="Havre, hösilage, pellets"
                value={formData.diet_feed}
                onChange={(e) => setFormData({ ...formData, diet_feed: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diet_supplements" className="text-sm font-medium">Kosttillägg</Label>
              <Input
                id="diet_supplements"
                placeholder="Vitaminer, mineraler, tillskott"
                value={formData.diet_supplements}
                onChange={(e) => setFormData({ ...formData, diet_supplements: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diet_restrictions" className="text-sm font-medium">Allergier/Specialkost</Label>
              <Input
                id="diet_restrictions"
                placeholder="Glutenintolerans, ingen sockerbetor"
                value={formData.diet_restrictions}
                onChange={(e) => setFormData({ ...formData, diet_restrictions: e.target.value })}
                className="h-10"
              />
            </div>
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
              {loading ? "Uppdaterar..." : "Spara ändringar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

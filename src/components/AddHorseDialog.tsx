import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, CheckCircle, Sparkles, Heart, Star, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AddHorseDialogProps {
  onHorseAdded?: () => void;
}

interface TDBHorse {
  name: string;
  breed: string;
  age: number;
  birthDate?: string;
  color: string;
  microchip?: string;
  registrationNumber?: string;
  gender?: string;
}

export const AddHorseDialog = ({ onHorseAdded }: AddHorseDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [searchingTDB, setSearchingTDB] = useState(false);
  const [tdbResults, setTdbResults] = useState<TDBHorse[]>([]);
  const [selectedTDBHorse, setSelectedTDBHorse] = useState<TDBHorse | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    discipline: "",
    level: "Lätt",
    color: "",
  });

  // Search TDB when horse name changes
  useEffect(() => {
    const searchTDB = async () => {
      if (!formData.name || formData.name.trim().length < 3) {
        setTdbResults([]);
        setSelectedTDBHorse(null);
        return;
      }

      setSearchingTDB(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.functions.invoke('search-tdb-horse', {
          body: { horseName: formData.name, userId: user.id }
        });

        if (error) {
          console.error('TDB search error:', error);
          return;
        }

        if (data.horses && data.horses.length > 0) {
          setTdbResults(data.horses);
          
          // If exactly 1 horse found, auto-fill
          if (data.horses.length === 1) {
            const horse = data.horses[0];
            setSelectedTDBHorse(horse);
            setFormData(prev => ({
              ...prev,
              breed: horse.breed || prev.breed,
              age: horse.age?.toString() || prev.age,
              color: horse.color || prev.color,
            }));
            toast({
              title: "Häst hittad i TDB!",
              description: `Uppgifter för ${horse.name} har fyllts i automatiskt.`,
            });
          }
        } else {
          setTdbResults([]);
          setSelectedTDBHorse(null);
        }
      } catch (error) {
        console.error('Error searching TDB:', error);
      } finally {
        setSearchingTDB(false);
      }
    };

    const timeoutId = setTimeout(searchTDB, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.name, toast]);

  const selectTDBHorse = (horse: TDBHorse) => {
    setSelectedTDBHorse(horse);
    setFormData({
      ...formData,
      name: horse.name,
      breed: horse.breed,
      age: horse.age.toString(),
      color: horse.color,
    });
    setTdbResults([]);
    toast({
      title: "Häst vald",
      description: `${horse.name} har valts från TDB.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Fel",
          description: "Du måste vara inloggad för att lägga till en häst",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("horses").insert({
        user_id: user.id,
        name: formData.name,
        breed: formData.breed,
        age: parseInt(formData.age),
        discipline: formData.discipline,
        level: formData.level,
        color: formData.color,
      });

      if (error) throw error;

      toast({
        title: "Häst tillagd!",
        description: `${formData.name} har lagts till i dina hästar.`,
      });
      
      setOpen(false);
      setFormData({
        name: "",
        breed: "",
        age: "",
        discipline: "",
        level: "Lätt",
        color: "",
      });
      setTdbResults([]);
      setSelectedTDBHorse(null);
      
      if (onHorseAdded) {
        onHorseAdded();
      }
    } catch (error) {
      console.error("Error adding horse:", error);
      toast({
        title: "Fel",
        description: "Kunde inte lägga till hästen",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <Sparkles className="w-4 h-4 mr-2" />
          Lägg till häst
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Lägg till ny häst
          </DialogTitle>
          <div className="flex items-center gap-2 mt-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <Star className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground italic">Varje häst är unik - börja din gemensamma resa här</p>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">Namn *</Label>
            <div className="relative">
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="T.ex. Thunder"
                className="h-11 pr-10"
              />
              {searchingTDB && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3.5 text-primary" />
              )}
              {selectedTDBHorse && !searchingTDB && (
                <div className="absolute right-3 top-3.5">
                  <CheckCircle className="w-4 h-4 text-primary animate-scale-in" />
                </div>
              )}
            </div>
            {formData.name.length > 0 && formData.name.length < 3 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="w-3 h-3" />
                <span>Skriv minst 3 tecken för att söka i TDB</span>
              </div>
            )}
            {selectedTDBHorse && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Häst hittad i TDB - uppgifter ifyllda!</span>
              </div>
            )}
          </div>

          {/* TDB Search Results */}
          {tdbResults.length > 1 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <Label className="text-base font-semibold">
                  Välj häst från TDB ({tdbResults.length} hittade)
                </Label>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {tdbResults.map((horse, index) => (
                  <Card 
                    key={index} 
                    className="p-4 cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all hover:shadow-md animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => selectTDBHorse(horse)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-primary" />
                          <p className="font-semibold text-lg">{horse.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {horse.breed}
                          </Badge>
                          <Badge variant="outline">{horse.age} år</Badge>
                          {horse.color && (
                            <Badge variant="outline" className="bg-secondary/10">
                              {horse.color}
                            </Badge>
                          )}
                        </div>
                        {horse.registrationNumber && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Reg: {horse.registrationNumber}
                          </p>
                        )}
                      </div>
                      <Zap className="w-5 h-5 text-primary ml-2 flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed" className="text-base">Ras *</Label>
              <Input
                id="breed"
                required
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="T.ex. Svensk Varmblod"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-base">Ålder *</Label>
              <Input
                id="age"
                type="number"
                required
                min="1"
                max="40"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="T.ex. 8"
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discipline" className="text-base">Gren *</Label>
            <Input
              id="discipline"
              required
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
              placeholder="T.ex. Hoppning, Dressyr"
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level" className="text-base">Nivå</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger id="level" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lätt">Lätt</SelectItem>
                  <SelectItem value="Medel">Medel</SelectItem>
                  <SelectItem value="Avancerad">Avancerad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-base">Färg</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="T.ex. Brun, Svart, Grå"
                className="h-11"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Avbryt
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Spara häst
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

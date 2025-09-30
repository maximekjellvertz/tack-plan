import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, CheckCircle } from "lucide-react";
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
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Lägg till häst
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till ny häst</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Namn *</Label>
            <div className="relative">
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="T.ex. Thunder"
              />
              {searchingTDB && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-muted-foreground" />
              )}
              {selectedTDBHorse && !searchingTDB && (
                <CheckCircle className="w-4 h-4 absolute right-3 top-3 text-green-600" />
              )}
            </div>
            {formData.name.length > 0 && formData.name.length < 3 && (
              <p className="text-xs text-muted-foreground">Skriv minst 3 tecken för att söka i TDB</p>
            )}
          </div>

          {/* TDB Search Results */}
          {tdbResults.length > 1 && (
            <div className="space-y-2">
              <Label>Välj häst från TDB ({tdbResults.length} hittade)</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tdbResults.map((horse, index) => (
                  <Card 
                    key={index} 
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => selectTDBHorse(horse)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{horse.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{horse.breed}</Badge>
                          <Badge variant="outline">{horse.age} år</Badge>
                          {horse.color && <Badge variant="outline">{horse.color}</Badge>}
                        </div>
                        {horse.registrationNumber && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reg: {horse.registrationNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="breed">Ras *</Label>
            <Input
              id="breed"
              required
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              placeholder="T.ex. Svensk Varmblod"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Ålder *</Label>
            <Input
              id="age"
              type="number"
              required
              min="1"
              max="40"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="T.ex. 8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discipline">Gren *</Label>
            <Input
              id="discipline"
              required
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
              placeholder="T.ex. Hoppning, Dressyr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Nivå</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
              <SelectTrigger id="level">
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
            <Label htmlFor="color">Färg</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="T.ex. Brun, Svart, Grå"
            />
          </div>

          <Button type="submit" className="w-full">
            Spara häst
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

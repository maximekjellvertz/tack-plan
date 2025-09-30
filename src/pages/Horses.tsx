import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const horses = [
  {
    id: 1,
    name: "Thunder",
    breed: "Svensk Varmblod",
    age: 8,
    discipline: "Hoppning",
    level: "Medel",
    color: "Brun",
  },
  {
    id: 2,
    name: "Storm",
    breed: "Hannoveraner",
    age: 6,
    discipline: "Dressyr",
    level: "Lätt",
    color: "Svart",
  },
  {
    id: 3,
    name: "Luna",
    breed: "Islandshäst",
    age: 10,
    discipline: "Fälttävlan",
    level: "Avancerad",
    color: "Grå",
  },
];

const Horses = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Mina hästar</h1>
            <p className="text-muted-foreground">
              Hantera dina hästars profiler och information
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till häst
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {horses.map((horse) => (
            <Card key={horse.id} className="overflow-hidden hover:shadow-elevated transition-shadow">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Heart className="w-24 h-24 text-primary/40" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-foreground">{horse.name}</h3>
                  <Badge variant="secondary">{horse.level}</Badge>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ras:</span>
                    <span className="text-foreground font-medium">{horse.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ålder:</span>
                    <span className="text-foreground font-medium">{horse.age} år</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gren:</span>
                    <span className="text-foreground font-medium">{horse.discipline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Färg:</span>
                    <span className="text-foreground font-medium">{horse.color}</span>
                  </div>
                </div>
                <Link to={`/horses/${horse.id}`}>
                  <Button className="w-full" variant="outline">
                    Visa detaljer
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Horses;

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Search, Filter } from "lucide-react";
import { useState } from "react";

const competitions = [
  {
    id: 1,
    name: "Hopptävling Strömsholm",
    date: "2025-10-05",
    location: "Strömsholm",
    district: "Stockholm",
    discipline: "Hoppning",
    height: "110-130 cm",
    status: "Öppen",
  },
  {
    id: 2,
    name: "Dressyr SM",
    date: "2025-10-12",
    location: "Flyinge",
    district: "Skåne",
    discipline: "Dressyr",
    height: "-",
    status: "Öppen",
  },
  {
    id: 3,
    name: "Fälttävlan Göteborg",
    date: "2025-10-18",
    location: "Heden, Göteborg",
    district: "Västra Götaland",
    discipline: "Fälttävlan",
    height: "Alla nivåer",
    status: "Öppen",
  },
  {
    id: 4,
    name: "Hoppning Malmö",
    date: "2025-10-25",
    location: "Malmö Ridklubb",
    district: "Skåne",
    discipline: "Hoppning",
    height: "90-120 cm",
    status: "Öppen",
  },
  {
    id: 5,
    name: "Dressyr Uppsala",
    date: "2025-11-02",
    location: "Uppsala Ridcenter",
    district: "Uppsala",
    discipline: "Dressyr",
    height: "-",
    status: "Snart full",
  },
];

const Competitions = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompetitions = competitions.filter((comp) =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.discipline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Tävlingskalender</h1>
          <p className="text-muted-foreground">
            Sök och filtrera tävlingar från hela Sverige
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Sök tävling, plats eller gren..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filtrera
            </Button>
          </div>
        </Card>

        {/* Competition List */}
        <div className="space-y-4">
          {filteredCompetitions.map((comp) => (
            <Card key={comp.id} className="p-6 hover:shadow-elevated transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">{comp.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{comp.discipline}</Badge>
                        <Badge variant="outline">{comp.height}</Badge>
                        <Badge className={comp.status === "Öppen" ? "bg-secondary" : "bg-primary"}>
                          {comp.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{comp.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{comp.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">{comp.district}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:w-48">
                  <Button className="bg-primary hover:bg-primary/90">
                    Lägg till i kalender
                  </Button>
                  <Button variant="outline">
                    Mer information
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredCompetitions.length === 0 && (
          <Card className="p-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Inga tävlingar hittades
            </h3>
            <p className="text-muted-foreground">
              Prova att söka efter något annat eller ändra dina filter
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Competitions;

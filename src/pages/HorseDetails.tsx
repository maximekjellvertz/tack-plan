import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Calendar, Activity, FileText } from "lucide-react";

// Mock data - skulle hämtas från databas
const horsesData = [
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

const HorseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const horse = horsesData.find((h) => h.id === Number(id));

  if (!horse) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Häst hittades inte</h2>
          <Button onClick={() => navigate("/horses")}>Tillbaka till mina hästar</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate("/horses")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till mina hästar
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
              <Heart className="w-16 h-16 text-primary/40" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">{horse.name}</h1>
                <Badge variant="secondary">{horse.level}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ras</p>
                  <p className="font-medium">{horse.breed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ålder</p>
                  <p className="font-medium">{horse.age} år</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gren</p>
                  <p className="font-medium">{horse.discipline}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Färg</p>
                  <p className="font-medium">{horse.color}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="training">Träning</TabsTrigger>
            <TabsTrigger value="competitions">Tävlingar</TabsTrigger>
            <TabsTrigger value="health">Hälsa</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Grundläggande information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registreringsnummer:</span>
                    <span className="font-medium">SE-{horse.id}2345</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mikrochip:</span>
                    <span className="font-medium">752098{horse.id}00123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Födelsedatum:</span>
                    <span className="font-medium">2017-04-15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kön:</span>
                    <span className="font-medium">Valack</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Statistik</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tävlingar i år:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Placeringar:</span>
                    <span className="font-medium">5 priser</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Träningspass:</span>
                    <span className="font-medium">143</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Veterinärbesök:</span>
                    <span className="font-medium">3</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Träningshistorik</h3>
              </div>
              <p className="text-muted-foreground">
                Träningsschema och historik kommer visas här. Koppla till kalendern för att planera träning inför kommande tävlingar.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="competitions" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Tävlingshistorik</h3>
              </div>
              <p className="text-muted-foreground">
                Tidigare och kommande tävlingar för {horse.name} kommer visas här.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Hälsojournal</h3>
              </div>
              <p className="text-muted-foreground">
                Hälsologg, vaccinationer och veterinärbesök för {horse.name} kommer visas här.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HorseDetails;

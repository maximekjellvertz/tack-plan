import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Calendar, Activity, FileText, Trophy, MapPin, Clock, AlertCircle, CheckCircle, Image as ImageIcon } from "lucide-react";
import { AddCompetitionToHorseDialog } from "@/components/AddCompetitionToHorseDialog";
import { AddTrainingSessionDialog } from "@/components/AddTrainingSessionDialog";
import { AddHealthLogToHorseDialog } from "@/components/AddHealthLogToHorseDialog";
import { HealthLogDetailsDialog } from "@/components/HealthLogDetailsDialog";
import { UpdateHealthLogDialog } from "@/components/UpdateHealthLogDialog";

interface Competition {
  id: number;
  name: string;
  date: string;
  location: string;
  discipline: string;
  class: string;
  notes: string;
  status: "upcoming" | "completed";
  result?: string;
}

interface TrainingSession {
  id: number;
  type: string;
  date: string;
  duration: string;
  intensity: string;
  notes: string;
}

interface HealthLog {
  id: number;
  horse: string;
  event: string;
  date: string;
  severity: string;
  status: string;
  treatment: string;
  notes: string;
  images?: string[];
}

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

  // Mock initial competitions - skulle hämtas från databas
  const [competitions, setCompetitions] = useState<Competition[]>([
    {
      id: 1,
      name: "Hopptävling Strömsholm",
      date: "2025-11-15",
      location: "Strömsholm",
      discipline: "Hoppning",
      class: "Medel A, 110 cm",
      notes: "Anmälan stänger 2025-11-10",
      status: "upcoming",
    },
    {
      id: 2,
      name: "Lokaltävling Uppsala",
      date: "2025-09-20",
      location: "Uppsala Ridcenter",
      discipline: "Hoppning",
      class: "Lätt B, 90 cm",
      notes: "",
      status: "completed",
      result: "2:a plats",
    },
  ]);

  const handleAddCompetition = (newComp: Omit<Competition, 'id' | 'status' | 'result'>) => {
    const competition: Competition = {
      ...newComp,
      id: Date.now(),
      status: new Date(newComp.date) > new Date() ? "upcoming" : "completed",
    };
    setCompetitions([competition, ...competitions]);
  };

  const upcomingCompetitions = competitions.filter(c => c.status === "upcoming");
  const completedCompetitions = competitions.filter(c => c.status === "completed");

  // Mock training sessions - skulle hämtas från databas
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([
    {
      id: 1,
      type: "Ridning",
      date: "2025-09-29",
      duration: "45 min",
      intensity: "Medel",
      notes: "Bra fokus idag, jobbade med övergångar",
    },
    {
      id: 2,
      type: "Hoppträning",
      date: "2025-09-27",
      duration: "1 timme",
      intensity: "Hög",
      notes: "Hoppade 100 cm, inga rivningar",
    },
    {
      id: 3,
      type: "Terrängriding",
      date: "2025-09-25",
      duration: "1.5 timme",
      intensity: "Lätt",
      notes: "Lugn tur i skogen, bra för återhämtning",
    },
  ]);

  const handleAddTrainingSession = (newSession: Omit<TrainingSession, 'id'>) => {
    const session: TrainingSession = {
      ...newSession,
      id: Date.now(),
    };
    setTrainingSessions([session, ...trainingSessions]);
  };

  const sortedTrainingSessions = [...trainingSessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Mock health logs - skulle hämtas från databas
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([
    {
      id: 1,
      horse: horse.name,
      event: "Munsår",
      date: "2025-09-28",
      severity: "Lätt",
      status: "Pågående",
      treatment: "Salva 2x/dag",
      notes: "Märkte vid borstning, lätt rodnad",
    },
    {
      id: 2,
      horse: horse.name,
      event: "Vaccination",
      date: "2025-09-15",
      severity: "Normal",
      status: "Klar",
      treatment: "Influensa + Stelkramp",
      notes: "Årlig vaccination utförd av veterinär",
    },
  ]);

  const handleAddHealthLog = (newLog: Omit<HealthLog, 'id' | 'date' | 'status' | 'horse'>) => {
    const log: HealthLog = {
      ...newLog,
      id: Date.now(),
      horse: horse.name,
      date: new Date().toISOString().split('T')[0],
      status: "Pågående",
    };
    setHealthLogs([log, ...healthLogs]);
  };

  const handleUpdateHealthLog = (id: number, updates: Partial<HealthLog>) => {
    setHealthLogs(healthLogs.map(log => 
      log.id === id ? { ...log, ...updates } : log
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Lätt":
        return "bg-secondary";
      case "Medel":
        return "bg-primary";
      case "Allvarlig":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pågående":
        return <Clock className="w-4 h-4" />;
      case "Klar":
        return <CheckCircle className="w-4 h-4" />;
      case "Uppmärksamhet":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const sortedHealthLogs = [...healthLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Träningshistorik</h3>
              </div>
              <AddTrainingSessionDialog horseName={horse.name} onAdd={handleAddTrainingSession} />
            </div>

            {/* Training Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Pass denna vecka</p>
                <p className="text-2xl font-bold">{trainingSessions.filter(s => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(s.date) >= weekAgo;
                }).length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Pass denna månad</p>
                <p className="text-2xl font-bold">{trainingSessions.filter(s => {
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return new Date(s.date) >= monthAgo;
                }).length}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Totalt pass</p>
                <p className="text-2xl font-bold">{trainingSessions.length}</p>
              </Card>
            </div>

            {/* Training Sessions List */}
            {sortedTrainingSessions.length > 0 ? (
              <div className="space-y-4">
                {sortedTrainingSessions.map((session) => (
                  <Card key={session.id} className="p-5 hover:shadow-elevated transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-semibold text-lg">{session.type}</h5>
                          {session.intensity && (
                            <Badge variant={
                              session.intensity === "Hög" ? "default" : 
                              session.intensity === "Medel" ? "secondary" : 
                              "outline"
                            }>
                              {session.intensity}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{session.date}</span>
                          </div>
                          {session.duration && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{session.duration}</span>
                            </div>
                          )}
                          {session.notes && (
                            <p className="text-muted-foreground mt-2">{session.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Inga träningspass än</h4>
                <p className="text-muted-foreground mb-6">
                  Börja logga träningspass för {horse.name} för att följa utveckling och planera träning.
                </p>
                <AddTrainingSessionDialog horseName={horse.name} onAdd={handleAddTrainingSession} />
              </Card>
            )}
          </TabsContent>

          <TabsContent value="competitions" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Tävlingsschema</h3>
              </div>
              <AddCompetitionToHorseDialog horseName={horse.name} onAdd={handleAddCompetition} />
            </div>

            {/* Upcoming Competitions */}
            {upcomingCompetitions.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4">Kommande tävlingar ({upcomingCompetitions.length})</h4>
                <div className="space-y-4">
                  {upcomingCompetitions.map((comp) => (
                    <Card key={comp.id} className="p-5 hover:shadow-elevated transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-lg mb-1">{comp.name}</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{comp.date}</span>
                              </div>
                              {comp.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span>{comp.location}</span>
                                </div>
                              )}
                              {comp.class && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{comp.class}</Badge>
                                  {comp.discipline && <Badge variant="outline">{comp.discipline}</Badge>}
                                </div>
                              )}
                              {comp.notes && (
                                <p className="text-muted-foreground mt-2">{comp.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Competitions */}
            {completedCompetitions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Tidigare tävlingar ({completedCompetitions.length})</h4>
                <div className="space-y-4">
                  {completedCompetitions.map((comp) => (
                    <Card key={comp.id} className="p-5 hover:shadow-elevated transition-shadow border-muted">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h5 className="font-semibold text-lg">{comp.name}</h5>
                              {comp.result && (
                                <Badge className="bg-secondary">{comp.result}</Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{comp.date}</span>
                              </div>
                              {comp.location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span>{comp.location}</span>
                                </div>
                              )}
                              {comp.class && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{comp.class}</Badge>
                                  {comp.discipline && <Badge variant="outline">{comp.discipline}</Badge>}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {competitions.length === 0 && (
              <Card className="p-12 text-center">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Inga tävlingar än</h4>
                <p className="text-muted-foreground mb-6">
                  Lägg till kommande tävlingar för {horse.name} för att planera träning och hålla koll på scheman.
                </p>
                <AddCompetitionToHorseDialog horseName={horse.name} onAdd={handleAddCompetition} />
              </Card>
            )}
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Hälsojournal</h3>
              </div>
              <AddHealthLogToHorseDialog horseName={horse.name} onAdd={handleAddHealthLog} />
            </div>

            {/* Health Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pågående</p>
                    <p className="text-2xl font-bold">
                      {healthLogs.filter(log => log.status === "Pågående").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avslutade</p>
                    <p className="text-2xl font-bold">
                      {healthLogs.filter(log => log.status === "Klar").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-secondary" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Totalt händelser</p>
                    <p className="text-2xl font-bold">{healthLogs.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
              </Card>
            </div>

            {/* Health Log Entries */}
            {sortedHealthLogs.length > 0 ? (
              <div className="space-y-4">
                {sortedHealthLogs.map((log) => (
                  <Card key={log.id} className="p-6 hover:shadow-elevated transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-foreground">{log.event}</h3>
                              <Badge className={getSeverityColor(log.severity)}>
                                {log.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {log.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="text-sm font-medium text-foreground">{log.status}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div>
                            <p className="text-sm font-medium text-foreground mb-1">Behandling:</p>
                            <p className="text-sm text-muted-foreground">{log.treatment}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground mb-1">Anteckningar:</p>
                            <p className="text-sm text-muted-foreground">{log.notes}</p>
                          </div>
                          {log.images && log.images.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Bilder ({log.images.length})
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                {log.images.map((img, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={img}
                                    alt={`${log.event} bild ${imgIndex + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-border hover:scale-105 transition-transform cursor-pointer"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:w-40">
                        <HealthLogDetailsDialog log={log} />
                        {log.status === "Pågående" && (
                          <UpdateHealthLogDialog log={log} onUpdate={handleUpdateHealthLog} />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Inga hälsohändelser än</h4>
                <p className="text-muted-foreground mb-6">
                  Börja dokumentera hälsohändelser för {horse.name} för att spåra symptom och behandlingar.
                </p>
                <AddHealthLogToHorseDialog horseName={horse.name} onAdd={handleAddHealthLog} />
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HorseDetails;

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, CheckCircle, Clock, Image as ImageIcon } from "lucide-react";
import { AddHealthLogDialog } from "@/components/AddHealthLogDialog";
import { HealthLogDetailsDialog } from "@/components/HealthLogDetailsDialog";
import { UpdateHealthLogDialog } from "@/components/UpdateHealthLogDialog";

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

const initialHealthLogs: HealthLog[] = [
  {
    id: 1,
    horse: "Thunder",
    event: "Munsår",
    date: "2025-09-28",
    severity: "Lätt",
    status: "Pågående",
    treatment: "Salva 2x/dag",
    notes: "Märkte vid borstning, lätt rodnad",
    images: ["https://images.unsplash.com/photo-1551415923-a2297c7fda79?w=400", "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=400"],
  },
  {
    id: 2,
    horse: "Storm",
    event: "Vaccination",
    date: "2025-09-25",
    severity: "Normal",
    status: "Klar",
    treatment: "Influensa + Stelkramp",
    notes: "Årlig vaccination utförd av veterinär",
  },
  {
    id: 3,
    horse: "Luna",
    event: "Hovbesiktning",
    date: "2025-09-20",
    severity: "Normal",
    status: "Klar",
    treatment: "Omskoning",
    notes: "Rutinkontroll, allt ser bra ut",
  },
  {
    id: 4,
    horse: "Thunder",
    event: "Skrubbsår",
    date: "2025-09-15",
    severity: "Medel",
    status: "Klar",
    treatment: "Rengöring + bandage 3 dagar",
    notes: "Läkt efter 1 vecka",
  },
];

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

const HealthLog = () => {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(initialHealthLogs);

  const handleAddLog = (newLog: Omit<HealthLog, 'id' | 'date' | 'status'>) => {
    const log: HealthLog = {
      ...newLog,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: "Pågående",
    };
    setHealthLogs([log, ...healthLogs]);
  };

  const handleUpdateLog = (id: number, updates: Partial<HealthLog>) => {
    setHealthLogs(healthLogs.map(log => 
      log.id === id ? { ...log, ...updates } : log
    ));
  };

  const ongoingCount = healthLogs.filter(log => log.status === "Pågående").length;
  const completedCount = healthLogs.filter(log => log.status === "Klar").length;
  const attentionCount = healthLogs.filter(log => log.status === "Uppmärksamhet").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Hälsologg</h1>
            <p className="text-muted-foreground">
              Dokumentera och följ upp dina hästars hälsa
            </p>
          </div>
          <AddHealthLogDialog onAdd={handleAddLog} />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pågående</p>
                <p className="text-3xl font-bold text-foreground">{ongoingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avslutade</p>
                <p className="text-3xl font-bold text-foreground">{completedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Uppföljning</p>
                <p className="text-3xl font-bold text-foreground">{attentionCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </Card>
        </div>

        {/* Log Entries */}
        <div className="space-y-4">
          {healthLogs.map((log) => (
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
                        {log.horse} • {log.date}
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
                    <UpdateHealthLogDialog log={log} onUpdate={handleUpdateLog} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <div className="flex gap-4">
            <FileText className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Tips för bra dokumentation
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fotografera alltid symptomen för framtida jämförelse</li>
                <li>• Notera exakt plats på kroppen och svårighetsgrad</li>
                <li>• Dokumentera vilken behandling som användes och resultatet</li>
                <li>• Följ upp efter några dagar för att se förändring</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HealthLog;

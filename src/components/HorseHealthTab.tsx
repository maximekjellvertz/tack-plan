import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Clock, AlertCircle, CheckCircle, Image as ImageIcon } from "lucide-react";
import { AddHealthLogToHorseDialog } from "@/components/AddHealthLogToHorseDialog";
import { HealthLogDetailsDialog } from "@/components/HealthLogDetailsDialog";
import { UpdateHealthLogDialog } from "@/components/UpdateHealthLogDialog";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { StatsCard } from "@/components/StatsCard";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface HealthLog {
  id: string;
  horse_name: string;
  event: string;
  created_at: string;
  severity: string;
  status: string;
  treatment: string;
  notes: string | null;
  images: any;
}

interface HorseHealthTabProps {
  horseName: string;
  horseId?: string;
  healthLogs: HealthLog[];
  loadingHealthLogs: boolean;
  onAddHealthLog: (log: any) => void;
  onUpdateHealthLog: (id: string, updates: Partial<HealthLog>) => void;
  onDeleteHealthLog: (id: string) => void;
}

export const HorseHealthTab = ({
  horseName,
  horseId,
  healthLogs,
  loadingHealthLogs,
  onAddHealthLog,
  onUpdateHealthLog,
  onDeleteHealthLog,
}: HorseHealthTabProps) => {
  const [selectedLog, setSelectedLog] = useState<HealthLog | null>(null);
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null);

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
        return <Heart className="w-4 h-4" />;
    }
  };

  const sortedHealthLogs = [...healthLogs].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (loadingHealthLogs) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">Hälsologg</h3>
        </div>
        <AddHealthLogToHorseDialog horseName={horseName} horseId={horseId} onAdd={onAddHealthLog} />
      </div>

      {sortedHealthLogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Pågående"
            value={healthLogs.filter(log => log.status === "Pågående").length}
            icon={Clock}
            gradient="from-primary/20 to-primary/5"
            delay={0}
          />
          <StatsCard
            title="Klara"
            value={healthLogs.filter(log => log.status === "Klar").length}
            icon={CheckCircle}
            gradient="from-secondary/20 to-secondary/5"
            delay={100}
          />
          <StatsCard
            title="Uppmärksamhet"
            value={healthLogs.filter(log => log.status === "Uppmärksamhet").length}
            icon={AlertCircle}
            gradient="from-destructive/20 to-destructive/5"
            delay={200}
          />
        </div>
      )}

      {sortedHealthLogs.length > 0 ? (
        <div className="space-y-4">
          {sortedHealthLogs.map((log, index) => (
            <Card
              key={log.id}
              className="p-5 hover:shadow-elevated transition-all cursor-pointer animate-fade-in hover-scale"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className={`w-12 h-12 ${getSeverityColor(log.severity)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-lg mb-1">{log.event}</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(log.created_at), "PPP", { locale: sv })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getStatusIcon(log.status)}
                          {log.status}
                        </Badge>
                        {log.images && log.images.length > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {log.images.length}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        <strong>Behandling:</strong> {log.treatment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          icon={Heart}
          title="Inga hälsoanteckningar än"
          motivationalText="En frisk häst är en lycklig häst"
          description={`Börja logga hälsohändelser för ${horseName} för att hålla koll på veterinärbesök och behandlingar.`}
          action={<AddHealthLogToHorseDialog horseName={horseName} horseId={horseId} onAdd={onAddHealthLog} />}
        />
      )}

      {selectedLog && (
        <HealthLogDetailsDialog
          log={selectedLog}
          onDelete={onDeleteHealthLog}
        />
      )}

      {editingLog && (
        <UpdateHealthLogDialog
          log={editingLog}
          onUpdate={onUpdateHealthLog}
        />
      )}
    </div>
  );
};
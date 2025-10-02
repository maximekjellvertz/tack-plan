import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, Clock } from "lucide-react";
import { AddTrainingSessionDialog } from "@/components/AddTrainingSessionDialog";

interface TrainingSession {
  id: number;
  type: string;
  date: string;
  duration: string;
  intensity: string;
  notes: string;
}

interface HorseTrainingTabProps {
  horseName: string;
  trainingSessions: TrainingSession[];
  sortedTrainingSessions: TrainingSession[];
  onAddTrainingSession: (session: any) => void;
}

export const HorseTrainingTab = ({
  horseName,
  trainingSessions,
  sortedTrainingSessions,
  onAddTrainingSession,
}: HorseTrainingTabProps) => {
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "Lätt":
        return "bg-secondary";
      case "Medel":
        return "bg-primary";
      case "Hög":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">Träningspass</h3>
        </div>
        <AddTrainingSessionDialog horseName={horseName} onAdd={onAddTrainingSession} />
      </div>

      {sortedTrainingSessions.length > 0 ? (
        <div className="space-y-4">
          {sortedTrainingSessions.map((session, index) => (
            <Card
              key={session.id}
              className="p-5 hover:shadow-elevated transition-all animate-fade-in hover-scale"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-lg mb-1">{session.type}</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration}</span>
                      </div>
                      <Badge variant="outline" className={getIntensityColor(session.intensity)}>
                        {session.intensity}
                      </Badge>
                      {session.notes && (
                        <p className="text-muted-foreground mt-2">{session.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center animate-fade-in">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-xl font-semibold mb-2">Inga träningspass än</h4>
          <p className="text-muted-foreground mb-2">
            Det du skriver idag blir värdefull kunskap i morgon.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Börja logga träningspass för {horseName} för att följa utveckling och planera framåt.
          </p>
          <AddTrainingSessionDialog horseName={horseName} onAdd={onAddTrainingSession} />
        </Card>
      )}
    </div>
  );
};
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, Clock } from "lucide-react";
import { AddTrainingSessionDialog } from "@/components/AddTrainingSessionDialog";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { StatsCard } from "@/components/StatsCard";

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

      {sortedTrainingSessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Pass denna vecka"
            value={trainingSessions.filter(s => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(s.date) >= weekAgo;
            }).length}
            icon={Activity}
            gradient="from-primary/20 to-primary/5"
            delay={0}
          />
          <StatsCard
            title="Pass denna månad"
            value={trainingSessions.filter(s => {
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return new Date(s.date) >= monthAgo;
            }).length}
            icon={Calendar}
            gradient="from-secondary/20 to-secondary/5"
            delay={100}
          />
          <StatsCard
            title="Totalt pass"
            value={trainingSessions.length}
            icon={Clock}
            gradient="from-accent/20 to-accent/5"
            delay={200}
          />
        </div>
      )}

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
        <EmptyStateCard
          icon={Activity}
          title="Inga träningspass än"
          motivationalText="Det du skriver idag blir värdefull kunskap i morgon"
          description={`Börja logga träningspass för ${horseName} för att följa utveckling och planera framåt.`}
          action={<AddTrainingSessionDialog horseName={horseName} onAdd={onAddTrainingSession} />}
        />
      )}
    </div>
  );
};
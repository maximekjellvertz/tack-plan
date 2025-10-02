import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, MapPin, Trash2 } from "lucide-react";
import { AddCompetitionToHorseDialog } from "@/components/AddCompetitionToHorseDialog";
import { EmptyStateCard } from "@/components/EmptyStateCard";

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

interface HorseCompetitionsTabProps {
  horseName: string;
  competitions: Competition[];
  upcomingCompetitions: Competition[];
  completedCompetitions: Competition[];
  onAddCompetition: (comp: any) => void;
  onDeleteCompetition?: (id: number, date: string) => void;
}

export const HorseCompetitionsTab = ({
  horseName,
  competitions,
  upcomingCompetitions,
  completedCompetitions,
  onAddCompetition,
  onDeleteCompetition,
}: HorseCompetitionsTabProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">Tävlingar</h3>
        </div>
        <AddCompetitionToHorseDialog horseName={horseName} onAdd={onAddCompetition} />
      </div>

      {/* Upcoming Competitions */}
      {upcomingCompetitions.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4">Kommande tävlingar ({upcomingCompetitions.length})</h4>
          <div className="space-y-4">
            {upcomingCompetitions.map((comp, index) => (
              <Card
                key={comp.id}
                className="p-5 hover:shadow-elevated transition-all animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 50}ms` }}
              >
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
                  {onDeleteCompetition && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCompetition(comp.id, comp.date)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
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
            {completedCompetitions.map((comp, index) => (
              <Card
                key={comp.id}
                className="p-5 hover:shadow-elevated transition-all border-muted animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 50}ms` }}
              >
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
                  {onDeleteCompetition && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCompetition(comp.id, comp.date)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {competitions.length === 0 && (
        <EmptyStateCard
          icon={Trophy}
          title="Inga tävlingar än"
          motivationalText="Varje resa börjar med ett första steg"
          description={`Lägg till kommande tävlingar för ${horseName} för att planera träning och hålla koll på scheman.`}
          action={<AddCompetitionToHorseDialog horseName={horseName} onAdd={onAddCompetition} />}
        />
      )}
    </div>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Search } from "lucide-react";
import { CompetitionDetailsDialog } from "./CompetitionDetailsDialog";
import { AddCompetitionDialog } from "./AddCompetitionDialog";
import { useState } from "react";

interface Competition {
  id: string | number;
  name: string;
  date: string;
  location: string;
  discipline: string;
  district?: string;
  height?: string;
  status?: string;
  time?: string;
  classes?: any[];
  registration_status?: string;
}

interface CompetitionsPlanningTabProps {
  competitions: Competition[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddToCalendar: (competition: Competition) => void;
  onAddCompetition: (competition: any) => void;
}

export function CompetitionsPlanningTab({
  competitions,
  searchTerm,
  onSearchChange,
  onAddToCalendar,
  onAddCompetition,
}: CompetitionsPlanningTabProps) {
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  const filteredCompetitions = competitions.filter(
    (comp) =>
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.discipline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Sök tävlingar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <AddCompetitionDialog onAdd={onAddCompetition} />
      </div>

      <div className="grid gap-4">
        {filteredCompetitions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>Inga tävlingar hittades</p>
            </CardContent>
          </Card>
        ) : (
          filteredCompetitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{competition.name}</CardTitle>
                    <Badge variant="secondary">{competition.discipline}</Badge>
                  </div>
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(competition.date).toLocaleDateString("sv-SE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {competition.time && ` • ${competition.time}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{competition.location}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => onAddToCalendar(competition)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Lägg till i kalender
                    </Button>
                    <Button
                      onClick={() => setSelectedCompetition(competition)}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      Visa detaljer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedCompetition && (
        <CompetitionDetailsDialog
          competition={selectedCompetition}
          open={!!selectedCompetition}
          onOpenChange={(open) => !open && setSelectedCompetition(null)}
        />
      )}
    </div>
  );
}

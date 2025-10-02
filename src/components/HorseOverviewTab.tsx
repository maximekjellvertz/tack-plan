import { Card } from "@/components/ui/card";
import { EditHorseInfoDialog } from "@/components/EditHorseInfoDialog";
import { EditHorseStatsDialog } from "@/components/EditHorseStatsDialog";

interface Horse {
  id: string;
  name: string;
  breed: string;
  age: number;
  discipline: string;
  level: string;
  color: string;
  registration_number?: string | null;
  microchip?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  competitions_this_year?: number | null;
  placements?: number | null;
  training_sessions?: number | null;
  vet_visits?: number | null;
}

interface HorseOverviewTabProps {
  horse: Horse;
  onUpdate: () => void;
}

export const HorseOverviewTab = ({ horse, onUpdate }: HorseOverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Card className="p-6 hover-scale" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Grundläggande information</h3>
          <EditHorseInfoDialog
            horseId={horse.id}
            currentData={{
              registration_number: horse.registration_number,
              microchip: horse.microchip,
              birth_date: horse.birth_date,
              gender: horse.gender,
            }}
            onUpdate={onUpdate}
          />
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Registreringsnummer</p>
            <p className="font-medium">{horse.registration_number || "Ej angivet"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mikrochip</p>
            <p className="font-medium">{horse.microchip || "Ej angivet"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Födelsedatum</p>
            <p className="font-medium">{horse.birth_date || "Ej angivet"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kön</p>
            <p className="font-medium">{horse.gender || "Ej angivet"}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 hover-scale" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Statistik</h3>
          <EditHorseStatsDialog
            horseId={horse.id}
            currentData={{
              competitions_this_year: horse.competitions_this_year,
              placements: horse.placements,
              training_sessions: horse.training_sessions,
              vet_visits: horse.vet_visits,
            }}
            onUpdate={onUpdate}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-primary">{horse.competitions_this_year || 0}</p>
            <p className="text-sm text-muted-foreground">Tävlingar i år</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-secondary">{horse.placements || 0}</p>
            <p className="text-sm text-muted-foreground">Placeringar</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-primary">{horse.training_sessions || 0}</p>
            <p className="text-sm text-muted-foreground">Träningspass</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-destructive">{horse.vet_visits || 0}</p>
            <p className="text-sm text-muted-foreground">Veterinärbesök</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HorseImageUpload } from "./HorseImageUpload";

interface HorseHeaderProps {
  horse: {
    id: string;
    name: string;
    level: string;
    breed: string;
    age: number;
    discipline: string;
    color: string;
    image_url?: string | null;
  };
  onUpdate?: () => void;
}

export const HorseHeader = ({ horse, onUpdate }: HorseHeaderProps) => {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-start gap-6">
        <div className="relative w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center hover-scale overflow-hidden">
          {horse.image_url ? (
            <img
              src={horse.image_url}
              alt={horse.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Heart className="w-16 h-16 text-primary/40" />
          )}
          {onUpdate && (
            <HorseImageUpload
              horseId={horse.id}
              currentImageUrl={horse.image_url}
              onImageUpdated={onUpdate}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground">{horse.name}</h1>
            <Badge variant="secondary">{horse.level}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <p className="text-sm text-muted-foreground">Ras</p>
              <p className="font-medium">{horse.breed}</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <p className="text-sm text-muted-foreground">Ålder</p>
              <p className="font-medium">{horse.age} år</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
              <p className="text-sm text-muted-foreground">Gren</p>
              <p className="font-medium">{horse.discipline}</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
              <p className="text-sm text-muted-foreground">Färg</p>
              <p className="font-medium">{horse.color}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
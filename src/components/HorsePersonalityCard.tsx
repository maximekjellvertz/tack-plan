import { Card } from "@/components/ui/card";
import { Heart, Smile, Zap, Star, Sparkles } from "lucide-react";
import { EditHorsePersonalityDialog } from "./EditHorsePersonalityDialog";

interface HorsePersonalityCardProps {
  horseId: string;
  horseName: string;
  breed: string;
  level: string;
  personalityTrait?: string | null;
  funFact?: string | null;
  onUpdate: () => void;
}

const personalityMap: { [key: string]: { trait: string; icon: any; description: string; color: string } } = {
  brave: {
    trait: "Modig",
    icon: Zap,
    description: "Älskar utmaningar och nya äventyr",
    color: "from-orange-500/20 to-orange-600/20 text-orange-600"
  },
  loving: {
    trait: "Kärleksfull",
    icon: Heart,
    description: "Vill alltid vara nära sina favoritmänniskor",
    color: "from-pink-500/20 to-pink-600/20 text-pink-600"
  },
  playful: {
    trait: "Lekfull",
    icon: Smile,
    description: "Ser möjligheter till lek överallt",
    color: "from-blue-500/20 to-blue-600/20 text-blue-600"
  },
  ambitious: {
    trait: "Ambitiös",
    icon: Star,
    description: "Strävar alltid efter att göra sitt bästa",
    color: "from-purple-500/20 to-purple-600/20 text-purple-600"
  },
  calm: {
    trait: "Lugn",
    icon: Heart,
    description: "Behåller sinneslugnet i alla situationer",
    color: "from-green-500/20 to-green-600/20 text-green-600"
  },
  energetic: {
    trait: "Energisk",
    icon: Zap,
    description: "Alltid redo för action",
    color: "from-yellow-500/20 to-yellow-600/20 text-yellow-600"
  },
  curious: {
    trait: "Nyfiken",
    icon: Sparkles,
    description: "Vill utforska allt och alla",
    color: "from-cyan-500/20 to-cyan-600/20 text-cyan-600"
  },
  gentle: {
    trait: "Mild",
    icon: Heart,
    description: "Extra försiktig och ömsint",
    color: "from-rose-500/20 to-rose-600/20 text-rose-600"
  }
};

export const HorsePersonalityCard = ({ 
  horseId, 
  horseName, 
  breed, 
  level,
  personalityTrait,
  funFact,
  onUpdate
}: HorsePersonalityCardProps) => {
  // Check if it's a predefined personality or custom one
  const isPredefined = personalityTrait && personalityMap[personalityTrait];
  
  const personality = isPredefined
    ? personalityMap[personalityTrait]
    : {
        trait: personalityTrait || "Personlighet",
        icon: Sparkles,
        description: personalityTrait ? "Egen personlighet" : "Lägg till personlighetsdrag för din häst",
        color: "from-primary/20 to-secondary/20 text-primary"
      };
  
  const Icon = personality.icon;
  const hasData = personalityTrait || funFact;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/20 hover-scale animate-fade-in">
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${personality.color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">Personlighet</h3>
              <span className="text-2xl">✨</span>
            </div>
            <EditHorsePersonalityDialog
              horseId={horseId}
              currentPersonalityTrait={personalityTrait}
              currentFunFact={funFact}
              onUpdate={onUpdate}
            />
          </div>
          
          {hasData ? (
            <>
              {personalityTrait && (
                <>
                  <p className="text-sm text-primary font-semibold mb-1">{personality.trait}</p>
                  <p className="text-sm text-muted-foreground mb-3">{personality.description}</p>
                </>
              )}
              {funFact && (
                <div className={personalityTrait ? "pt-3 border-t border-border" : ""}>
                  <p className="text-xs text-muted-foreground mb-1">Visste du att {horseName}...</p>
                  <p className="text-sm text-foreground italic">{funFact} 🎯</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Klicka på "Redigera" för att lägga till personlighet och kul fakta om {horseName}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

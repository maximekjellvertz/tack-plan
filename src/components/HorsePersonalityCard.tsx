import { Card } from "@/components/ui/card";
import { Heart, Smile, Zap, Star } from "lucide-react";

interface HorsePersonalityCardProps {
  horseName: string;
  breed: string;
  level: string;
}

const personalities = [
  {
    trait: "Modig",
    icon: Zap,
    description: "Älskar utmaningar och nya äventyr",
    color: "from-orange-500/20 to-orange-600/20 text-orange-600"
  },
  {
    trait: "Kärleksfull",
    icon: Heart,
    description: "Vill alltid vara nära sina favoritmänniskor",
    color: "from-pink-500/20 to-pink-600/20 text-pink-600"
  },
  {
    trait: "Lekfull",
    icon: Smile,
    description: "Ser möjligheter till lek överallt",
    color: "from-blue-500/20 to-blue-600/20 text-blue-600"
  },
  {
    trait: "Ambitiös",
    icon: Star,
    description: "Strävar alltid efter att göra sitt bästa",
    color: "from-purple-500/20 to-purple-600/20 text-purple-600"
  }
];

const funFacts = [
  "kan känna av ditt humör innan du ens säger något",
  "har en hemlängtan till morgonrutinen",
  "älskar att imponera på publik",
  "har ett extra mjukt hjärta för barn",
  "blir extra energisk av regn",
  "tycker om att vara i centrum",
  "är nyfiken på allt nytt",
  "har en favorit äpple-smak"
];

export const HorsePersonalityCard = ({ horseName, breed, level }: HorsePersonalityCardProps) => {
  // Generate consistent personality based on horse name
  const nameHash = horseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const personality = personalities[nameHash % personalities.length];
  const funFact = funFacts[nameHash % funFacts.length];
  const Icon = personality.icon;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/20 hover-scale animate-fade-in">
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${personality.color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-foreground">Personlighet</h3>
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-sm text-primary font-semibold mb-1">{personality.trait}</p>
          <p className="text-sm text-muted-foreground mb-3">{personality.description}</p>
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Visste du att {horseName}...</p>
            <p className="text-sm text-foreground italic">{funFact}? 🎯</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

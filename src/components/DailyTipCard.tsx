import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const tips = [
  "En glad häst är en produktiv häst - ta tid för lek och belöningar!",
  "Kom ihåg: små framsteg varje dag leder till stora resultat!",
  "Träning + vila = framgång. Glöm inte återhämtningen!",
  "Dokumentera din resa - du kommer vara glad över att se tillbaka!",
  "En stark grund börjar med tillit. Bygg relationen först!",
  "Varje häst är unik - lyssna på vad din häst behöver idag.",
  "Fira de små vinsterna! Varje steg framåt räknas.",
  "Rutiner skapar trygghet - men var inte rädd för att prova nytt!",
  "En bra ryttare lyssnar mer än vad de talar.",
  "Glädje i träningen = glädje i tävlingen!",
  "Uthållighet slår talent när talangen inte tränar.",
  "Din hästs hälsa är viktigast - lyssna på kroppens signaler.",
  "Varje misstag är en lärdom i förklädnad.",
  "Framgång mäts inte bara i placeringar, utan i samarbete.",
  "Ta en dag i taget - resan är lika viktig som målet!"
];

export const DailyTipCard = () => {
  const [tip, setTip] = useState("");

  useEffect(() => {
    // Get tip based on day of year for consistent daily tips
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTip(tips[dayOfYear % tips.length]);
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20 hover-scale animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Dagens tips</h3>
            <p className="text-xs text-muted-foreground">Inspiration för dagen</p>
          </div>
        </div>
        <p className="text-foreground/90 leading-relaxed italic">
          "{tip}"
        </p>
      </div>
    </Card>
  );
};

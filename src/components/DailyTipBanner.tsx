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

export const DailyTipBanner = () => {
  const [tip, setTip] = useState("");

  useEffect(() => {
    // Get tip based on day of year for consistent daily tips
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTip(tips[dayOfYear % tips.length]);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 border border-primary/20 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
      <div className="relative px-6 py-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center animate-pulse flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary mb-0.5">Dagens tips</p>
          <p className="text-foreground/90 italic text-sm md:text-base leading-relaxed">
            "{tip}"
          </p>
        </div>
      </div>
    </div>
  );
};

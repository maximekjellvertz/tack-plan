import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka
          </Button>
          <h1 className="text-4xl font-bold">Om Hoofprints</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none space-y-8">
          {/* Min resa med hästar */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Min resa med hästar</h2>
            <p className="text-muted-foreground leading-relaxed">
              Jag har tävlat på elitnivå och tagit mig hela vägen till internationell U25 Grand Prix. 
              Men trots meriterna på banan har en av de största stressfaktorerna för mig aldrig varit 
              själva ridningen – utan rädslan att glömma något viktigt.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Alla som håller på med hästar vet hur mycket det är att hålla reda på: hovslagare, 
              vaccinationer, träningar, tävlingar, små förändringar i hästens beteende eller hälsa. 
              Ofta är det just detaljerna som gör skillnad.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Jag har själv stått där när en häst blivit sjuk och jag desperat försökt minnas: 
              "Hur var det sist han fick eksem? Vad gjorde jag då? När var det egentligen?" – 
              och svaret blev bara gissningar. Men egentligen behöver vi exakta svar för att ta hand 
              om våra hästar på bästa sätt.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Jag är inte uppväxt i en hästfamilj, vilket gjort att jag fått lära mig allt själv: 
              termer, behandlingar, rutiner. På många sätt har det varit en styrka – jag har lärt 
              mig massor – men det har också inneburit att jag ofta burit allt ansvar och kunskap 
              i huvudet.
            </p>
          </section>

          {/* Varför Hoofprints? */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Varför Hoofprints?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Jag vet att jag inte är ensam. Därför föddes idén till Hoofprints: ett verktyg som 
              tar bort stressen, samlar all information och gör det enkelt att se samband mellan 
              hästens mående, träning och tävlingar.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Med Hoofprints kan du dokumentera och följa din hästs resa dag för dag – och när 
              något händer kan du gå tillbaka och se exakt vad som gjordes förra gången. Ett 
              digitalt minne som alltid finns där, så att du kan fokusera på det viktigaste: 
              din häst och ridningen.
            </p>
          </section>

          {/* Vår vision */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Vår vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hoofprints handlar inte bara om struktur – det handlar om relationen mellan ryttare 
              och häst. Min vision är att skapa världens bästa digitala stallbok: en plats där 
              hästägare kan samla allt på ett ställe, bygga trygghet i vardagen och fira framsteg 
              på vägen mot sina mål.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Det här är bara början. Hoofprints kommer fortsätta utvecklas tillsammans med ryttare, 
              tränare och hästälskare – för att verkligen bli det verktyg vi alla saknat.
            </p>
          </section>

          {/* CTA */}
          <div className="pt-8 text-center">
            <Button 
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-lg px-8 py-6"
            >
              Kom igång gratis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

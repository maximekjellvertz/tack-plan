import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import heroHorse from "@/assets/hero-horse.jpg";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${heroHorse})` }}
      />
      
      {/* Header with back button */}
      <div className="border-b bg-card/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Om Hoofprints
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10 flex-1">
        <div className="space-y-8 animate-fade-in">
          {/* Min resa med hästar */}
          <section className="bg-card/90 backdrop-blur-sm p-8 rounded-xl border shadow-lg space-y-4">
            <h2 className="text-3xl font-bold text-foreground mb-6">Min resa med hästar</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Jag har tävlat på elitnivå och tagit mig hela vägen till internationell U25 Grand Prix. 
              Men trots meriterna på banan har en av de största stressfaktorerna för mig aldrig varit 
              själva ridningen – utan rädslan att glömma något viktigt.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Alla som håller på med hästar vet hur mycket det är att hålla reda på: hovslagare, 
              vaccinationer, träningar, tävlingar, små förändringar i hästens beteende eller hälsa. 
              Ofta är det just detaljerna som gör skillnad.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Jag har själv stått där när en häst blivit sjuk och jag desperat försökt minnas: 
              "Hur var det sist han fick eksem? Vad gjorde jag då? När var det egentligen?" – 
              och svaret blev bara gissningar. Men egentligen behöver vi exakta svar för att ta hand 
              om våra hästar på bästa sätt.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Jag är inte uppväxt i en hästfamilj, vilket gjort att jag fått lära mig allt själv: 
              termer, behandlingar, rutiner. På många sätt har det varit en styrka – jag har lärt 
              mig massor – men det har också inneburit att jag ofta burit allt ansvar och kunskap 
              i huvudet.
            </p>
          </section>

          {/* Varför Hoofprints? */}
          <section className="bg-card/90 backdrop-blur-sm p-8 rounded-xl border shadow-lg space-y-4">
            <h2 className="text-3xl font-bold text-foreground mb-6">Varför Hoofprints?</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Jag vet att jag inte är ensam. Därför föddes idén till Hoofprints: ett verktyg som 
              tar bort stressen, samlar all information och gör det enkelt att se samband mellan 
              hästens mående, träning och tävlingar.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Med Hoofprints kan du dokumentera och följa din hästs resa dag för dag – och när 
              något händer kan du gå tillbaka och se exakt vad som gjordes förra gången. Ett 
              digitalt minne som alltid finns där, så att du kan fokusera på det viktigaste: 
              din häst och ridningen.
            </p>
          </section>

          {/* Vår vision */}
          <section className="bg-card/90 backdrop-blur-sm p-8 rounded-xl border shadow-lg space-y-4">
            <h2 className="text-3xl font-bold text-foreground mb-6">Vår vision</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Hoofprints handlar inte bara om struktur – det handlar om relationen mellan ryttare 
              och häst. Min vision är att skapa världens bästa digitala stallbok: en plats där 
              hästägare kan samla allt på ett ställe, bygga trygghet i vardagen och fira framsteg 
              på vägen mot sina mål.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Det här är bara början. Hoofprints kommer fortsätta utvecklas tillsammans med ryttare, 
              tränare och hästälskare – för att verkligen bli det verktyg vi alla saknat.
            </p>
          </section>

          {/* CTA */}
          <div className="pt-8 text-center">
            <Button 
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Kom igång gratis
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;

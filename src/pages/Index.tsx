import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Footer from "@/components/Footer";
import heroHorse from "@/assets/hero-horse.jpg";
import { Heart, Calendar, FileText, Target, Award, Users, CheckCircle2, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: "Hästprofiler",
      description: "Skapa detaljerade profiler för varje häst med all viktig information på ett ställe"
    },
    {
      icon: Calendar,
      title: "Tävlingskalender",
      description: "Sök och filtrera tävlingar, planera din säsong och håll koll på viktiga datum"
    },
    {
      icon: FileText,
      title: "Hälsologg",
      description: "Dokumentera symptom, behandlingar och veterinärbesök för att ha fullständig historik"
    },
    {
      icon: Target,
      title: "Mål & Milstolpar",
      description: "Sätt mål och följ framsteg, fira varje framgång i din hästs utveckling"
    },
    {
      icon: Award,
      title: "Tjäna Badges",
      description: "Få belöningar för träning, tävlingar och engagemang i din hästs välfärd"
    },
    {
      icon: Users,
      title: "Dela åtkomst",
      description: "Ge tränare, veterinärer eller familj tillgång att följa med och hjälpa till"
    }
  ];

  const benefits = [
    "Allt på ett ställe - ingen mer pappershantering",
    "Påminnelser så du aldrig missar något viktigt",
    "Följ träningsframsteg och hälsoutveckling över tid",
    "Dela information enkelt med andra inblandade",
    "Gratis att komma igång - betala bara om du behöver mer"
  ];

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroHorse})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        
        {/* Login Button - Top Right */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
          <Button 
            onClick={() => navigate("/auth")}
            size="sm"
            variant="ghost"
            className="bg-white/90 backdrop-blur-sm text-foreground hover:bg-white md:h-11 md:px-8"
          >
            Logga in
          </Button>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4 animate-fade-in">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-primary font-semibold">Välkommen till Hoofprints</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg animate-fade-in">
              Every horse writes a story, we're here to keep it
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-md animate-fade-in" style={{ animationDelay: "100ms" }}>
              Den kompletta plattformen för att hantera dina hästars hälsa, träning, tävlingar och mål. Allt du behöver på ett ställe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <Button 
                onClick={() => navigate("/auth")}
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
              >
                Kom igång gratis
              </Button>
              <Button 
                onClick={() => navigate("/about")}
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                Läs mer om oss
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Allt du behöver för din häst
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Hoofprints ger dig verktygen för att ge din häst bästa möjliga vård och utveckling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="p-6 md:p-8 hover-scale animate-fade-in bg-gradient-to-br from-card to-muted/30"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <feature.icon className="w-12 h-12 text-primary relative" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Varför välja Hoofprints?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Vi gör det enkelt att ha full kontroll över din hästs välmående och utveckling. Spara tid, håll ordning och fokusera på det som verkligen betyder något.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-foreground text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <Card className="p-8 md:p-10 relative bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="space-y-6">
                  <div>
                    <p className="text-4xl md:text-5xl font-bold text-primary mb-2">100%</p>
                    <p className="text-muted-foreground">Gratis att komma igång</p>
                  </div>
                  <div>
                    <p className="text-4xl md:text-5xl font-bold text-primary mb-2">∞</p>
                    <p className="text-muted-foreground">Obegränsat antal hästar</p>
                  </div>
                  <div>
                    <p className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</p>
                    <p className="text-muted-foreground">Tillgängligt när du behöver det</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Redo att börja skriva din hästs historia?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Skapa ditt konto idag och börja organisera allt som rör dina hästar. Det är helt gratis att komma igång.
          </p>
          <Button 
            onClick={() => navigate("/auth")}
            size="lg"
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
          >
            Kom igång nu - helt gratis
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

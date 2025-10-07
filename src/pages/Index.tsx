import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import heroHorse from "@/assets/hero-horse.jpg";
import { Heart, Calendar, FileText, Target, Award, Trophy, CheckCircle2, Sparkles, TrendingUp, Activity, Bell } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { ProgressRing } from "@/components/ProgressRing";
import { Progress } from "@/components/ui/progress";
import { LandingNav } from "@/components/LandingNav";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background">
      <LandingNav />
      
      {/* Hero Section */}
      <section id="hero" className="relative min-h-[600px] md:min-h-[700px] flex items-center pt-16 md:pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroHorse})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        
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

      {/* Dashboard Preview Section */}
      <section id="dashboard" className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Din översikt på en minut
            </h2>
            <p className="text-lg text-muted-foreground">
              Så här ser din dashboard ut när du loggat in
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Hästar"
              value={3}
              icon={Heart}
              trend="neutral"
              gradient="from-primary/20 to-primary/10"
              delay={0}
            />
            <StatsCard
              title="Tävlingar"
              value={12}
              icon={Trophy}
              trend="up"
              gradient="from-secondary/20 to-secondary/10"
              delay={100}
            />
            <StatsCard
              title="Hälsologgar"
              value={8}
              icon={FileText}
              trend="neutral"
              gradient="from-accent/20 to-accent/10"
              delay={200}
            />
            <StatsCard
              title="Märken"
              value={5}
              icon={Award}
              trend="up"
              gradient="from-primary/20 to-primary/10"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Horse Profile Preview */}
      <section id="horses" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Komplett hästprofil
            </h2>
            <p className="text-lg text-muted-foreground">
              All information om din häst samlas på ett ställe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Horse Card 1 */}
            <Card className="overflow-hidden hover-scale animate-fade-in">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                <Heart className="w-24 h-24 text-primary/40" />
                <div className="absolute top-4 right-4 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
                  <div className="relative w-[60px] h-[60px]">
                    <ProgressRing progress={75} size={60} strokeWidth={4} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="relative w-[60px] h-[60px]">
                    <ProgressRing progress={90} size={60} strokeWidth={4} color="hsl(var(--secondary))" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Fiona</h3>
                    <p className="text-sm text-muted-foreground">Svensk Varmblod</p>
                  </div>
                  <Badge variant="secondary">M-nivå</Badge>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ålder:</span>
                    <span className="font-medium">8 år</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gren:</span>
                    <span className="font-medium">Dressyr</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Example Horse Card 2 */}
            <Card className="overflow-hidden hover-scale animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="h-48 bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center relative">
                <Heart className="w-24 h-24 text-secondary/40" />
                <div className="absolute top-4 right-4 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
                  <div className="relative w-[60px] h-[60px]">
                    <ProgressRing progress={60} size={60} strokeWidth={4} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="relative w-[60px] h-[60px]">
                    <ProgressRing progress={95} size={60} strokeWidth={4} color="hsl(var(--secondary))" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Thunder</h3>
                    <p className="text-sm text-muted-foreground">Hannoveraner</p>
                  </div>
                  <Badge variant="secondary">L-nivå</Badge>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ålder:</span>
                    <span className="font-medium">6 år</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gren:</span>
                    <span className="font-medium">Hoppning</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Example Horse Card 3 */}
            <Card className="overflow-hidden hover-scale animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="h-48 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative">
                <Heart className="w-24 h-24 text-accent/40" />
                <div className="absolute top-4 right-4 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
                  <div className="relative w-[60px] h-[60px]">
                    <ProgressRing progress={85} size={60} strokeWidth={4} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="relative w-[60px] h-[60px]">
                    <ProgressRing progress={88} size={60} strokeWidth={4} color="hsl(var(--secondary))" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Luna</h3>
                    <p className="text-sm text-muted-foreground">New Forest Ponny</p>
                  </div>
                  <Badge variant="secondary">A-nivå</Badge>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ålder:</span>
                    <span className="font-medium">12 år</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gren:</span>
                    <span className="font-medium">Allround</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Goals Preview */}
      <section id="goals" className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sätt mål och följ framsteg
            </h2>
            <p className="text-lg text-muted-foreground">
              Håll koll på din hästs utveckling mot era gemensamma mål
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {/* Example Goal Card */}
            <Card className="p-6 hover-scale animate-fade-in bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold">Tävla på L-nivå</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Förbereda för första L-tävlingen i dressyr
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Tävling</Badge>
                    <Badge variant="outline">Måldatum: 2025-06-15</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Framsteg</span>
                  <span className="font-semibold">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section id="features" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Och mycket mer...
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Tävlingskalender</h3>
              <p className="text-muted-foreground">Sök och planera alla dina tävlingar</p>
            </Card>
            <Card className="p-6 text-center">
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Hälsologg</h3>
              <p className="text-muted-foreground">Dokumentera behandlingar och veterinärbesök</p>
            </Card>
            <Card className="p-6 text-center">
              <Bell className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Påminnelser</h3>
              <p className="text-muted-foreground">Glöm aldrig viktiga datum och uppgifter</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Varför välja Hoofprints?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-5xl font-bold text-primary mb-2">100%</div>
              <p className="text-lg font-semibold mb-2">Gratis att komma igång</p>
              <p className="text-muted-foreground">Ingen bindningstid eller dolda avgifter</p>
            </Card>
            <Card className="p-8 text-center bg-gradient-to-br from-secondary/10 to-accent/10">
              <div className="text-5xl font-bold text-primary mb-2">∞</div>
              <p className="text-lg font-semibold mb-2">Obegränsat antal hästar</p>
              <p className="text-muted-foreground">Hantera alla dina hästar på ett ställe</p>
            </Card>
            <Card className="p-8 text-center bg-gradient-to-br from-accent/10 to-primary/10">
              <div className="text-5xl font-bold text-primary mb-2">24/7</div>
              <p className="text-lg font-semibold mb-2">Tillgängligt när du behöver</p>
              <p className="text-muted-foreground">Från både dator och mobil</p>
            </Card>
          </div>

          <div className="mt-12 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground text-lg">Allt på ett ställe - ingen mer pappershantering</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground text-lg">Påminnelser så du aldrig missar något viktigt</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground text-lg">Följ träningsframsteg och hälsoutveckling över tid</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-foreground text-lg">Dela information enkelt med tränare och veterinärer</p>
              </div>
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

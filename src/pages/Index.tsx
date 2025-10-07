import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import heroHorse from "@/assets/hero-horse.jpg";
import horseProfile1 from "@/assets/horse-profile-1.jpg";
import horseProfile2 from "@/assets/horse-profile-2.jpg";
import horseProfile3 from "@/assets/horse-profile-3.jpg";
import { Heart, Calendar, FileText, Target, Award, Trophy, CheckCircle2, Sparkles, TrendingUp, Activity, Bell, ArrowRight, UserPlus, Plus, BarChart } from "lucide-react";
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
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

          {/* Today's Schedule Preview */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">Dagens schema</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-background rounded-lg border-l-4 border-primary">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-muted-foreground">08:00</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">Träning</Badge>
                      <Badge variant="outline">Fiona</Badge>
                    </div>
                    <p className="font-semibold text-foreground">Dressyrträning</p>
                    <p className="text-sm text-muted-foreground">Ridskola Norra, 60 min</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-background rounded-lg border-l-4 border-secondary">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-muted-foreground">14:00</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">Veterinär</Badge>
                      <Badge variant="outline">Thunder</Badge>
                    </div>
                    <p className="font-semibold text-foreground">Kontroll efter skada</p>
                    <p className="text-sm text-muted-foreground">Veterinär Anna Svensson</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-background rounded-lg border-l-4 border-accent">
                  <div className="text-center min-w-[60px]">
                    <p className="text-xs text-muted-foreground">16:30</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>Hovslagare</Badge>
                      <Badge variant="outline">Luna</Badge>
                    </div>
                    <p className="font-semibold text-foreground">Ombeläggning</p>
                    <p className="text-sm text-muted-foreground">Erik Johansson</p>
                  </div>
                </div>
              </div>
            </Card>
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
              <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${horseProfile1})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
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
              <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${horseProfile2})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
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
              <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${horseProfile3})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
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

      {/* Health Log Feature */}
      <section id="health" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-8 h-8 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Hälsologg & Spårning
                </h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Dokumentera allt som rör din hästs hälsa på ett ställe. Få påminnelser och se trender över tid.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Logga symptom och behandlingar</p>
                    <p className="text-sm text-muted-foreground">Håll koll på vad som hänt och när</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Veterinärbesök & vaccinationer</p>
                    <p className="text-sm text-muted-foreground">Få påminnelser för återkommande hälsocheckar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Viktspårning & kondition</p>
                    <p className="text-sm text-muted-foreground">Följ utvecklingen och upptäck mönster</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Dela med veterinär</p>
                    <p className="text-sm text-muted-foreground">Ge veterinären fullständig historik direkt</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">Hög prioritet</Badge>
                      <span className="text-xs text-muted-foreground">2024-03-15</span>
                    </div>
                    <h4 className="font-bold text-lg">Halta vänster fram</h4>
                    <p className="text-sm text-muted-foreground mt-1">Fiona</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Behandling:</span>
                    <p className="text-foreground">Hovvård + vila i 3 dagar</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="ml-2">Pågående</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">Vaccination</Badge>
                      <span className="text-xs text-muted-foreground">2024-04-01</span>
                    </div>
                    <h4 className="font-bold text-lg">Påminnelse: Influensavaccin</h4>
                    <p className="text-sm text-muted-foreground mt-1">Thunder & Luna</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Feature - Everything in One Place */}
      <section id="calendar" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Allt i en gemensam kalender
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Alla aktiviteter, påminnelser och händelser samlas på ett ställe. Få full översikt och missa aldrig något.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                En kalender för allt
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Tävlingar & starter</p>
                    <p className="text-sm text-muted-foreground">Se alla kommande tävlingar med starttider</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Träningspass</p>
                    <p className="text-sm text-muted-foreground">Planera och följ upp all träning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Veterinär & hovslagare</p>
                    <p className="text-sm text-muted-foreground">Boka och kom ihåg alla besök</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Vaccinationer & behandlingar</p>
                    <p className="text-sm text-muted-foreground">Få påminnelser i god tid</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Anmälningsdeadlines</p>
                    <p className="text-sm text-muted-foreground">Missa aldrig sista anmälningsdag</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Egna påminnelser</p>
                    <p className="text-sm text-muted-foreground">Lägg till vad du vill hålla koll på</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-foreground">Vecka 24, 2025</h4>
                <Badge variant="secondary">8 händelser</Badge>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-background rounded-lg border-l-4 border-primary">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold">Mån 9 Jun - 08:00</p>
                    <Badge variant="secondary" className="text-xs">Träning</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Dressyrträning - Fiona</p>
                </div>

                <div className="p-3 bg-background rounded-lg border-l-4 border-destructive">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold">Tis 10 Jun - 14:00</p>
                    <Badge variant="destructive" className="text-xs">Veterinär</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Kontroll - Thunder</p>
                </div>

                <div className="p-3 bg-background rounded-lg border-l-4 border-accent">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold">Ons 11 Jun</p>
                    <Badge variant="outline" className="text-xs">Deadline</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Anmälan SM Dressyr</p>
                </div>

                <div className="p-3 bg-background rounded-lg border-l-4 border-secondary">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold">Lör 14 Jun - Heldag</p>
                    <Badge className="text-xs">Tävling</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Regional Dressyr - Fiona</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Competition Management Feature */}
      <section id="competitions" className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Komplett tävlingshantering
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Allt du behöver för att planera, förbereda och genomföra tävlingar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6">
              <Calendar className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Tävlingskalender</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Sök och filtrera tävlingar
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Spara favoriter och få påminnelser
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Lägg till anmälningsdeadlines
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Planera resor och boende
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <FileText className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Tävlingsregler</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Sök i regeldokument
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Spara viktiga regler
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Få koll på olika klasser
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Alltid uppdaterad information
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <Award className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Packlistor</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Förberedda mallar per disciplin
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Anpassa efter dina behov
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Bocka av när du packar
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Glöm aldrig något viktigt
                </li>
              </ul>
            </Card>
          </div>

          {/* Competition Card Example */}
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Dressyr</Badge>
                    <Badge variant="outline">M-nivå</Badge>
                  </div>
                  <h3 className="text-2xl font-bold">Svenska Mästerskapen</h3>
                  <p className="text-muted-foreground">Strömsholm, 15-17 Juni 2025</p>
                </div>
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">Anmälan senast:</span>
                  <p className="font-semibold">1 Juni 2025</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Häst:</span>
                  <p className="font-semibold">Fiona</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Avresa:</span>
                  <p className="font-semibold">15 Juni, 07:00</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Packlista:</span>
                  <p className="font-semibold text-primary">12/15 ✓</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Anmäld
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Boende bokat
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Goals Preview */}
      <section id="goals" className="py-16 md:py-24 bg-background">
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
      <section id="features" className="py-16 md:py-24 bg-muted/30">
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hur det fungerar
            </h2>
            <p className="text-lg text-muted-foreground">
              Kom igång på mindre än 5 minuter
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative animate-fade-in">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  1
                </div>
                <UserPlus className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 text-foreground">Skapa konto</h3>
                <p className="text-muted-foreground">Registrera dig gratis med din e-post. Inga kreditkort krävs.</p>
              </div>
              <ArrowRight className="hidden md:block absolute top-10 -right-4 w-8 h-8 text-primary/30" />
            </div>

            {/* Step 2 */}
            <div className="relative animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  2
                </div>
                <Plus className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 text-foreground">Lägg till hästar</h3>
                <p className="text-muted-foreground">Registrera dina hästar med namn, ras, ålder och andra detaljer.</p>
              </div>
              <ArrowRight className="hidden md:block absolute top-10 -right-4 w-8 h-8 text-primary/30" />
            </div>

            {/* Step 3 */}
            <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  3
                </div>
                <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 text-foreground">Börja logga</h3>
                <p className="text-muted-foreground">Lägg till träningspass, hälsologgar, tävlingar och mål.</p>
              </div>
              <ArrowRight className="hidden md:block absolute top-10 -right-4 w-8 h-8 text-primary/30" />
            </div>

            {/* Step 4 */}
            <div className="relative animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  4
                </div>
                <BarChart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3 text-foreground">Följ utveckling</h3>
                <p className="text-muted-foreground">Se statistik, framsteg och få påminnelser för viktiga händelser.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Se hur det ser ut
            </h2>
            <p className="text-lg text-muted-foreground">
              Exempel på några av funktionerna du får tillgång till
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Animated Card 1 - Stats */}
            <Card className="p-6 hover-scale animate-fade-in overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <Badge className="mb-4">Översikt</Badge>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Snabb överblick</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <span className="text-sm font-medium">Träningspass denna vecka</span>
                    <span className="text-2xl font-bold text-primary">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <span className="text-sm font-medium">Kommande tävlingar</span>
                    <span className="text-2xl font-bold text-secondary">3</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
                    <span className="text-sm font-medium">Avklarade mål</span>
                    <span className="text-2xl font-bold text-accent">8</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Animated Card 2 - Progress */}
            <Card className="p-6 hover-scale animate-fade-in overflow-hidden relative" style={{ animationDelay: "100ms" }}>
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <Badge className="mb-4">Träningsframsteg</Badge>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Fiona - Dressyr M</h3>
                <div className="space-y-4">
                  <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Utförandegrad</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <Progress value={85} className="h-3" />
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Kondition</span>
                      <span className="font-semibold">92%</span>
                    </div>
                    <Progress value={92} className="h-3" />
                  </div>
                  <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Teknisk utveckling</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <Progress value={78} className="h-3" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Animated Card 3 - Calendar Preview */}
            <Card className="p-6 hover-scale animate-fade-in overflow-hidden relative" style={{ animationDelay: "200ms" }}>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <Badge className="mb-4">Kalender</Badge>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Kommande vecka</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded animate-fade-in" style={{ animationDelay: "300ms" }}>
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">Mån - Dressyrträning</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded animate-fade-in" style={{ animationDelay: "400ms" }}>
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="text-sm">Ons - Veterinärkontroll</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded animate-fade-in" style={{ animationDelay: "500ms" }}>
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm">Lör - Tävling i Göteborg</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded animate-fade-in" style={{ animationDelay: "600ms" }}>
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">Sön - Hoppträning</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Animated Card 4 - Health Tracking */}
            <Card className="p-6 hover-scale animate-fade-in overflow-hidden relative" style={{ animationDelay: "300ms" }}>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
              <div className="relative">
                <Badge className="mb-4">Hälsologg</Badge>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Thunder - Senaste loggar</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Vaccination</span>
                      <span className="text-xs text-muted-foreground">15 mars</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Influensa + Stelkramp</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg animate-fade-in" style={{ animationDelay: "500ms" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Hovslagare</span>
                      <span className="text-xs text-muted-foreground">8 mars</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Nya skor fram</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg animate-fade-in" style={{ animationDelay: "600ms" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Maskinkur</span>
                      <span className="text-xs text-muted-foreground">1 mars</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Equest Pramox</p>
                  </div>
                </div>
              </div>
            </Card>
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

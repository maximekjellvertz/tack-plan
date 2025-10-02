import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import heroHorse from "@/assets/hero-horse.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${heroHorse})` }}
      />
      
      {/* Login Button - Top Right */}
      <div className="absolute top-6 right-6 z-20 relative">
        <Button 
          onClick={() => navigate("/auth")}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Logga in
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex min-h-screen items-center justify-center px-4 relative z-10">
        <div className="max-w-4xl text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            Hoofprints
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground font-light">
            Every horse writes a story, we're here to keep it
          </p>
          
          {/* Info Section */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card/80 backdrop-blur-md p-6 rounded-lg border shadow-soft">
              <h3 className="text-xl font-semibold mb-3">Följ din hästs resa</h3>
              <p className="text-muted-foreground">Varje steg lämnar ett avtryck – samla hela din hästs resa på ett ställe.</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-md p-6 rounded-lg border shadow-soft">
              <h3 className="text-xl font-semibold mb-3">Hälsa & utveckling</h3>
              <p className="text-muted-foreground">Ge din häst bästa förutsättningar – följ utvecklingen och fånga signalerna i tid.</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-md p-6 rounded-lg border shadow-soft">
              <h3 className="text-xl font-semibold mb-3">Sätt mål & fira framsteg</h3>
              <p className="text-muted-foreground">Från första tävlingen till stora drömmar – fira varje milstolpe på vägen.</p>
            </div>
          </div>
          
          <div className="mt-12">
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
      
      <Footer />
    </div>
  );
};

export default Index;

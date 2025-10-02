import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import heroHorse from "@/assets/hero-horse.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroHorse})` }}
      />
      
      {/* Login Button - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <Button 
          onClick={() => navigate("/auth")}
          size="lg"
          variant="ghost"
          className="bg-white/90 backdrop-blur-sm text-foreground hover:bg-white"
        >
          Logga in
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex min-h-screen items-center justify-center px-4 relative z-10">
        <div className="max-w-4xl text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
            Hoofprints
          </h1>
          <p className="text-2xl md:text-3xl text-white font-light drop-shadow-md">
            Every horse writes a story, we're here to keep it
          </p>
          
          {/* Info Section */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">Följ din hästs resa</h3>
              <p className="text-white/90">Varje steg lämnar ett avtryck – samla hela din hästs resa på ett ställe.</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">Hälsa & utveckling</h3>
              <p className="text-white/90">Ge din häst bästa förutsättningar – följ utvecklingen och fånga signalerna i tid.</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-white">Sätt mål & fira framsteg</h3>
              <p className="text-white/90">Från första tävlingen till stora drömmar – fira varje milstolpe på vägen.</p>
            </div>
          </div>
          
          <div className="mt-12">
            <Button 
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-lg px-8 py-6 bg-orange-600 hover:bg-orange-700 text-white"
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

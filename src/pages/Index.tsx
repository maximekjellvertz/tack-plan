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
      
      {/* Content */}
      <div className="flex min-h-screen items-center justify-center px-4 py-20 md:py-0 relative z-10">
        <div className="max-w-4xl text-center space-y-6 md:space-y-8">
          <h1 className="text-4xl md:text-7xl font-bold text-white drop-shadow-lg">
            Hoofprints
          </h1>
          <p className="text-xl md:text-3xl text-white font-light drop-shadow-md">
            Every horse writes a story, we're here to keep it
          </p>
          
          {/* Info Section */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
            <div className="bg-white/20 backdrop-blur-md p-4 md:p-6 rounded-lg">
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-white">Följ din hästs resa</h3>
              <p className="text-sm md:text-base text-white/90">Varje steg lämnar ett avtryck – samla hela din hästs resa på ett ställe.</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md p-4 md:p-6 rounded-lg">
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-white">Hälsa & utveckling</h3>
              <p className="text-sm md:text-base text-white/90">Ge din häst bästa förutsättningar – följ utvecklingen och fånga signalerna i tid.</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-md p-4 md:p-6 rounded-lg">
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-white">Sätt mål & fira framsteg</h3>
              <p className="text-sm md:text-base text-white/90">Från första tävlingen till stora drömmar – fira varje milstolpe på vägen.</p>
            </div>
          </div>
          
          <div className="mt-8 md:mt-12">
            <Button 
              onClick={() => navigate("/auth")}
              size="default"
              className="text-base md:text-lg px-6 py-5 md:px-8 md:py-6 w-full md:w-auto"
            >
              Kom igång gratis
            </Button>
            <div className="mt-3 md:mt-4">
              <Button 
                onClick={() => navigate("/about")}
                variant="ghost"
                className="text-white hover:text-white/80 underline text-sm md:text-base"
              >
                Läs mer om oss
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;

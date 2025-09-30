import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-horse.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/dashboard");
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Login Button - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <Button 
          onClick={() => navigate("/auth")}
          size="lg"
          className="bg-white/90 text-primary hover:bg-white shadow-xl backdrop-blur-sm"
        >
          Logga in
        </Button>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="max-w-4xl text-center space-y-8">
          <h1 className="mb-6 text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
            Hoofprints
          </h1>
          <p className="text-2xl md:text-3xl text-white/95 drop-shadow-lg font-light mb-8">
            Every horse writes a story, we're here to keep it
          </p>
          
          {/* Info Section */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">Följ din hästs resa</h3>
              <p className="text-white/90">Varje steg lämnar ett avtryck – samla hela din hästs resa på ett ställe.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">Hälsa & utveckling</h3>
              <p className="text-white/90">Ge din häst bästa förutsättningar – följ utvecklingen och fånga signalerna i tid.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">Sätt mål & fira framsteg</h3>
              <p className="text-white/90">Från första tävlingen till stora drömmar – fira varje milstolpe på vägen.</p>
            </div>
          </div>
          
          <div className="mt-12">
            <Button 
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white shadow-2xl text-lg px-8 py-6"
            >
              Kom igång gratis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

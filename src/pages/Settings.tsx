import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, HelpCircle, Sparkles } from "lucide-react";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { toast } from "sonner";

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };
    checkAuth();
  }, [navigate]);

  const handleRestartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    toast.success("Guiden avslutad!");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-8">
      <OnboardingDialog open={showOnboarding} onComplete={handleOnboardingComplete} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <SettingsIcon className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold text-foreground glow-text">Inställningar</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Hantera ditt konto och preferenser
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Section */}
          <Card className="p-6 bg-gradient-to-br from-card to-muted/30 border-2 shadow-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-primary" />
              Konto
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">E-post</label>
                <p className="text-lg text-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Konto-ID</label>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
            </div>
          </Card>

          {/* Help & Guide Section */}
          <Card className="p-6 bg-gradient-to-br from-card to-muted/30 border-2 shadow-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              Hjälp & Guider
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Visa guiden igen</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vill du se introduktionsguiden igen? Klicka på knappen nedan för att starta om den interaktiva guiden.
                </p>
                <Button onClick={handleRestartOnboarding} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Starta om guiden
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Calendar, FileText, Home, Bell, LogOut, Menu, Target, Trophy, Info, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { TooltipWrapper } from "@/components/TooltipWrapper";

const navItems = [
  { name: "Hem", path: "/dashboard", icon: Home },
  { name: "Hästar", path: "/horses", icon: Heart },
  { name: "Kalender", path: "/calendar", icon: Calendar },
  { name: "Tävlingar", path: "/competitions", icon: Trophy },
  { name: "Hälsologg", path: "/health-log", icon: FileText },
  { name: "Mål", path: "/goals", icon: Target },
  { name: "Påminnelser", path: "/reminders", icon: Bell },
  { name: "Inställningar", path: "/settings", icon: Settings },
  { name: "Om oss", path: "/about", icon: Info },
];

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Utloggad",
      description: "Du har loggats ut",
    });
    navigate("/");
  };

  // Don't show navigation on auth page
  if (location.pathname === "/auth") {
    return null;
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            {isMobile && user && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="flex flex-col gap-4 mt-8">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="justify-start gap-3 px-4 py-3 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logga ut</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Hoofprints</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              const tooltips: { [key: string]: string } = {
                "/dashboard": "Se en översikt av dina hästar och aktiviteter",
                "/horses": "Hantera dina hästar och deras profiler",
                "/calendar": "Se alla dina händelser och lägg till schemaaktiviteter",
                "/competitions": "Sök och hantera tävlingar",
                "/health-log": "Dokumentera hälsohändelser och behandlingar",
                "/goals": "Sätt mål och följ din utveckling",
                "/reminders": "Skapa påminnelser för viktiga uppgifter",
                "/settings": "Hantera konto och preferenser",
                "/about": "Information om Hoofprints",
              };
              
              return (
                <TooltipWrapper key={item.path} content={tooltips[item.path] || item.name}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </TooltipWrapper>
              );
            })}
            {user && (
              <TooltipWrapper content="Logga ut från ditt konto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logga ut
                </Button>
              </TooltipWrapper>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

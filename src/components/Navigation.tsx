import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Calendar, FileText, Home, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Hem", path: "/", icon: Home },
  { name: "Hästar", path: "/horses", icon: Heart },
  { name: "Tävlingar", path: "/competitions", icon: Calendar },
  { name: "Hälsologg", path: "/health-log", icon: FileText },
  { name: "Påminnelser", path: "/reminders", icon: Bell },
];

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

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
    navigate("/auth");
  };

  // Don't show navigation on auth page
  if (location.pathname === "/auth") {
    return null;
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Tävlingsplaneraren</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
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
              );
            })}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logga ut
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

import { Link, useLocation } from "react-router-dom";
import { Heart, Calendar, FileText, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Hem", path: "/", icon: Home },
  { name: "Hästar", path: "/horses", icon: Heart },
  { name: "Tävlingar", path: "/competitions", icon: Calendar },
  { name: "Hälsologg", path: "/health-log", icon: FileText },
];

const Navigation = () => {
  const location = useLocation();

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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

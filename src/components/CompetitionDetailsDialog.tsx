import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Users, Clock, Phone, Mail, Globe } from "lucide-react";

interface Competition {
  id: string | number;
  name: string;
  date: string;
  location: string;
  district?: string;
  discipline: string;
  height?: string;
  status?: string;
  time?: string;
  classes?: any[];
  registration_status?: string;
}

interface CompetitionDetailsDialogProps {
  competition: Competition;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CompetitionDetailsDialog = ({ 
  competition, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: CompetitionDetailsDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline">
            Mer information
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{competition.name}</DialogTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">{competition.discipline}</Badge>
                {competition.status && (
                  <Badge className={competition.status === "upcoming" ? "bg-secondary" : "bg-primary"}>
                    {competition.status === "upcoming" ? "Kommande" : competition.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Grundläggande information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Grundläggande information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Datum</p>
                  <p className="font-medium">{competition.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tid</p>
                  <p className="font-medium">09:00 - 17:00</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Plats</p>
                  <p className="font-medium">{competition.location}</p>
                  {competition.district && (
                    <p className="text-sm text-muted-foreground">{competition.district}</p>
                  )}
                </div>
              </div>
              {competition.height && (
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Höjd/Nivå</p>
                    <p className="font-medium">{competition.height}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Klasser */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Klasser</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                <div>
                  <p className="font-medium">Klass 1: Lätt A</p>
                  <p className="text-sm text-muted-foreground">09:00 - Höjd: 90 cm</p>
                </div>
                <Badge variant="outline">450 kr</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                <div>
                  <p className="font-medium">Klass 2: Medel A</p>
                  <p className="text-sm text-muted-foreground">11:00 - Höjd: 110 cm</p>
                </div>
                <Badge variant="outline">500 kr</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                <div>
                  <p className="font-medium">Klass 3: Medel B</p>
                  <p className="text-sm text-muted-foreground">13:30 - Höjd: 120 cm</p>
                </div>
                <Badge variant="outline">550 kr</Badge>
              </div>
            </div>
          </div>

          {/* Kontakt */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Kontakt</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Arrangör: {competition.location} Ridklubb</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">070-123 45 67</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">tavling@exempel.se</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a href="#" className="text-sm text-primary hover:underline">www.tavling.se</a>
              </div>
            </div>
          </div>

          {/* Anmälan */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Anmälan</h3>
            <p className="text-sm text-muted-foreground">
              Anmälan öppnar 14 dagar före tävlingen och stänger 3 dagar före. 
              Anmäl dig via Tävlingsdatabasen (TDB).
            </p>
          </div>

          {/* Åtgärder */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-primary hover:bg-primary/90">
              Öppna i TDB
            </Button>
            <Button variant="outline" className="flex-1">
              Dela tävling
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

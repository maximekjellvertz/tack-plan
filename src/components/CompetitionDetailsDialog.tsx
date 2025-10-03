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
  organizer?: string;
  phone?: string;
  email?: string;
  website?: string;
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
              {competition.time && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tid</p>
                    <p className="font-medium">{competition.time}</p>
                  </div>
                </div>
              )}
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

          {/* Klasser - only show if classes exist */}
          {competition.classes && competition.classes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Klasser</h3>
              <div className="space-y-2">
                {competition.classes.map((classItem: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                    <div>
                      <p className="font-medium">{classItem.name || `Klass ${index + 1}`}</p>
                      {classItem.time && (
                        <p className="text-sm text-muted-foreground">{classItem.time}</p>
                      )}
                    </div>
                    {classItem.fee && (
                      <Badge variant="outline">{classItem.fee} kr</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kontakt - only show if contact info exists */}
          {(competition.organizer || competition.phone || competition.email || competition.website) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Kontakt</h3>
              <div className="space-y-2">
                {competition.organizer && (
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Arrangör: {competition.organizer}</span>
                  </div>
                )}
                {competition.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{competition.phone}</span>
                  </div>
                )}
                {competition.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{competition.email}</span>
                  </div>
                )}
                {competition.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={competition.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {competition.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};

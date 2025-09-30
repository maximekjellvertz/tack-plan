import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, Clock, Image as ImageIcon, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface HealthLog {
  id: string;
  horse_name: string;
  event: string;
  severity: string;
  status: string;
  treatment: string;
  notes: string | null;
  images: any;
  created_at: string;
}

interface HealthLogDetailsDialogProps {
  log: HealthLog;
  onDelete?: (id: string) => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Lätt":
      return "bg-secondary";
    case "Medel":
      return "bg-primary";
    case "Allvarlig":
      return "bg-destructive";
    default:
      return "bg-muted";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Pågående":
      return <Clock className="w-5 h-5" />;
    case "Klar":
      return <CheckCircle className="w-5 h-5" />;
    case "Uppmärksamhet":
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
};

export const HealthLogDetailsDialog = ({ log, onDelete }: HealthLogDetailsDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const images = Array.isArray(log.images) ? log.images : [];

  const handleDelete = () => {
    if (onDelete) {
      onDelete(log.id);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Visa detaljer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {getStatusIcon(log.status)}
            </div>
            <div>
              <DialogTitle className="text-2xl">{log.event}</DialogTitle>
              <div className="flex gap-2 mt-1">
                <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                <Badge variant="outline">{log.status}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Grundläggande information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Grundläggande information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Datum</p>
                  <p className="font-medium">{new Date(log.created_at).toLocaleDateString('sv-SE')}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Häst</p>
                <p className="font-medium">{log.horse_name}</p>
              </div>
            </div>
          </div>

          {/* Behandling */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Behandling</h3>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm">{log.treatment || "Ingen behandling angiven"}</p>
            </div>
          </div>

          {/* Anteckningar */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Anteckningar</h3>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm">{log.notes || "Inga anteckningar"}</p>
            </div>
          </div>

          {/* Bilder */}
          {images.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Bilder ({images.length})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {images.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${log.event} bild ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-border hover:scale-105 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Delete button */}
          {onDelete && (
            <div className="pt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Radera hälsologg
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Detta kommer permanent radera hälsologgen. Detta kan inte ångras.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Avbryt</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Radera
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

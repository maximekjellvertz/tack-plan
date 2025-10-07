import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ProgressRing";
import { Badge } from "@/components/ui/badge";

export const PreviewHorseCard = () => {
  return (
    <div className="relative">
      <Card className="p-6 hover-scale animate-fade-in bg-gradient-to-br from-card to-muted/30 blur-[2px] opacity-60">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Fiona</h3>
            <p className="text-sm text-muted-foreground mb-2">Svensk Varmblod</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">8 år</Badge>
              <Badge variant="secondary">Dressyr</Badge>
              <Badge variant="secondary">Svartbrun</Badge>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Träningsframsteg</p>
            <ProgressRing progress={75} size={60} strokeWidth={6} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Hälsostatus</p>
            <ProgressRing progress={90} size={60} strokeWidth={6} />
          </div>
        </div>
      </Card>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-primary/95 text-primary-foreground px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm border-2 border-primary-foreground/20">
          <p className="font-bold text-sm">EXEMPEL - Så här ser ett hästkort ut!</p>
        </div>
      </div>
    </div>
  );
};

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

export const PreviewGoalCard = () => {
  return (
    <div className="relative">
      <Card className="p-6 hover-scale animate-fade-in bg-gradient-to-br from-card to-muted/30 blur-[2px] opacity-60">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Tävla på L-nivå</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Förbereda för första L-tävlingen i dressyr
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">Tävling</Badge>
              <Badge variant="outline">Måldatum: 2025-06-15</Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Framsteg</span>
            <span className="font-semibold">60%</span>
          </div>
          <Progress value={60} className="h-2" />
        </div>
      </Card>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-primary/95 text-primary-foreground px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm border-2 border-primary-foreground/20">
          <p className="font-bold text-sm">EXEMPEL - Så här ser ett mål ut!</p>
        </div>
      </div>
    </div>
  );
};

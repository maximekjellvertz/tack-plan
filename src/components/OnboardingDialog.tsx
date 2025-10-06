import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Calendar, Trophy, Activity, Target, Settings, Sparkles } from "lucide-react";

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: "Välkommen till Equi Manager! 🐴",
    description: "Din kompletta lösning för att hantera allt kring dina hästar. Låt oss visa dig runt!",
    icon: Sparkles,
    color: "text-primary",
  },
  {
    title: "Lägg till dina hästar",
    description: "Börja med att lägga till dina hästar under 'Hästar'. Här kan du registrera all information som ras, ålder, disciplin och personlighet.",
    icon: Heart,
    color: "text-primary",
  },
  {
    title: "Håll koll på tävlingar",
    description: "Under 'Tävlingar' kan du planera och organisera kommande tävlingar. Lägg till detaljer som datum, plats, disciplin och packlista.",
    icon: Trophy,
    color: "text-yellow-500",
  },
  {
    title: "Spåra träning och framsteg",
    description: "Logga träningspass och följ utvecklingen över tid. Du kan se hur många träningspass varje häst har gjort.",
    icon: Activity,
    color: "text-blue-500",
  },
  {
    title: "Hälsoöversikt",
    description: "Dokumentera veterinärbesök, behandlingar och hälsohändelser. Håll koll på allvarlighetsgrad och status för varje händelse.",
    icon: Heart,
    color: "text-red-500",
  },
  {
    title: "Sätt mål och få badges",
    description: "Skapa mål för dina hästar och tjäna badges när du uppnår dem. Se din utveckling i en visuell resa under 'Mål'.",
    icon: Target,
    color: "text-green-500",
  },
  {
    title: "Kalender och påminnelser",
    description: "Se alla händelser i kalendern och skapa påminnelser för viktiga uppgifter som vaccination, hovslagare eller behandlingar.",
    icon: Calendar,
    color: "text-purple-500",
  },
  {
    title: "Du är redo! 🎉",
    description: "Nu kan du börja använda Equi Manager. Du kan alltid starta guiden igen från inställningarna.",
    icon: Settings,
    color: "text-primary",
  },
];

export const OnboardingDialog = ({ open, onComplete }: OnboardingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const StepIcon = step.icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ${step.color}`}>
              <StepIcon className="w-12 h-12" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">{step.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Steg {currentStep + 1} av {onboardingSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentStep === 0 ? (
            <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">
              Hoppa över
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePrevious} className="w-full sm:w-auto">
              Tillbaka
            </Button>
          )}
          <Button onClick={handleNext} className="w-full sm:w-auto">
            {currentStep === onboardingSteps.length - 1 ? "Kom igång!" : "Nästa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

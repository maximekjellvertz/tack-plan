import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DashboardWidget } from "@/hooks/useDashboardPreferences";

interface DashboardCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: DashboardWidget[];
  onToggleWidget: (widgetId: string, isVisible: boolean) => void;
}

export const DashboardCustomizeDialog = ({
  open,
  onOpenChange,
  widgets,
  onToggleWidget,
}: DashboardCustomizeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Anpassa Dashboard</DialogTitle>
          <DialogDescription>
            Välj vilka widgets du vill se på din dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-start justify-between space-x-4 rounded-lg border p-4"
            >
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={widget.id}
                  className="text-base font-medium cursor-pointer"
                >
                  {widget.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {widget.description}
                </p>
              </div>
              <Switch
                id={widget.id}
                checked={widget.isVisible}
                onCheckedChange={(checked) =>
                  onToggleWidget(widget.id, checked)
                }
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

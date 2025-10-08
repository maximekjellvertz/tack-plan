import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExportHealthPdfButtonProps {
  horseId: string;
  horseName: string;
}

export const ExportHealthPdfButton = ({ horseId, horseName }: ExportHealthPdfButtonProps) => {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-health-pdf", {
        body: { horseId }
      });

      if (error) throw error;

      // Open the HTML in a new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
      }

      toast({
        title: "PDF-rapport skapad",
        description: `Hälsorapport för ${horseName} öppnad för utskrift`
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Fel",
        description: "Kunde inte skapa PDF-rapport",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm">
      <Download className="w-4 h-4 mr-2" />
      {exporting ? "Skapar..." : "Exportera hälsohistorik"}
    </Button>
  );
};
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { getUserName } from "@/hooks/useUserProfile";

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horseId: string;
  onSuccess: () => void;
}

const DOCUMENT_TYPES = [
  { value: "vaccination_certificate", label: "Vaccinationsintyg" },
  { value: "passport", label: "Pass" },
  { value: "insurance", label: "Försäkring" },
  { value: "xray", label: "Röntgenbild" },
  { value: "veterinary_report", label: "Veterinärrapport" },
  { value: "registration", label: "Registrering" },
  { value: "other", label: "Övrigt" }
];

export const AddDocumentDialog = ({ open, onOpenChange, horseId, onSuccess }: AddDocumentDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    document_type: "",
    expires_at: "",
    notes: "",
    file: null as File | null
  });
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Filen är för stor",
          description: "Maximal filstorlek är 10MB",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !formData.title || !formData.document_type) {
      toast({
        title: "Fyll i alla obligatoriska fält",
        description: "Titel, dokumenttyp och fil krävs",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Användare inte inloggad");

      const userName = await getUserName();
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("horse-documents")
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // Save metadata
      const { error: dbError } = await supabase
        .from("horse_documents")
        .insert([{
          user_id: user.id,
          horse_id: horseId,
          document_type: formData.document_type as "vaccination_certificate" | "passport" | "insurance" | "xray" | "veterinary_report" | "registration" | "other",
          title: formData.title,
          file_path: filePath,
          file_name: formData.file.name,
          file_size: formData.file.size,
          expires_at: formData.expires_at || null,
          notes: formData.notes || null,
          created_by_name: userName
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Dokumentet uppladdat",
        description: `${formData.title} har lagts till`
      });

      setFormData({
        title: "",
        document_type: "",
        expires_at: "",
        notes: "",
        file: null
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda upp dokumentet",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till dokument</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="T.ex. Vaccinationsbevis 2024"
              required
            />
          </div>

          <div>
            <Label htmlFor="document_type">Dokumenttyp *</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj dokumenttyp" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file">Fil * (Max 10MB)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                required
              />
              {formData.file && (
                <span className="text-sm text-muted-foreground">
                  {(formData.file.size / 1024).toFixed(2)} KB
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="expires_at">Utgångsdatum</Label>
            <Input
              id="expires_at"
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Frivilliga anteckningar..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                "Laddar upp..."
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Ladda upp
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
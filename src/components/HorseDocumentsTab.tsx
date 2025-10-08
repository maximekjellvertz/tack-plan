import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Download, Trash2, AlertCircle, Plus } from "lucide-react";
import { AddDocumentDialog } from "./AddDocumentDialog";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HorseDocumentsTabProps {
  horseId: string;
}

interface Document {
  id: string;
  document_type: string;
  title: string;
  file_path: string;
  file_name: string;
  file_size: number;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  created_by_name: string | null;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  vaccination_certificate: "Vaccinationsintyg",
  passport: "Pass",
  insurance: "Försäkring",
  xray: "Röntgenbild",
  veterinary_report: "Veterinärrapport",
  registration: "Registrering",
  other: "Övrigt"
};

export const HorseDocumentsTab = ({ horseId }: HorseDocumentsTabProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [horseId]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("horse_documents")
        .select("*")
        .eq("horse_id", horseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta dokument",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from("horse-documents")
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Dokumentet nedladdat",
        description: `${doc.file_name} har laddats ner`
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda ner dokumentet",
        variant: "destructive"
      });
    }
  };

  const deleteDocument = async (doc: Document) => {
    if (!confirm(`Är du säker på att du vill ta bort ${doc.title}?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from("horse-documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("horse_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Dokumentet borttaget",
        description: `${doc.title} har tagits bort`
      });

      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort dokumentet",
        variant: "destructive"
      });
    }
  };

  const getExpiringDocuments = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return documents.filter(doc => {
      if (!doc.expires_at) return false;
      const expiryDate = new Date(doc.expires_at);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
    });
  };

  const expiringDocs = getExpiringDocuments();

  if (loading) {
    return <div className="p-4">Laddar dokument...</div>;
  }

  return (
    <div className="space-y-6">
      {expiringDocs.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Du har {expiringDocs.length} dokument som går ut inom 30 dagar
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Dokument</h3>
          <p className="text-sm text-muted-foreground">
            Hantera alla dokument för din häst
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Lägg till dokument
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Inga dokument ännu</p>
              <Button onClick={() => setDialogOpen(true)} className="mt-4">
                Lägg till ditt första dokument
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => {
            const isExpiringSoon = expiringDocs.some(d => d.id === doc.id);
            const isExpired = doc.expires_at && new Date(doc.expires_at) < new Date();

            return (
              <Card key={doc.id} className={isExpired ? "border-destructive" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{doc.title}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary" className="mr-2 mt-2">
                          {DOCUMENT_TYPE_LABELS[doc.document_type]}
                        </Badge>
                        {doc.expires_at && (
                          <Badge 
                            variant={isExpired ? "destructive" : isExpiringSoon ? "default" : "outline"}
                            className="mt-2"
                          >
                            {isExpired ? "Utgånget" : "Utgår"} {format(new Date(doc.expires_at), "d MMM yyyy", { locale: sv })}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadDocument(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteDocument(doc)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {doc.notes && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{doc.notes}</p>
                  </CardContent>
                )}
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Filnamn: {doc.file_name}</div>
                    <div>Storlek: {(doc.file_size / 1024).toFixed(2)} KB</div>
                    <div>Uppladdad: {format(new Date(doc.created_at), "d MMM yyyy", { locale: sv })}</div>
                    {doc.created_by_name && <div>Av: {doc.created_by_name}</div>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddDocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        horseId={horseId}
        onSuccess={fetchDocuments}
      />
    </div>
  );
};
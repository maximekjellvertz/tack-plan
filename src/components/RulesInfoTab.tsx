import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ExternalLink, Trash2, BookOpen, Sparkles, FileText, Link, Tag, Upload, Search, Loader2, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Rule {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  category: string;
  created_at: string;
}

interface RulePdf {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  category: string;
  uploaded_at: string;
}

const CATEGORIES = ["Allmänt", "Hoppning", "Dressyr", "Fälttävlan", "Körning", "Distans"];

export function RulesInfoTab() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [pdfs, setPdfs] = useState<RulePdf[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    title: "",
    content: "",
    url: "",
    category: "Allmänt",
  });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfCategory, setPdfCategory] = useState("Allmänt");
  const [searchQuestion, setSearchQuestion] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchAnswer, setSearchAnswer] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
    fetchPdfs();
  }, []);

  const fetchRules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("competition_rules")
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true });

    if (error) {
      toast({ title: "Fel", description: "Kunde inte hämta regler", variant: "destructive" });
      return;
    }

    setRules(data || []);
  };

  const fetchPdfs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("rule_pdfs")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      toast({ title: "Fel", description: "Kunde inte hämta PDFer", variant: "destructive" });
      return;
    }

    setPdfs(data || []);
  };

  const createRule = async () => {
    if (!newRule.title.trim()) {
      toast({ title: "Fel", description: "Titel måste fyllas i", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("competition_rules").insert({
      user_id: user.id,
      title: newRule.title,
      content: newRule.content || null,
      url: newRule.url || null,
      category: newRule.category,
    });

    if (error) {
      toast({ title: "Fel", description: "Kunde inte skapa regel", variant: "destructive" });
      return;
    }

    toast({ title: "Framgång", description: "Regel skapad!" });
    setNewRule({ title: "", content: "", url: "", category: "Allmänt" });
    setIsCreateDialogOpen(false);
    fetchRules();
  };

  const deleteRule = async (ruleId: string) => {
    const { error } = await supabase
      .from("competition_rules")
      .delete()
      .eq("id", ruleId);

    if (error) {
      toast({ title: "Fel", description: "Kunde inte ta bort regel", variant: "destructive" });
      return;
    }

    toast({ title: "Framgång", description: "Regel borttagen" });
    fetchRules();
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: "Fel", description: "Endast PDF-filer är tillåtna", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({ title: "Fel", description: "Filen är för stor (max 10MB)", variant: "destructive" });
      return;
    }

    setUploadingPdf(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileName = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('rule-pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('rule_pdfs')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          category: pdfCategory,
        });

      if (dbError) throw dbError;

      toast({ title: "Framgång", description: "PDF uppladdad!" });
      fetchPdfs();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Fel", description: "Kunde inte ladda upp PDF", variant: "destructive" });
    } finally {
      setUploadingPdf(false);
      event.target.value = '';
    }
  };

  const openPdf = async (pdf: RulePdf) => {
    try {
      const { data, error } = await supabase.storage
        .from('rule-pdfs')
        .createSignedUrl(pdf.file_path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        // Build full URL - signedUrl is relative, needs Supabase URL
        const fullUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1${data.signedUrl}`;
        window.open(fullUrl, '_blank');
      }
    } catch (error) {
      console.error('Open PDF error:', error);
      toast({ title: "Fel", description: "Kunde inte öppna PDF", variant: "destructive" });
    }
  };

  const deletePdf = async (pdf: RulePdf) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('rule-pdfs')
        .remove([pdf.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('rule_pdfs')
        .delete()
        .eq('id', pdf.id);

      if (dbError) throw dbError;

      toast({ title: "Framgång", description: "PDF borttagen" });
      fetchPdfs();
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: "Fel", description: "Kunde inte ta bort PDF", variant: "destructive" });
    }
  };

  const handleAiSearch = async () => {
    if (!searchQuestion.trim()) {
      toast({ title: "Fel", description: "Skriv en fråga först", variant: "destructive" });
      return;
    }

    setSearchLoading(true);
    setSearchAnswer("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-rule-pdfs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ question: searchQuestion }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search');
      }

      const data = await response.json();
      setSearchAnswer(data.answer);

    } catch (error) {
      console.error('Search error:', error);
      toast({ 
        title: "Fel", 
        description: error instanceof Error ? error.message : "Kunde inte söka i PDFer", 
        variant: "destructive" 
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  const groupedPdfs = pdfs.reduce((acc, pdf) => {
    if (!acc[pdf.category]) {
      acc[pdf.category] = [];
    }
    acc[pdf.category].push(pdf);
    return acc;
  }, {} as Record<string, RulePdf[]>);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI-sökning
          </TabsTrigger>
          <TabsTrigger value="pdfs" className="gap-2">
            <File className="h-4 w-4" />
            PDFer ({pdfs.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Anteckningar ({rules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Sök med AI i dina regeldokument
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ställ en fråga så söker AI genom alla dina uppladdade PDFer
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-question">Din fråga</Label>
                <Textarea
                  id="search-question"
                  placeholder="T.ex. 'Vad säger reglerna om ridstövlar vid dressyrtävling?'"
                  value={searchQuestion}
                  onChange={(e) => setSearchQuestion(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <Button 
                onClick={handleAiSearch} 
                disabled={searchLoading || !searchQuestion.trim()}
                className="w-full gap-2"
              >
                {searchLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Söker...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Sök
                  </>
                )}
              </Button>

              {searchAnswer && (
                <Card className="bg-muted/50 border-2">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI-svar:
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{searchAnswer}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdfs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Ladda upp regel-PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={pdfCategory} onValueChange={setPdfCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Välj PDF-fil (max 10MB)</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={uploadingPdf}
                  className="cursor-pointer"
                />
              </div>
              
              {uploadingPdf && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Laddar upp...
                </div>
              )}
            </CardContent>
          </Card>

          {pdfs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Inga PDFer uppladdade ännu</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedPdfs).map(([category, categoryPdfs]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <File className="h-5 w-5" />
                      {category} ({categoryPdfs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categoryPdfs.map((pdf) => (
                        <div
                          key={pdf.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{pdf.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(pdf.file_size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openPdf(pdf)}
                              className="hover:bg-primary/10"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deletePdf(pdf)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Lägg till anteckning
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Lägg till regel eller information</DialogTitle>
                <DialogDescription>
                  Spara länkar och anteckningar om tävlingsregler
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Titel *
                  </Label>
                  <Input
                    id="title"
                    placeholder="T.ex. 'Tävlingsreglemente Hoppning'"
                    value={newRule.title}
                    onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={newRule.category}
                    onValueChange={(value) => setNewRule({ ...newRule, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Anteckningar</Label>
                  <Textarea
                    id="content"
                    placeholder="Dina egna anteckningar eller sammanfattningar (valfritt)"
                    value={newRule.content}
                    onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Länk</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://exempel.se/dokument.pdf (valfritt)"
                    value={newRule.url}
                    onChange={(e) => setNewRule({ ...newRule, url: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewRule({ title: "", content: "", url: "", category: "Allmänt" });
                    }}
                  >
                    Avbryt
                  </Button>
                  <Button 
                    onClick={createRule} 
                    disabled={!newRule.title.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Spara regel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {rules.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Inga anteckningar ännu</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedRules).map(([category, categoryRules]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {category} ({categoryRules.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              {rule.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteRule(rule.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {rule.content && (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                              {rule.content}
                            </p>
                          )}
                          {rule.url && (
                            <a
                              href={rule.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Öppna länk
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
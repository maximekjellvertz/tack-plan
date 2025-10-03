import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ExternalLink, Trash2, BookOpen, Sparkles, FileText, Link, Tag } from "lucide-react";
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

interface Rule {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  category: string;
  created_at: string;
}

const CATEGORIES = ["Allmänt", "Hoppning", "Dressyr", "Fälttävlan", "Körning", "Distans"];

export function RulesInfoTab() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    title: "",
    content: "",
    url: "",
    category: "Allmänt",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
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

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  return (
    <div className="space-y-6">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105">
            <Sparkles className="h-4 w-4" />
            Lägg till regel/info
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-muted/30">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Lägg till regel eller information</DialogTitle>
                <DialogDescription>
                  Spara länkar och anteckningar om tävlingsregler
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Titel *
              </Label>
              <Input
                id="title"
                placeholder="T.ex. 'Tävlingsreglemente Hoppning'"
                value={newRule.title}
                onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                className="border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Kategori
              </Label>
              <Select
                value={newRule.category}
                onValueChange={(value) => setNewRule({ ...newRule, category: value })}
              >
                <SelectTrigger id="category" className="border-2">
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
              <Label htmlFor="content" className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Anteckningar
              </Label>
              <Textarea
                id="content"
                placeholder="Dina egna anteckningar eller sammanfattningar (valfritt)"
                value={newRule.content}
                onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
                rows={5}
                className="border-2 focus:border-primary resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-semibold flex items-center gap-2">
                <Link className="h-4 w-4 text-primary" />
                Länk
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://exempel.se/dokument.pdf (valfritt)"
                value={newRule.url}
                onChange={(e) => setNewRule({ ...newRule, url: e.target.value })}
                className="border-2 focus:border-primary"
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
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Spara regel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {rules.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="relative inline-block mb-6">
              <BookOpen className="h-20 w-20 text-primary/30" />
              <Sparkles className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Samla all info på ett ställe!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Spara länkar till tävlingsreglement, egna anteckningar om regler och viktig information
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                ✓ Länkar till TR
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                ✓ Egna anteckningar
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                ✓ Per disciplin
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {Object.entries(groupedRules).map(([category, categoryRules]) => (
            <Card key={category} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {categoryRules.length} {categoryRules.length === 1 ? 'dokument' : 'dokument'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all hover:shadow-md"
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
                          className="hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {rule.content && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3 pl-6">
                          {rule.content}
                        </p>
                      )}
                      {rule.url && (
                        <a
                          href={rule.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline pl-6 font-medium"
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
    </div>
  );
}

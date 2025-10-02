import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ExternalLink, Trash2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Lägg till regel/info
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lägg till regel eller information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Titel"
              value={newRule.title}
              onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
            />
            <Select
              value={newRule.category}
              onValueChange={(value) => setNewRule({ ...newRule, category: value })}
            >
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
            <Textarea
              placeholder="Anteckningar (valfritt)"
              value={newRule.content}
              onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
              rows={4}
            />
            <Input
              placeholder="Länk (valfritt)"
              value={newRule.url}
              onChange={(e) => setNewRule({ ...newRule, url: e.target.value })}
            />
            <Button onClick={createRule} className="w-full">
              Spara
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Lägg till dina första regler och tips här!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedRules).map(([category, categoryRules]) => (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{category}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{rule.title}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {rule.content && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">
                          {rule.content}
                        </p>
                      )}
                      {rule.url && (
                        <a
                          href={rule.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
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

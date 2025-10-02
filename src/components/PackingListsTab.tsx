import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package, CheckCircle2, ListChecks, Sparkles } from "lucide-react";
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

interface Template {
  id: string;
  name: string;
  created_at: string;
}

interface PackingItem {
  id: string;
  name: string;
  category: string;
  is_checked: boolean;
  template_id: string | null;
}

const CATEGORIES = ["Hästutrustning", "Ryttarutrustning", "Dokumentation", "Övrigt"];

export function PackingListsTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [items, setItems] = useState<PackingItem[]>([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState(CATEGORIES[0]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchItems(selectedTemplate);
    }
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("packing_list_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Fel", description: "Kunde inte hämta mallar", variant: "destructive" });
      return;
    }

    setTemplates(data || []);
  };

  const fetchItems = async (templateId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("packing_list_items")
      .select("*")
      .eq("template_id", templateId)
      .eq("user_id", user.id)
      .order("category", { ascending: true });

    if (error) {
      toast({ title: "Fel", description: "Kunde inte hämta items", variant: "destructive" });
      return;
    }

    setItems(data || []);
  };

  const createTemplate = async () => {
    if (!newTemplateName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("packing_list_templates")
      .insert({ user_id: user.id, name: newTemplateName })
      .select()
      .single();

    if (error) {
      toast({ title: "Fel", description: "Kunde inte skapa mall", variant: "destructive" });
      return;
    }

    toast({ title: "Framgång", description: "Mall skapad!" });
    setNewTemplateName("");
    setIsCreateDialogOpen(false);
    fetchTemplates();
    setSelectedTemplate(data.id);
  };

  const addItem = async () => {
    if (!newItemName.trim() || !selectedTemplate) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("packing_list_items")
      .insert({
        user_id: user.id,
        template_id: selectedTemplate,
        name: newItemName,
        category: newItemCategory,
      });

    if (error) {
      toast({ title: "Fel", description: "Kunde inte lägga till sak", variant: "destructive" });
      return;
    }

    setNewItemName("");
    fetchItems(selectedTemplate);
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from("packing_list_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast({ title: "Fel", description: "Kunde inte ta bort sak", variant: "destructive" });
      return;
    }

    if (selectedTemplate) {
      fetchItems(selectedTemplate);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    const { error } = await supabase
      .from("packing_list_templates")
      .delete()
      .eq("id", templateId);

    if (error) {
      toast({ title: "Fel", description: "Kunde inte ta bort mall", variant: "destructive" });
      return;
    }

    toast({ title: "Framgång", description: "Mall borttagen" });
    setSelectedTemplate(null);
    setItems([]);
    fetchTemplates();
  };

  const toggleItemCheck = async (itemId: string, currentChecked: boolean) => {
    const { error } = await supabase
      .from("packing_list_items")
      .update({ is_checked: !currentChecked })
      .eq("id", itemId);

    if (error) {
      toast({ title: "Fel", description: "Kunde inte uppdatera", variant: "destructive" });
      return;
    }

    if (selectedTemplate) {
      fetchItems(selectedTemplate);
    }
  };

  const resetAllChecks = async () => {
    if (!selectedTemplate) return;

    const { error } = await supabase
      .from("packing_list_items")
      .update({ is_checked: false })
      .eq("template_id", selectedTemplate);

    if (error) {
      toast({ title: "Fel", description: "Kunde inte återställa", variant: "destructive" });
      return;
    }

    toast({ title: "Framgång", description: "Alla bockar återställda!" });
    fetchItems(selectedTemplate);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105">
              <Sparkles className="h-4 w-4" />
              Skapa ny mall
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Skapa packlista-mall
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="T.ex. 'Hopptävling' eller 'Vinterdressyr'"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Skapa en återanvändbar mall för liknande tävlingar
                </p>
              </div>
              <Button onClick={createTemplate} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Skapa mall
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Select value={selectedTemplate || ""} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="🎯 Välj din packlista-mall" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-primary" />
                  {template.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTemplate && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => deleteTemplate(selectedTemplate)}
            className="transition-all hover:scale-110"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedTemplate && (
        <>
          <Card className="border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Lägg till saker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="T.ex. 'Sadel' eller 'Ridstövlar'"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem()}
                  className="flex-1"
                />
                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                <Button onClick={addItem} className="hover:scale-105 transition-all">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 animate-fade-in">
            {Object.entries(groupedItems).map(([category, categoryItems]) => {
              const checkedCount = categoryItems.filter(item => item.is_checked).length;
              const totalCount = categoryItems.length;
              const isComplete = checkedCount === totalCount;
              
              return (
                <Card key={category} className={`transition-all hover:shadow-lg ${isComplete ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isComplete ? 'bg-primary/20' : 'bg-primary/10'}`}>
                          {isComplete ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Package className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {checkedCount} av {totalCount} packade
                          </p>
                        </div>
                      </div>
                      <Badge variant={isComplete ? "default" : "secondary"}>
                        {isComplete ? '✓ Klart!' : `${totalCount}`}
                      </Badge>
                    </div>
                  </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md ${
                          item.is_checked ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={item.is_checked}
                            onCheckedChange={() => toggleItemCheck(item.id, item.is_checked)}
                            className="transition-all"
                          />
                          <span className={`transition-all ${item.is_checked ? "line-through text-muted-foreground" : "font-medium"}`}>
                            {item.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem(item.id)}
                          className="hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )})}

            {items.length > 0 && (
              <Button 
                onClick={resetAllChecks} 
                variant="outline" 
                className="w-full gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <ListChecks className="h-4 w-4" />
                Återställ alla bockar
              </Button>
            )}
          </div>
        </>
      )}

      {!selectedTemplate && templates.length > 0 && (
        <Card className="border-dashed border-2 bg-gradient-to-br from-muted/50 to-transparent">
          <CardContent className="pt-12 pb-12 text-center">
            <ListChecks className="h-16 w-16 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-semibold mb-2">Välj en mall ovan</h3>
            <p className="text-muted-foreground">
              Börja bocka av eller lägg till fler saker i din packlista
            </p>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 && (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="relative inline-block mb-6">
              <Package className="h-20 w-20 text-primary/30" />
              <Sparkles className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Skapa din första packlista!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Spara tid och glöm aldrig något. Skapa mallar för olika typer av tävlingar och återanvänd dem.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                ✓ Återanvändbar
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                ✓ Bocka av saker
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                ✓ Återställ enkelt
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

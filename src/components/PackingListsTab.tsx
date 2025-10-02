import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package } from "lucide-react";
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
      <div className="flex gap-4">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Skapa mall
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Skapa ny packlista-mall</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Namn på mallen (t.ex. Hopptävling)"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
              <Button onClick={createTemplate} className="w-full">
                Skapa
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Select value={selectedTemplate || ""} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Välj en mall" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTemplate && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => deleteTemplate(selectedTemplate)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedTemplate && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lägg till saker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Namn på sak"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addItem()}
                />
                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                  <SelectTrigger className="w-[180px]">
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
                <Button onClick={addItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <Badge variant="secondary">{categoryItems.length}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 border"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={item.is_checked}
                            onCheckedChange={() => toggleItemCheck(item.id, item.is_checked)}
                          />
                          <span className={item.is_checked ? "line-through text-muted-foreground" : ""}>
                            {item.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {items.length > 0 && (
              <Button 
                onClick={resetAllChecks} 
                variant="outline" 
                className="w-full"
              >
                Återställ alla bockar
              </Button>
            )}
          </div>
        </>
      )}

      {!selectedTemplate && templates.length > 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Välj en mall för att börja redigera</p>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Skapa din första packlista-mall för att komma igång!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

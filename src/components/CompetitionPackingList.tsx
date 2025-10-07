import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PackingListItem {
  id: string;
  name: string;
  category: string;
  is_checked: boolean;
}

interface CompetitionPackingListProps {
  competitionId: string | number;
}

const CATEGORIES = ["Häst", "Ryttare", "Utrustning", "Övrigt"];

export const CompetitionPackingList = ({ competitionId }: CompetitionPackingListProps) => {
  const [items, setItems] = useState<PackingListItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<string>("Häst");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, [competitionId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("packing_list_items")
        .select("*")
        .eq("competition_id", String(competitionId))
        .order("category", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching packing list:", error);
      toast({
        title: "Kunde inte hämta packlista",
        description: "Försök igen senare",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItemName.trim()) {
      toast({
        title: "Namn krävs",
        description: "Ange ett namn för artikeln",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("packing_list_items")
        .insert([{
          name: newItemName.trim(),
          category: newItemCategory,
          competition_id: String(competitionId),
          user_id: user.id,
          is_checked: false,
        }]);

      if (error) throw error;

      toast({
        title: "Artikel tillagd",
        description: `${newItemName} har lagts till i packlistan`,
      });

      setNewItemName("");
      setNewItemCategory("Häst");
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Kunde inte lägga till artikel",
        description: "Försök igen senare",
        variant: "destructive",
      });
    }
  };

  const toggleItem = async (itemId: string, currentChecked: boolean) => {
    try {
      const { error } = await supabase
        .from("packing_list_items")
        .update({ is_checked: !currentChecked })
        .eq("id", itemId);

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_checked: !currentChecked } : item
      ));
    } catch (error) {
      console.error("Error toggling item:", error);
      toast({
        title: "Kunde inte uppdatera artikel",
        description: "Försök igen senare",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("packing_list_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Artikel borttagen",
        description: "Artikeln har tagits bort från packlistan",
      });

      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Kunde inte ta bort artikel",
        description: "Försök igen senare",
        variant: "destructive",
      });
    }
  };

  const checkedCount = items.filter(item => item.is_checked).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const itemsByCategory = CATEGORIES.map(category => ({
    category,
    items: items.filter(item => item.category === category),
  })).filter(group => group.items.length > 0);

  if (loading) {
    return <div className="text-center py-8">Laddar packlista...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      {totalCount > 0 && (
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{checkedCount} / {totalCount}</p>
                  <p className="text-sm text-muted-foreground">artiklar packade</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{progressPercent}%</p>
                <p className="text-sm text-muted-foreground">klart</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add new item */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lägg till artikel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="T.ex. Sadel, Hjälm, Hövätska..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addItem()}
              className="flex-1"
            />
            <Select value={newItemCategory} onValueChange={setNewItemCategory}>
              <SelectTrigger className="w-[140px]">
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
              <Plus className="w-4 h-4 mr-2" />
              Lägg till
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items by category */}
      {itemsByCategory.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Ingen packlista än. Börja lägg till artiklar!</p>
          </CardContent>
        </Card>
      ) : (
        itemsByCategory.map(({ category, items: categoryItems }) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category}</CardTitle>
                <Badge variant="outline">
                  {categoryItems.filter(i => i.is_checked).length} / {categoryItems.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={item.is_checked}
                        onCheckedChange={() => toggleItem(item.id, item.is_checked)}
                      />
                      <span className={item.is_checked ? "line-through text-muted-foreground" : ""}>
                        {item.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
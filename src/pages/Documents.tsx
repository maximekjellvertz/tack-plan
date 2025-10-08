import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HorseDocumentsTab } from "@/components/HorseDocumentsTab";
import { FileText } from "lucide-react";

interface Horse {
  id: string;
  name: string;
}

const Documents = () => {
  const navigate = useNavigate();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchHorses();
  };

  const fetchHorses = async () => {
    try {
      const { data, error } = await supabase
        .from("horses")
        .select("id, name")
        .order("name");

      if (error) throw error;

      setHorses(data || []);
      if (data && data.length > 0) {
        setSelectedHorseId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching horses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p>Laddar...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Dokument</h1>
          </div>
          <p className="text-muted-foreground">
            Hantera alla dokument för dina hästar - vaccinationsintyg, pass, försäkringar och mer
          </p>
        </div>

        {horses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Inga hästar</CardTitle>
              <CardDescription>
                Du behöver lägga till en häst innan du kan hantera dokument
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Välj häst</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedHorseId} onValueChange={setSelectedHorseId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Välj en häst" />
                  </SelectTrigger>
                  <SelectContent>
                    {horses.map((horse) => (
                      <SelectItem key={horse.id} value={horse.id}>
                        {horse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedHorseId && (
              <HorseDocumentsTab horseId={selectedHorseId} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Documents;
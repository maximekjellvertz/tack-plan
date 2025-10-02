import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CompetitionsPlanningTab } from "@/components/CompetitionsPlanningTab";
import { PackingListsTab } from "@/components/PackingListsTab";
import { RulesInfoTab } from "@/components/RulesInfoTab";
import { TDBSettings } from "@/components/TDBSettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";


const Competitions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCompetitions();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;

      setCompetitions(data || []);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      toast({
        title: "Kunde inte hämta tävlingar",
        description: "Försök igen senare",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = (competition: any) => {
    toast({
      title: "Tillagd i kalender!",
      description: `${competition.name} har lagts till i din kalender.`,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Tävlingar</h1>
            <p className="text-muted-foreground">
              Planering, packlistor och information
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                TDB-inställningar
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>TDB-integration</SheetTitle>
                <SheetDescription>
                  Anslut ditt TDB-konto för att automatiskt visa dina anmälda tävlingar
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <TDBSettings />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Tabs defaultValue="planning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planning">Planering</TabsTrigger>
            <TabsTrigger value="packing">Packlistor</TabsTrigger>
            <TabsTrigger value="rules">Regler & Info</TabsTrigger>
          </TabsList>

          <TabsContent value="planning">
            <CompetitionsPlanningTab
              competitions={competitions}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddToCalendar={handleAddToCalendar}
            />
          </TabsContent>

          <TabsContent value="packing">
            <PackingListsTab />
          </TabsContent>

          <TabsContent value="rules">
            <RulesInfoTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Competitions;

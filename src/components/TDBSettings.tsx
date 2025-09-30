import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link as LinkIcon, RefreshCw } from "lucide-react";

export const TDBSettings = () => {
  const [tdbEmail, setTdbEmail] = useState("");
  const [tdbPassword, setTdbPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingCredentials();
  }, []);

  const checkExistingCredentials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("tdb_credentials")
        .select("last_synced_at")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        setHasCredentials(true);
        setLastSynced(data.last_synced_at);
      }
    } catch (error) {
      console.error("Error checking credentials:", error);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Inte inloggad",
          description: "Du måste vara inloggad för att spara TDB-uppgifter",
          variant: "destructive",
        });
        return;
      }

      // Simple encryption (in production, use proper encryption)
      const encrypted = btoa(tdbPassword);

      const { error } = await supabase
        .from("tdb_credentials")
        .upsert({
          user_id: user.id,
          tdb_email: tdbEmail,
          tdb_password_encrypted: encrypted,
        });

      if (error) throw error;

      setHasCredentials(true);
      toast({
        title: "TDB-uppgifter sparade!",
        description: "Nu kan du synka dina tävlingar från TDB",
      });

      // Trigger initial sync
      handleSync();
    } catch (error) {
      console.error("Error saving credentials:", error);
      toast({
        title: "Misslyckades att spara",
        description: "Kunde inte spara TDB-uppgifter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call edge function to sync competitions
      const { data, error } = await supabase.functions.invoke("sync-tdb-competitions", {
        body: { userId: user.id },
      });

      if (error) throw error;

      setLastSynced(new Date().toISOString());
      
      toast({
        title: "Synkronisering klar!",
        description: `Hämtade ${data?.count || 0} tävlingar från TDB`,
      });

      // Refresh credentials check to update last_synced_at
      checkExistingCredentials();
    } catch (error) {
      console.error("Error syncing:", error);
      toast({
        title: "Synkronisering misslyckades",
        description: "Kunde inte hämta tävlingar från TDB. Kontrollera dina inloggningsuppgifter.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <LinkIcon className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">TDB-integration</h2>
      </div>

      {!hasCredentials ? (
        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Koppla ditt TDB-konto för att automatiskt synka dina anmälda tävlingar
          </p>

          <div className="space-y-2">
            <Label htmlFor="tdb-email">TDB E-post</Label>
            <Input
              id="tdb-email"
              type="email"
              placeholder="din@tdb-email.com"
              value={tdbEmail}
              onChange={(e) => setTdbEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tdb-password">TDB Lösenord</Label>
            <Input
              id="tdb-password"
              type="password"
              placeholder="Ditt TDB-lösenord"
              value={tdbPassword}
              onChange={(e) => setTdbPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sparar...
              </>
            ) : (
              "Spara och synka"
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-secondary/20 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-1">Status: Ansluten</p>
            {lastSynced && (
              <p className="text-xs text-muted-foreground">
                Senast synkad: {new Date(lastSynced).toLocaleString("sv-SE")}
              </p>
            )}
          </div>

          <Button onClick={handleSync} className="w-full" disabled={syncing}>
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Synkroniserar...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Synka nu
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setHasCredentials(false);
              setTdbEmail("");
              setTdbPassword("");
            }}
          >
            Uppdatera inloggningsuppgifter
          </Button>
        </div>
      )}
    </Card>
  );
};

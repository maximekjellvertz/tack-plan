import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, CheckCircle, Clock, Image as ImageIcon } from "lucide-react";
import { AddHealthLogDialog } from "@/components/AddHealthLogDialog";
import { HealthLogDetailsDialog } from "@/components/HealthLogDetailsDialog";
import { UpdateHealthLogDialog } from "@/components/UpdateHealthLogDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface HealthLog {
  id: string;
  horse_name: string;
  event: string;
  severity: string;
  status: string;
  treatment: string;
  notes: string | null;
  images: any;
  created_at: string;
  created_by_name?: string | null;
  updated_by_name?: string | null;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Lätt":
      return "bg-secondary";
    case "Medel":
      return "bg-primary";
    case "Allvarlig":
      return "bg-destructive";
    default:
      return "bg-muted";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Pågående":
      return <Clock className="w-4 h-4" />;
    case "Klar":
      return <CheckCircle className="w-4 h-4" />;
    case "Uppmärksamhet":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const HealthLog = () => {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchHealthLogs();
    }
  }, [user]);

  const fetchHealthLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("health_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setHealthLogs(data || []);
    } catch (error) {
      console.error("Error fetching health logs:", error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta hälsologgar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLog = async (id: string, updates: Partial<HealthLog>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's full name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { error } = await supabase
        .from("health_logs")
        .update({
          ...updates,
          updated_by_name: profile?.full_name || "Okänd användare",
        })
        .eq("id", id);

      if (error) throw error;

      await fetchHealthLogs();
      toast({
        title: "Uppdaterat",
        description: "Hälsologg har uppdaterats",
      });
    } catch (error) {
      console.error("Error updating health log:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera hälsologg",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from("health_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchHealthLogs();
      toast({
        title: "Raderat",
        description: "Hälsologg har raderats",
      });
    } catch (error) {
      console.error("Error deleting health log:", error);
      toast({
        title: "Fel",
        description: "Kunde inte radera hälsologg",
        variant: "destructive",
      });
    }
  };

  const ongoingCount = healthLogs.filter(log => log.status === "Pågående").length;
  const completedCount = healthLogs.filter(log => log.status === "Klar").length;
  const attentionCount = healthLogs.filter(log => log.status === "Uppmärksamhet").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Hälsologg</h1>
            <p className="text-muted-foreground">
              Dokumentera och följ upp dina hästars hälsa
            </p>
          </div>
          <AddHealthLogDialog onLogAdded={fetchHealthLogs} />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Pågående</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{ongoingCount}</p>
              </div>
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Avslutade</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{completedCount}</p>
              </div>
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Uppföljning</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{attentionCount}</p>
              </div>
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-destructive" />
            </div>
          </Card>
        </div>

        {/* Log Entries */}
        {healthLogs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-24 w-24 text-muted-foreground/40 mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">Inga hälsologgar än</h3>
            <p className="text-muted-foreground mb-6">
              Börja dokumentera dina hästars hälsa och behandlingar
            </p>
            <AddHealthLogDialog onLogAdded={fetchHealthLogs} />
          </Card>
        ) : (
          <div className="space-y-4">
            {healthLogs.map((log) => (
              <Card key={log.id} className="p-6 hover:shadow-elevated transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{log.event}</h3>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.horse_name} • {new Date(log.created_at).toLocaleDateString('sv-SE')}
                          {log.created_by_name && (
                            <> • Tillagd av {log.created_by_name}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm font-medium text-foreground">{log.status}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Behandling:</p>
                        <p className="text-sm text-muted-foreground">{log.treatment}</p>
                      </div>
                      {log.notes && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Anteckningar:</p>
                          <p className="text-sm text-muted-foreground">{log.notes}</p>
                        </div>
                      )}
                      {log.images && Array.isArray(log.images) && log.images.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Bilder ({log.images.length})
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {log.images.map((img: string, imgIndex: number) => (
                              <img
                                key={imgIndex}
                                src={img}
                                alt={`${log.event} bild ${imgIndex + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-border hover:scale-105 transition-transform cursor-pointer"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:w-40">
                    <HealthLogDetailsDialog log={log} onDelete={handleDeleteLog} />
                    {log.status === "Pågående" && (
                      <UpdateHealthLogDialog 
                        log={log} 
                        onUpdate={(id, updates) => handleUpdateLog(id, updates)} 
                      />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <div className="flex gap-4">
            <FileText className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Tips för bra dokumentation
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fotografera alltid symptomen för framtida jämförelse</li>
                <li>• Notera exakt plats på kroppen och svårighetsgrad</li>
                <li>• Dokumentera vilken behandling som användes och resultatet</li>
                <li>• Följ upp efter några dagar för att se förändring</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HealthLog;

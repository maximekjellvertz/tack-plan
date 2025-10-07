import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Trash2, Mail, CheckCircle, Clock, Eye, Edit, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SharedAccess {
  id: string;
  collaborator_email: string;
  role: "viewer" | "editor" | "manager";
  access_type: "full_account" | "specific_horses";
  horse_ids: string[] | null;
  status: "pending" | "active" | "revoked";
  invited_at: string;
  accepted_at: string | null;
}

export const SharedAccessList = () => {
  const [sharedAccess, setSharedAccess] = useState<SharedAccess[]>([]);
  const [horses, setHorses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSharedAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("shared_access")
        .select("*")
        .eq("owner_id", user.id)
        .order("invited_at", { ascending: false });

      if (error) throw error;
      setSharedAccess(data || []);

      // Fetch horse names
      const { data: horsesData } = await supabase
        .from("horses")
        .select("id, name")
        .eq("user_id", user.id);

      if (horsesData) {
        const horseMap = horsesData.reduce((acc, horse) => {
          acc[horse.id] = horse.name;
          return acc;
        }, {} as Record<string, string>);
        setHorses(horseMap);
      }
    } catch (error: any) {
      console.error("Error fetching shared access:", error);
      toast.error("Kunde inte hämta delningar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedAccess();
  }, []);

  const handleRevoke = async (id: string) => {
    try {
      const { error } = await supabase
        .from("shared_access")
        .update({ status: "revoked" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Tillgång återkallad");
      fetchSharedAccess();
    } catch (error: any) {
      console.error("Error revoking access:", error);
      toast.error("Kunde inte återkalla tillgång");
    }
    setDeleteId(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "viewer": return <Eye className="w-4 h-4" />;
      case "editor": return <Edit className="w-4 h-4" />;
      case "manager": return <Shield className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "viewer": return "Viewer";
      case "editor": return "Editor";
      case "manager": return "Manager";
      default: return role;
    }
  };

  const getAccessDescription = (access: SharedAccess) => {
    if (access.access_type === "full_account") {
      return "Alla hästar";
    }
    if (access.horse_ids && access.horse_ids.length > 0) {
      return access.horse_ids.map(id => horses[id] || "Okänd häst").join(", ");
    }
    return "Ingen häst vald";
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Laddar...</div>;
  }

  if (sharedAccess.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-card to-muted/30">
        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Ingen delad tillgång ännu</h3>
        <p className="text-sm text-muted-foreground">
          Klicka på "Dela tillgång" för att bjuda in personer till ditt konto
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sharedAccess.map((access) => (
          <Card key={access.id} className="p-4 bg-gradient-to-br from-card to-muted/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{access.collaborator_email}</span>
                  {access.status === "pending" && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Väntar
                    </Badge>
                  )}
                  {access.status === "active" && (
                    <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Aktiv
                    </Badge>
                  )}
                  {access.status === "revoked" && (
                    <Badge variant="outline" className="gap-1 border-red-500 text-red-600">
                      Återkallad
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {getRoleIcon(access.role)}
                    <span>{getRoleLabel(access.role)}</span>
                  </div>
                  <span>•</span>
                  <span>{getAccessDescription(access)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Inbjuden {new Date(access.invited_at).toLocaleDateString("sv-SE")}
                  {access.accepted_at && (
                    <> • Accepterad {new Date(access.accepted_at).toLocaleDateString("sv-SE")}</>
                  )}
                </div>
              </div>
              {access.status !== "revoked" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(access.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Återkalla tillgång?</AlertDialogTitle>
            <AlertDialogDescription>
              Personen kommer inte längre kunna se eller redigera din data. Du kan bjuda in dem igen senare.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleRevoke(deleteId)}>
              Återkalla tillgång
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

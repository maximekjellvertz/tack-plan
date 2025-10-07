import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Shield, Trash2, Clock, CheckCircle2, XCircle, Edit } from "lucide-react";
import { EditSharedAccessDialog } from "./EditSharedAccessDialog";
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

interface SharedAccessListProps {
  sharedAccess: SharedAccess[];
  horses: Array<{ id: string; name: string }>;
  onUpdate: () => void;
}

export const SharedAccessList = ({ sharedAccess, horses, onUpdate }: SharedAccessListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editAccess, setEditAccess] = useState<SharedAccess | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("shared_access")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast.success("Tillgång borttagen");
      onUpdate();
      setDeleteId(null);
    } catch (error: any) {
      console.error("Error deleting access:", error);
      toast.error("Kunde inte ta bort tillgång");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      viewer: { label: "Viewer", variant: "secondary" },
      editor: { label: "Editor", variant: "default" },
      manager: { label: "Manager", variant: "outline" },
    };
    const config = variants[role] || variants.viewer;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "active":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "revoked":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getHorseNames = (horseIds: string[] | null) => {
    if (!horseIds || horseIds.length === 0) return null;
    return horseIds
      .map(id => horses.find(h => h.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  if (sharedAccess.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Du har inte delat tillgång med någon än
        </p>
      </Card>
    );
  }

  return (
    <>
      <EditSharedAccessDialog
        open={!!editAccess}
        onOpenChange={(open) => !open && setEditAccess(null)}
        horses={horses}
        sharedAccess={editAccess}
        onSuccess={onUpdate}
      />
      
      <div className="space-y-3">
        {sharedAccess.map((access) => (
          <Card key={access.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{access.collaborator_email}</span>
                  {getStatusIcon(access.status)}
                </div>
                
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  {getRoleBadge(access.role)}
                  
                  {access.access_type === "full_account" ? (
                    <Badge variant="outline">Hela kontot</Badge>
                  ) : (
                    <Badge variant="outline">
                      {access.horse_ids?.length || 0} häst(ar)
                    </Badge>
                  )}
                  
                  <span className="text-muted-foreground">
                    {access.status === "pending" ? "Väntar på accept" : 
                     access.status === "active" ? "Aktiv" : "Återkallad"}
                  </span>
                </div>

                {access.access_type === "specific_horses" && access.horse_ids && (
                  <p className="text-xs text-muted-foreground">
                    Hästar: {getHorseNames(access.horse_ids) || "Inga hästar valda"}
                  </p>
                )}
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditAccess(access)}
                  className="text-primary hover:text-primary"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(access.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort tillgång?</AlertDialogTitle>
            <AlertDialogDescription>
              Denna person kommer inte längre att ha tillgång till dina hästar och data.
              Denna åtgärd kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Tar bort..." : "Ta bort"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

export const useAcceptInvitations = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    let isProcessing = false;
    
    const acceptPendingInvitations = async () => {
      // Prevent multiple simultaneous executions
      if (isProcessing) return;
      isProcessing = true;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        // Check for pending invitations
        const { data: pendingInvites, error: fetchError } = await supabase
          .from("shared_access")
          .select("*")
          .eq("collaborator_email", user.email.toLowerCase())
          .eq("status", "pending");

        if (fetchError) {
          console.error("Error fetching invitations:", fetchError);
          return;
        }

        // Only process if there are actually pending invitations
        if (!pendingInvites || pendingInvites.length === 0) {
          return;
        }

        console.log("Found pending invites, activating:", pendingInvites.length);

        // Accept all pending invitations
        const { error: updateError } = await supabase
          .from("shared_access")
          .update({
            collaborator_id: user.id,
            status: "active",
            accepted_at: new Date().toISOString()
          })
          .eq("collaborator_email", user.email.toLowerCase())
          .eq("status", "pending");

        if (updateError) {
          console.error("Error updating invitations:", updateError);
          toast.error("Kunde inte aktivera inbjudningar");
          return;
        }

        toast.success(`Välkommen! Du har nu tillgång till ${pendingInvites.length} delad(e) konto(n).`, {
          duration: 4000,
        });
        
        // Navigate to horses page to see shared data
        setTimeout(() => {
          navigate("/horses", { replace: true });
        }, 1000);
      } catch (error) {
        console.error("Error accepting invitations:", error);
      } finally {
        isProcessing = false;
      }
    };

    acceptPendingInvitations();
  }, []); // Only run once on mount
};

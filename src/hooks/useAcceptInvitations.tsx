import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAcceptInvitations = () => {
  useEffect(() => {
    const acceptPendingInvitations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        // Check for pending invitations
        const { data: pendingInvites, error: fetchError } = await supabase
          .from("shared_access")
          .select("*")
          .eq("collaborator_email", user.email.toLowerCase())
          .eq("status", "pending");

        if (fetchError) throw fetchError;

        if (pendingInvites && pendingInvites.length > 0) {
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

          if (updateError) throw updateError;

          toast.success(`${pendingInvites.length} inbjudan(ar) aktiverad(e)!`);
        }
      } catch (error) {
        console.error("Error accepting invitations:", error);
      }
    };

    acceptPendingInvitations();
  }, []);
};

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

export const useAcceptInvitations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const acceptPendingInvitations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        console.log("Checking for pending invitations for:", user.email);

        // Check for pending invitations
        const { data: pendingInvites, error: fetchError } = await supabase
          .from("shared_access")
          .select("*")
          .eq("collaborator_email", user.email.toLowerCase())
          .eq("status", "pending");

        if (fetchError) {
          console.error("Error fetching invitations:", fetchError);
          throw fetchError;
        }

        console.log("Pending invites found:", pendingInvites);

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

          if (updateError) {
            console.error("Error updating invitations:", updateError);
            throw updateError;
          }

          console.log("Invitations activated successfully");

          toast.success(`Välkommen! Du har nu tillgång till ${pendingInvites.length} delad(e) konto(n).`, {
            duration: 4000,
          });
          
          // If on auth page, redirect to horses
          if (location.pathname === "/auth" || location.pathname === "/") {
            setTimeout(() => {
              navigate("/horses");
            }, 1000);
          } else {
            // Reload current page to show shared data
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Error accepting invitations:", error);
        toast.error("Kunde inte aktivera inbjudningar");
      }
    };

    acceptPendingInvitations();
  }, [navigate, location]);
};

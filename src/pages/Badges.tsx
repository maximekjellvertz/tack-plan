import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BadgesGrid } from "@/components/BadgesGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useBadgeManager } from "@/hooks/useBadgeManager";

interface Badge {
  id: string;
  badge_type: string;
  title: string;
  description: string | null;
  earned_date: string;
  is_manual: boolean;
}

const Badges = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>();
  const { checkBadges } = useBadgeManager(userId);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBadges();
      // Check for new badges when page loads
      checkBadges();
    }
  }, [userId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUserId(session.user.id);
  };

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("user_id", userId)
        .order("earned_date", { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Dina Badges</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Du har tjänat {badges.length} {badges.length === 1 ? "badge" : "badges"}!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Fortsätt träna, tävla och dokumentera för att samla fler prestationer
          </p>
        </div>

        <BadgesGrid badges={badges} />
      </div>
    </div>
  );
};

export default Badges;

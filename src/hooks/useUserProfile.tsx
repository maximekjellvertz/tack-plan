import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<{ id: string; full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          setLoading(false);
          return;
        }

        setUserProfile(data);
      } catch (error) {
        console.error("Error in useUserProfile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { userProfile, loading };
};

export const getUserName = async (userId?: string): Promise<string> => {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Okänd användare";
    userId = user.id;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return "Okänd användare";
  }

  return data.full_name;
};

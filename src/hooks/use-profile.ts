import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  sex: string | null;
  goal: string | null;
  diet_plan: any;
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      setProfile(data as any);
      setLoading(false);
    })();
  }, []);
  return { profile, loading, setProfile };
}

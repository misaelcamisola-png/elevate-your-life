import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, weight_kg, height_cm")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (!profile?.name || !profile?.weight_kg || !profile?.height_cm) {
        navigate({ to: "/onboarding" });
      } else {
        navigate({ to: "/home" });
      }
    });
  }, [navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

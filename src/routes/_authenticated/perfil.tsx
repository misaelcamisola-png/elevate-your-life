import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { useProfile } from "@/hooks/use-profile";
import { LogOut, Edit, Moon, Sparkles, BarChart3, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const [grats, setGrats] = useState<any[]>([]);
  const [grat, setGrat] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("gratitude_entries").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(10);
      setGrats(data ?? []);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }
  async function addGrat() {
    if (!grat.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("gratitude_entries").insert({ user_id: session.user.id, content: grat.trim() });
    setGrat(""); toast.success("Gratidão registrada");
    const { data } = await supabase.from("gratitude_entries").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(10);
    setGrats(data ?? []);
  }

  const bmi = profile?.weight_kg && profile?.height_cm ? (Number(profile.weight_kg) / Math.pow(Number(profile.height_cm) / 100, 2)).toFixed(1) : null;

  if (loading) return null;

  return (
    <div>
      <PageHeader title="Perfil" />
      <Section title="Dados">
        <Card className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold">{profile?.name?.[0] ?? "?"}</div>}
          <div className="flex-1">
            <div className="font-semibold">{profile?.name}</div>
            <div className="text-xs text-muted-foreground">{profile?.weight_kg}kg · {profile?.height_cm}cm{bmi ? ` · IMC ${bmi}` : ""}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{profile?.goal}</div>
          </div>
          <Link to="/onboarding" className="text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></Link>
        </Card>
      </Section>

      <Section title="Mais">
        <div className="space-y-2">
          <Link to="/sono"><Card className="flex items-center justify-between"><div className="flex items-center gap-3"><Moon className="h-5 w-5 text-gold" /><span className="text-sm">Sono e despertar</span></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></Card></Link>
          <Link to="/progresso"><Card className="flex items-center justify-between"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-success" /><span className="text-sm">Progresso semanal</span></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></Card></Link>
        </div>
      </Section>

      <Section title="Gratidão">
        <Card className="space-y-2 mb-2">
          <textarea placeholder="Pelo que você é grato hoje?" value={grat} onChange={(e) => setGrat(e.target.value)} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm min-h-16" />
          <button onClick={addGrat} className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold flex items-center justify-center gap-1"><Sparkles className="h-4 w-4" />Registrar</button>
        </Card>
        <div className="space-y-1.5">
          {grats.map((g) => (
            <Card key={g.id} className="!p-3"><p className="text-sm">{g.content}</p><div className="text-[10px] text-muted-foreground mt-1">{new Date(g.created_at).toLocaleDateString("pt-BR")}</div></Card>
          ))}
        </div>
      </Section>

      <Section title="Conta">
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive py-3 text-sm font-semibold">
          <LogOut className="h-4 w-4" /> Desconectar
        </button>
      </Section>
    </div>
  );
}

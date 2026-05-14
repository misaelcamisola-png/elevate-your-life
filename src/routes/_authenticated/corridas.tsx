import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { todayISO } from "@/lib/date-utils";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/corridas")({
  component: CorridasPage,
});

function CorridasPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [form, setForm] = useState({ km: "", duration_min: "", type: "corrida" });

  useEffect(() => { load(); }, []);
  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from("runs").select("*").eq("user_id", session.user.id).order("run_date", { ascending: false }).limit(60);
    setRuns(data ?? []);
  }
  async function add() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const km = Number(form.km);
    if (!km) return toast.error("Informe os km");
    const dur = Number(form.duration_min) || 0;
    // estimativa simples: corrida 65 kcal/km, caminhada 50
    const calories = Math.round(km * (form.type === "corrida" ? 65 : 50));
    await supabase.from("runs").insert({
      user_id: session.user.id, km, duration_min: dur || null, type: form.type, calories, run_date: todayISO(),
    });
    setForm({ km: "", duration_min: "", type: form.type });
    toast.success("Registrado!");
    load();
  }
  async function del(id: string) { await supabase.from("runs").delete().eq("id", id); load(); }

  const totalKm = runs.reduce((a, r) => a + Number(r.km || 0), 0);
  const totalCal = runs.reduce((a, r) => a + Number(r.calories || 0), 0);

  return (
    <div>
      <PageHeader title="Corridas e caminhadas" subtitle="Cada km conta." />

      <Section title="Resumo">
        <div className="grid grid-cols-2 gap-3">
          <Card><div className="text-xs text-muted-foreground">Total km</div><div className="mt-1 text-2xl font-bold">{totalKm.toFixed(1)}</div></Card>
          <Card><div className="text-xs text-muted-foreground">Calorias</div><div className="mt-1 text-2xl font-bold">{totalCal}</div></Card>
        </div>
      </Section>

      <Section title="Registrar">
        <Card className="space-y-2">
          <div className="flex gap-2">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="bg-input border border-border rounded-lg px-3 py-2 text-sm">
              <option value="corrida">Corrida</option>
              <option value="caminhada">Caminhada</option>
            </select>
            <input placeholder="Km" type="number" step="0.1" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Min" type="number" value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: e.target.value })} className="w-20 bg-input border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={add} className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold">Adicionar</button>
        </Card>
      </Section>

      <Section title="Histórico">
        <div className="space-y-2">
          {runs.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{r.km} km · {r.type}</div>
                  <div className="text-xs text-muted-foreground">{r.run_date} · {r.calories} kcal{r.duration_min ? ` · ${r.duration_min} min` : ""}</div>
                </div>
                <button onClick={() => del(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </Card>
          ))}
          {runs.length === 0 && <Card><p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p></Card>}
        </div>
      </Section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { weekStartISO, DAY_LABELS } from "@/lib/date-utils";

export const Route = createFileRoute("/_authenticated/progresso")({
  component: ProgressoPage,
});

function ProgressoPage() {
  const [data, setData] = useState<any>({ checklist: [], reading: [], water: [], runs: [], prayers: 0, workouts: 0 });

  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ws = weekStartISO();
    const start = ws;
    const [{ data: ck }, { data: rd }, { data: wt }, { data: rn }, { data: pr }, { data: wo }] = await Promise.all([
      supabase.from("daily_checklist").select("*").eq("user_id", session.user.id).gte("log_date", start),
      supabase.from("reading_logs").select("*").eq("user_id", session.user.id).gte("log_date", start),
      supabase.from("water_logs").select("*").eq("user_id", session.user.id).gte("log_date", start),
      supabase.from("runs").select("*").eq("user_id", session.user.id).gte("run_date", start),
      supabase.from("prayer_logs").select("*").eq("user_id", session.user.id).eq("week_start", ws),
      supabase.from("workout_logs").select("*").eq("user_id", session.user.id).eq("completed", true).gte("log_date", start),
    ]);
    setData({ checklist: ck ?? [], reading: rd ?? [], water: wt ?? [], runs: rn ?? [], prayers: (pr ?? []).length, workouts: (wo ?? []).length });
  })(); }, []);

  const totalRdMin = data.reading.reduce((a: number, r: any) => a + (r.minutes || 0), 0);
  const totalKm = data.runs.reduce((a: number, r: any) => a + Number(r.km || 0), 0);
  const totalCups = data.water.reduce((a: number, r: any) => a + (r.cups || 0), 0);
  const fullDays = data.checklist.filter((c: any) => c.water_done && c.meals_done && c.workout_done && c.reading_done && c.prayer_done).length;

  // gráfico de checklist por dia da semana
  const byDow = Array.from({ length: 7 }).map((_, i) => {
    const ws = new Date(weekStartISO()); ws.setDate(ws.getDate() + i);
    const iso = ws.toISOString().slice(0, 10);
    const c: any = data.checklist.find((x: any) => x.log_date === iso);
    if (!c) return 0;
    return ["water_done", "meals_done", "workout_done", "reading_done", "prayer_done"].filter((k) => c[k]).length;
  });

  return (
    <div>
      <PageHeader title="Progresso semanal" subtitle="Sua semana em números." />

      <Section title="Resumo">
        <div className="grid grid-cols-2 gap-2">
          <Card><div className="text-[10px] uppercase text-muted-foreground">Treinos</div><div className="mt-1 text-2xl font-bold">{data.workouts}</div></Card>
          <Card><div className="text-[10px] uppercase text-muted-foreground">Orações</div><div className="mt-1 text-2xl font-bold">{data.prayers}/7</div></Card>
          <Card><div className="text-[10px] uppercase text-muted-foreground">Leitura</div><div className="mt-1 text-2xl font-bold">{totalRdMin} min</div></Card>
          <Card><div className="text-[10px] uppercase text-muted-foreground">Km</div><div className="mt-1 text-2xl font-bold">{totalKm.toFixed(1)}</div></Card>
          <Card><div className="text-[10px] uppercase text-muted-foreground">Copos água</div><div className="mt-1 text-2xl font-bold">{totalCups}</div></Card>
          <Card><div className="text-[10px] uppercase text-muted-foreground">Dias 100%</div><div className="mt-1 text-2xl font-bold">{fullDays}</div></Card>
        </div>
      </Section>

      <Section title="Checklist por dia">
        <Card>
          <div className="flex h-32 items-end gap-2">
            {byDow.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-success transition-all" style={{ height: `${(v / 5) * 100}%`, minHeight: 2 }} />
                <span className="text-[10px] text-muted-foreground">{DAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { PLANS, planByKey, type WorkoutPlan } from "@/lib/workout-plans";
import { todayISO, dayOfWeekISO, DAY_LABELS } from "@/lib/date-utils";
import { Check, Plus, Trash2, ChevronRight, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/treinos")({
  component: TreinosPage,
});

function TreinosPage() {
  const [planKey, setPlanKey] = useState<string>("hipertrofia_emagrecimento");
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [todayLogId, setTodayLogId] = useState<string | null>(null);
  const [todayChecks, setTodayChecks] = useState<Record<number, boolean>>({});
  const [customs, setCustoms] = useState<any[]>([]);
  const [showCustom, setShowCustom] = useState(false);

  const plan = planByKey(planKey)!;
  const dow = dayOfWeekISO();
  const todayWorkout = plan.days.find((d) => d.day_of_week === dow);

  useEffect(() => { load(); }, [planKey]);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const since = new Date(); since.setDate(since.getDate() - 60);
    const { data: logs } = await supabase
      .from("workout_logs").select("*")
      .eq("user_id", session.user.id).eq("completed", true)
      .gte("log_date", since.toISOString().slice(0,10));
    setCompletedDates(new Set((logs ?? []).map((l) => l.log_date as string)));
    const { data: today } = await supabase
      .from("workout_logs").select("*")
      .eq("user_id", session.user.id).eq("log_date", todayISO()).eq("plan_key", planKey).maybeSingle();
    if (today) {
      setTodayLogId(today.id as string);
      setTodayChecks((today.exercises as any)?.checks ?? {});
    } else { setTodayLogId(null); setTodayChecks({}); }

    const { data: cw } = await supabase.from("custom_workouts").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setCustoms(cw ?? []);
  }

  async function toggleExercise(idx: number) {
    if (!todayWorkout) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const next = { ...todayChecks, [idx]: !todayChecks[idx] };
    setTodayChecks(next);
    const allDone = todayWorkout.exercises.every((_, i) => next[i]);
    const payload = {
      user_id: session.user.id,
      log_date: todayISO(),
      plan_key: planKey,
      workout_name: todayWorkout.name,
      exercises: { checks: next, list: todayWorkout.exercises },
      completed: allDone,
    };
    if (todayLogId) {
      await supabase.from("workout_logs").update(payload).eq("id", todayLogId);
    } else {
      const { data } = await supabase.from("workout_logs").insert(payload).select().single();
      if (data) setTodayLogId(data.id as string);
    }
    if (allDone) {
      toast.success("🎉 Treino concluído!");
      setCompletedDates(new Set([...completedDates, todayISO()]));
      // marcar checklist do dia
      await supabase.from("daily_checklist").upsert({
        user_id: session.user.id, log_date: todayISO(), workout_done: true,
      }, { onConflict: "user_id,log_date" });
      // reset visual após 1s
      setTimeout(() => setTodayChecks({}), 1500);
    }
  }

  return (
    <div>
      <PageHeader title="Treinos" subtitle="Escolha um plano e bata a meta de hoje." />

      <Section title="Planos">
        <div className="space-y-2">
          {PLANS.map((p) => (
            <button key={p.key} onClick={() => setPlanKey(p.key)} className={`w-full text-left rounded-2xl border p-4 transition ${planKey === p.key ? "border-foreground/60 bg-card" : "border-border bg-card/50"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.subtitle}</div>
                </div>
                {planKey === p.key && <Check className="h-5 w-5 text-success" />}
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section title={`Hoje — ${DAY_LABELS[dow - 1]}`}>
        {dow === 7 ? (
          <Card><p className="text-sm text-muted-foreground">Domingo é descanso. Recupere e prepare a semana 🙌</p></Card>
        ) : todayWorkout ? (
          <Card>
            <div className="font-semibold">{todayWorkout.name}</div>
            <div className="mt-3 space-y-2">
              {todayWorkout.exercises.map((ex, i) => (
                <button key={i} onClick={() => toggleExercise(i)} className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3 text-left">
                  <div className={`h-5 w-5 shrink-0 rounded border-2 ${todayChecks[i] ? "bg-success border-success" : "border-border"} flex items-center justify-center`}>
                    {todayChecks[i] && <Check className="h-3 w-3 text-success-foreground" strokeWidth={3} />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm ${todayChecks[i] ? "line-through text-muted-foreground" : ""}`}>{ex.name}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{ex.sets}</span>
                </button>
              ))}
            </div>
          </Card>
        ) : <Card><p className="text-sm text-muted-foreground">Sem treino programado.</p></Card>}
      </Section>

      <Section title="Semana inteira">
        <div className="space-y-2">
          {plan.days.map((d) => {
            const isToday = d.day_of_week === dow;
            const isBonus = d.day_of_week === 6;
            return (
              <Card key={d.day_of_week} className={isToday ? "border-foreground/60" : ""}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{DAY_LABELS[d.day_of_week - 1]}</span>
                    {isToday && <span className="text-[10px] px-2 py-0.5 rounded-full bg-foreground text-background font-semibold">HOJE</span>}
                    {isBonus && <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-semibold">BÔNUS</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{d.exercises.length} ex.</span>
                </div>
                <div className="font-semibold text-sm">{d.name}</div>
                {isBonus && <div className="text-xs text-muted-foreground mt-1">Sábado é opcional — só se quiser ir 💪</div>}
              </Card>
            );
          })}
          <Card className="bg-secondary/30">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Domingo</div>
            <div className="font-semibold text-sm mt-1">Descanso</div>
          </Card>
        </div>
      </Section>

      <Section title="Calendário (últimos 60 dias)" action={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}>
        <Card>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 60 }).map((_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (59 - i));
              const iso = d.toISOString().slice(0, 10);
              const ok = completedDates.has(iso);
              return <div key={i} title={iso} className={`aspect-square rounded ${ok ? "bg-success" : "bg-secondary"}`} />;
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">{completedDates.size} treinos concluídos</div>
        </Card>
      </Section>

      <Section title="Meus treinos personalizados" action={
        <button onClick={() => setShowCustom(!showCustom)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <Plus className="h-4 w-4" /> Criar
        </button>
      }>
        {showCustom && <CustomWorkoutForm onCreated={() => { setShowCustom(false); load(); }} />}
        {customs.length === 0 && !showCustom ? (
          <Card><p className="text-sm text-muted-foreground">Nenhum treino criado ainda.</p></Card>
        ) : (
          <div className="space-y-2">
            {customs.map((c) => (
              <Card key={c.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{(c.exercises as any[])?.length ?? 0} exercícios</div>
                  </div>
                  <button onClick={async () => { await supabase.from("custom_workouts").delete().eq("id", c.id); load(); }} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section title="Outras atividades">
        <Link to="/corridas" className="block">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary"><MapPin className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold text-sm">Corridas e caminhadas</div>
                <div className="text-xs text-muted-foreground">Registre km e calorias</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </Link>
      </Section>
    </div>
  );
}

function CustomWorkoutForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [exs, setExs] = useState<{ name: string; sets: string }[]>([{ name: "", sets: "" }]);
  async function save() {
    if (!name.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("custom_workouts").insert({
      user_id: session.user.id, name: name.trim(), exercises: exs.filter(e => e.name.trim()),
    });
    toast.success("Treino criado!");
    onCreated();
  }
  return (
    <Card className="space-y-2 mb-2">
      <input placeholder="Nome do treino" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" />
      {exs.map((e, i) => (
        <div key={i} className="flex gap-2">
          <input placeholder="Exercício" value={e.name} onChange={(ev) => { const n = [...exs]; n[i].name = ev.target.value; setExs(n); }} className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm" />
          <input placeholder="4x10" value={e.sets} onChange={(ev) => { const n = [...exs]; n[i].sets = ev.target.value; setExs(n); }} className="w-20 bg-input border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={() => setExs([...exs, { name: "", sets: "" }])} className="flex-1 rounded-lg border border-border py-2 text-xs">+ Exercício</button>
        <button onClick={save} className="flex-1 rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold">Salvar</button>
      </div>
    </Card>
  );
}

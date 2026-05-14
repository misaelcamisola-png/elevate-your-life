import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { getDailyContent } from "@/lib/ai.functions";
import { weekStartISO, DAY_LABELS } from "@/lib/date-utils";
import { Heart, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/fe")({
  component: FePage,
});

function FePage() {
  const getContent = useServerFn(getDailyContent);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weekChecks, setWeekChecks] = useState<Record<number, boolean>>({});

  useEffect(() => { (async () => {
    try { const c = await getContent(); setContent(c); }
    catch (e: any) { toast.error("Erro IA: " + e.message); }
    setLoading(false);
    loadWeek();
  })(); }, []);

  async function loadWeek() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ws = weekStartISO();
    const { data } = await supabase.from("prayer_logs").select("*").eq("user_id", session.user.id).eq("week_start", ws);
    const m: Record<number, boolean> = {};
    (data ?? []).forEach((r) => { m[r.day_of_week as number] = true; });
    setWeekChecks(m);
  }

  async function togglePray(dow: number) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const ws = weekStartISO();
    if (weekChecks[dow]) {
      await supabase.from("prayer_logs").delete().eq("user_id", session.user.id).eq("week_start", ws).eq("day_of_week", dow);
      setWeekChecks({ ...weekChecks, [dow]: false });
    } else {
      await supabase.from("prayer_logs").upsert({ user_id: session.user.id, week_start: ws, day_of_week: dow, prayed: true }, { onConflict: "user_id,week_start,day_of_week" });
      setWeekChecks({ ...weekChecks, [dow]: true });
      // marcar checklist hoje se for o dia atual
      const todayDow = (() => { const d = new Date().getDay(); return d === 0 ? 7 : d; })();
      if (dow === todayDow) {
        await supabase.from("daily_checklist").upsert({ user_id: session.user.id, log_date: new Date().toISOString().slice(0, 10), prayer_done: true }, { onConflict: "user_id,log_date" });
      }
      const total = Object.values({ ...weekChecks, [dow]: true }).filter(Boolean).length;
      if (total >= 7) toast.success("🙌 Semana completa! Resetando para a próxima.");
    }
  }

  return (
    <div>
      <PageHeader title="Fé & Bíblia" subtitle="Comece o dia com oração." />

      <Section title="Lembrete semanal de oração">
        <Card>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_LABELS.map((lbl, i) => {
              const dow = i + 1;
              const ok = weekChecks[dow];
              return (
                <button key={dow} onClick={() => togglePray(dow)} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">{lbl}</span>
                  <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center ${ok ? "bg-success border-success" : "border-border bg-secondary"}`}>
                    {ok && <Heart className="h-4 w-4 text-success-foreground fill-current" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Reseta automaticamente toda segunda-feira.</div>
        </Card>
      </Section>

      <Section title="Versículos do dia" action={<BookOpen className="h-4 w-4 text-muted-foreground" />}>
        {loading ? <Card className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></Card> :
          content?.verses?.map((v: any, i: number) => (
            <Card key={i} className="mb-2">
              <div className="text-xs font-semibold text-gold">{v.reference}</div>
              <p className="mt-1 text-sm italic">"{v.text}"</p>
              {v.reflection && <p className="mt-2 text-xs text-muted-foreground">💭 {v.reflection}</p>}
            </Card>
          ))
        }
      </Section>

      <Section title="3 orações de hoje">
        {loading ? <Card className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></Card> :
          content?.prayers?.map((p: any, i: number) => (
            <Card key={i} className="mb-2">
              <div className="text-xs font-semibold uppercase text-gold tracking-wide">{p.theme}</div>
              <p className="mt-2 text-sm leading-relaxed">{p.text}</p>
            </Card>
          ))
        }
      </Section>
    </div>
  );
}

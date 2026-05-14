import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { todayISO } from "@/lib/date-utils";
import { Play, Pause, RotateCcw, BookOpen, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leitura")({
  component: LeituraPage,
});

function LeituraPage() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const ref = useRef<number | null>(null);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (ref.current) { clearInterval(ref.current); ref.current = null; }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from("reading_logs").select("*").eq("user_id", session.user.id).order("log_date", { ascending: false }).limit(60);
    setLogs(data ?? []);
  }

  async function save() {
    const min = Math.floor(seconds / 60);
    if (min < 1) return toast.error("Leia pelo menos 1 minuto");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const today = todayISO();
    const existing = logs.find((l) => l.log_date === today);
    const total = (existing?.minutes ?? 0) + min;
    await supabase.from("reading_logs").upsert({
      user_id: session.user.id, log_date: today, minutes: total,
    }, { onConflict: "user_id,log_date" });
    if (total >= 20) {
      await supabase.from("daily_checklist").upsert({
        user_id: session.user.id, log_date: today, reading_done: true,
      }, { onConflict: "user_id,log_date" });
    }
    toast.success(`+${min} min de leitura`);
    setSeconds(0); setRunning(false); load();
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const todayMin = logs.find((l) => l.log_date === todayISO())?.minutes ?? 0;

  // últimos 30 dias
  const last30 = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const iso = d.toISOString().slice(0, 10);
    const log = logs.find((l) => l.log_date === iso);
    return { iso, minutes: log?.minutes ?? 0 };
  });

  return (
    <div>
      <PageHeader title="Leitura diária" subtitle="20 a 60 minutos. Todo dia." />

      <Section title="Timer">
        <Card className="text-center">
          <div className="font-mono text-6xl font-bold tabular-nums">{mm}:{ss}</div>
          <div className="mt-1 text-xs text-muted-foreground">Hoje: {todayMin} min</div>
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => setRunning(!running)} className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">
              {running ? <><Pause className="h-4 w-4" />Pausar</> : <><Play className="h-4 w-4" />{seconds === 0 ? "Iniciar" : "Continuar"}</>}
            </button>
            <button onClick={() => { setSeconds(0); setRunning(false); }} className="rounded-xl border border-border px-3"><RotateCcw className="h-4 w-4" /></button>
            <button onClick={save} className="flex items-center gap-1.5 rounded-xl bg-success/20 text-success px-4 py-2.5 text-sm font-semibold"><Check className="h-4 w-4" />Salvar</button>
          </div>
        </Card>
      </Section>

      <Section title="Últimos 30 dias">
        <Card>
          <div className="grid grid-cols-10 gap-1.5">
            {last30.map((d) => (
              <div key={d.iso} title={`${d.iso}: ${d.minutes} min`} className={`aspect-square rounded-full ${d.minutes >= 20 ? "bg-success" : d.minutes > 0 ? "bg-success/40" : "bg-secondary"}`} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><BookOpen className="h-3.5 w-3.5" />{logs.filter(l => l.minutes >= 20).length} dias completos</div>
        </Card>
      </Section>

      <Section title="Histórico">
        <div className="space-y-1.5">
          {logs.slice(0, 10).map((l) => (
            <Card key={l.id} className="!p-3 flex items-center justify-between">
              <div className="text-sm">{l.log_date}</div>
              <div className="text-sm font-semibold">{l.minutes} min</div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

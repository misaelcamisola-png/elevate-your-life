import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { todayISO } from "@/lib/date-utils";
import { toast } from "sonner";
import { Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/_authenticated/sono")({
  component: SonoPage,
});

const TIPS = [
  "Durma e acorde no MESMO horário todo dia (inclusive fim de semana).",
  "Sem celular 30 min antes de dormir.",
  "Quarto escuro, frio (~20°C) e silencioso.",
  "Despertador LONGE da cama. Você TEM que levantar.",
  "Beba 1 copo de água assim que acordar.",
  "Treino de manhã: roupa pronta na noite anterior.",
  "Sol nos olhos nos primeiros 10 min do dia.",
];

function SonoPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [form, setForm] = useState({ bedtime: "23:00", wake_time: "06:00", quality: 4 });

  useEffect(() => { load(); }, []);
  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from("sleep_logs").select("*").eq("user_id", session.user.id).order("log_date", { ascending: false }).limit(14);
    setLogs(data ?? []);
  }
  function calcHours(bed: string, wake: string) {
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return Math.round((mins / 60) * 10) / 10;
  }
  async function save() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const hours = calcHours(form.bedtime, form.wake_time);
    await supabase.from("sleep_logs").insert({
      user_id: session.user.id, log_date: todayISO(), bedtime: form.bedtime, wake_time: form.wake_time, hours, quality: form.quality,
    });
    toast.success("Sono registrado");
    load();
  }

  return (
    <div>
      <PageHeader title="Sono e despertar" subtitle="Acordar cedo é hábito, não dom." />
      <Section title="Registrar">
        <Card className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs text-muted-foreground mb-1 flex items-center gap-1"><Moon className="h-3 w-3" /> Dormi às</span>
              <input type="time" value={form.bedtime} onChange={(e) => setForm({ ...form, bedtime: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="block text-xs text-muted-foreground mb-1 flex items-center gap-1"><Sun className="h-3 w-3" /> Acordei às</span>
              <input type="time" value={form.wake_time} onChange={(e) => setForm({ ...form, wake_time: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" />
            </label>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground mb-1">Qualidade: {form.quality}/5</span>
            <input type="range" min={1} max={5} value={form.quality} onChange={(e) => setForm({ ...form, quality: Number(e.target.value) })} className="w-full" />
          </div>
          <div className="text-sm">Total: <strong>{calcHours(form.bedtime, form.wake_time)}h</strong></div>
          <button onClick={save} className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold">Salvar</button>
        </Card>
      </Section>

      <Section title="Histórico">
        <div className="space-y-1.5">
          {logs.map((l) => (
            <Card key={l.id} className="!p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{l.log_date}</div>
                <div className="text-xs text-muted-foreground">{l.bedtime?.slice(0,5)} → {l.wake_time?.slice(0,5)} · {"⭐".repeat(l.quality ?? 0)}</div>
              </div>
              <div className="text-sm font-bold">{l.hours}h</div>
            </Card>
          ))}
          {logs.length === 0 && <Card><p className="text-sm text-muted-foreground">Nenhum registro.</p></Card>}
        </div>
      </Section>

      <Section title="Anti-preguiça">
        <Card><ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">{TIPS.map((t, i) => <li key={i}>{t}</li>)}</ul></Card>
      </Section>
    </div>
  );
}

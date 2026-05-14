import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { todayISO } from "@/lib/date-utils";
import { Droplet, Utensils, Dumbbell, BookOpen, Heart, Flame, Trophy, Quote } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

const ITEMS = [
  { key: "water_done" as const, label: "Beber 2L de água", icon: Droplet },
  { key: "meals_done" as const, label: "Seguir as refeições", icon: Utensils },
  { key: "workout_done" as const, label: "Treinar", icon: Dumbbell },
  { key: "reading_done" as const, label: "Ler 20 min", icon: BookOpen },
  { key: "prayer_done" as const, label: "Orar", icon: Heart },
];

const QUOTES = [
  "Disciplina é a ponte entre metas e conquistas.",
  "Você não precisa estar pronto, precisa estar disposto.",
  "Pequenos passos diários superam grandes saltos esporádicos.",
  "A preguiça é mentirosa. Vai e treina.",
  "Quem suja a roupa, levanta troféus.",
  "Tudo posso naquele que me fortalece.",
];

function todayQuote() {
  return QUOTES[new Date().getDate() % QUOTES.length];
}

type Checklist = Record<typeof ITEMS[number]["key"], boolean> & { id?: string };

function emptyChecklist(): Checklist {
  return { water_done: false, meals_done: false, workout_done: false, reading_done: false, prayer_done: false };
}

function HomePage() {
  const { profile } = useProfile();
  const [checklist, setChecklist] = useState<Checklist>(emptyChecklist());
  const [streak, setStreak] = useState(0);
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const today = todayISO();
    const { data } = await supabase.from("daily_checklist").select("*").eq("user_id", session.user.id).eq("log_date", today).maybeSingle();
    if (data) setChecklist(data as any); else setChecklist(emptyChecklist());

    // streak: contar dias consecutivos com pelo menos 3/5 marcados
    const { data: hist } = await supabase.from("daily_checklist").select("*").eq("user_id", session.user.id).order("log_date", { ascending: false }).limit(60);
    let s = 0;
    const oneDay = 86400000;
    let cursor = new Date().setHours(0,0,0,0);
    const completed = new Set<string>();
    for (const row of hist ?? []) {
      const allDone = ITEMS.every((it) => (row as any)[it.key]);
      if (allDone) completed.add(row.log_date as string);
    }
    setCompletedDays(completed);
    for (const row of hist ?? []) {
      const d = new Date(row.log_date as any).setHours(0,0,0,0);
      if (d !== cursor) break;
      const count = ITEMS.reduce((acc, it) => acc + ((row as any)[it.key] ? 1 : 0), 0);
      if (count >= 3) { s++; cursor -= oneDay; } else break;
    }
    setStreak(s);
  }

  async function toggle(key: keyof Checklist) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    const { error } = await supabase.from("daily_checklist").upsert({
      user_id: session.user.id,
      log_date: todayISO(),
      water_done: next.water_done,
      meals_done: next.meals_done,
      workout_done: next.workout_done,
      reading_done: next.reading_done,
      prayer_done: next.prayer_done,
    }, { onConflict: "user_id,log_date" });
    if (error) toast.error(error.message);
    else if (Object.values(next).every(Boolean)) toast.success("🔥 Dia perfeito! Continue assim.");
  }

  const done = ITEMS.filter((i) => checklist[i.key]).length;
  const pct = Math.round((done / ITEMS.length) * 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = profile?.name?.split(" ")[0] ?? "atleta";

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle={todayQuote()}
        right={
          <div className="flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5">
            <Flame className="h-4 w-4 text-gold" />
            <span className="text-sm font-semibold">{streak}</span>
          </div>
        }
      />

      <Section title="Progresso de hoje">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{pct}%</div>
              <div className="text-xs text-muted-foreground mt-0.5">{done} de {ITEMS.length} concluídos</div>
            </div>
            <Trophy className={`h-8 w-8 ${pct === 100 ? "text-gold" : "text-muted-foreground/40"}`} />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-success transition-all" style={{ width: `${pct}%` }} />
          </div>
        </Card>
      </Section>

      <Section title="Checklist do dia">
        <div className="space-y-2">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            const checked = checklist[it.key];
            return (
              <button
                key={it.key}
                onClick={() => toggle(it.key)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${checked ? "border-success/40 bg-success/10" : "border-border bg-card"}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${checked ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`flex-1 ${checked ? "line-through text-muted-foreground" : ""}`}>{it.label}</span>
                <div className={`h-5 w-5 rounded-md border-2 ${checked ? "border-success bg-success" : "border-border"} flex items-center justify-center`}>
                  {checked && <span className="text-xs text-success-foreground">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Calendário do mês">
        <Card>
          <MonthCalendar completed={completedDays} />
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-success" /> Dia completo</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-border" /> Pendente</span>
          </div>
        </Card>
      </Section>

      <Section title="Frase do dia">
        <Card className="flex gap-3">
          <Quote className="h-5 w-5 shrink-0 text-gold" />
          <p className="text-sm">{todayQuote()}</p>
        </Card>
      </Section>

      <Section title="Lembretes">
        <Card className="space-y-2 text-sm text-muted-foreground">
          <div>💧 Água: 7h, 10h, 13h, 16h, 19h, 21h</div>
          <div>🍽️ Refeições: 7h30, 10h, 12h30, 16h, 20h</div>
          <div>🏋️ Treino: 6h da manhã. Sem desculpa!</div>
          <div>📖 Leitura: 22h antes de dormir</div>
          <div>🙏 Oração: ao acordar e antes de dormir</div>
        </Card>
      </Section>
    </div>
  );
}

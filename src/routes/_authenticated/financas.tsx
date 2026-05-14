import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { Trash2, Plus, Target } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/financas")({
  component: FinancasPage,
});

const TIPS = [
  "Anote TODO gasto, mesmo o cafezinho.",
  "Pague as dívidas mais caras primeiro (juros).",
  "Reserve 10% do salário no início do mês.",
  "Evite parcelar no cartão sem necessidade.",
  "Antes de comprar: aguarde 24h.",
  "Cozinhe em casa, leve marmita.",
  "Apps: Mobills, Organizze, planilha.",
  "Renda extra: freelance, aulas, vendas.",
];

const SCHEDULE = [
  { day: "Dia 1 do mês", task: "Receber salário → reservar 10% imediatamente" },
  { day: "Dia 2", task: "Pagar contas fixas (aluguel, luz, água, internet)" },
  { day: "Dia 5", task: "Revisar gastos da semana anterior" },
  { day: "Toda 6ª", task: "Conferir extrato do cartão" },
  { day: "Dia 25", task: "Planejar mês seguinte e ajustar metas" },
];

function FinancasPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [gForm, setGForm] = useState({ title: "", target_amount: "", deadline: "2027-06-30" });
  const [eForm, setEForm] = useState({ type: "despesa", category: "Alimentação", amount: "", description: "" });

  useEffect(() => { load(); }, []);
  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: g } = await supabase.from("finance_goals").select("*").eq("user_id", session.user.id).order("created_at");
    const { data: e } = await supabase.from("finance_entries").select("*").eq("user_id", session.user.id).order("entry_date", { ascending: false }).limit(50);
    setGoals(g ?? []); setEntries(e ?? []);
  }
  async function addGoal() {
    if (!gForm.title || !gForm.target_amount) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("finance_goals").insert({
      user_id: session.user.id, title: gForm.title, target_amount: Number(gForm.target_amount), deadline: gForm.deadline,
      is_main: goals.length === 0,
    });
    setGForm({ title: "", target_amount: "", deadline: gForm.deadline });
    load();
  }
  async function bumpGoal(id: string, current: number, target: number, delta: number) {
    const next = Math.max(0, Math.min(target, current + delta));
    await supabase.from("finance_goals").update({ current_amount: next }).eq("id", id);
    if (next >= target) toast.success("🏆 Meta alcançada!");
    load();
  }
  async function addEntry() {
    if (!eForm.amount) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("finance_entries").insert({
      user_id: session.user.id, type: eForm.type, category: eForm.category, amount: Number(eForm.amount), description: eForm.description,
    });
    setEForm({ ...eForm, amount: "", description: "" });
    load();
  }
  const receitas = entries.filter(e => e.type === "receita").reduce((a, e) => a + Number(e.amount), 0);
  const despesas = entries.filter(e => e.type === "despesa").reduce((a, e) => a + Number(e.amount), 0);
  const saldo = receitas - despesas;

  return (
    <div>
      <PageHeader title="Finanças" subtitle="Organize. Economize. Multiplique." />

      <Section title="Saldo do mês">
        <div className="grid grid-cols-3 gap-2">
          <Card><div className="text-[10px] text-muted-foreground uppercase">Receitas</div><div className="mt-1 text-base font-bold text-success">R$ {receitas.toFixed(0)}</div></Card>
          <Card><div className="text-[10px] text-muted-foreground uppercase">Despesas</div><div className="mt-1 text-base font-bold text-destructive">R$ {despesas.toFixed(0)}</div></Card>
          <Card><div className="text-[10px] text-muted-foreground uppercase">Saldo</div><div className={`mt-1 text-base font-bold ${saldo >= 0 ? "text-success" : "text-destructive"}`}>R$ {saldo.toFixed(0)}</div></Card>
        </div>
      </Section>

      <Section title="Metas (até meio de 2027)" action={<Target className="h-4 w-4 text-muted-foreground" />}>
        <Card className="space-y-2 mb-2">
          <input placeholder="Ex: Reservar R$ 10.000" value={gForm.title} onChange={(e) => setGForm({ ...gForm, title: e.target.value })} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <input type="number" placeholder="Valor R$" value={gForm.target_amount} onChange={(e) => setGForm({ ...gForm, target_amount: e.target.value })} className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm" />
            <input type="date" value={gForm.deadline} onChange={(e) => setGForm({ ...gForm, deadline: e.target.value })} className="bg-input border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={addGoal} className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold">+ Adicionar meta</button>
        </Card>
        <div className="space-y-2">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100));
            return (
              <Card key={g.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{g.title}</div>
                    <div className="text-xs text-muted-foreground">R$ {Number(g.current_amount).toFixed(0)} / {Number(g.target_amount).toFixed(0)} · até {g.deadline}</div>
                  </div>
                  <button onClick={async () => { await supabase.from("finance_goals").delete().eq("id", g.id); load(); }} className="text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-success" style={{ width: `${pct}%` }} /></div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => bumpGoal(g.id, Number(g.current_amount), Number(g.target_amount), 50)} className="flex-1 text-xs rounded-lg border border-border py-1.5">+50</button>
                  <button onClick={() => bumpGoal(g.id, Number(g.current_amount), Number(g.target_amount), 100)} className="flex-1 text-xs rounded-lg border border-border py-1.5">+100</button>
                  <button onClick={() => bumpGoal(g.id, Number(g.current_amount), Number(g.target_amount), 500)} className="flex-1 text-xs rounded-lg border border-border py-1.5">+500</button>
                </div>
              </Card>
            );
          })}
          {goals.length === 0 && <Card><p className="text-sm text-muted-foreground">Crie sua primeira meta acima.</p></Card>}
        </div>
      </Section>

      <Section title="Plano de economia">
        <Card className="space-y-1.5 text-sm">
          <p>Regra <strong>50/30/20</strong>:</p>
          <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
            <li><strong>50%</strong> contas fixas</li>
            <li><strong>30%</strong> gastos pessoais</li>
            <li><strong>20%</strong> reserva + investimentos</li>
          </ul>
          <p className="mt-2 text-xs">Para juntar R$ 10.000 em 14 meses → ≈ R$ 715/mês ou R$ 25/dia.</p>
        </Card>
      </Section>

      <Section title="Cronograma de organização">
        <Card>
          <ul className="space-y-2 text-sm">
            {SCHEDULE.map((s, i) => (
              <li key={i} className="flex gap-3"><span className="text-gold font-mono text-xs w-20 shrink-0">{s.day}</span><span className="text-muted-foreground">{s.task}</span></li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Controle de gastos">
        <Card className="space-y-2 mb-2">
          <div className="flex gap-2">
            <select value={eForm.type} onChange={(e) => setEForm({ ...eForm, type: e.target.value })} className="bg-input border border-border rounded-lg px-2 py-2 text-sm">
              <option value="despesa">Despesa</option><option value="receita">Receita</option>
            </select>
            <select value={eForm.category} onChange={(e) => setEForm({ ...eForm, category: e.target.value })} className="flex-1 bg-input border border-border rounded-lg px-2 py-2 text-sm">
              <option>Alimentação</option><option>Transporte</option><option>Moradia</option><option>Lazer</option><option>Saúde</option><option>Salário</option><option>Outros</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="R$" value={eForm.amount} onChange={(e) => setEForm({ ...eForm, amount: e.target.value })} className="w-24 bg-input border border-border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Descrição" value={eForm.description} onChange={(e) => setEForm({ ...eForm, description: e.target.value })} className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm" />
            <button onClick={addEntry} className="rounded-lg bg-primary text-primary-foreground px-3 text-sm font-semibold"><Plus className="h-4 w-4" /></button>
          </div>
        </Card>
        <div className="space-y-1.5">
          {entries.slice(0, 15).map((e) => (
            <Card key={e.id} className="!p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{e.description || e.category}</div>
                  <div className="text-xs text-muted-foreground">{e.category} · {e.entry_date}</div>
                </div>
                <div className={`text-sm font-bold ${e.type === "receita" ? "text-success" : "text-destructive"}`}>
                  {e.type === "receita" ? "+" : "-"}R$ {Number(e.amount).toFixed(0)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Dicas de economia">
        <Card><ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">{TIPS.map((t, i) => <li key={i}>{t}</li>)}</ul></Card>
      </Section>
    </div>
  );
}

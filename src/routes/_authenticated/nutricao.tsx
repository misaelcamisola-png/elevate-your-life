import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Section } from "@/components/ui-kit";
import { useProfile } from "@/hooks/use-profile";
import { generateDiet } from "@/lib/ai.functions";
import { todayISO } from "@/lib/date-utils";
import { Sparkles, Droplet, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/nutricao")({
  component: NutricaoPage,
});

function NutricaoPage() {
  const { profile } = useProfile();
  const generateDietFn = useServerFn(generateDiet);
  const [generating, setGenerating] = useState(false);
  const [foods, setFoods] = useState<any[]>([]);
  const [water, setWater] = useState(0);
  const [form, setForm] = useState({ meal_type: "Café da manhã", food: "", calories: "" });
  const [diet, setDiet] = useState<any>(null);

  useEffect(() => {
    if (profile?.diet_plan) setDiet(profile.diet_plan);
    load();
  }, [profile?.id]);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: f } = await supabase.from("food_logs").select("*").eq("user_id", session.user.id).eq("log_date", todayISO()).order("created_at");
    setFoods(f ?? []);
    const { data: w } = await supabase.from("water_logs").select("*").eq("user_id", session.user.id).eq("log_date", todayISO()).maybeSingle();
    setWater(w?.cups ?? 0);
  }

  async function gerarDieta() {
    if (!profile?.weight_kg || !profile?.height_cm) { toast.error("Cadastre peso e altura no perfil"); return; }
    setGenerating(true);
    try {
      const result: any = await generateDietFn();
      setDiet(result);
      toast.success("Dieta gerada!");
    } catch (e: any) { toast.error(e.message); }
    setGenerating(false);
  }

  async function addFood() {
    if (!form.food.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("food_logs").insert({
      user_id: session.user.id, log_date: todayISO(),
      meal_type: form.meal_type, food: form.food.trim(), calories: Number(form.calories) || 0,
    });
    setForm({ ...form, food: "", calories: "" });
    load();
  }

  async function setCups(n: number) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setWater(n);
    await supabase.from("water_logs").upsert({ user_id: session.user.id, log_date: todayISO(), cups: n }, { onConflict: "user_id,log_date" });
    if (n >= 8) {
      await supabase.from("daily_checklist").upsert({ user_id: session.user.id, log_date: todayISO(), water_done: true }, { onConflict: "user_id,log_date" });
    }
  }

  const totalCal = foods.reduce((a, f) => a + Number(f.calories || 0), 0);
  const target = diet?.daily_calories ?? 0;

  return (
    <div>
      <PageHeader title="Nutrição" subtitle="Sua dieta personalizada e diário alimentar." />

      <Section title="Plano alimentar" action={
        <button onClick={gerarDieta} disabled={generating} className="flex items-center gap-1 text-xs text-gold">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {diet ? "Regenerar" : "Gerar com IA"}
        </button>
      }>
        {diet ? (
          <Card>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div><div className="text-xs text-muted-foreground">kcal</div><div className="text-lg font-bold">{diet.daily_calories}</div></div>
              <div><div className="text-xs text-muted-foreground">Prot</div><div className="text-lg font-bold">{diet.protein_g}g</div></div>
              <div><div className="text-xs text-muted-foreground">Carb</div><div className="text-lg font-bold">{diet.carbs_g}g</div></div>
              <div><div className="text-xs text-muted-foreground">Gord</div><div className="text-lg font-bold">{diet.fat_g}g</div></div>
            </div>
            <div className="mt-4 space-y-2">
              {diet.meals?.map((m: any, i: number) => (
                <div key={i} className="rounded-xl border border-border bg-secondary/40 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.time} · {m.calories} kcal</div>
                  </div>
                  <ul className="mt-1.5 text-xs text-muted-foreground list-disc list-inside">
                    {m.foods?.map((f: string, j: number) => <li key={j}>{f}</li>)}
                  </ul>
                  <div className="mt-1.5 text-xs italic text-gold/80">💡 {m.tip}</div>
                </div>
              ))}
            </div>
            {diet.shopping_tips && (
              <div className="mt-3 rounded-xl bg-secondary/40 p-3">
                <div className="text-xs font-semibold mb-1.5">Dicas de compra barata</div>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {diet.shopping_tips.map((t: string, i: number) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
          </Card>
        ) : (
          <Card><p className="text-sm text-muted-foreground">Clique em "Gerar com IA" para criar sua dieta personalizada baseada no seu peso e altura.</p></Card>
        )}
      </Section>

      <Section title="Água do dia">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm">{water} / 8 copos (≈ {(water * 250 / 1000).toFixed(1)}L)</div>
            <Droplet className="h-5 w-5 text-blue-400" />
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <button key={i} onClick={() => setCups(i + 1 === water ? i : i + 1)} className={`aspect-square rounded-md border ${i < water ? "bg-blue-500/30 border-blue-500" : "border-border bg-secondary"}`} />
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Lembretes: 7h · 10h · 13h · 16h · 19h · 21h</div>
        </Card>
      </Section>

      <Section title={`Diário alimentar — ${totalCal} kcal${target ? ` / ${target}` : ""}`}>
        <Card className="space-y-2 mb-3">
          <div className="flex gap-2">
            <select value={form.meal_type} onChange={(e) => setForm({ ...form, meal_type: e.target.value })} className="bg-input border border-border rounded-lg px-2 py-2 text-sm">
              <option>Café da manhã</option><option>Lanche</option><option>Almoço</option><option>Lanche tarde</option><option>Jantar</option><option>Ceia</option>
            </select>
            <input placeholder="O que comeu?" value={form.food} onChange={(e) => setForm({ ...form, food: e.target.value })} className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <input placeholder="kcal" type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm" />
            <button onClick={addFood} className="rounded-lg bg-primary text-primary-foreground px-4 text-sm font-semibold flex items-center gap-1"><Plus className="h-4 w-4" />Adicionar</button>
          </div>
        </Card>
        <div className="space-y-2">
          {foods.map((f) => (
            <Card key={f.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{f.food}</div>
                  <div className="text-xs text-muted-foreground">{f.meal_type} · {f.calories} kcal</div>
                </div>
                <button onClick={async () => { await supabase.from("food_logs").delete().eq("id", f.id); load(); }} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
          {foods.length === 0 && <Card><p className="text-sm text-muted-foreground">Nada registrado hoje.</p></Card>}
        </div>
      </Section>
    </div>
  );
}

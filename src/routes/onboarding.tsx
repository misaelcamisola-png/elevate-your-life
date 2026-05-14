import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    avatar_url: "",
    weight_kg: "",
    height_cm: "",
    age: "",
    sex: "M",
    goal: "Emagrecer e ganhar disciplina",
  });

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login" }); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (data) {
        setForm((f) => ({
          ...f,
          name: data.name ?? f.name,
          avatar_url: data.avatar_url ?? "",
          weight_kg: data.weight_kg?.toString() ?? "",
          height_cm: data.height_cm?.toString() ?? "",
          age: data.age?.toString() ?? "",
          sex: data.sex ?? "M",
          goal: data.goal ?? f.goal,
        }));
      }
      setLoading(false);
    })();
  }, [navigate]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      name: form.name.trim(),
      avatar_url: form.avatar_url.trim() || null,
      weight_kg: Number(form.weight_kg),
      height_cm: Number(form.height_cm),
      age: form.age ? Number(form.age) : null,
      sex: form.sex,
      goal: form.goal,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil salvo!");
    navigate({ to: "/home" });
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const bmi = form.weight_kg && form.height_cm ? (Number(form.weight_kg) / Math.pow(Number(form.height_cm) / 100, 2)).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">Bem-vindo!</h1>
        <p className="mt-1 text-sm text-muted-foreground">Conte um pouco sobre você para personalizarmos seu plano.</p>

        <form onSubmit={save} className="mt-8 space-y-4">
          <Field label="Seu nome">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Como devo te chamar?" />
          </Field>
          <Field label="Foto de perfil (URL)">
            <input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="input" placeholder="https://..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Peso (kg)">
              <input required type="number" step="0.1" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} className="input" />
            </Field>
            <Field label="Altura (cm)">
              <input required type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Idade">
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input" />
            </Field>
            <Field label="Sexo">
              <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} className="input">
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </Field>
          </div>
          <Field label="Seu objetivo">
            <textarea value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="input min-h-20" />
          </Field>
          {bmi && (
            <div className="rounded-xl bg-card border border-border p-3 text-sm">
              <span className="text-muted-foreground">IMC: </span>
              <span className="font-semibold">{bmi}</span>
            </div>
          )}
          <button disabled={saving} className="mt-2 w-full rounded-xl bg-primary px-4 py-3.5 text-primary-foreground font-medium disabled:opacity-50">
            {saving ? "Salvando..." : "Continuar"}
          </button>
        </form>
      </div>

      <style>{`
        .input { width: 100%; background: var(--input); border: 1px solid var(--border); border-radius: 0.75rem; padding: 0.75rem 1rem; color: var(--foreground); outline: none; }
        .input:focus { border-color: var(--ring); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

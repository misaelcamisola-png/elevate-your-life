import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY ausente");
  const gw = createLovableAiGatewayProvider(key);
  return gw("google/gemini-3-flash-preview");
}

// ----- Conteúdo diário compartilhado: 3 orações + 2 versículos + dicas
export const getDailyContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabaseAdmin
      .from("ai_daily_content")
      .select("*")
      .eq("content_date", today)
      .maybeSingle();
    if (existing) return existing;

    const themes = [
      "sucesso pessoal e profissional",
      "proteção da família",
      "ajudar os enfermos e doentes da família",
      "ajudar pessoas necessitadas",
      "vida financeira e prosperidade nos negócios",
    ];
    const pick = [0, 1, 2].map((i) => themes[(new Date().getDate() + i) % themes.length]);

    const { output } = await generateText({
      model: getModel(),
      output: Output.object({
        schema: z.object({
          prayers: z.array(z.object({ theme: z.string(), text: z.string() })).min(1).max(5),
          verses: z.array(z.object({ reference: z.string(), text: z.string(), reflection: z.string() })).min(1).max(4),
          gratitude_tip: z.string(),
          saving_tip: z.string(),
        }),
      }),
      prompt: `Gere conteúdo diário em português brasileiro para um app de disciplina cristã.
Retorne EXATAMENTE:
- prayers: 3 orações curtas (3-5 frases cada), uma para cada tema: ${pick.join("; ")}.
- verses: 2 versículos da Bíblia com referência (livro capítulo:verso), texto e uma reflexão de 1 frase.
- gratitude_tip: 1 dica curta de gratidão (1 frase).
- saving_tip: 1 dica curta de economia financeira (1 frase).
Tom: motivacional, simples, direto.`,
    });

    const row = {
      content_date: today,
      prayers: output.prayers,
      verses: output.verses,
      gratitude_tip: output.gratitude_tip,
      saving_tip: output.saving_tip,
    };
    await supabaseAdmin.from("ai_daily_content").upsert(row);
    return row;
  });

// ----- Geração de dieta personalizada
export const generateDiet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!profile?.weight_kg || !profile?.height_cm) {
      throw new Error("Cadastre peso e altura no perfil primeiro");
    }
    const gw = createLovableAiGatewayProvider(process.env.LOVABLE_API_KEY!);
    const { output } = await generateText({
      model: gw("google/gemini-2.5-flash"),
      output: Output.object({
        schema: z.object({
          daily_calories: z.coerce.number(),
          protein_g: z.coerce.number(),
          carbs_g: z.coerce.number(),
          fat_g: z.coerce.number(),
          meals: z.array(z.object({
            name: z.string(),
            time: z.string(),
            foods: z.array(z.string()),
            calories: z.coerce.number(),
            tip: z.string().optional().default(""),
          })).min(1),
          shopping_tips: z.array(z.string()).min(1),
        }),
      }),
      prompt: `Monte uma dieta de emagrecimento em português brasileiro, BARATA e FÁCIL de manter, para:
peso ${profile.weight_kg}kg, altura ${profile.height_cm}cm, idade ${profile.age ?? "adulto"}, sexo ${profile.sex ?? "não informado"}, objetivo: ${profile.goal ?? "emagrecer"}.
Use ingredientes acessíveis no Brasil (arroz, feijão, ovos, frango, batata-doce, banana, aveia etc).
Retorne 4 a 6 refeições (café da manhã, lanche, almoço, lanche da tarde, jantar e ceia se fizer sentido).
Para cada refeição: name, time (HH:MM), foods (lista com porções), calories (número) e tip curta.
Inclua também daily_calories, protein_g, carbs_g, fat_g (números) e shopping_tips (3+ dicas).`,
    });
    await supabase.from("profiles").update({ diet_plan: output, updated_at: new Date().toISOString() }).eq("id", userId);
    return output;
  });

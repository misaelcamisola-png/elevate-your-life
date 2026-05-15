import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getDailyPrayerThemes, getLovableAiModel, getStructuredLovableAiModel } from "./ai.server";

const dailyContentSchema = z.object({
  prayers: z.array(z.object({ theme: z.string(), text: z.string() })).min(1).max(5),
  verses: z.array(z.object({ reference: z.string(), text: z.string(), reflection: z.string() })).min(1).max(4),
  gratitude_tip: z.string(),
  saving_tip: z.string(),
});

const dailyContentFallback = (themes: string[]) => ({
  prayers: themes.map((theme) => ({
    theme,
    text: `Senhor, entrego ${theme.toLowerCase()} em Tuas mãos. Dá-me sabedoria, paz e constância para agir com fé neste dia. Que eu reconheça Tua presença em cada decisão e permaneça firme no bem. Amém.`,
  })),
  verses: [
    {
      reference: "Filipenses 4:6",
      text: "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.",
      reflection: "A oração troca a ansiedade pela confiança prática em Deus.",
    },
    {
      reference: "Salmos 37:5",
      text: "Entregue o seu caminho ao Senhor; confie nele, e ele agirá.",
      reflection: "Confiar em Deus é continuar dando passos mesmo sem controlar tudo.",
    },
  ],
  gratitude_tip: "Anote hoje uma pequena bênção que normalmente passaria despercebida.",
  saving_tip: "Antes de comprar algo, compare preços e espere alguns minutos para decidir com calma.",
});

async function generateDailyContentPayload(themes: string[]) {
  try {
    const { output } = await generateText({
      model: getStructuredLovableAiModel("google/gemini-3-flash-preview", {
        maxOutputTokens: 2200,
        temperature: 0.2,
      }),
      output: Output.object({ schema: dailyContentSchema }),
      prompt: `Gere conteúdo diário em português brasileiro para um app de disciplina cristã.
Responda apenas com um objeto JSON válido, sem markdown e sem texto fora do JSON.
Retorne EXATAMENTE:
- prayers: 3 orações curtas (3-5 frases cada), uma para cada tema: ${themes.join("; ")}.
- verses: 2 versículos da Bíblia com reference, text e reflection.
- gratitude_tip: 1 dica curta de gratidão (1 frase).
- saving_tip: 1 dica curta de economia financeira (1 frase).
Tom: motivacional, simples, direto.`,
    });

    return output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("[AI] Falha ao gerar conteúdo diário estruturado", {
        cause: error.cause,
        finishReason: error.finishReason,
        text: error.text,
        response: error.response,
      });
      return dailyContentFallback(themes);
    }

    throw error;
  }
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

    const pick = getDailyPrayerThemes();

    const output = await generateDailyContentPayload(pick);

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
    const { output } = await generateText({
      model: getLovableAiModel("google/gemini-2.5-flash"),
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

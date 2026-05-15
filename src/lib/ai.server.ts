import {
  defaultSettingsMiddleware,
  extractJsonMiddleware,
  wrapLanguageModel,
} from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway";

export function getLovableAiModel(modelName = "google/gemini-3-flash-preview") {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY ausente");

  const gateway = createLovableAiGatewayProvider(key);
  return gateway(modelName);
}

export function getStructuredLovableAiModel(
  modelName = "google/gemini-3-flash-preview",
  settings: {
    maxOutputTokens?: number;
    temperature?: number;
  } = {},
) {
  return wrapLanguageModel({
    model: getLovableAiModel(modelName),
    middleware: [
      extractJsonMiddleware(),
      defaultSettingsMiddleware({
        settings: {
          temperature: settings.temperature ?? 0.3,
          maxOutputTokens: settings.maxOutputTokens ?? 2048,
        },
      }),
    ],
  });
}

export function getDailyPrayerThemes(date = new Date()) {
  const themes = [
    "sucesso pessoal e profissional",
    "proteção da família",
    "ajudar os enfermos e doentes da família",
    "ajudar pessoas necessitadas",
    "vida financeira e prosperidade nos negócios",
  ];

  return [0, 1, 2].map((i) => themes[(date.getDate() + i) % themes.length]);
}
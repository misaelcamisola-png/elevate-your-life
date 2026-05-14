// Planos de treino prontos. day_of_week: 1=seg ... 6=sáb (domingo descanso, sábado bônus).
export type Exercise = { name: string; sets: string; rest?: string };
export type DayWorkout = { day_of_week: number; name: string; exercises: Exercise[] };
export type WorkoutPlan = { key: string; title: string; subtitle: string; days: DayWorkout[] };

export const PLANS: WorkoutPlan[] = [
  {
    key: "hipertrofia_emagrecimento",
    title: "Hipertrofia + Emagrecimento",
    subtitle: "Musculação 5x + cardio diário",
    days: [
      { day_of_week: 1, name: "Peito + Tríceps + Cardio", exercises: [
        { name: "Esteira/Bike — aquecimento", sets: "10 min" },
        { name: "Supino reto halteres", sets: "4x10" },
        { name: "Supino inclinado", sets: "3x12" },
        { name: "Crucifixo", sets: "3x12" },
        { name: "Tríceps corda", sets: "4x12" },
        { name: "Tríceps testa", sets: "3x10" },
        { name: "Cardio HIIT", sets: "15 min" },
      ]},
      { day_of_week: 2, name: "Costas + Bíceps + Cardio", exercises: [
        { name: "Esteira/Bike — aquecimento", sets: "10 min" },
        { name: "Puxada frente", sets: "4x10" },
        { name: "Remada curvada", sets: "4x10" },
        { name: "Remada baixa", sets: "3x12" },
        { name: "Rosca direta", sets: "4x10" },
        { name: "Rosca alternada", sets: "3x10" },
        { name: "Cardio constante", sets: "20 min" },
      ]},
      { day_of_week: 3, name: "Pernas (quadríceps) + Cardio", exercises: [
        { name: "Bike — aquecimento", sets: "10 min" },
        { name: "Agachamento livre", sets: "4x10" },
        { name: "Leg press", sets: "4x12" },
        { name: "Cadeira extensora", sets: "3x15" },
        { name: "Avanço", sets: "3x10/perna" },
        { name: "Panturrilha em pé", sets: "4x15" },
        { name: "Cardio leve", sets: "15 min" },
      ]},
      { day_of_week: 4, name: "Ombros + Abdômen + Cardio", exercises: [
        { name: "Esteira — aquecimento", sets: "10 min" },
        { name: "Desenvolvimento halteres", sets: "4x10" },
        { name: "Elevação lateral", sets: "4x12" },
        { name: "Elevação frontal", sets: "3x12" },
        { name: "Abdominal supra", sets: "4x20" },
        { name: "Prancha", sets: "3x45s" },
        { name: "HIIT", sets: "15 min" },
      ]},
      { day_of_week: 5, name: "Pernas (posterior) + Cardio", exercises: [
        { name: "Bike — aquecimento", sets: "10 min" },
        { name: "Stiff", sets: "4x10" },
        { name: "Mesa flexora", sets: "4x12" },
        { name: "Cadeira flexora", sets: "3x12" },
        { name: "Glúteo no cabo", sets: "3x15" },
        { name: "Panturrilha sentado", sets: "4x15" },
        { name: "Cardio constante", sets: "25 min" },
      ]},
      { day_of_week: 6, name: "BÔNUS — Full body + Cardio", exercises: [
        { name: "Burpees", sets: "4x10" },
        { name: "Agachamento + jump", sets: "4x12" },
        { name: "Flexão", sets: "4x12" },
        { name: "Abdominal", sets: "4x20" },
        { name: "Corrida intervalada", sets: "20 min" },
      ]},
    ],
  },
  {
    key: "ganho_de_forca",
    title: "Ganho de Força",
    subtitle: "5x semana — cargas pesadas",
    days: [
      { day_of_week: 1, name: "Supino + Tríceps", exercises: [
        { name: "Supino reto barra", sets: "5x5" },
        { name: "Supino inclinado", sets: "4x6" },
        { name: "Paralelas (peso)", sets: "4x6" },
        { name: "Tríceps testa barra", sets: "4x8" },
      ]},
      { day_of_week: 2, name: "Agachamento + Core", exercises: [
        { name: "Agachamento livre", sets: "5x5" },
        { name: "Front squat", sets: "4x6" },
        { name: "Avanço com barra", sets: "4x8" },
        { name: "Prancha com peso", sets: "4x40s" },
      ]},
      { day_of_week: 3, name: "Levantamento Terra + Costas", exercises: [
        { name: "Terra convencional", sets: "5x5" },
        { name: "Remada curvada barra", sets: "4x6" },
        { name: "Barra fixa", sets: "4x máx" },
        { name: "Encolhimento", sets: "4x10" },
      ]},
      { day_of_week: 4, name: "Desenvolvimento + Ombros", exercises: [
        { name: "Desenvolvimento militar", sets: "5x5" },
        { name: "Push press", sets: "4x6" },
        { name: "Elevação lateral pesada", sets: "4x8" },
        { name: "Encolhimento halteres", sets: "4x10" },
      ]},
      { day_of_week: 5, name: "Força total", exercises: [
        { name: "Agachamento", sets: "3x3" },
        { name: "Supino", sets: "3x3" },
        { name: "Terra", sets: "3x3" },
        { name: "Barra fixa peso", sets: "4x5" },
      ]},
      { day_of_week: 6, name: "BÔNUS — Acessórios", exercises: [
        { name: "Rosca direta barra", sets: "4x8" },
        { name: "Tríceps banco", sets: "4x10" },
        { name: "Panturrilha pesada", sets: "5x10" },
        { name: "Abdominal com peso", sets: "4x15" },
      ]},
    ],
  },
  {
    key: "resistencia",
    title: "Resistência (bônus)",
    subtitle: "Para quem quer fôlego",
    days: [
      { day_of_week: 1, name: "Corrida longa", exercises: [
        { name: "Corrida ritmo leve", sets: "40 min" },
        { name: "Mobilidade", sets: "10 min" },
      ]},
      { day_of_week: 2, name: "Circuito funcional", exercises: [
        { name: "Burpees", sets: "5x15" },
        { name: "Mountain climber", sets: "5x40s" },
        { name: "Saltos no caixote", sets: "5x10" },
        { name: "Polichinelo", sets: "5x40s" },
      ]},
      { day_of_week: 3, name: "Bike longa", exercises: [
        { name: "Bike ritmo constante", sets: "45 min" },
        { name: "Alongamento", sets: "10 min" },
      ]},
      { day_of_week: 4, name: "HIIT", exercises: [
        { name: "Sprints 30s/30s", sets: "10 rounds" },
        { name: "Kettlebell swing", sets: "5x20" },
        { name: "Abdominal", sets: "5x20" },
      ]},
      { day_of_week: 5, name: "Tempo run", exercises: [
        { name: "Aquecimento", sets: "10 min" },
        { name: "Corrida em ritmo forte", sets: "25 min" },
        { name: "Volta à calma", sets: "10 min" },
      ]},
      { day_of_week: 6, name: "BÔNUS — Trilha/caminhada longa", exercises: [
        { name: "Caminhada/trilha", sets: "60-90 min" },
      ]},
    ],
  },
];

export function planByKey(key: string) {
  return PLANS.find((p) => p.key === key);
}

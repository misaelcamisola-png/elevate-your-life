# App Disciplina (ML)

App completo de disciplina pessoal com design **preto, simples e intuitivo**, login só por **Google**, e tudo salvo em banco de dados (nada é excluído).

## 1. Backend (Lovable Cloud)
- Ativar Lovable Cloud (Postgres + Auth + AI Gateway).
- **Auth**: somente Google OAuth na tela de login. Sessão persistente no celular. Botão "Desconectar" dentro do app.
- **Tabelas** (todas com RLS por `user_id`):
  - `profiles` — nome, foto, peso, altura, idade, sexo, objetivo
  - `workout_plans` + `workouts` + `workout_logs` (treinos do app + criados pelo usuário, histórico completo)
  - `runs` — caminhadas/corridas com km e calorias
  - `finance_goals` + `finance_entries` — metas progressivas até meio do ano que vem + plano de economia
  - `meals` + `food_logs` + `water_logs` — dieta gerada por IA conforme peso/altura, registro de refeições e água
  - `reading_logs` — leitura diária 20–60 min, bolinhas por dia
  - `prayer_logs` — marcação seg→dom, **reset automático ao virar a semana**
  - `bible_verses_daily` — 1 versículo do dia (gerado por IA)
  - `prayers_daily` — 3 orações geradas por IA (sucesso, família, enfermos, necessitados, finanças/negócios)
  - `gratitude_entries` — dicas e registros de gratidão
  - `sleep_logs` — regulador de sono
  - `daily_checklist` — caixinhas de "feito" para água/refeição/treino/leitura/oração

## 2. Telas
1. **Login** — só Google.
2. **Onboarding** — nome, foto, peso, altura, idade, objetivo.
3. **Home / Hoje** — saudação "Olá, {nome}", checklist do dia (água, refeições, treino, leitura, oração), barra de progresso, lembretes.
4. **Treinos** — 3 planos prontos (seg–sáb):
   - Hipertrofia + Emagrecimento
   - Ganho de Força
   - Resistência (bônus)
   Bônus sábado, domingo descanso. Criar treino próprio. Registrar séries/cargas. **Calendário marca automaticamente** dias concluídos. Reset automático ao marcar tudo.
5. **Corridas/Caminhadas** — registrar km + calorias.
6. **Nutrição** — IA monta dieta de emagrecimento barata e fácil baseada em peso/altura/objetivo. Diário alimentar, macros e calorias diárias, registro de água com horários, lembretes de refeição.
7. **Finanças** — meta principal até meio de 2027, metas progressivas, plano detalhado de economia, cronograma de organização, controle de gastos com dicas.
8. **Leitura** — timer 20–60 min, bolinhas por dia, histórico.
9. **Fé & Bíblia** — 3 orações do dia (geradas por IA, rotativas), 2 versículos diários, lembrete de oração seg→dom com **reset automático na virada da semana**.
10. **Gratidão** — dica do dia + registro.
11. **Sono** — horário de dormir/acordar, regulador anti-preguiça.
12. **Progresso semanal** — gráficos de tudo (treino, leitura, água, finanças, oração).
13. **Perfil** — editar dados, foto, sair.

## 3. Gamificação & Notificações
- Pontos/streaks por checklist completo.
- Badges semanais.
- Notificações push (web push) para água, refeições, treino da manhã, leitura, oração.
- Frases anti-preguiça antes do treino.

## 4. IA (Lovable AI Gateway)
- Gera 3 orações novas por dia (rotativas pelos temas: sucesso, família, enfermos, necessitados, finanças).
- Gera 2 versículos com reflexão.
- Gera dieta personalizada por peso/altura/objetivo.
- Gera dicas de economia e gratidão diárias.

## 5. Design
- Tema **preto** (background near-black, acentos brancos, accent dourado/verde para sucesso).
- Tipografia limpa, ícones lucide, cards arredondados, micro-animações sutis.
- Mobile-first.

## 6. Detalhes técnicos
- TanStack Start + Lovable Cloud (Supabase under the hood).
- Server functions para chamadas de IA e operações sensíveis.
- RLS em todas as tabelas: cada usuário só vê seus dados.
- Cron-style reset semanal de orações via lógica de data (toda segunda zera a contagem visual mantendo histórico no DB).
- Histórico **nunca é deletado** — apenas marcado como concluído/arquivado.

## Ordem de implementação
1. Ativar Cloud + schema completo + Google OAuth.
2. Login + Onboarding + layout base preto + navegação.
3. Home/Hoje com checklist.
4. Treinos + calendário + corridas.
5. Nutrição + IA da dieta + água/refeições.
6. Finanças + plano de economia.
7. Leitura + Fé/Bíblia + IA orações/versículos.
8. Gratidão + Sono + Progresso semanal.
9. Notificações + gamificação + polimento.

Confirma para eu começar?
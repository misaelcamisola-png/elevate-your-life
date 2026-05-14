// Helpers de data — semana começa na segunda-feira (ISO).
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function weekStartISO(d: Date = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0=dom, 1=seg, ...
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

export function dayOfWeekISO(d: Date = new Date()): number {
  // Retorna 1=seg ... 7=dom
  const day = d.getDay();
  return day === 0 ? 7 : day;
}

export const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

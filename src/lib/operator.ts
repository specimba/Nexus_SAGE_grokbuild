export const TAPE_KEY = "sage-operator-tape";

export type TapeRow = { at: string; event: string };

export function readTape(): TapeRow[] {
  try {
    const raw = localStorage.getItem(TAPE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TapeRow[];
    return Array.isArray(parsed) ? parsed.slice(0, 40) : [];
  } catch {
    return [];
  }
}

export function pushTape(event: string) {
  const row: TapeRow = { at: new Date().toISOString(), event };
  const next = [row, ...readTape()].slice(0, 40);
  try {
    localStorage.setItem(TAPE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

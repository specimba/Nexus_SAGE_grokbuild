export function crawlAgeHours(at: string, now = Date.now()) {
  const t = Date.parse(at);
  const hours = Number.isFinite(t) ? (now - t) / 3_600_000 : Infinity;
  return { hours, stale: hours > 18 };
}

export function applyHydrate<T extends { id: string; likes?: number; views?: number }>(prev: T[], live: T[]) {
  const map = new Map(live.map((p) => [p.id, p]));
  return prev.map((p) => {
    const n = map.get(p.id);
    if (!n) return p;
    const likes = n.likes && n.likes > 0 ? n.likes : p.likes;
    const views = n.views && n.views > 0 ? n.views : p.views;
    return { ...p, ...n, likes, views };
  });
}

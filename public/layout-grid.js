export function clampGridN(n) {
  const value = Math.round(Number(n));
  if (!Number.isFinite(value)) return 12;
  return Math.min(24, Math.max(6, value));
}

export function gridRows(n, ratioW, ratioH) {
  const cols = Number(n);
  const w = Number(ratioW) || 1;
  const h = Number(ratioH) || 1;
  if (!Number.isFinite(cols)) return 1;
  // M = max(1, round(n×H/W))。这里不把 n 钳进 6–24，否则 n=0 会变成 8 行，对不上「至少 1 行」。
  return Math.max(1, Math.round((cols * h) / w));
}

export function snapToGrid(xPct, yPct, n, m) {
  const cols = Math.max(1, n);
  const rows = Math.max(1, m);
  const stepX = 100 / cols;
  const stepY = 100 / rows;
  const gx = Math.round(xPct / stepX) * stepX;
  const gy = Math.round(yPct / stepY) * stepY;
  // 半格阈值：round 已等价于「距交点 ≤ 半格则吸」
  return {
    x: Math.min(100, Math.max(0, gx)),
    y: Math.min(100, Math.max(0, gy)),
  };
}

export function clampBlock(x, y, w, h) {
  const width = Math.max(1, w);
  const height = Math.max(1, h);
  const minX = -width + 1;
  const minY = -height + 1;
  const maxX = 99;
  const maxY = 99;
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  };
}

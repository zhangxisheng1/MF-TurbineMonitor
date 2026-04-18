export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const wrap360 = (v: number) => ((v % 360) + 360) % 360;

export const levelScore = (level: 'normal' | 'attention' | 'warning' | 'critical') => {
  if (level === 'critical') return 4;
  if (level === 'warning') return 3;
  if (level === 'attention') return 2;
  return 1;
};

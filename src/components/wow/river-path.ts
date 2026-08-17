const KEY_POINTS: { z: number; x: number }[] = [
  { z: -62, x: 22 },
  { z: -48, x: 17 },
  { z: -36, x: 13 },
  { z: -24, x: 10 },
  { z: -14, x: 8 },
  { z: -6, x: 7 },
];

export const RIVER_Z_START = -62;
export const RIVER_Z_END = -6;

export function riverCenterX(z: number): number {
  if (z <= KEY_POINTS[0].z) return KEY_POINTS[0].x;
  if (z >= KEY_POINTS[KEY_POINTS.length - 1].z) return KEY_POINTS[KEY_POINTS.length - 1].x;
  for (let i = 0; i < KEY_POINTS.length - 1; i++) {
    const a = KEY_POINTS[i];
    const b = KEY_POINTS[i + 1];
    if (z >= a.z && z <= b.z) {
      const t = (z - a.z) / (b.z - a.z);
      const s = t * t * (3 - 2 * t);
      return a.x + (b.x - a.x) * s;
    }
  }
  return 0;
}

export function riverWidth(z: number): number {
  const t = Math.min(1, Math.max(0, (z - RIVER_Z_START) / (RIVER_Z_END - RIVER_Z_START)));
  return 10 + t * 6;
}

export function distanceFromRiver(x: number, z: number): number {
  return Math.abs(x - riverCenterX(z)) - riverWidth(z) / 2;
}

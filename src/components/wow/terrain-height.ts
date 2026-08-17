import { riverCenterX } from "./river-path";

/** Floor level of the valley the camp overlooks. The camp plateau sits at y = 0. */
export const VALLEY_Y = -15;

/** Front (camera-side) edge of the camp plateau. */
export const PLATEAU = {
  minX: -16,
  maxX: 3,
  minZ: -1,
  maxZ: 22,
};

/** Distance over which the ground descends from the camp down to the valley floor. */
const SLOPE_DEPTH = 24;

function smoothstep(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

/**
 * Terrain height of the valley floor and its walls at a world point.
 *
 * Rather than dropping off a sheer cliff (which hides the whole valley from an
 * overlooking camera), the ground ramps down from just below camp level at the
 * plateau edge to the full valley depth ~24 units out. That slope is what makes
 * the river, bridges and terraced village readable from the campsite.
 */
export function valleyHeight(x: number, z: number): number {
  const d = Math.abs(x - riverCenterX(z));
  const wall = Math.max(0, d - 8);
  const rise = Math.min(wall * 0.9, 22);

  const floor = VALLEY_Y + rise;
  const nearLevel = -1.5 + rise * 0.5;
  const s = smoothstep((PLATEAU.minZ - z) / SLOPE_DEPTH);

  const undulation =
    Math.sin(x * 0.13 + z * 0.07) * 0.9 + Math.sin(x * 0.31 - z * 0.19) * 0.45;

  return nearLevel + (floor - nearLevel) * s + undulation * s;
}

/** True when a point sits on top of (or inside) the camp plateau footprint. */
export function onPlateau(x: number, z: number): boolean {
  return x > PLATEAU.minX - 1 && x < PLATEAU.maxX + 1 && z > PLATEAU.minZ - 1;
}

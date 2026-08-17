"use client";

import { useMemo } from "react";
import { mulberry32 } from "./texture-utils";
import { distanceFromRiver } from "./river-path";
import { onPlateau, valleyHeight } from "./terrain-height";
import { GlowPoints } from "./WindowField";
import {
  InstancedAsset,
  distanceFromViewpoint,
  useAssets,
  type AssetName,
  type Placement,
} from "./useAssets";

const HOUSE_ASSETS: AssetName[] = ["house_a", "house_b", "house_c", "house_d"];

type House = { x: number; y: number; z: number; rot: number; scale: number; variant: number };

/** Poisson-ish scatter: rejects placements that would intersect a neighbour. */
function scatterHouses(seed: number, count: number): House[] {
  const rand = mulberry32(seed);
  const houses: House[] = [];
  const MIN_GAP = 3.4;
  let attempts = 0;
  while (houses.length < count && attempts < count * 40) {
    attempts++;
    const x = -34 + rand() * 92;
    const z = -62 + rand() * 52;
    if (onPlateau(x, z)) continue;
    // keep the village down in the valley rather than crowding the camera
    if (z > -8) continue;
    if (distanceFromRiver(x, z) < 3) continue;
    if (houses.some((h) => (h.x - x) ** 2 + (h.z - z) ** 2 < MIN_GAP * MIN_GAP)) continue;
    houses.push({
      x,
      y: valleyHeight(x, z),
      z,
      rot: rand() * Math.PI,
      scale: 0.55 + rand() * 0.4,
      variant: Math.floor(rand() * HOUSE_ASSETS.length),
    });
  }
  return houses;
}

export function Village() {
  const assets = useAssets();
  const houses = useMemo(() => scatterHouses(707, 150), []);

  // Split by distance: full-detail models only where they're big enough on
  // screen to read, decimated LODs everywhere else.
  const { near, far } = useMemo(() => {
    const LOD_AT = 42;
    const near = HOUSE_ASSETS.map<Placement[]>(() => []);
    const far = HOUSE_ASSETS.map<Placement[]>(() => []);
    for (const h of houses) {
      const p: Placement = {
        position: [h.x, h.y, h.z],
        rotationY: h.rot,
        scale: h.scale,
      };
      (distanceFromViewpoint(h.x, h.y, h.z) < LOD_AT ? near : far)[h.variant].push(p);
    }
    return { near, far };
  }, [houses]);

  // soft additive halo on top of the models' own emissive windows, so the
  // village still reads as points of light at distance
  const glowPositions = useMemo(() => {
    const arr = new Float32Array(houses.length * 3);
    houses.forEach((h, i) => arr.set([h.x, h.y + h.scale * 1.1, h.z], i * 3));
    return arr;
  }, [houses]);

  return (
    <group>
      {HOUSE_ASSETS.map((name, vi) => (
        <InstancedAsset key={name} parts={assets[name]} placements={near[vi]} />
      ))}
      {HOUSE_ASSETS.map((name, vi) => (
        <InstancedAsset
          key={`${name}_lod`}
          parts={assets[`${name}_lod` as AssetName]}
          placements={far[vi]}
          castShadow={false}
        />
      ))}
      <GlowPoints positions={glowPositions} color="#ffb066" size={1.1} seed={19} />
    </group>
  );
}

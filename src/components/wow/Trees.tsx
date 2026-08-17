"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "./texture-utils";
import { distanceFromRiver } from "./river-path";
import { onPlateau, valleyHeight } from "./terrain-height";
import {
  InstancedAsset,
  distanceFromViewpoint,
  useAssets,
  type AssetName,
  type Placement,
} from "./useAssets";

const PINE_ASSETS: AssetName[] = ["pine_a", "pine_b", "pine_c"];

type Tree = { x: number; y: number; z: number; scale: number; rot: number; variant: number };

function scatterValleyTrees(seed: number, count: number): Tree[] {
  const rand = mulberry32(seed);
  const trees: Tree[] = [];
  let attempts = 0;
  while (trees.length < count && attempts < count * 12) {
    attempts++;
    const x = -40 + rand() * 104;
    const z = -64 + rand() * 60;
    if (onPlateau(x, z)) continue;
    if (distanceFromRiver(x, z) < 2.5) continue;
    if (trees.some((t) => (t.x - x) ** 2 + (t.z - z) ** 2 < 4)) continue;
    const depthT = Math.min(1, Math.max(0, (z + 64) / 62));
    const scale = THREE.MathUtils.lerp(0.6, 1.15, 1 - depthT) * (0.75 + rand() * 0.55);
    trees.push({
      x,
      y: valleyHeight(x, z),
      z,
      scale,
      rot: rand() * Math.PI * 2,
      variant: Math.floor(rand() * PINE_ASSETS.length),
    });
  }
  return trees;
}

/** Tall pines standing on the camp plateau, framing the left edge. */
function plateauTrees(): Tree[] {
  const specs: [number, number, number, number][] = [
    [-10, -2, 2.4, 0],
    [-10.8, -3.5, 2.0, 1],
    [-12, 1, 2.2, 1],
  ];
  return specs.map(([x, z, scale, variant]) => ({
    x,
    y: 0,
    z,
    scale,
    rot: x,
    variant,
  }));
}

export function Trees() {
  const assets = useAssets();
  const all = useMemo(() => [...scatterValleyTrees(501, 280), ...plateauTrees()], []);

  const { near, far } = useMemo(() => {
    const LOD_AT = 40;
    const near = PINE_ASSETS.map<Placement[]>(() => []);
    const far = PINE_ASSETS.map<Placement[]>(() => []);
    for (const t of all) {
      const p: Placement = {
        position: [t.x, t.y, t.z],
        rotationY: t.rot,
        scale: t.scale,
      };
      (distanceFromViewpoint(t.x, t.y, t.z) < LOD_AT ? near : far)[t.variant].push(p);
    }
    return { near, far };
  }, [all]);

  return (
    <group>
      {PINE_ASSETS.map((name, vi) => (
        <InstancedAsset key={name} parts={assets[name]} placements={near[vi]} />
      ))}
      {PINE_ASSETS.map((name, vi) => (
        <InstancedAsset
          key={`${name}_lod`}
          parts={assets[`${name}_lod` as AssetName]}
          placements={far[vi]}
          castShadow={false}
        />
      ))}
    </group>
  );
}

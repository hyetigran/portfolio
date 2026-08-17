"use client";

import { InstancedAsset, useAssets } from "./useAssets";

// Sits further from the camera than the campfire so the fire lights the face
// of the cloth rather than backlighting it.
const POSITION: [number, number, number] = [-7, 0, 0.5];

/**
 * Modeled in Blender (tools/blender/build_wow_assets.py): turned pole, ornate
 * crossbar with spear finials, cloth with real fold geometry, gold fringe and
 * emblem. The flag texture is authored to map once across the cloth.
 */
export function Banner() {
  const assets = useAssets();
  return (
    <InstancedAsset
      parts={assets.banner}
      placements={[{ position: POSITION, rotationY: -0.26, scale: 1.35 }]}
    />
  );
}

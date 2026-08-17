"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export const ASSETS_URL = "/models/wow-assets.glb";
/** Draco decoder is vendored from three/examples — no CDN dependency. */
const DRACO_PATH = "/draco/";

export const ASSET_NAMES = [
  "house_a",
  "house_b",
  "house_c",
  "house_d",
  "pine_a",
  "pine_b",
  "pine_c",
  "rock_a",
  "rock_b",
  "rock_c",
  "tower_a",
  "tower_b",
  "wall_a",
  "barrel",
  "crate",
  "tent",
  "banner",
  "house_a_lod",
  "house_b_lod",
  "house_c_lod",
  "house_d_lod",
  "pine_a_lod",
  "pine_b_lod",
  "pine_c_lod",
] as const;

/** Camera rest position — LOD selection is measured from here. */
export const VIEWPOINT: [number, number, number] = [0.5, 7, 10.5];

export function distanceFromViewpoint(x: number, y: number, z: number) {
  const dx = x - VIEWPOINT[0];
  const dy = y - VIEWPOINT[1];
  const dz = z - VIEWPOINT[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export type AssetName = (typeof ASSET_NAMES)[number];

/** One material's worth of an asset. Multi-material assets have several. */
export type AssetPart = { geometry: THREE.BufferGeometry; material: THREE.Material };

/**
 * Assets are authored procedurally in Blender
 * (tools/blender/build_wow_assets.py) and shipped as a single GLB.
 *
 * A glTF mesh with several materials is split into one primitive per material,
 * which GLTFLoader turns into a Group of `<name>_<i>` child meshes. We regroup
 * those back under the asset name so each part can be instanced separately.
 */
export function useAssets(): Partial<Record<AssetName, AssetPart[]>> {
  const gltf = useGLTF(ASSETS_URL, DRACO_PATH);

  return useMemo(() => {
    const out: Partial<Record<AssetName, AssetPart[]>> = {};
    const known = new Set<string>(ASSET_NAMES);

    gltf.scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const base = mesh.name.replace(/_\d+$/, "");
      if (!known.has(base)) return;
      const key = base as AssetName;
      const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      (out[key] ??= []).push({ geometry: mesh.geometry, material });
    });

    return out;
  }, [gltf]);
}

export type Placement = {
  position: [number, number, number];
  rotationY?: number;
  scale?: number | [number, number, number];
};

function InstancedPart({
  part,
  placements,
  castShadow,
  receiveShadow,
}: {
  part: AssetPart;
  placements: Placement[];
  castShadow: boolean;
  receiveShadow: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    placements.forEach((p, i) => {
      dummy.position.set(...p.position);
      dummy.rotation.set(0, p.rotationY ?? 0, 0);
      const s = p.scale ?? 1;
      if (typeof s === "number") dummy.scale.setScalar(s);
      else dummy.scale.set(...s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placements]);

  return (
    <instancedMesh
      ref={ref}
      args={[part.geometry, part.material, placements.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

/** Instances every part of a multi-material asset with a shared transform list. */
export function InstancedAsset({
  parts,
  placements,
  castShadow = true,
  receiveShadow = true,
}: {
  parts?: AssetPart[];
  placements: Placement[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  if (!parts || parts.length === 0 || placements.length === 0) return null;
  return (
    <>
      {parts.map((part, i) => (
        <InstancedPart
          key={i}
          part={part}
          placements={placements}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      ))}
    </>
  );
}

useGLTF.preload(ASSETS_URL, DRACO_PATH);

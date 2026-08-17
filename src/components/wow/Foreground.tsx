"use client";

import { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import * as THREE from "three";
import { mulberry32 } from "./texture-utils";
import { InstancedAsset, useAssets, type AssetName, type Placement } from "./useAssets";

const ROCK_ASSETS: AssetName[] = ["rock_a", "rock_b", "rock_c"];

type Rock = { x: number; z: number; scale: number; rot: number; variant: number };

function scatterRocks(seed: number, count: number): Rock[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: -11 + rand() * 20,
    z: -1.5 + rand() * 8,
    scale: 0.16 + Math.pow(rand(), 2) * 0.5,
    rot: rand() * Math.PI * 2,
    variant: Math.floor(rand() * ROCK_ASSETS.length),
  }));
}

type Tuft = { x: number; z: number; s: number; rot: number; color: string };

function scatterTufts(seed: number, count: number): Tuft[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: -11 + rand() * 20,
    z: -1.5 + rand() * 8,
    s: 0.1 + rand() * 0.17,
    rot: rand() * Math.PI,
    color: new THREE.Color("#2c3a1e").multiplyScalar(0.5 + rand() * 0.7).getStyle(),
  }));
}

export function Foreground() {
  const assets = useAssets();
  const rocks = useMemo(() => scatterRocks(9091, 80), []);
  const tufts = useMemo(() => scatterTufts(1234, 60), []);

  const rocksByVariant = useMemo(
    () =>
      ROCK_ASSETS.map((_, vi) =>
        rocks
          .filter((r) => r.variant === vi)
          .map<Placement>((r) => ({
            position: [r.x, 0, r.z],
            rotationY: r.rot,
            scale: r.scale,
          }))
      ),
    [rocks]
  );

  return (
    <group>
      {ROCK_ASSETS.map((name, vi) => (
        <InstancedAsset key={name} parts={assets[name]} placements={rocksByVariant[vi]} />
      ))}

      <Instances limit={tufts.length} range={tufts.length} castShadow>
        <coneGeometry args={[0.32, 1, 4]} />
        <meshStandardMaterial roughness={0.95} metalness={0} />
        {tufts.map((t, i) => (
          <Instance
            key={i}
            position={[t.x, t.s * 0.5, t.z]}
            scale={[t.s, t.s * 1.5, t.s]}
            rotation={[0, t.rot, 0]}
            color={t.color}
          />
        ))}
      </Instances>
    </group>
  );
}

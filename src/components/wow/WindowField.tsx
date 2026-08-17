"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mulberry32, radialGlowTexture } from "./texture-utils";

/** Additive glow sprites at explicit world positions — lit windows, lanterns. */
export function GlowPoints({
  positions,
  color = "#ffc47a",
  size = 1.7,
  seed = 0,
}: {
  positions: Float32Array;
  color?: string;
  size?: number;
  seed?: number;
}) {
  const texture = useMemo(() => radialGlowTexture(color), [color]);
  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.74 + Math.sin(state.clock.elapsedTime * 2.1 + seed) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={size}
        color={color}
        transparent
        opacity={0.78}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  );
}

/** Randomly scattered glow points inside a box — used for castle windows. */
export function WindowField({
  count,
  spread,
  origin,
  seed,
  color = "#ffc47a",
  size = 1.7,
}: {
  count: number;
  spread: [number, number, number];
  origin: [number, number, number];
  seed: number;
  color?: string;
  size?: number;
}) {
  const positions = useMemo(() => {
    const rand = mulberry32(seed);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr.set(
        [
          origin[0] + (rand() - 0.5) * spread[0],
          origin[1] + rand() * spread[1],
          origin[2] + (rand() - 0.5) * spread[2],
        ],
        i * 3
      );
    }
    return arr;
  }, [count, spread, origin, seed]);

  return <GlowPoints positions={positions} color={color} size={size} seed={seed} />;
}

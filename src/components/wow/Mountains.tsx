"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mulberry32, radialGlowTexture } from "./texture-utils";

type RidgeConfig = { seed: number; z: number; baseHeight: number; amplitude: number; color: string };

const RIDGES: RidgeConfig[] = [
  { seed: 11, z: -180, baseHeight: 30, amplitude: 22, color: "#1b2a49" },
  { seed: 42, z: -150, baseHeight: 24, amplitude: 26, color: "#141f3a" },
  { seed: 77, z: -120, baseHeight: 16, amplitude: 22, color: "#0e172c" },
];

function ridgeShape(seed: number, baseHeight: number, amplitude: number) {
  const rand = mulberry32(seed);
  const width = 360;
  const segments = 28;
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -70);
  let prev = baseHeight + (rand() - 0.5) * amplitude * 0.3;
  for (let i = 0; i <= segments; i++) {
    const x = -width / 2 + (width * i) / segments;
    const jitter = (rand() - 0.5) * amplitude;
    const y = THREE.MathUtils.lerp(prev, baseHeight + jitter, 0.6);
    shape.lineTo(x, y);
    prev = y;
  }
  shape.lineTo(width / 2, -70);
  shape.closePath();
  return shape;
}

function Ridges() {
  return (
    <>
      {RIDGES.map((ridge) => (
        <mesh key={ridge.seed} position={[0, 0, ridge.z]}>
          <shapeGeometry args={[ridgeShape(ridge.seed, ridge.baseHeight, ridge.amplitude)]} />
          <meshBasicMaterial color={ridge.color} />
        </mesh>
      ))}
    </>
  );
}

function BeaconSpire({ x, y, z, height = 26 }: { x: number; y: number; z: number; height?: number }) {
  const beamRef = useRef<THREE.Mesh>(null);
  const glow = useMemo(() => radialGlowTexture("rgba(120,190,255,0.95)"), []);

  useFrame((state) => {
    if (!beamRef.current) return;
    const mat = beamRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.45 + Math.sin(state.clock.elapsedTime * 1.6 + x) * 0.08;
  });

  return (
    <group position={[x, y, z]}>
      {/* jagged peak the beacon crowns */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[height * 0.2, height * 0.55, 5]} />
        <meshStandardMaterial color="#16233d" roughness={0.9} metalness={0.1} flatShading />
      </mesh>
      {/* slender lit spire */}
      <mesh position={[0, height * 0.52, 0]}>
        <coneGeometry args={[0.5, height * 0.42, 6]} />
        <meshStandardMaterial
          color="#2a4f80"
          emissive="#6cc4ff"
          emissiveIntensity={1.4}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      <mesh ref={beamRef} position={[0, height * 0.78, 0]}>
        <coneGeometry args={[0.75, height * 0.7, 10, 1, true]} />
        <meshBasicMaterial
          color="#8fd0ff"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          fog={false}
        />
      </mesh>
      <sprite position={[0, height * 0.74, 0]} scale={[9, 9, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.9} fog={false} />
      </sprite>
      <pointLight color="#69b6ff" intensity={6} distance={34} position={[0, height * 0.7, 0]} />
    </group>
  );
}

export function Mountains() {
  return (
    <>
      <Ridges />
      {/* central landmark peak, per reference */}
      <BeaconSpire x={1} y={12} z={-96} height={34} />
    </>
  );
}

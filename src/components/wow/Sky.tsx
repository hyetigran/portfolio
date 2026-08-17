"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { moonTexture, mulberry32, puffTexture, radialGlowTexture } from "./texture-utils";

const skyVertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = `
  varying vec3 vWorldPosition;
  uniform vec3 topColor;
  uniform vec3 horizonColor;
  uniform vec3 bottomColor;
  void main() {
    float h = normalize(vWorldPosition).y;
    vec3 color = h > 0.0
      ? mix(horizonColor, topColor, pow(h, 0.5))
      : mix(horizonColor, bottomColor, pow(-h, 0.7));
    gl_FragColor = vec4(color, 1.0);
  }
`;

function SkyDome() {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color("#050b1e") },
      horizonColor: { value: new THREE.Color("#27436b") },
      bottomColor: { value: new THREE.Color("#03050a") },
    }),
    []
  );
  return (
    <mesh>
      <sphereGeometry args={[300, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
      />
    </mesh>
  );
}

function Moon() {
  const glow = useMemo(() => radialGlowTexture("rgba(232,240,255,0.95)"), []);
  const surface = useMemo(() => moonTexture(), []);
  const position: [number, number, number] = [26, 38, -115];
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[9, 32, 32]} />
        <meshStandardMaterial
          map={surface}
          emissive="#f4f2ec"
          emissiveMap={surface}
          emissiveIntensity={1.15}
          roughness={1}
          metalness={0}
          fog={false}
        />
      </mesh>
      <sprite scale={[42, 42, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} fog={false} blending={THREE.AdditiveBlending} opacity={0.55} />
      </sprite>
    </group>
  );
}

type Puff = { position: [number, number, number]; scale: number; speed: number; opacity: number };

function Clouds({ count = 16 }: { count?: number }) {
  const texture = useMemo(() => puffTexture(), []);
  const group = useRef<THREE.Group>(null);
  const puffs = useMemo<Puff[]>(() => {
    const rand = mulberry32(88);
    return Array.from({ length: count }, (_, i) => {
      const nearMoon = i < 9;
      return {
        position: nearMoon
          ? [26 + (rand() - 0.5) * 50, 28 + rand() * 20, -100 - rand() * 20]
          : [(rand() - 0.5) * 220, 26 + rand() * 26, -75 - rand() * 130],
        scale: 22 + rand() * 26,
        speed: 0.12 + rand() * 0.2,
        opacity: nearMoon ? 0.5 : 0.22,
      } as Puff;
    });
  }, [count]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      child.position.x = puffs[i].position[0] + Math.sin(t * 0.02 + i) * 5 + t * puffs[i].speed;
    });
  });

  return (
    <group ref={group}>
      {puffs.map((puff, i) => (
        <sprite key={i} position={puff.position} scale={[puff.scale, puff.scale * 0.55, 1]}>
          <spriteMaterial map={texture} transparent depthWrite={false} opacity={puff.opacity} fog={false} />
        </sprite>
      ))}
    </group>
  );
}

export function Sky() {
  return (
    <>
      <SkyDome />
      <Stars radius={150} depth={50} count={3400} factor={7} saturation={0} fade speed={0.3} />
      <Moon />
      <Clouds />
    </>
  );
}

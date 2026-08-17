"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";
import * as THREE from "three";
import { mulberry32, puffTexture, radialGlowTexture } from "./texture-utils";

const POSITION: [number, number, number] = [-1, 0, 3.5];

function StoneRing() {
  const stones = useMemo(() => {
    const rand = mulberry32(4);
    const count = 14;
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      const r = 1.5 + rand() * 0.15;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        s: 0.22 + rand() * 0.14,
        rot: rand() * Math.PI,
      };
    });
  }, []);
  return (
    <Instances limit={stones.length} range={stones.length} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#3a352f" roughness={0.9} metalness={0.05} />
      {stones.map((s, i) => (
        <Instance key={i} position={[s.x, s.s * 0.6, s.z]} scale={s.s} rotation={[s.rot, s.rot, 0]} />
      ))}
    </Instances>
  );
}

function Logs() {
  return (
    <group position={[0, 0.18, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 3, Math.PI / 2 + 0.15]} castShadow receiveShadow>
          <cylinderGeometry args={[0.11, 0.13, 1.5, 6]} />
          <meshStandardMaterial color="#241812" roughness={0.85} metalness={0} emissive="#3a1505" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Flame() {
  const group = useRef<THREE.Group>(null);
  const glow = useMemo(() => radialGlowTexture("rgba(255,200,120,0.95)"), []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const flick = 0.85 + Math.sin(t * (7 + i) + i * 3) * 0.12 + Math.sin(t * 13 + i) * 0.05;
      child.scale.setScalar(flick);
    });
  });

  const layers = [
    { y: 0.95, scale: 4.4, color: "#ff5a14", opacity: 0.5 },
    { y: 1.35, scale: 3.1, color: "#ff8f26", opacity: 0.62 },
    { y: 1.75, scale: 1.8, color: "#ffe58a", opacity: 0.86 },
  ];

  return (
    <group ref={group} position={POSITION}>
      {layers.map((l, i) => (
        <sprite key={i} position={[0, l.y, 0]} scale={[l.scale, l.scale * 1.25, 1]}>
          <spriteMaterial
            map={glow}
            color={l.color}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={l.opacity}
          />
        </sprite>
      ))}
      <pointLight
        color="#ff8a3d"
        intensity={18}
        distance={30}
        decay={2}
        position={[0, 1.2, 0]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.004}
      />
      {/* tight warm bounce: falls off fast so the ground goes dark away from the fire */}
      <pointLight color="#ff9b52" intensity={5} distance={24} decay={1.9} position={[0, 2.2, 0]} />
    </group>
  );
}

type Ember = { baseX: number; baseZ: number; speed: number; phase: number; life: number };

function Embers() {
  const ref = useRef<THREE.Points>(null);
  const texture = useMemo(() => radialGlowTexture("rgba(255,190,110,0.95)"), []);
  const embers = useMemo<Ember[]>(() => {
    const rand = mulberry32(9);
    return Array.from({ length: 26 }, () => ({
      baseX: (rand() - 0.5) * 1.2,
      baseZ: (rand() - 0.5) * 1.2,
      speed: 0.6 + rand() * 0.8,
      phase: rand() * Math.PI * 2,
      life: 2 + rand() * 2,
    }));
  }, []);
  const positions = useMemo(() => new Float32Array(embers.length * 3), [embers.length]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    embers.forEach((e, i) => {
      const localT = ((t * e.speed + e.phase) % e.life) / e.life;
      arr[i * 3] = POSITION[0] + e.baseX + Math.sin(t * 1.4 + e.phase) * 0.3;
      arr[i * 3 + 1] = POSITION[1] + 0.4 + localT * 3.2;
      arr[i * 3 + 2] = POSITION[2] + e.baseZ + Math.cos(t * 1.1 + e.phase) * 0.3;
    });
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.14}
        color="#ffb066"
        transparent
        opacity={0.85}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

type Smoke = { baseX: number; baseZ: number; speed: number; phase: number; life: number; scale: number };

function Smoke() {
  const ref = useRef<THREE.Group>(null);
  const texture = useMemo(() => puffTexture(), []);
  const puffs = useMemo<Smoke[]>(() => {
    const rand = mulberry32(15);
    return Array.from({ length: 8 }, () => ({
      baseX: (rand() - 0.5) * 0.6,
      baseZ: (rand() - 0.5) * 0.6,
      speed: 0.35 + rand() * 0.2,
      phase: rand() * Math.PI * 2,
      life: 5 + rand() * 3,
      scale: 0.5 + rand() * 0.45,
    }));
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.children.forEach((child, i) => {
      const p = puffs[i];
      const localT = ((t * p.speed + p.phase) % p.life) / p.life;
      child.position.set(
        POSITION[0] + p.baseX + Math.sin(t * 0.3 + p.phase) * 0.6 * localT,
        POSITION[1] + 1.4 + localT * 6,
        POSITION[2] + p.baseZ + Math.cos(t * 0.25 + p.phase) * 0.6 * localT
      );
      const s = p.scale * (0.4 + localT * 1.6);
      child.scale.setScalar(s);
      (child as THREE.Sprite).material.opacity = (1 - localT) * 0.1;
    });
  });

  return (
    <group ref={ref}>
      {puffs.map((_, i) => (
        <sprite key={i}>
          <spriteMaterial map={texture} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}

export function Campfire() {
  return (
    <group>
      <mesh position={POSITION} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.4, 24]} />
        <meshStandardMaterial color="#1a1410" roughness={0.95} metalness={0} />
      </mesh>
      <group position={POSITION}>
        <StoneRing />
        <Logs />
      </group>
      <Flame />
      <Embers />
      <Smoke />
    </group>
  );
}

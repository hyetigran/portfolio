"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";
import * as THREE from "three";
import { mulberry32, puffTexture, stoneNormalTexture, waterfallTexture } from "./texture-utils";
import { WindowField } from "./WindowField";
import { VALLEY_Y } from "./terrain-height";
import { InstancedAsset, useAssets, type Placement } from "./useAssets";

const STONE = "#24344f";
const STONE_LIGHT = "#31445f";

function stoneTexture(size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1a2740";
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(88);
  for (let i = 0; i < 260; i++) {
    const x = rand() * size;
    const y = rand() * size;
    ctx.fillStyle = rand() > 0.5 ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.06)";
    ctx.fillRect(x, y, 2 + rand() * 4, 1 + rand() * 2);
  }
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

type TowerSpec = {
  x: number;
  y: number;
  z: number;
  height: number;
  radius: number;
  roofType: "cone" | "crenellated";
};

const TOWERS: TowerSpec[] = [
  { x: 27, y: -9, z: -36, height: 9, radius: 1.7, roofType: "crenellated" },
  { x: 31, y: -7.5, z: -39, height: 12, radius: 2.1, roofType: "cone" },
  { x: 34.5, y: -5.5, z: -42, height: 15, radius: 2.5, roofType: "cone" },
  { x: 38, y: -3.5, z: -44, height: 13, radius: 2.2, roofType: "crenellated" },
  { x: 41.5, y: -1.5, z: -46.5, height: 19, radius: 3, roofType: "cone" },
  { x: 45, y: 0.5, z: -49, height: 15, radius: 2.3, roofType: "crenellated" },
  { x: 48.5, y: 2, z: -51.5, height: 21, radius: 2.6, roofType: "cone" },
  { x: 43, y: 3, z: -54, height: 24, radius: 2.4, roofType: "cone" },
  { x: 36.5, y: -1, z: -49, height: 11, radius: 1.6, roofType: "crenellated" },
  { x: 52, y: 3.5, z: -55, height: 14, radius: 2, roofType: "cone" },
  { x: 24, y: -10.5, z: -33, height: 7, radius: 1.4, roofType: "crenellated" },
];

/** Modeled tower modules from the Blender GLB, scaled per placement. */
function Towers() {
  const assets = useAssets();
  const roofed = TOWERS.filter((t) => t.roofType === "cone").map<Placement>((t) => ({
    position: [t.x, t.y, t.z],
    rotationY: t.x * 0.3,
    scale: [t.radius / 1.5, t.height / 6.5, t.radius / 1.5],
  }));
  const open = TOWERS.filter((t) => t.roofType !== "cone").map<Placement>((t) => ({
    position: [t.x, t.y, t.z],
    rotationY: t.x * 0.4,
    scale: [t.radius / 1.2, t.height / 4.5, t.radius / 1.2],
  }));

  return (
    <group>
      <InstancedAsset parts={assets.tower_a} placements={roofed} />
      <InstancedAsset parts={assets.tower_b} placements={open} />
    </group>
  );
}

function Merlons() {
  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    for (const t of TOWERS) {
      if (t.roofType !== "crenellated") continue;
      const count = 9;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        out.push([
          t.x + Math.cos(a) * t.radius * 0.82,
          t.y + t.height + 0.28,
          t.z + Math.sin(a) * t.radius * 0.82,
        ]);
      }
    }
    return out;
  }, []);

  return (
    <Instances limit={positions.length} range={positions.length} castShadow receiveShadow>
      <boxGeometry args={[0.55, 0.6, 0.55]} />
      <meshStandardMaterial color={STONE_LIGHT} roughness={0.85} metalness={0.1} />
      {positions.map((p, i) => (
        <Instance key={i} position={p} />
      ))}
    </Instances>
  );
}

/** Stacked rock terraces the citadel is built into, rising out of the valley. */
function CliffMass() {
  const blocks = useMemo(() => {
    const rand = mulberry32(51);
    return Array.from({ length: 18 }, (_, i) => {
      const t = i / 17;
      const x = 22 + t * 32 + (rand() - 0.5) * 3;
      const z = -31 - t * 26 + (rand() - 0.5) * 3;
      const top = THREE.MathUtils.lerp(-8, 5, t) + (rand() - 0.5) * 2;
      const h = top - VALLEY_Y + 4;
      const w = 5.5 + rand() * 4;
      return { x, y: top - h / 2, z, h, w };
    });
  }, []);
  const normalMap = useMemo(() => {
    const t = stoneNormalTexture();
    t.repeat.set(2, 3);
    return t;
  }, []);
  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.w * 1.25]} />
          <meshStandardMaterial
            color="#0d1729"
            normalMap={normalMap}
            normalScale={new THREE.Vector2(0.7, 0.7)}
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Reusable arched gatehouse module: pillars + lintel + arch ring. */
function Gatehouse({ x, y, z, rot = 0 }: { x: number; y: number; z: number; rot?: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      {[-1.5, 1.5].map((dx) => (
        <mesh key={dx} position={[dx, 2.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 4.8, 2.4]} />
          <meshStandardMaterial color={STONE} roughness={0.85} metalness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, 5.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 1.6, 2.4]} />
        <meshStandardMaterial color={STONE_LIGHT} roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[1.5, 0.28, 6, 12, Math.PI]} />
        <meshStandardMaterial color={STONE_LIGHT} roughness={0.85} metalness={0.1} />
      </mesh>
      {[-2.1, 2.1].map((dx) => (
        <mesh key={dx} position={[dx, 6.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.5]} />
          <meshStandardMaterial color={STONE_LIGHT} roughness={0.85} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/** Angled buttress module braced against the cliff walls. */
function Buttresses() {
  const specs: [number, number, number][] = [
    [30, -7, -37],
    [37, -3, -43],
    [44.5, 1, -48],
  ];
  return (
    <group>
      {specs.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y + 2, z + 1.6]} rotation={[0.22, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 6, 1.6]} />
          <meshStandardMaterial color={STONE} roughness={0.9} metalness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

/** Small hanging banners on the towers — cheap fantasy-MMO read. */
function TowerBanners() {
  const specs: [number, number, number][] = [
    [31, 3, -37.8],
    [41.5, 15, -45.3],
    [45, 13, -47.8],
  ];
  return (
    <group>
      {specs.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <planeGeometry args={[1.1, 2.2]} />
          <meshStandardMaterial
            color="#7c2230"
            side={THREE.DoubleSide}
            roughness={0.9}
            metalness={0}
            emissive="#3a0f16"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function CurtainWalls() {
  const walls = [
    { x: 29, y: -6.5, z: -37.5, len: 8, rot: 0.4 },
    { x: 36, y: -3, z: -43, len: 9, rot: 0.35 },
    { x: 43.5, y: 1, z: -47.5, len: 8, rot: 0.4 },
    { x: 47, y: 3, z: -53, len: 7, rot: -0.2 },
  ];
  return (
    <group>
      {walls.map((w, i) => (
        <mesh key={i} position={[w.x, w.y + 2.5, w.z]} rotation={[0, w.rot, 0]} castShadow receiveShadow>
          <boxGeometry args={[w.len, 5.5, 2.4]} />
          <meshStandardMaterial color={STONE} roughness={0.85} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function Waterfall({
  x,
  y,
  z,
  height = 22,
  width = 2.6,
}: {
  x: number;
  y: number;
  z: number;
  height?: number;
  width?: number;
}) {
  const texture = useMemo(() => waterfallTexture(), []);
  const mist = useMemo(() => puffTexture(), []);
  const ref = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const map = ref.current?.map;
    if (map) map.offset.y -= delta * 0.55;
  });

  return (
    <group position={[x, y, z]}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#8fabcd" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={ref}
          map={texture}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <sprite position={[0, -height / 2 + 0.4, 0.3]} scale={[width * 2.4, width * 1.5, 1]}>
        <spriteMaterial
          map={mist}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

export function Castle() {
  const stoneMap = useMemo(() => stoneTexture(), []);
  const stoneNormal = useMemo(() => {
    const t = stoneNormalTexture();
    t.repeat.set(3, 5);
    return t;
  }, []);

  return (
    <group>
      <CliffMass />
      <Towers />
      <Merlons />
      <CurtainWalls />
      <Buttresses />
      <Gatehouse x={33} y={-6.5} z={-38} rot={0.35} />
      <Gatehouse x={44} y={1.5} z={-48.5} rot={0.3} />
      <TowerBanners />

      {/* central keep */}
      <mesh position={[41, 6, -47]} castShadow receiveShadow>
        <boxGeometry args={[10, 18, 10]} />
        <meshStandardMaterial
          map={stoneMap}
          normalMap={stoneNormal}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          color={STONE}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      <WindowField count={190} spread={[30, 24, 24]} origin={[38, -9, -45]} seed={31} color="#ffc47a" size={1.35} />
      <WindowField count={44} spread={[10, 14, 6]} origin={[43, 1, -48]} seed={63} color="#ffe0a0" size={1.6} />

      {/* falls tumbling off the citadel cliffs into the valley */}
      <Waterfall x={22.5} y={-9.5} z={-30} height={13} width={2.8} />
      <Waterfall x={33} y={-7} z={-36} height={17} width={3.2} />
      <Waterfall x={46} y={-3} z={-44} height={24} width={2.6} />
      <Waterfall x={55} y={-2} z={-52} height={26} width={2.2} />
    </group>
  );
}

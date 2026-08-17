"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mulberry32, radialGlowTexture, stoneNormalTexture, woodTexture } from "./texture-utils";
import { InstancedAsset, useAssets } from "./useAssets";
function Chest({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const texture = useMemo(() => woodTexture("#4a2e1c", "#20130a"), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.62, 0.68]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.05, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.18, 0.85]} />
        <meshStandardMaterial color="#5e1f22" roughness={0.7} metalness={0} />
      </mesh>
    </group>
  );
}
function ShieldAndSword({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.5, 0.18]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.62, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 16]} />
        <meshStandardMaterial color="#2e2e34" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.62, 0.035]} castShadow>
        <torusGeometry args={[0.4, 0.03, 6, 16]} />
        <meshStandardMaterial color="#9a7f38" roughness={0.35} metalness={0.9} />
      </mesh>
      <mesh position={[0.75, 0.9, 0.05]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[0.07, 1.3, 0.02]} />
        <meshStandardMaterial color="#c4c9d0" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0.75, 0.24, 0.05]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[0.22, 0.08, 0.04]} />
        <meshStandardMaterial color="#6b4a24" roughness={0.8} metalness={0.05} />
      </mesh>
    </group>
  );
}

function Bench({ position }: { position: [number, number, number] }) {
  const texture = useMemo(() => woodTexture("#5a3a22", "#2c1c10"), []);
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.12, 0.5]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
      </mesh>
      {[
        [-0.65, -0.18],
        [0.65, -0.18],
        [-0.65, 0.18],
        [0.65, 0.18],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow receiveShadow>
          <boxGeometry args={[0.09, 0.4, 0.09]} />
          <meshStandardMaterial color="#2c1c10" roughness={0.9} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

function Lantern({ position }: { position: [number, number, number] }) {
  const glow = useMemo(() => radialGlowTexture("rgba(255,200,120,0.95)"), []);
  const ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.intensity = 3.4 + Math.sin(state.clock.elapsedTime * 5) * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.3, 0.22]} />
        <meshStandardMaterial
          color="#caa04a"
          emissive="#ffb066"
          emissiveIntensity={1.6}
          roughness={0.4}
          metalness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      <sprite scale={[0.9, 0.9, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.8} />
      </sprite>
      <pointLight ref={ref} color="#ffb066" intensity={3.4} distance={6} decay={2} castShadow />
    </group>
  );
}

/** Rail fence running along the cliff edge the camp overlooks the valley from. */
function Fence() {
  const texture = useMemo(() => woodTexture("#4a3320", "#20140a"), []);
  const postX = [-9, -6.5, -4, -1.5, 1, 3.5, 6];
  const spanX = (postX[0] + postX[postX.length - 1]) / 2;
  const spanLen = postX[postX.length - 1] - postX[0];
  return (
    <group position={[0, 0, -1.2]}>
      {[1.05, 0.62].map((y) => (
        <mesh key={y} position={[spanX, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, spanLen, 6]} />
          <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
        </mesh>
      ))}
      {postX.map((x) => (
        <mesh key={x} position={[x, 0.6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.07, 0.085, 1.3, 6]} />
          <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
        </mesh>
      ))}
      <Lantern position={[1, 1.6, 0.25]} />
    </group>
  );
}

function Mug({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <cylinderGeometry args={[0.14, 0.12, 0.28, 10]} />
      <meshStandardMaterial color="#2e2e32" roughness={0.4} metalness={0.75} />
    </mesh>
  );
}

function groundPatchTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0d0a07";
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(63);
  for (let i = 0; i < 2600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.5 + rand() * 2.4;
    ctx.fillStyle = rand() > 0.5 ? `rgba(72,54,36,${0.14 + rand() * 0.28})` : `rgba(3,2,1,${0.25 + rand() * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 3);
  texture.needsUpdate = true;
  return texture;
}

/** Trodden dirt/stone patch on top of the plateau where the camp sits. */
function Ground() {
  const map = useMemo(() => groundPatchTexture(), []);
  const normalMap = useMemo(() => {
    const t = stoneNormalTexture();
    t.repeat.set(10, 8);
    return t;
  }, []);
  return (
    <mesh position={[-1, 0.02, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[26, 16]} />
      <meshStandardMaterial
        map={map}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.45, 0.45)}
        roughness={0.96}
        metalness={0}
      />
    </mesh>
  );
}

export function CampProps() {
  const assets = useAssets();

  return (
    <group>
      <Ground />

      {/* modeled assets from the Blender build */}
      <InstancedAsset
        parts={assets.tent}
        placements={[{ position: [-8.5, 0, -1.5], rotationY: 0.5, scale: 1.05 }]}
      />
      <InstancedAsset
        parts={assets.crate}
        placements={[
          { position: [-6.8, 0, 1.2], rotationY: 0.3 },
          { position: [-7.4, 0, 1.9], rotationY: -0.5, scale: 0.9 },
          { position: [-6.8, 0.8, 1.4], rotationY: 0.9, scale: 0.85 },
          { position: [5.6, 0, 0.4], rotationY: -0.2, scale: 0.95 },
        ]}
      />
      <InstancedAsset
        parts={assets.barrel}
        placements={[
          { position: [-7.8, 0, 0.2], rotationY: 0.2 },
          { position: [-8.4, 0, 1.1], rotationY: 1.1, scale: 0.92 },
        ]}
      />

      <Chest position={[-3.5, 0, -1]} rotationY={0.3} />
      <Chest position={[6, 0, -0.5]} rotationY={-0.4} />
      <ShieldAndSword position={[-6.2, 0, 2.6]} />
      <Bench position={[4, 0, 1.5]} />
      <Mug position={[5, 0.5, -1.2]} />
      <Fence />
    </group>
  );
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { waterNormalTexture, waterSurfaceTexture } from "./texture-utils";
import { RIVER_Z_END, RIVER_Z_START, riverCenterX, riverWidth } from "./river-path";
import { valleyHeight } from "./terrain-height";

/** Water surface height at a point along the river's course. */
function riverY(z: number) {
  return valleyHeight(riverCenterX(z), z) + 0.25;
}

function riverGeometry() {
  const steps = 72;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = THREE.MathUtils.lerp(RIVER_Z_START, RIVER_Z_END, t);
    const cx = riverCenterX(z);
    const w = riverWidth(z) / 2;
    const y = riverY(z);
    positions.push(cx - w, y, z, cx + w, y, z);
    uvs.push(0, t * 16, 1, t * 16);
    if (i < steps) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function StoneBridge({ z, span }: { z: number; span: number }) {
  const cx = riverCenterX(z);
  const w = riverWidth(z);
  const y = riverY(z) + 1.5;
  return (
    <group position={[cx, y, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[span, 0.5, w + 2.6]} />
        <meshStandardMaterial color="#39393f" roughness={0.85} metalness={0.08} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.42, (s * (w + 2.6)) / 2]} castShadow>
          <boxGeometry args={[span, 0.35, 0.18]} />
          <meshStandardMaterial color="#2c2c33" roughness={0.85} metalness={0.08} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`p${s}`} position={[(s * span) / 2 - s * 0.5, -1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 2.2, w + 1]} />
          <meshStandardMaterial color="#26262e" roughness={0.9} metalness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

export function River() {
  const geometry = useMemo(() => riverGeometry(), []);
  const map = useMemo(() => waterSurfaceTexture(), []);
  const normalMap = useMemo(() => waterNormalTexture(), []);
  const ref = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    const mat = ref.current;
    if (!mat) return;
    mat.map!.offset.y -= delta * 0.05;
    mat.normalMap!.offset.y -= delta * 0.09;
    mat.normalMap!.offset.x += delta * 0.02;
  });

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          ref={ref}
          map={map}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          roughness={0.14}
          metalness={0.45}
          envMapIntensity={2.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <StoneBridge z={-34} span={11} />
      <StoneBridge z={-18} span={10} />
    </group>
  );
}

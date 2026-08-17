"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32, stoneNormalTexture } from "./texture-utils";
import { PLATEAU, valleyHeight } from "./terrain-height";

function groundTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#0b1410";
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(41);
  for (let i = 0; i < 2600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.6 + rand() * 2.2;
    ctx.fillStyle =
      rand() > 0.5
        ? `rgba(22,40,26,${0.12 + rand() * 0.26})`
        : `rgba(4,8,7,${0.16 + rand() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.needsUpdate = true;
  return texture;
}

const VALLEY_CENTER_X = 12;
const VALLEY_CENTER_Z = -28;

function valleyGeometry() {
  const width = 160;
  const depth = 90;
  const geo = new THREE.PlaneGeometry(width, depth, 160, 90);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const wx = pos.getX(i) + VALLEY_CENTER_X;
    const wz = pos.getZ(i) + VALLEY_CENTER_Z;
    pos.setY(i, valleyHeight(wx, wz));
  }
  geo.translate(VALLEY_CENTER_X, 0, VALLEY_CENTER_Z);
  geo.computeVertexNormals();
  return geo;
}

/** Rough rocky lip along the cliff edge so the plateau doesn't read as a clean box. */
function CliffLip() {
  const rocks = useMemo(() => {
    const rand = mulberry32(311);
    return Array.from({ length: 22 }, () => {
      const x = PLATEAU.minX + rand() * (PLATEAU.maxX - PLATEAU.minX);
      const s = 0.9 + rand() * 2.2;
      return {
        x,
        y: -0.5 - rand() * 1.6,
        z: PLATEAU.minZ + (rand() - 0.5) * 2.2,
        s,
        rot: rand() * Math.PI,
      };
    });
  }, []);
  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.y, r.z]} scale={r.s} rotation={[r.rot, r.rot * 1.7, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#1a1712" roughness={0.95} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

export function Terrain() {
  const geometry = useMemo(() => valleyGeometry(), []);
  const map = useMemo(() => groundTexture(), []);
  const normalMap = useMemo(() => {
    const t = stoneNormalTexture();
    t.repeat.set(20, 20);
    return t;
  }, []);

  const plateauW = PLATEAU.maxX - PLATEAU.minX;
  const plateauD = PLATEAU.maxZ - PLATEAU.minZ;

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          map={map}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.55, 0.55)}
          roughness={0.97}
          metalness={0}
        />
      </mesh>

      {/* camp plateau: the cliff the campsite overlooks the valley from */}
      <mesh
        position={[(PLATEAU.minX + PLATEAU.maxX) / 2, -11, (PLATEAU.minZ + PLATEAU.maxZ) / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[plateauW, 22, plateauD]} />
        <meshStandardMaterial
          color="#0a0806"
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.97}
          metalness={0.03}
        />
      </mesh>

      <CliffLip />
    </group>
  );
}

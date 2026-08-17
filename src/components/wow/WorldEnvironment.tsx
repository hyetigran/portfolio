"use client";

import { Environment } from "@react-three/drei";
import * as THREE from "three";

/**
 * Renders a simplified sky gradient into a real-time cubemap so PBR materials
 * (river, metal, stone) pick up reflected night-sky color instead of only
 * direct-light specular. No external HDRI — same gradient story as SkyDome.
 */
export function WorldEnvironment() {
  return (
    <Environment resolution={64} background={false}>
      <mesh>
        <sphereGeometry args={[80, 16, 8]} />
        <meshBasicMaterial color="#233a5e" side={THREE.BackSide} />
      </mesh>
      <mesh position={[18, 34, -50]}>
        <sphereGeometry args={[9, 12, 12]} />
        <meshBasicMaterial color="#f4f2ec" />
      </mesh>
      <pointLight position={[-6, 3, 10]} color="#ff8a3d" intensity={4} distance={16} />
    </Environment>
  );
}

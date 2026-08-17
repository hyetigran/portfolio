"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import { CameraRig } from "./CameraRig";
import { Lighting } from "./Lighting";
import { Sky } from "./Sky";
import { WorldEnvironment } from "./WorldEnvironment";
import { Mountains } from "./Mountains";
import { Castle } from "./Castle";
import { Terrain } from "./Terrain";
import { River } from "./River";
import { Village } from "./Village";
import { Trees } from "./Trees";
import { Campfire } from "./Campfire";
import { Banner } from "./Banner";
import { CampProps } from "./CampProps";
import { Foreground } from "./Foreground";

export function WorldCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows
      camera={{ fov: 62, near: 0.1, far: 400 }}
      gl={{ antialias: true, toneMappingExposure: 1.15 }}
    >
      <fog attach="fog" args={["#0c1730", 42, 205]} />
      <CameraRig />
      <Lighting />
      <WorldEnvironment />
      <Sky />
      <Mountains />
      <Terrain />
      <River />
      <Campfire />

      {/* everything below draws from the Blender GLB, which suspends while loading */}
      <Suspense fallback={null}>
        <Castle />
        <Village />
        <Trees />
        <CampProps />
        <Foreground />
        <Banner />
      </Suspense>

      <EffectComposer multisampling={4}>
        <DepthOfField focusDistance={0.018} focalLength={0.012} bokehScale={1.1} height={480} />
        <Bloom
          mipmapBlur
          intensity={1.15}
          luminanceThreshold={0.28}
          luminanceSmoothing={0.3}
          radius={0.78}
        />
        <Vignette eskil={false} offset={0.14} darkness={0.95} />
      </EffectComposer>
    </Canvas>
  );
}

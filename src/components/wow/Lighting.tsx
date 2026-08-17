"use client";

/**
 * Deliberately low ambient/hemisphere so unlit geometry falls to near-black.
 * The value range in this scene comes from the campfire pool and the emissive
 * windows reading against genuinely dark surroundings — lifting ambient to make
 * things "visible" is what flattens it.
 */
export function Lighting() {
  return (
    <>
      <hemisphereLight color="#5f7fb5" groundColor="#04060a" intensity={0.2} />
      <directionalLight
        position={[30, 46, -20]}
        color="#cfe0ff"
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-camera-near={1}
        shadow-camera-far={130}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-18, 12, 20]} color="#35507e" intensity={0.1} />
      <ambientLight color="#0d1524" intensity={0.09} />
    </>
  );
}

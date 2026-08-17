"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Elevated overlook: camp in the near foreground, valley falling away to the
// citadel on the right.
const LOOK_AT = new THREE.Vector3(4, 1.5, -30);
const REST_POSITION = new THREE.Vector3(0.5, 7, 10.5);
const START_POSITION = new THREE.Vector3(-0.5, 5, 17.5);
const INTRO_SECONDS = 5;

export function CameraRig() {
  const { camera } = useThree();
  const reducedMotion = useRef(false);
  const start = useRef(0);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    camera.position.copy(reducedMotion.current ? REST_POSITION : START_POSITION);
    camera.lookAt(LOOK_AT);
  }, [camera]);

  useFrame((state, delta) => {
    if (reducedMotion.current) return;

    start.current += delta;
    const introProgress = Math.min(start.current / INTRO_SECONDS, 1);
    const eased = 1 - Math.pow(1 - introProgress, 3);

    const base = START_POSITION.clone().lerp(REST_POSITION, eased);

    if (introProgress >= 1) {
      const t = state.clock.elapsedTime;
      base.x += Math.sin(t * 0.045) * 0.2;
      base.y += Math.sin(t * 0.07) * 0.08;
    }

    camera.position.copy(base);
    camera.lookAt(LOOK_AT);
  });

  return null;
}

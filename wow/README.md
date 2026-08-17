# Tigran Fantasy Portfolio

A cinematic fantasy portfolio prototype built with Next.js, React Three Fiber, and Three.js.

## Current phase

The generated fantasy artwork is being used as the art-direction / hero backdrop. A transparent Three.js atmosphere layer adds stars and firefly particles.

The next phase is to replace the painted backdrop with a real 3D scene while keeping the same composition:
- foreground campfire
- fantasy-themed American banner
- distant mountain settlement
- castle
- waterfalls
- layered depth
- cinematic camera
- interactive portfolio objects

## Run

```bash
npm install
npm run dev
```

Then open the local URL shown by Next.js.

## Planned architecture

- `components/FantasyWorld.tsx` — portfolio/world shell
- `components/Atmosphere.tsx` — Three.js atmospheric layer
- `public/world-concept.png` — current visual reference
- future `/scene` components — terrain, camp, buildings, props, lights, particles

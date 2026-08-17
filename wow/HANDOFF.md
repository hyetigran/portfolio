# Tigran Asriyan Fantasy Portfolio — Claude Code Handoff

## Goal
Build a premium cinematic portfolio that feels like a small fantasy game world rather than a conventional developer portfolio.

Use a WoW-inspired fantasy visual language, but do not ship ripped Blizzard/WoW assets. Use original, procedural, CC0, or properly licensed assets.

## Approved scene
- Moonlit fantasy valley
- Foreground campsite
- Large campfire as the primary foreground anchor
- Fantasy-styled American banner
- Crates, barrels, chest, lanterns and other camp props
- River, bridges and waterfalls
- Distant illuminated fantasy settlement
- Large castle on the mountain
- Mountains, clouds and stars
- Cool blue environment contrasted with warm orange firelight
- Restrained gold fantasy UI

**The Orc and Dwarf were removed. Do not add them back.**

## Experience
The site should feel like looking into a living fantasy world, not a dashboard with a 3D wallpaper.

Use a fixed/cinematic camera:
1. Start relatively close to the campsite/campfire.
2. Slowly pull back/rise.
3. Reveal the valley.
4. Reveal the settlement and castle.
5. Settle into the hero composition.
6. Continue with subtle idle drift.

Eventually navigation should trigger cinematic camera transitions.

## Portfolio metaphor
Potential future mapping:
- About -> campsite/campfire
- Projects -> quest board / artifacts / workshop
- Experience -> fortress/castle
- Skills -> forge/enchanting station
- Contact -> messenger/raven/lantern
- Resume -> map/scroll
- GitHub -> engineering/workshop area

## Technology
Preferred: Next.js, React, TypeScript, React Three Fiber, Three.js, @react-three/drei.

Potential additions only when justified: GSAP, @react-three/postprocessing, Meshopt/Draco, Blender, Rapier.

## Performance
Target modern desktop browsers around 60 FPS. Use GLB, compressed geometry/textures, instancing, LOD, baked lighting where possible, limited dynamic lights, selective postprocessing, cheap distant geometry, particles, and lazy loading.

The fixed camera is intentional. Optimize aggressively for what is visible. Do not build a giant open world.

## Current prototype
The project contains a Next.js shell, R3F atmosphere layer, stars, floating particles, responsive fantasy UI, concept-art background, navigation, intro panel and map panel.

`public/world-concept.png` is art direction / temporary background. Replace it with a real 3D scene.

## Implementation order
1. R3F canvas, camera, fog, sky, moon and lighting.
2. Foreground terrain, campfire, smoke/embers, banner and camp props.
3. River, waterfalls, bridges, buildings, lanterns, roads and trees.
4. Settlement, castle, mountains, magical beacon and distant lights.
5. Fire, smoke, water, flag, particles, clouds and foliage animation.
6. Cinematic intro, idle drift and future camera targets.
7. Interactive portfolio locations and content panels.

## Code expectations
Keep scene logic separate from HTML portfolio UI. Avoid giant components. Use data-driven configuration for interactive locations. Use refs for high-frequency animation and avoid React state in `useFrame`. Keep browser-only Three.js code client-side. Preserve accessibility and responsive behavior. Respect `prefers-reduced-motion`.

Suggested future structure:

components/world/
- WorldCanvas.tsx
- CameraRig.tsx
- Lighting.tsx
- Environment.tsx
- ForegroundCamp.tsx
- Campfire.tsx
- Banner.tsx
- MidgroundVillage.tsx
- Castle.tsx
- Waterfalls.tsx
- Particles.tsx

components/portfolio/
- PortfolioShell.tsx
- Navigation.tsx
- ProjectPanel.tsx
- AboutPanel.tsx
- ExperiencePanel.tsx
- SkillsPanel.tsx
- ContactPanel.tsx

## First 3D milestone
Do not build the whole portfolio first.

Success means:
- real R3F/Three.js environment
- compelling campfire
- fantasy American banner
- convincing depth
- moonlight + firelight
- animated particles
- subtle environmental motion
- cinematic camera
- good desktop performance
- existing HTML UI still works over the world

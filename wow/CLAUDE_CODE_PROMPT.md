# Claude Code — Start Here

Read `HANDOFF.md`, `DESIGN_SPEC.md`, and `README.md` first.

Turn the existing Next.js/React prototype into a real-time 3D fantasy portfolio using React Three Fiber and Three.js.

### Critical direction
This is a portfolio disguised as a cinematic fantasy world.

Approved scene:
- foreground campfire
- fantasy-styled American banner
- campsite props
- moonlit valley
- waterfalls
- distant settlement
- castle
- mountains
- warm settlement lights
- blue magical beacon

There are **NO Orc or Dwarf characters**.

`public/world-concept.png` is the art-direction reference and temporary background. Replace it with a real 3D environment.

### Build only the first milestone
Implement:
1. R3F canvas
2. cinematic camera
3. terrain/cliff
4. campfire
5. fantasy American banner
6. foreground camp props
7. basic river/waterfall
8. distant settlement silhouettes
9. castle silhouette
10. moon/fog/stars
11. fire/ember/smoke animation
12. warm/cool lighting
13. subtle camera drift

Do not build portfolio detail pages yet.

### Technical constraints
- TypeScript
- React Three Fiber
- Three.js
- drei
- modular scene components
- refs for animation
- no React state in animation loops
- optimize geometry/textures
- instance repeated objects
- keep distant geometry cheap
- preserve HTML UI as overlay
- responsive behavior
- isolate placeholders so GLB assets can replace them later

GSAP is acceptable for camera transitions if useful.

### Camera
Create a reusable `CameraRig` supporting:
- cinematic intro
- idle drift
- future named camera targets

Use smooth interpolation.

### Visual target
Stylized premium fantasy, not photorealism:
deep blue night, warm orange fire, gold UI, atmospheric fog, strong depth and cinematic lighting.

### Performance
Target smooth modern desktop performance. The scene is intentionally small and fixed-camera. Optimize for the visible composition.

### Finish
Run `npm run build`, update `README.md`, and do not rewrite unrelated code.

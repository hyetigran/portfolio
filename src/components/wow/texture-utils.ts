import * as THREE from "three";

/** Procedural ripple normal map for water surfaces (tileable-ish blue-tinted bump texture). */
export function waterNormalTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(29);
  for (let i = 0; i < 160; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 3 + rand() * 10;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tint = rand() > 0.5 ? "#9a9aff" : "#6767e6";
    g.addColorStop(0, tint);
    g.addColorStop(1, "rgba(128,128,255,0)");
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.4, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** Procedural lunar surface texture with soft crater shading. */
export function moonTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e8e6df";
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(17);
  for (let i = 0; i < 46; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 4 + rand() * 22;
    const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.12)");
    g.addColorStop(0.55, "rgba(150,148,140,0.16)");
    g.addColorStop(1, "rgba(120,118,110,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 900; i++) {
    const x = rand() * size;
    const y = rand() * size;
    ctx.fillStyle = rand() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(90,88,82,0.08)";
    ctx.fillRect(x, y, 1, 1);
  }
  const t = new THREE.CanvasTexture(canvas);
  t.needsUpdate = true;
  return t;
}

/** Procedural rocky/stone-ish tangent-space normal map (mottled bumps, no directionality). */
export function stoneNormalTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(203);
  for (let i = 0; i < 320; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 2 + rand() * 6;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const lean = rand() > 0.5;
    g.addColorStop(0, lean ? "#a0a0ff" : "#6060e0");
    g.addColorStop(1, "rgba(128,128,255,0)");
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** Deterministic pseudo-random generator so scene layout is stable across renders. */
export function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tex(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.needsUpdate = true;
  return t;
}

/** Soft radial gradient sprite — moon halo, window glow, beacon core, embers. */
export function radialGlowTexture(color: string, size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, color);
  g.addColorStop(0.4, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return tex(canvas);
}

/** Soft irregular puff sprite for clouds and smoke. */
export function puffTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.55, "rgba(255,255,255,0.32)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return tex(canvas);
}

/** Tileable vertical streak + noise texture for waterfalls. */
export function waterfallTexture(width = 32, height = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const len = 6 + Math.random() * 18;
    const alpha = 0.12 + Math.random() * 0.35;
    ctx.strokeStyle = `rgba(214,232,255,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + len);
    ctx.stroke();
  }
  const t = tex(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Rough wood-grain texture for crates, barrels, tent poles, fences. */
export function woodTexture(base = "#5a3a22", grain = "#2c1c10", size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(7);
  for (let i = 0; i < 40; i++) {
    const y = rand() * size;
    ctx.strokeStyle = grain;
    ctx.globalAlpha = 0.15 + rand() * 0.25;
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + (rand() - 0.5) * 8, size * 0.7, y + (rand() - 0.5) * 8, size, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const t = tex(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Fantasy American banner cloth: red/white stripes, blue canton with stars, gold trim. */
export function bannerTexture(width = 256, height = 384): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const stripeH = height / 13;
  for (let i = 0; i < 13; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#b03434" : "#f2e9d2";
    ctx.fillRect(0, i * stripeH, width, stripeH + 1);
  }

  const cantonW = width * 0.52;
  const cantonH = height * 0.46;
  ctx.fillStyle = "#243d78";
  ctx.fillRect(0, 0, cantonW, cantonH);

  const rows = 6;
  const cols = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offset = r % 2 === 0 ? 0 : cantonW / cols / 2;
      const x = offset + (c + 0.5) * (cantonW / cols);
      const y = (r + 0.5) * (cantonH / rows);
      if (x > cantonW - 4) continue;
      drawStar(ctx, x, y, cantonW / cols / 3.4);
    }
  }

  // weathering: subtle vertical fade + noise
  const fade = ctx.createLinearGradient(0, 0, 0, height);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, width, height);

  const rand = mulberry32(21);
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = rand() > 0.5 ? "#000" : "#fff";
    ctx.fillRect(rand() * width, rand() * height, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;

  // gold border
  ctx.strokeStyle = "#caa04a";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  const t = tex(canvas);
  t.anisotropy = 4;
  return t;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos((18 + i * 72) * (Math.PI / 180)) * r, -Math.sin((18 + i * 72) * (Math.PI / 180)) * r);
    ctx.lineTo(
      Math.cos((54 + i * 72) * (Math.PI / 180)) * r * 0.42,
      -Math.sin((54 + i * 72) * (Math.PI / 180)) * r * 0.42
    );
  }
  ctx.closePath();
  ctx.fillStyle = "#e8d27a";
  ctx.fill();
  ctx.restore();
}

/** Gentle shimmer/noise texture for river water. */
export function waterSurfaceTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#6f9fd0";
  ctx.fillRect(0, 0, size, size);
  const rand = mulberry32(3);
  for (let i = 0; i < 300; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const w = 4 + rand() * 14;
    ctx.strokeStyle = `rgba(225,240,255,${0.2 + rand() * 0.34})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  }
  const t = tex(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

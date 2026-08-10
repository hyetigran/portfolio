"use client";

import { useEffect, useRef } from "react";

/**
 * Animated interference topography behind the hero: a handful of moving wave
 * sources (plus the pointer, as a faster-moving source) summed into a scalar
 * field, contoured with marching squares every frame.
 */
export function HeroField({ density = 15 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim() || "oklch(0.82 0.17 152)";

    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let step = density;
    let vals: Float32Array = new Float32Array(0);

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      step = density;
      cols = Math.ceil(W / step) + 1;
      rows = Math.ceil(H / step) + 1;
      vals = new Float32Array((cols + 1) * (rows + 1));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // The pointer acts as a fourth, faster wave source.
    let px = 0.72;
    let py = 0.3;
    let tx = 0.72;
    let ty = 0.3;
    const onMove = (e: MouseEvent) => {
      const r = host.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
    };
    host.addEventListener("mousemove", onMove);

    let raf = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      const t = reduceMotion ? 4200 : (now - t0) / 1000;
      px += (tx - px) * 0.045;
      py += (ty - py) * 0.045;

      const src: [number, number, number, number, number][] = [
        [0.78 + 0.13 * Math.sin(t * 0.21), 0.26 + 0.15 * Math.cos(t * 0.17), 0.055, 1.35, 1.0],
        [0.52 + 0.17 * Math.cos(t * 0.13), 0.72 + 0.12 * Math.sin(t * 0.19), 0.042, -1.1, 0.85],
        [1.02 + 0.09 * Math.sin(t * 0.27), 0.86 + 0.1 * Math.cos(t * 0.23), 0.036, 0.9, 0.7],
        [px, py, 0.062, 2.1, 0.9],
      ];
      const norm = Math.max(W, H);
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const x = i * step;
          const y = j * step;
          let v = 0;
          for (const s of src) {
            const dx = (x - s[0] * W) / norm;
            const dy = (y - s[1] * H) / norm;
            const d = Math.sqrt(dx * dx + dy * dy);
            v += s[4] * Math.sin(d / s[2] - t * s[3]) / (1 + d * 5.2);
          }
          vals[j * (cols + 1) + i] = v;
        }
      }

      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      const levels = 11;
      for (let l = 0; l < levels; l++) {
        const lv = -0.62 + (1.24 * l) / (levels - 1);
        const near = 1 - Math.min(1, Math.abs(lv) / 0.66);
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const a = vals[j * (cols + 1) + i];
            const b = vals[j * (cols + 1) + i + 1];
            const c = vals[(j + 1) * (cols + 1) + i + 1];
            const d = vals[(j + 1) * (cols + 1) + i];
            let m = 0;
            if (a > lv) m |= 8;
            if (b > lv) m |= 4;
            if (c > lv) m |= 2;
            if (d > lv) m |= 1;
            if (m === 0 || m === 15) continue;
            const x0 = i * step;
            const y0 = j * step;
            const ip = (p: number, q: number) => (lv - p) / (q - p || 1e-6);
            const T: [number, number] = [x0 + step * ip(a, b), y0];
            const R: [number, number] = [x0 + step, y0 + step * ip(b, c)];
            const B: [number, number] = [x0 + step * ip(d, c), y0 + step];
            const L: [number, number] = [x0, y0 + step * ip(a, d)];
            const seg = (p: [number, number], q: [number, number]) => {
              ctx.moveTo(p[0], p[1]);
              ctx.lineTo(q[0], q[1]);
            };
            switch (m) {
              case 1:
              case 14:
                seg(L, B);
                break;
              case 2:
              case 13:
                seg(B, R);
                break;
              case 3:
              case 12:
                seg(L, R);
                break;
              case 4:
              case 11:
                seg(T, R);
                break;
              case 6:
              case 9:
                seg(T, B);
                break;
              case 7:
              case 8:
                seg(L, T);
                break;
              case 5:
                seg(L, T);
                seg(B, R);
                break;
              case 10:
                seg(L, B);
                seg(T, R);
                break;
            }
          }
        }
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.05 + 0.05 * near;
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.globalAlpha = 0.16 + 0.4 * near;
        ctx.lineWidth = near > 0.72 ? 1.15 : 0.7;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("mousemove", onMove);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full block z-0 pointer-events-none"
      style={{
        maskImage:
          "radial-gradient(115% 150% at 78% 26%, #000 0%, rgba(0,0,0,.55) 42%, transparent 74%)",
        WebkitMaskImage:
          "radial-gradient(115% 150% at 78% 26%, #000 0%, rgba(0,0,0,.55) 42%, transparent 74%)",
      }}
    />
  );
}

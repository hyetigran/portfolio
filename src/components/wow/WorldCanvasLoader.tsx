"use client";

import dynamic from "next/dynamic";

const WorldCanvas = dynamic(
  () => import("./WorldCanvas").then((mod) => mod.WorldCanvas),
  { ssr: false }
);

export function WorldCanvasLoader() {
  return <WorldCanvas />;
}

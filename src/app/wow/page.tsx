import { WorldCanvasLoader } from "@/components/wow/WorldCanvasLoader";

export default function WowPage() {
  return (
    <section className="relative h-[calc(100vh-7rem)] min-h-[420px] overflow-hidden bg-[#050810]">
      <WorldCanvasLoader />
      <div className="pointer-events-none absolute left-6 bottom-6 sm:left-10 sm:bottom-8 px-4 py-3 border border-[#caa46a]/25 bg-black/45 backdrop-blur-[2px]">
        <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-[#caa46a]/80">
          prototype — the wow world
        </div>
      </div>
    </section>
  );
}

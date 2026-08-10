export function PlaceholderMedia({
  label,
  aspect = "16/10",
  className = "",
}: {
  label: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center border-b border-white/8 font-mono text-[10.5px] tracking-[0.08em] text-ink-faint ${className}`}
      style={{
        aspectRatio: aspect,
        backgroundImage:
          "repeating-linear-gradient(135deg, #16181a 0 9px, #121415 9px 18px)",
      }}
    >
      [ {label} ]
    </div>
  );
}

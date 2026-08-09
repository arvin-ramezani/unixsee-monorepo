export default function LoadingSpinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 shrink-0 animate-[spin_800ms_linear_infinite] rounded-full text-current"
      style={{
        background:
          "conic-gradient(from 0deg, transparent 0deg, transparent 110deg, currentColor 300deg, currentColor 360deg)",
        WebkitMask:
          "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
        mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
      }}
    />
  );
}

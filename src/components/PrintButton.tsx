"use client";

export default function PrintButton({
  label = "Print Recipe",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      aria-label="Print this recipe"
      className={
        className ||
        "no-print inline-flex items-center gap-2 bg-garden-green-pale text-black border border-garden-green-dark/30 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-garden-green-light/40 transition-colors"
      }
    >
      <span aria-hidden="true">🖨️</span>
      {label}
    </button>
  );
}

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * The ROM mark as a fixed box: the asset only supplies the silhouette, the
 * panel supplies the colour, and the mask fits the artwork inside the box.
 */
export function RomMark({
  id,
  src,
  className,
}: {
  id: string;
  src: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-rom-mark={id}
      className={cn("rom-mark pointer-events-none", className)}
      style={{ "--rom-mark": `url("${src}")` } as CSSProperties}
    />
  );
}

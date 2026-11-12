import { useEffect } from "react";

/**
 * Applies a ROM palette to the document so the header and any portals follow
 * the page's content. The page wrapper also carries `data-rom` for first paint.
 */
export function useRomPalette(id: string | undefined): void {
  useEffect(() => {
    if (!id) return;
    const root = document.documentElement;
    const previous = root.dataset.rom;
    root.dataset.rom = id;
    return () => {
      if (previous) root.dataset.rom = previous;
      else delete root.dataset.rom;
    };
  }, [id]);
}

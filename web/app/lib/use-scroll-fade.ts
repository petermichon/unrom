import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks whether a scroll container can still scroll down (`more`) and has
 * scrolled away from the start (`above`), so fades can stand in for a
 * scrollbar: the list looks clipped rather than ended.
 *
 * Uses a callback ref because the element (a dialog) mounts after the hook's
 * owner renders; an effect with `[]` would only ever see `null`.
 */
export function useScrollFade<T extends HTMLElement>() {
  const [more, setMore] = useState(false);
  const [above, setAbove] = useState(false);
  const cleanup = useRef<(() => void) | null>(null);

  const ref = useCallback((element: T | null) => {
    cleanup.current?.();
    cleanup.current = null;
    if (!element) return;

    const update = () => {
      const remaining =
        element.scrollHeight - element.clientHeight - element.scrollTop;
      setMore(remaining > 4);
      setAbove(element.scrollTop > 4);
    };

    update();
    element.addEventListener("scroll", update, { passive: true });
    // The element's own box can change (viewport rotation, card max-height);
    // observing it is enough because the content height is static per render.
    const observer = new ResizeObserver(update);
    observer.observe(element);
    cleanup.current = () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => () => cleanup.current?.(), []);

  return { ref, more, above };
}

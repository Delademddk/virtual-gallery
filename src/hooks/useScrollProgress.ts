"use client";

import { useEffect, useRef } from "react";

/** Scroll-linked transforms without a React render for each scroll frame. */
export function useScrollProgress<T extends HTMLElement>(
  mode: "pinned" | "travel" = "travel",
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const render = () => {
      frame = 0;
      const box = node.getBoundingClientRect();
      const value = media.matches
        ? 1
        : mode === "pinned"
          ? -box.top / Math.max(1, box.height - innerHeight)
          : (innerHeight - box.top) / Math.max(1, innerHeight + box.height);
      node.style.setProperty(
        "--motion-p",
        Math.max(0, Math.min(1, value)).toFixed(4),
      );
      node.dataset.motion = media.matches ? "reduced" : "full";
    };
    const update = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const observer = new ResizeObserver(update);
    observer.observe(node);
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    media.addEventListener("change", update);
    render();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      media.removeEventListener("change", update);
    };
  }, [mode]);
  return ref;
}

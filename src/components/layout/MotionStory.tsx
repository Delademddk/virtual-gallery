"use client";
import { type CSSProperties, type ReactNode } from "react";
import { useScrollProgress } from "@/src/hooks/useScrollProgress";

export function MotionStory({ children }: { children: ReactNode }) {
  const ref = useScrollProgress<HTMLElement>();
  return (
    <section ref={ref} id="about" className="story section-wrap motion-story">
      {children}
    </section>
  );
}
export function ScrollStatement() {
  const words = "Art has a place. Now, so do you.".split(" ");
  return (
    <h2
      className="scroll-statement"
      aria-label="Art has a place. Now, so do you."
    >
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i > 3 ? "statement-italic" : ""}
          style={{ "--word-index": i } as CSSProperties}
        >
          {word}{" "}
        </span>
      ))}
    </h2>
  );
}

"use client";
import { useScrollProgress } from "@/src/hooks/useScrollProgress";

export default function MotionRibbon() {
  const ref = useScrollProgress<HTMLElement>();
  return (
    <section
      ref={ref}
      className="motion-ribbon"
      aria-label="Art, culture and connection"
    >
      <div aria-hidden="true" className="ribbon-line">
        ART / CULTURE / CONNECTION / ART / CULTURE /
      </div>
      <div aria-hidden="true" className="ribbon-line ribbon-outline">
        SEE DIFFERENTLY / AZANIA / SEE DIFFERENTLY /
      </div>
    </section>
  );
}

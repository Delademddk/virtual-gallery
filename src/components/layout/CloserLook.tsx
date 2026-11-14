"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { useScrollProgress } from "@/src/hooks/useScrollProgress";

const details = [
  {
    title: "Surface",
    heading: "Start with what you can see.",
    text: "Follow the edges, repeated lines and areas of empty space. What does your eye return to? Give that detail a moment before moving on.",
    scale: 1.65,
    x: -9,
    y: 8,
    markerX: 62,
    markerY: 38,
  },
  {
    title: "Composition",
    heading: "See how it holds together.",
    text: "Trace a line across the work. Notice where it stops, changes direction or crosses another form. Step back and see how those small decisions make a whole.",
    scale: 1,
    x: 0,
    y: 0,
    markerX: 45,
    markerY: 62,
  },
  {
    title: "Context",
    heading: "Ask what the image cannot tell you.",
    text: "Who made it? What is it made from? What was it made for? A maker, a material and a story can open another way into a work.",
    scale: 1.25,
    x: 5,
    y: -5,
    markerX: 35,
    markerY: 34,
  },
];

export default function CloserLook() {
  const ref = useScrollProgress<HTMLElement>();
  const [active, setActive] = useState(0);
  const detail = details[active];
  const style = {
    "--detail-scale": detail.scale,
    "--detail-x": `${detail.x}%`,
    "--detail-y": `${detail.y}%`,
    "--marker-x": `${detail.markerX}%`,
    "--marker-y": `${detail.markerY}%`,
  } as CSSProperties;
  return (
    <section
      ref={ref}
      id="closer-look"
      className="closer-look section-wrap"
      style={style}
    >
      <div className="section-label">
        <span>04 / THE ART OF NOTICING</span>
        <span>A SMALL DETAIL CAN CHANGE THE WHOLE VIEW.</span>
      </div>
      <div className="closer-layout">
        <div className="closer-intro">
          <span className="eyebrow">TAKE A SECOND LOOK</span>
          <h2>
            Look
            <br />
            <i>closer.</i>
          </h2>
          <p>
            You do not need the right words to begin. Start with a question.
          </p>
          <Link href="/gallery" className="underlined-link">
            Try it in the gallery <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="detail-visual">
          <div className="detail-image-window">
            <img
              src="/studies/study-03.svg"
              alt="Abstract line study, enlarged to examine its shapes and intersections"
              loading="lazy"
            />
            <span className="detail-reticle" aria-hidden="true">
              <Plus size={20} />
            </span>
          </div>
          <div className="detail-visual-footer">
            <span>LINES OF CONNECTION</span>
            <span>DESIGN STUDY / 003</span>
          </div>
        </div>
        <div className="detail-reader">
          <div
            className="detail-buttons"
            role="group"
            aria-label="Choose a way to look"
          >
            {details.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-pressed={active === index}
                onClick={() => setActive(index)}
              >
                <span>0{index + 1}</span>
                {item.title}
                <Plus size={14} />
              </button>
            ))}
          </div>
          <div className="detail-note" key={active} aria-live="polite">
            <span className="detail-note-index">0{active + 1}</span>
            <h3>{detail.heading}</h3>
            <p>{detail.text}</p>
          </div>
          <p className="detail-source-note">
            Illustrated with an original AZANIA design study. Final exhibit
            research is in progress.
          </p>
        </div>
      </div>
    </section>
  );
}

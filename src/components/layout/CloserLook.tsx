"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { useScrollProgress } from "@/src/hooks/useScrollProgress";

const details = [
  {
    title: "Surface",
    heading: "Follow the light across the surface.",
    text: "Look at the folds of the headwrap, the face and the necklace. Notice how raised edges catch the light while recessed areas stay in shadow.",
    image: "/images/exhibit-portrait.jpg",
    alt: "Close view of the portrait bust from the AZANIA Blender gallery",
    scale: 1.5,
    x: 0,
    y: 10,
    markerX: 53,
    markerY: 46,
  },
  {
    title: "Composition",
    heading: "See how it holds together.",
    text: "Follow the outline from the headwrap down to the shoulders. Notice the balance between the face, the jewellery and the empty space around the figure.",
    image: "/images/exhibit-portrait.jpg",
    alt: "Three-quarter render showing the complete portrait bust from the gallery",
    scale: 1,
    x: 0,
    y: 0,
    markerX: 45,
    markerY: 62,
  },
  {
    title: "Context",
    heading: "Look at the setting, too.",
    text: "See how the portrait is presented beneath the arch. The pedestal, lighting and surrounding space change how you encounter the form. Its maker and cultural background are still being researched.",
    image: "/images/exhibit-portrait-context.jpg",
    alt: "The same portrait bust on its pedestal beneath the arch in the actual gallery",
    scale: 1,
    x: 0,
    y: 0,
    markerX: 53,
    markerY: 53,
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
              src={detail.image}
              alt={detail.alt}
              width={1200}
              height={1500}
              loading="lazy"
            />
            <span className="detail-reticle" aria-hidden="true">
              <Plus size={20} />
            </span>
          </div>
          <div className="detail-visual-footer">
            <span>PORTRAIT DISPLAY</span>
            <span>FROM THE GALLERY MODEL</span>
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
            Rendered from the team’s 3D gallery. Exhibit identification and
            historical context are being verified.
          </p>
        </div>
      </div>
    </section>
  );
}

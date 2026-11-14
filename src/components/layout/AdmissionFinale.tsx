"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type CSSProperties } from "react";
import { useScrollProgress } from "@/src/hooks/useScrollProgress";
import { studies } from "@/src/data/studies";

const passes = [
  { x: 2, turn: -22, land: 15 },
  { x: 19, turn: 13, land: 105 },
  { x: 35, turn: -8, land: 40 },
  { x: 51, turn: 18, land: 120 },
  { x: 68, turn: -17, land: 10 },
  { x: 83, turn: 28, land: 105 },
  { x: 7, turn: 8, land: 170 },
  { x: 40, turn: -13, land: 210 },
  { x: 73, turn: 6, land: 220 },
];
export default function AdmissionFinale() {
  const ref = useScrollProgress<HTMLElement>("pinned");
  return (
    <section
      ref={ref}
      id="admission"
      className="admission-finale"
      aria-label="Visit AZANIA"
    >
      <div className="admission-stage">
        <div className="admission-topline">
          <span>07 / YOUR INVITATION</span>
          <span>GHANA / EVERYWHERE</span>
        </div>
        <div className="admission-words" aria-hidden="true">
          ART
          <br />
          FORM
          <br />
          MEMORY
          <br />
          EXPRESSION
          <br />
          COMMUNITY
          <br />
          PERSPECTIVE
        </div>
        <div className="admission-copy">
          <span className="admission-kicker">
            NO TICKET REQUIRED. JUST CURIOSITY.
          </span>
          <h2>
            <span>Step</span>
            <span>
              <i>inside.</i>
            </span>
          </h2>
          <p>Explore at your own pace.</p>
        </div>
        <Link
          href="/gallery"
          className="rolling-entry"
          aria-label="Enter the 3D gallery"
        >
          <span className="rolling-label" aria-hidden="true">
            <span>
              Enter gallery <ArrowUpRight size={20} />
            </span>
            <span>
              Enter gallery <ArrowUpRight size={20} />
            </span>
          </span>
        </Link>
        <div className="admission-passes" aria-hidden="true">
          {passes.map((pass, i) => (
            <div
              key={i}
              className="gallery-pass"
              style={
                {
                  "--pass-x": pass.x,
                  "--pass-turn": pass.turn,
                  "--pass-land": pass.land,
                  "--pass-delay": i * 0.037,
                } as CSSProperties
              }
            >
              <img
                src={studies[i % studies.length].image}
                alt=""
                loading="lazy"
              />
              <div className="pass-content">
                <span className="pass-brand">AZANIA</span>
                <strong>GALLERY PASS</strong>
                <span>VIRTUAL VISIT / FREE ENTRY</span>
                <div className="pass-barcode" />
                <span className="pass-number">
                  A—00{i + 1} / ART BEYOND THE FRAME
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="admission-bottom">
          <span>A NEW PERSPECTIVE IS WAITING.</span>
          <a href="#top">Back to the beginning ↑</a>
        </div>
      </div>
    </section>
  );
}

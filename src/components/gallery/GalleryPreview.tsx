"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowLeft, ArrowUpRight, HelpCircle, X } from "lucide-react";
import { studies } from "@/src/data/studies";
const Scene = dynamic(() => import("@/src/components/three/GalleryScene"), {
  ssr: false,
});

export default function GalleryPreview() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [help, setHelp] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  const onSelect = useCallback((index: number) => {
    setSelected(index);
    setHelp(false);
  }, []);
  return (
    <main className="gallery-page">
      <div className="gallery-canvas">
        <Scene
          interactive
          active={!help && selected === null}
          onReady={onReady}
          onSelect={onSelect}
          onFailure={onFailure}
        />
      </div>
      <header className="gallery-header">
        <Link href="/" aria-label="AZANIA home" className="small-logo">
          AZANIA®
        </Link>
        <span>THE SPACE / ROOM PREVIEW</span>
        <div>
          <button
            aria-expanded={help}
            onClick={() => {
              setHelp(!help);
              setSelected(null);
            }}
          >
            <HelpCircle size={17} /> Help
          </button>
          <Link href="/">
            <ArrowLeft size={17} /> Leave gallery
          </Link>
        </div>
      </header>
      {!ready && !failed && (
        <div className="gallery-loading" role="status">
          Preparing the gallery…
        </div>
      )}
      {ready && !failed && !help && selected === null && (
        <div className="gallery-hint">
          <span className="live-dot" /> Drag to look around. Scroll or pinch to
          zoom. Select a framed study.
        </div>
      )}
      {help && (
        <aside className="gallery-panel">
          <button
            className="dialog-close"
            aria-label="Close help"
            onClick={() => setHelp(false)}
          >
            <X size={22} />
          </button>
          <span className="eyebrow">YOUR FIRST LOOK</span>
          <h1>A space to explore.</h1>
          <p>
            Drag with your mouse or one finger to rotate the view. Scroll or
            pinch to move closer. Select a framed study to read about it.
          </p>
          <p>
            This is the initial room preview, using the team’s Blender model.
            First-person walking, collision and audio guides are planned
            integration stages.
          </p>
          <button className="pill-button" onClick={() => setHelp(false)}>
            Back to the room <ArrowUpRight size={18} />
          </button>
        </aside>
      )}
      {selected !== null && (
        <aside className="gallery-panel">
          <button
            className="dialog-close"
            aria-label="Close exhibit information"
            onClick={() => setSelected(null)}
          >
            <X size={22} />
          </button>
          <img src={studies[selected].image} alt={studies[selected].title} />
          <span className="eyebrow">DESIGN STUDY / PLACEHOLDER</span>
          <h1>{studies[selected].title}</h1>
          <p>{studies[selected].description}</p>
          <span className="credit">
            Original prototype composition / AZANIA project
          </span>
          <button className="pill-button" onClick={() => setSelected(null)}>
            Back to the room <ArrowUpRight size={18} />
          </button>
        </aside>
      )}
      <span className="gallery-build-note">
        AZANIA / EXHIBITION IN DEVELOPMENT
      </span>
    </main>
  );
}

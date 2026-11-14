"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { studies, type Study } from "@/src/data/studies";
import { useScrollProgress } from "@/src/hooks/useScrollProgress";

export default function StudyCollection() {
  const [selected, setSelected] = useState<Study | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const choreography = useScrollProgress<HTMLDivElement>("pinned");
  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);
  return (
    <>
      <div ref={choreography} className="collection-choreography">
        <div className="collection-stage">
          <div className="collection-backdrop" aria-hidden="true">
            <span>ART IN</span>
            <span>
              <i>MOTION.</i>
            </span>
          </div>
          <span className="fan-instruction">
            SCROLL TO UNFOLD / SELECT A STUDY TO LOOK CLOSER
          </span>
          <div className="study-grid artwork-fan">
            {studies.map((study, index) => (
              <button
                className="study-card fan-card"
                key={study.id}
                style={
                  {
                    "--spread": [-160, -54, 54, 160][index],
                    "--rest-rotation": [-12, 7, -5, 11][index],
                    "--turn": [5, -3, 1, -4][index],
                    "--lift": [-18, 8, -3, 20][index],
                    "--depth": index,
                  } as CSSProperties
                }
                onClick={() => setSelected(study)}
              >
                <div className={`study-image study-image-${index}`}>
                  <img
                    src={study.image}
                    alt={`Abstract geometric study: ${study.title}`}
                    loading="lazy"
                  />
                  <span className="study-open">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
                <div className="study-caption">
                  <span className="study-number">0{index + 1}</span>
                  <div>
                    <h3>{study.title}</h3>
                    <span>{study.category}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <span className="fan-counter" aria-hidden="true">
            FOUR PERSPECTIVES / ONE SPACE
          </span>
        </div>
      </div>
      <p className="collection-note">
        Exhibition studies shown as placeholders. Final artworks and their
        stories are being curated.
      </p>
      <dialog
        ref={dialog}
        className="exhibit-dialog"
        aria-label="Artwork preview"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        {selected && (
          <>
            <button
              className="dialog-close"
              aria-label="Close artwork preview"
              onClick={() => dialog.current?.close()}
            >
              <X size={22} />
            </button>
            <img src={selected.image} alt={selected.title} />
            <div className="dialog-copy">
              <span className="eyebrow">DESIGN STUDY / PLACEHOLDER</span>
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
              <span className="credit">
                Original prototype composition / AZANIA project
              </span>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

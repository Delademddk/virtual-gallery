"use client";
import { useEffect, useRef } from "react";
import { X, Play } from "lucide-react";
import type { TourStop } from "../three/controls/tourStops";
export default function GalleryMap({
  stops,
  currentId,
  position,
  onClose,
  onVisit,
  onTour,
}: {
  stops: TourStop[];
  currentId: string | null;
  position: [number, number, number];
  onClose: () => void;
  onVisit: (index: number) => void;
  onTour: () => void;
}) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <aside className="gallery-map" aria-label="Gallery map">
      <div className="gallery-map-heading">
        <div>
          <span>FIND YOUR PERSPECTIVE</span>
          <h2>Gallery map</h2>
        </div>
        <button ref={close} aria-label="Close gallery map" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <p>Visit a display, or let us show you around.</p>
      <div
        className="gallery-floor-plan"
        role="img"
        aria-label="Gallery floor plan. Display locations and your current position."
      >
        <svg viewBox="-19 -9 38 18" aria-hidden="true">
          <rect
            x="-18"
            y="-8"
            width="36"
            height="16"
            rx=".25"
            fill="#20231e"
            stroke="#7b8471"
            strokeWidth=".18"
          />
          <path
            d="M4.35 -3.5V3.5 M13 0H18"
            fill="none"
            stroke="#7b8471"
            strokeWidth=".3"
          />
          <rect
            x="-7.8"
            y="-3.5"
            width="5"
            height="7"
            rx="1"
            fill="none"
            stroke="#50584a"
            strokeWidth=".15"
          />
          {stops.map((stop) => (
            <circle
              key={stop.id}
              cx={stop.position[0]}
              cy={stop.position[2]}
              r={stop.id === currentId ? 0.55 : 0.4}
              fill={stop.id === currentId ? "#f1f3e9" : "#8c9780"}
            />
          ))}
          <circle
            cx={position[0]}
            cy={position[2]}
            r=".45"
            fill="#fff"
            stroke="#111"
            strokeWidth=".18"
          />
          <circle
            cx={position[0]}
            cy={position[2]}
            r=".8"
            fill="none"
            stroke="#fff"
            strokeWidth=".12"
          />
        </svg>
        <span>The outlined dot is your position.</span>
      </div>
      <button className="gallery-map-tour" onClick={onTour}>
        <Play size={16} /> Start guided tour <span>{stops.length} stops</span>
      </button>
      <div className="gallery-map-list">
        {stops.map((stop, index) => (
          <button
            key={stop.id}
            className={stop.id === currentId ? "is-current" : ""}
            onClick={() => onVisit(index)}
            aria-label={`Visit ${stop.title}`}
            aria-current={stop.id === currentId ? "location" : undefined}
          >
            {stop.thumbnail ? (
              <img src={stop.thumbnail} alt="" />
            ) : (
              <span className="gallery-map-placeholder" aria-hidden="true">
                AZANIA
              </span>
            )}
            <span>
              <strong>{stop.title}</strong>
              <small>{stop.subtitle}</small>
              {stop.id === currentId && <em>Current stop</em>}
            </span>
          </button>
        ))}
        <p className="gallery-map-note">
          Preview labels describe the displays. Final exhibit stories are being
          prepared.
        </p>
      </div>
    </aside>
  );
}

"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  HelpCircle,
  X,
  Map as MapIcon,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import GalleryMap from "./GalleryMap";
import type { TourStop, TravelRequest } from "../three/controls/tourStops";
import TouchMovement from "./TouchMovement";
import type { NavigationInput } from "../three/controls/FirstPerson";
import { studies } from "@/src/data/studies";
const Scene = dynamic(() => import("@/src/components/three/GalleryScene"), {
  ssr: false,
});

export default function GalleryPreview() {
  const input = useRef<NavigationInput>({
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
  });
  const [entered, setEntered] = useState(false);
  const resumeButton = useRef<HTMLButtonElement>(null);
  const [walking, setWalking] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const [mouseNotice, setMouseNotice] = useState("");
  const [stops, setStops] = useState<TourStop[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [tourPlaying, setTourPlaying] = useState(false);
  const [tourMoving, setTourMoving] = useState(false);
  const [tourComplete, setTourComplete] = useState(false);
  const [travel, setTravel] = useState<TravelRequest | null>(null);
  const [currentStop, setCurrentStop] = useState<string | null>("entrance");
  const [position, setPosition] = useState<[number, number, number]>([
    0, 1.65, 6,
  ]);
  const serial = useRef(0);
  const [jumpKey, setJumpKey] = useState(0);
  const [tourNotice, setTourNotice] = useState("");
  const onCatalog = useCallback((items: TourStop[]) => setStops(items), []);
  const onPosition = useCallback(
    (point: [number, number, number]) => setPosition(point),
    [],
  );
  const onArrive = useCallback(
    (stopId: string, kind: TravelRequest["kind"]) => {
      setCurrentStop(stopId);
      setTravel(null);
      setTourMoving(false);
      if (kind === "jump") {
        setWalking(true);
        setHintVisible(true);
        setMouseNotice("You’re at the viewing position. Drag to look around.");
      }
    },
    [],
  );
  const onTravelError = useCallback((message: string) => {
    setTourNotice(message);
    setTourPlaying(false);
    setTourMoving(false);
    setTravel(null);
  }, []);
  const pause = useCallback(() => {
    setWalking(false);
    setTourPlaying(false);
  }, []);
  const start = (captureMouse = true) => {
    setEntered(true);
    setMapOpen(false);
    setTourIndex(null);
    setTourPlaying(false);
    setTravel(null);
    setTourComplete(false);
    setTourNotice("");
    setWalking(true);
    setHintVisible(true);
    setMouseNotice("");
    const canvas = document.querySelector<HTMLCanvasElement>(
      ".gallery-canvas canvas",
    );
    if (
      captureMouse &&
      matchMedia("(pointer: fine)").matches &&
      canvas?.requestPointerLock
    ) {
      try {
        const request = canvas.requestPointerLock();
        request?.catch(() =>
          setMouseNotice(
            "Mouse lock is unavailable. Hold and drag the scene to look around.",
          ),
        );
      } catch {
        setMouseNotice("Hold and drag the scene to look around.");
      }
    }
  };
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [help, setHelp] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => setFailed(true), []);
  const onSelect = useCallback((index: number) => {
    setWalking(false);
    setTourPlaying(false);
    setMapOpen(false);
    setSelected(index);
    setHelp(false);
  }, []);
  const goToStop = useCallback(
    (index: number, kind: TravelRequest["kind"]) => {
      const stop = stops[index];
      if (!stop) return;
      setEntered(true);
      setWalking(false);
      setMapOpen(false);
      setHelp(false);
      setSelected(null);
      setTourNotice("");
      setTourComplete(false);
      const request = { serial: ++serial.current, stopId: stop.id, kind };
      setTravel(request);
      if (kind === "tour") {
        setTourIndex(index);
        setTourPlaying(true);
        setTourMoving(true);
      } else {
        setTourIndex(null);
        setTourPlaying(false);
        setJumpKey(request.serial);
      }
    },
    [stops],
  );
  const beginTour = () => goToStop(0, "tour");
  const openMap = () => {
    pause();
    setHelp(false);
    setSelected(null);
    setMapOpen(true);
  };
  const closeMap = useCallback(() => {
    setMapOpen(false);
    if (tourIndex === null) {
      setWalking(true);
      setHintVisible(true);
    }
  }, [tourIndex]);
  useEffect(() => {
    if (
      !tourPlaying ||
      tourMoving ||
      tourIndex === null ||
      mapOpen ||
      help ||
      selected !== null
    )
      return;
    const timer = window.setTimeout(() => {
      if (tourIndex + 1 < stops.length) goToStop(tourIndex + 1, "tour");
      else {
        setTourPlaying(false);
        setTourComplete(true);
      }
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [
    tourPlaying,
    tourMoving,
    tourIndex,
    mapOpen,
    help,
    selected,
    stops.length,
    goToStop,
  ]);
  useEffect(() => {
    if (!walking) return;
    const timer = window.setTimeout(() => setHintVisible(false), 9000);
    return () => window.clearTimeout(timer);
  }, [walking]);
  useEffect(() => {
    if (
      entered &&
      !walking &&
      !help &&
      !mapOpen &&
      tourIndex === null &&
      selected === null &&
      !travel
    )
      resumeButton.current?.focus();
  }, [entered, walking, help, mapOpen, tourIndex, selected, travel]);
  return (
    <main className={`gallery-page${entered ? " gallery-page--entered" : ""}`}>
      <section
        className={`gallery-welcome${entered ? " gallery-welcome--entered" : ""}`}
        aria-label="Welcome to AZANIA"
        aria-hidden={entered}
        inert={entered}
      >
        <div className="gallery-welcome-top">
          <span>AZANIA / VIRTUAL GALLERY</span>
          <Link href="/">Back to website</Link>
        </div>
        <div className="gallery-welcome-content">
          <span className="gallery-welcome-kicker">
            AN INDEPENDENT PERSPECTIVE ON ART
          </span>
          <h1>AZANIA</h1>
          <p className="gallery-welcome-tagline">Art, beyond the frame.</p>
          <p className="gallery-welcome-description">
            A space for art, culture and the stories they carry.
            <br />
            Come curious. Take your time.
          </p>
          <button
            className="gallery-enter-button"
            disabled={!ready || failed}
            onClick={() => start()}
          >
            {ready && !failed
              ? "Enter gallery"
              : failed
                ? "Gallery unavailable"
                : "Preparing the gallery…"}
          </button>
          <div className="gallery-welcome-status" role="status">
            {failed ? (
              <>
                <span>The 3D space couldn’t load.</span>
                <button onClick={() => location.reload()}>Try again</button>
                <Link href="/#collection">Browse the collection</Link>
              </>
            ) : ready ? (
              <span>Your visit is ready.</span>
            ) : (
              <>
                <span className="gallery-loading-line" aria-hidden="true" />
                <span>Bringing the space into view.</span>
              </>
            )}
          </div>
        </div>
        <div className="gallery-welcome-bottom">
          <span>GHANA / EVERYWHERE</span>
          <span>A NEW WAY OF SEEING.</span>
        </div>
      </section>
      <div className="gallery-canvas" aria-hidden={!entered}>
        <Scene
          interactive
          walking={walking}
          input={input}
          onPause={pause}
          resetKey={resetKey}
          active={
            !help &&
            !mapOpen &&
            selected === null &&
            (!ready || walking || tourPlaying || travel?.kind === "jump")
          }
          travel={travel}
          touring={tourPlaying && !mapOpen && !help && selected === null}
          onCatalog={onCatalog}
          onArrive={onArrive}
          onTravelError={onTravelError}
          onPosition={onPosition}
          onReady={onReady}
          onSelect={onSelect}
          onFailure={onFailure}
        />
      </div>
      <header className="gallery-header" hidden={!entered}>
        <Link href="/" aria-label="AZANIA home" className="small-logo">
          AZANIA®
        </Link>
        <span>THE GALLERY / WALKTHROUGH</span>
        <div>
          <button
            onClick={openMap}
            aria-expanded={mapOpen}
            aria-label="Gallery map"
          >
            <MapIcon size={17} />
            <span className="gallery-nav-text">Map</span>
          </button>
          <button
            onClick={beginTour}
            disabled={!stops.length}
            aria-label="Start guided tour"
          >
            <Play size={17} />
            <span className="gallery-nav-text">Tour</span>
          </button>
          <button
            aria-label="Help"
            aria-expanded={help}
            onClick={() => {
              pause();
              setMapOpen(false);
              setHelp(!help);
              setSelected(null);
            }}
          >
            <HelpCircle size={17} />
            <span className="gallery-nav-text">Help</span>
          </button>
          {(walking || tourPlaying) && (
            <button onClick={pause} aria-label="Pause gallery">
              <Pause size={17} />
              <span className="gallery-nav-text">Pause</span>
            </button>
          )}
          <Link href="/" aria-label="Leave gallery">
            <ArrowLeft size={17} />
            <span className="gallery-nav-text">Leave gallery</span>
          </Link>
        </div>
      </header>
      {entered &&
        ready &&
        !failed &&
        !help &&
        !mapOpen &&
        tourIndex === null &&
        !travel &&
        selected === null &&
        (walking ? (
          <>
            <span className="gallery-crosshair" aria-hidden="true">
              +
            </span>
            {hintVisible && (
              <div className="gallery-walk-hint">
                <span className="desktop-walk-hint">
                  WASD / arrow keys to walk · Mouse to look · Esc to pause
                </span>
                <span className="mobile-walk-hint">
                  Hold a direction to walk · Drag the scene to look
                </span>
                {mouseNotice && <span role="status">{mouseNotice}</span>}
              </div>
            )}
            <TouchMovement input={input} />
          </>
        ) : (
          <section className="gallery-pause" aria-label="Gallery paused">
            <div className="gallery-pause-content">
              <span className="gallery-pause-kicker">TAKE A MOMENT</span>
              <h2>
                Your visit
                <br />
                <em>is paused.</em>
              </h2>
              <p>
                The gallery will be here.
                <br />
                Continue whenever you’re ready.
              </p>
              {tourNotice && <p role="status">{tourNotice}</p>}
              <button
                ref={resumeButton}
                className="gallery-enter-button"
                onClick={() => start()}
              >
                Continue exploring
              </button>
              <button
                className="gallery-pause-link"
                onClick={() => start(false)}
              >
                Continue with drag look
              </button>
              <div className="gallery-pause-secondary">
                <button onClick={() => setHelp(true)}>Controls</button>
                <button onClick={openMap}>Gallery map</button>
                <button onClick={beginTour}>Guided tour</button>
                <button
                  onClick={() => {
                    setResetKey((key) => key + 1);
                    setCurrentStop("entrance");
                    start(false);
                    setMouseNotice(
                      "Returned to the entrance. Drag the scene to look around.",
                    );
                  }}
                >
                  Return to entrance
                </button>
                <Link href="/">Leave gallery</Link>
              </div>
            </div>
          </section>
        ))}
      {jumpKey > 0 && (
        <div
          key={jumpKey}
          className="gallery-view-transition"
          aria-hidden="true"
        />
      )}
      {mapOpen && (
        <GalleryMap
          stops={stops}
          currentId={currentStop}
          position={position}
          onClose={closeMap}
          onVisit={(index) => goToStop(index, "jump")}
          onTour={beginTour}
        />
      )}
      {tourIndex !== null && !mapOpen && !help && selected === null && (
        <section className="gallery-tour-bar" aria-label="Guided tour">
          <div className="gallery-tour-caption" aria-live="polite">
            <span>
              GUIDED TOUR · {tourIndex + 1} OF {stops.length}
            </span>
            <h2>{stops[tourIndex]?.title}</h2>
            <p>
              {tourNotice ||
                (tourComplete
                  ? "Tour complete. Keep exploring at your own pace."
                  : !tourPlaying
                    ? "Tour paused. Continue when you’re ready."
                    : tourMoving
                      ? "Making our way to the display…"
                      : "Take a closer look. We’ll continue shortly.")}
            </p>
          </div>
          <div className="gallery-tour-actions">
            <button
              aria-label="Previous tour stop"
              disabled={tourIndex === 0}
              onClick={() => goToStop(tourIndex - 1, "tour")}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              aria-label={
                tourComplete
                  ? "Restart guided tour"
                  : tourPlaying
                    ? "Pause tour"
                    : "Resume tour"
              }
              onClick={() =>
                tourComplete ? beginTour() : setTourPlaying((value) => !value)
              }
            >
              {tourPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              aria-label="Next tour stop"
              disabled={tourIndex === stops.length - 1}
              onClick={() => goToStop(tourIndex + 1, "tour")}
            >
              <ChevronRight size={20} />
            </button>
            <button
              className="gallery-tour-manual"
              onClick={() => start(false)}
            >
              Walk yourself
            </button>
          </div>
        </section>
      )}
      {tourNotice && tourIndex === null && !mapOpen && (
        <div className="gallery-navigation-notice" role="status">
          {tourNotice}
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
            Select Enter gallery, then use W/A/S/D or arrow keys to move. Move
            the mouse to look around. If mouse lock is unavailable, hold and
            drag the scene instead. Escape pauses and releases the mouse.
          </p>
          <p>
            On a touch screen, hold the directional controls to walk and drag
            the scene with another finger to look. Walls and exhibits block your
            path. Select a prototype frame to read about it; while mouse-locked,
            aim the crosshair at a nearby frame and click. Audio guides are
            still planned.
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
      <span className="gallery-build-note" hidden={!entered}>
        AZANIA / EXHIBITION IN DEVELOPMENT
      </span>
    </main>
  );
}

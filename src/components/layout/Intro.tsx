"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const Scene = dynamic(() => import("@/src/components/three/IntroScene"), {
  ssr: false,
  loading: () => (
    <div className="cinematic-loading" role="status">
      Preparing the space…
    </div>
  ),
});
const clamp = (value: number) => Math.max(0, Math.min(1, value));

export default function Intro() {
  const section = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const invalidateRef = useRef<(() => void) | null>(null);
  const reducedRef = useRef(false);
  const failedRef = useRef(false);
  const [chapter, setChapter] = useState(0);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setFailed(true);
    setReady(true);
  }, []);
  reducedRef.current = reduced;
  failedRef.current = failed;

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(media.matches);
    const visibility = () =>
      setTabVisible(document.visibilityState === "visible");
    preference();
    visibility();
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    let frame = 0;
    let paintedChapter = -1;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const node = section.current;
        const bounds = node?.getBoundingClientRect();
        if (!node || !bounds) return;
        const raw = clamp(
          -bounds.top / Math.max(1, bounds.height - innerHeight),
        );
        const value = reducedRef.current || failedRef.current ? 1 : raw;
        progressRef.current = value;
        const reveal = clamp((value - 0.57) / 0.38);
        node.style.setProperty("--reveal", reveal.toFixed(4));
        node.style.setProperty(
          "--glyph-motion",
          (reducedRef.current ? 0 : Math.sin(value * Math.PI)).toFixed(4),
        );
        node.style.setProperty(
          "--intro-ink",
          `rgb(${Math.round(239 - reveal * 217)},${Math.round(239 - reveal * 216)},${Math.round(232 - reveal * 212)})`,
        );
        node.style.setProperty(
          "--intro-muted",
          `rgb(${Math.round(180 - reveal * 94)},${Math.round(185 - reveal * 96)},${Math.round(178 - reveal * 96)})`,
        );
        const nextChapter = value < 0.28 ? 0 : value < 0.66 ? 1 : 2;
        if (nextChapter !== paintedChapter) {
          paintedChapter = nextChapter;
          setChapter(nextChapter);
        }
        invalidateRef.current?.();
      });
    };
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (section.current) observer.observe(section.current);
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (!reduced && !failed) return;
    progressRef.current = 1;
    setChapter(2);
    const node = section.current;
    if (node) {
      node.style.setProperty("--reveal", "1");
      node.style.setProperty("--glyph-motion", "0");
      node.style.setProperty("--intro-ink", "rgb(22,23,20)");
      node.style.setProperty("--intro-muted", "rgb(86,89,82)");
    }
    invalidateRef.current?.();
  }, [reduced, failed]);

  const statement =
    chapter === 0 ? (
      <>
        Art, beyond
        <br />
        the frame.
      </>
    ) : chapter === 1 ? (
      <>
        Stories with
        <br />
        dimension.
      </>
    ) : (
      <>
        A new
        <br />
        perspective.
      </>
    );

  return (
    <section
      id="top"
      ref={section}
      className={`cinematic-intro ${reduced ? "cinematic-still" : ""}`}
      aria-label="AZANIA sculpture and gallery introduction"
    >
      <div className="cinematic-stage">
        <div className="cinematic-canvas" aria-hidden="true">
          {failed ? (
            <img src="/images/gallery-interior.jpg" alt="" />
          ) : (
            <Scene
              progressRef={progressRef}
              invalidateRef={invalidateRef}
              active={visible && tabVisible}
              reduced={reduced}
              onReady={onReady}
              onFailure={onFailure}
            />
          )}
        </div>
        <div className="cinematic-grain" aria-hidden="true" />
        <div className="cinematic-copy">
          <span className="cinematic-overline">
            GHANAIAN ART. A NEW DIMENSION.
          </span>
          <h1 className="kinetic-wordmark" aria-label="AZANIA">
            {"AZANIA".split("").map((letter, i) => (
              <span
                key={i}
                className="wordmark-glyph"
                aria-hidden="true"
                style={
                  {
                    "--glyph-offset": [-32, 18, -12, 32, -22, 14][i],
                    "--glyph-angle": [-12, 5, -8, 10, -5, 8][i],
                    "--glyph-index": i,
                  } as CSSProperties
                }
              >
                <span>{letter}</span>
              </span>
            ))}
          </h1>
          <p className="cinematic-statement">{statement}</p>
          <p className="cinematic-description">
            A gallery of objects, expressions
            <br />
            and the stories they carry.
          </p>
          <Link href="/gallery" className="cinematic-entry">
            Enter gallery <ArrowUpRight size={19} />
          </Link>
        </div>
        <Link href="/gallery" className="cinematic-mobile-entry">
          Enter gallery <ArrowUpRight size={19} />
        </Link>
        <span className="cinematic-object-label">
          FORM STUDY / 001
          <br />
          <span>Light. Material. Perspective.</span>
        </span>
        <div className="cinematic-footer">
          <a href="#collection" className="cinematic-scroll">
            <ArrowDown size={14} />
            <span>
              {reduced
                ? "EXPLORE THE COLLECTION"
                : "SCROLL TO REVEAL THE SPACE"}
            </span>
          </a>
          <span className="cinematic-chapter">
            {chapter === 0
              ? "01 / FORM"
              : chapter === 1
                ? "02 / PERSPECTIVE"
                : "03 / THE GALLERY"}
          </span>
          <a href="#collection" className="cinematic-skip">
            Skip intro ↗
          </a>
        </div>
        {!ready && (
          <span className="cinematic-status" role="status">
            Preparing the space…
          </span>
        )}
        {failed && (
          <span className="cinematic-status">
            3D preview unavailable. You can still explore the collection.
          </span>
        )}
      </div>
    </section>
  );
}

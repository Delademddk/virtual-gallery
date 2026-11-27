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
  const [progress, setProgress] = useState(0);
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
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = section.current?.getBoundingClientRect();
        if (bounds)
          setProgress(
            clamp(-bounds.top / Math.max(1, bounds.height - innerHeight)),
          );
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

  const p = reduced || failed ? 1 : progress;
  const reveal = clamp((p - 0.57) / 0.38);
  const statement =
    p < 0.28 ? (
      <>
        Art, beyond
        <br />
        the frame.
      </>
    ) : p < 0.66 ? (
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
  const styles = {
    "--reveal": reveal,
    "--glyph-motion": reduced ? 0 : Math.sin(p * Math.PI),
    "--intro-ink": `rgb(${Math.round(239 - reveal * 217)},${Math.round(239 - reveal * 216)},${Math.round(232 - reveal * 212)})`,
    "--intro-muted": `rgb(${Math.round(180 - reveal * 94)},${Math.round(185 - reveal * 96)},${Math.round(178 - reveal * 96)})`,
  } as CSSProperties;

  return (
    <section
      id="top"
      ref={section}
      className={`cinematic-intro ${reduced ? "cinematic-still" : ""}`}
      style={styles}
      aria-label="AZANIA sculpture and gallery introduction"
    >
      <div className="cinematic-stage">
        <div className="cinematic-canvas" aria-hidden="true">
          {failed ? (
            <img src="/images/gallery-interior.jpg" alt="" />
          ) : (
            <Scene
              progress={p}
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
        <span
          className="cinematic-object-label"
          style={{ opacity: 1 - reveal }}
        >
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
            {p < 0.28
              ? "01 / FORM"
              : p < 0.66
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

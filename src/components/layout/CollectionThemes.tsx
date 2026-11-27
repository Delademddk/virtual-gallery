"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { useScrollProgress } from "@/src/hooks/useScrollProgress";

const themes = [
  {
    title: "Material & memory",
    question: "What can a surface tell us?",
    image: "/studies/study-01.svg",
    heading: "Begin with the material.",
    description:
      "A surface invites you to slow down. Look at texture, repetition and the trace of a hand. This curatorial direction asks how objects can hold personal and shared memories.",
    lens: "TEXTURE / RHYTHM / MAKING",
  },
  {
    title: "Form & meaning",
    question: "When does a shape become a story?",
    image: "/studies/study-03.svg",
    heading: "Follow the shape of an idea.",
    description:
      "An outline, a repeated mark, a space left open. Look at how forms relate before asking what they mean. The final exhibition will connect those observations to researched context.",
    lens: "LINE / SYMBOL / CONTEXT",
  },
  {
    title: "New perspectives",
    question: "What changes when we look again?",
    image: "/studies/study-04.svg",
    heading: "Make room for another reading.",
    description:
      "Move between the familiar and the unexpected. This direction leaves space for contemporary expression, individual voices and different ways of seeing Ghanaian art and cultural heritage.",
    lens: "EXPRESSION / CONTRAST / POSSIBILITY",
  },
];

export default function CollectionThemes() {
  const ref = useScrollProgress<HTMLElement>();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const changeWithKeys = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next: number;
    if (event.key === "ArrowDown") next = (index + 1) % themes.length;
    else if (event.key === "ArrowUp")
      next = (index + themes.length - 1) % themes.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = themes.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <section ref={ref} id="themes" className="collection-themes section-wrap">
      <div className="section-label">
        <span>02 / CURATORIAL DIRECTIONS</span>
        <span>ONE COLLECTION. MORE THAN ONE READING.</span>
      </div>
      <div className="themes-layout">
        <div className="themes-navigation">
          <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
          <h2>
            Three ways
            <br />
            <i>to look.</i>
          </h2>
          <div
            className="theme-tabs"
            role="tablist"
            aria-label="Collection themes"
            aria-orientation="vertical"
          >
            {themes.map((theme, index) => (
              <button
                key={theme.title}
                id={`theme-tab-${index}`}
                ref={(node) => {
                  buttons.current[index] = node;
                }}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-controls={`theme-panel-${index}`}
                tabIndex={active === index ? 0 : -1}
                className="theme-tab"
                onClick={() => setActive(index)}
                onKeyDown={(event) => changeWithKeys(event, index)}
              >
                <span className="theme-index">0{index + 1}</span>
                <span className="theme-tab-copy">
                  <span>{theme.title}</span>
                  <span className="theme-question">{theme.question}</span>
                </span>
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
          <p className="theme-note">
            Proposed themes for the collection. Final works and their stories
            are being researched.
          </p>
        </div>
        <div className="theme-panels">
          {themes.map((theme, index) => (
            <div
              key={theme.title}
              id={`theme-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`theme-tab-${index}`}
              hidden={active !== index}
              tabIndex={0}
            >
              <div className={`theme-visual theme-visual-${index}`}>
                <div className="theme-visual-inner">
                  <img
                    className="theme-echo theme-echo-one"
                    src={theme.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                  <img
                    className="theme-echo theme-echo-two"
                    src={theme.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                  <img
                    className="theme-main-image"
                    src={theme.image}
                    alt={`Original geometric design study illustrating ${theme.title.toLowerCase()}`}
                    loading="lazy"
                  />
                  <span className="theme-scan" aria-hidden="true" />
                  <span className="theme-large-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span className="theme-image-label">
                    AZANIA / VISUAL STUDY
                  </span>
                </div>
              </div>
              <div className="theme-description">
                <span className="theme-lens">{theme.lens}</span>
                <h3>{theme.heading}</h3>
                <p>{theme.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

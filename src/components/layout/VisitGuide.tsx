"use client";

import Link from "next/link";
import { ArrowUpRight, MousePointer2, Move, ScanEye, Plus } from "lucide-react";
import { type CSSProperties } from "react";
import { useScrollProgress } from "@/src/hooks/useScrollProgress";

const steps = [
  {
    title: "Enter the space",
    text: "Open the room in your browser. There is no ticket to book and no account to create.",
    icon: MousePointer2,
  },
  {
    title: "Find your angle",
    text: "Use WASD or arrow keys to walk and your mouse to look. On a phone, hold a direction and drag the scene to look around.",
    icon: Move,
  },
  {
    title: "Follow a detail",
    text: "Select a framed study to read about it. Close the information panel when you are ready to continue.",
    icon: ScanEye,
  },
];
const questions = [
  {
    question: "What can I do in the current preview?",
    answer:
      "Walk through the gallery with WASD or touch controls. Walls and exhibits block your path. Select a prototype frame to open its information panel. Audio guides are still planned.",
  },
  {
    question: "Can I visit on my phone?",
    answer:
      "Hold the on-screen directional controls to walk and drag the scene with another finger to look. Use Pause to stop. Performance depends on your device and browser.",
  },
  {
    question: "Do I need a ticket or an account?",
    answer:
      "No. Select Enter gallery to open the current preview. The gallery passes on this page are part of the exhibition design; they are not tickets you need to purchase.",
  },
  {
    question: "Are these the final artworks?",
    answer:
      "Not yet. The current geometric studies are original placeholders for layout and interaction testing. The team is researching Ghanaian artworks and cultural objects, along with their descriptions and credits, for the final collection.",
  },
];

export default function VisitGuide() {
  const ref = useScrollProgress<HTMLElement>();
  return (
    <section ref={ref} id="visit-guide" className="visit-guide section-wrap">
      <div className="section-label">
        <span>06 / YOUR VISIT</span>
        <span>COME CURIOUS. TAKE YOUR TIME.</span>
      </div>
      <div className="guide-heading">
        <h2>
          A little guidance.
          <br />
          <i>A lot to discover.</i>
        </h2>
        <p>
          There is no single way to look at art. Here is how to make your first
          visit your own.
        </p>
      </div>
      <ol className="visit-steps">
        {steps.map((step, index) => (
          <li
            key={step.title}
            style={{ "--step-index": index } as CSSProperties}
          >
            <div className="visit-step-top">
              <span className="visit-step-number">0{index + 1}</span>
              <step.icon size={28} strokeWidth={1.2} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <div className="visit-faq">
        <div className="faq-heading">
          <span className="eyebrow">BEFORE YOU STEP INSIDE</span>
          <h3>
            Good to
            <br />
            <i>know.</i>
          </h3>
          <Link href="/gallery" className="underlined-link">
            Enter the gallery <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="faq-list">
          {questions.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <Plus size={20} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

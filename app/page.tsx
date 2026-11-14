import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Intro from "@/src/components/layout/Intro";
import StudyCollection from "@/src/components/gallery/StudyCollection";
import MotionRibbon from "@/src/components/layout/MotionRibbon";
import {
  MotionStory,
  ScrollStatement,
} from "@/src/components/layout/MotionStory";
import AdmissionFinale from "@/src/components/layout/AdmissionFinale";
import CollectionThemes from "@/src/components/layout/CollectionThemes";
import CloserLook from "@/src/components/layout/CloserLook";
import VisitGuide from "@/src/components/layout/VisitGuide";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#collection">
        Skip introduction
      </a>
      <header className="site-header cinematic-header">
        <Link href="/" className="small-logo">
          AZANIA®
        </Link>
        <span className="header-caption">
          An independent perspective on art.
        </span>
        <nav aria-label="Main navigation">
          <a href="#collection">Collection</a>
          <a href="#themes">Discover</a>
          <a href="#about">Our story</a>
          <Link href="/gallery" className="entry-link">
            Enter gallery <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>
      <main>
        <Intro />
        <section id="collection" className="collection section-wrap">
          <div className="section-label">
            <span>01 / THE COLLECTION</span>
            <span>AN EXHIBITION IN THE MAKING</span>
          </div>
          <div className="section-heading">
            <h2>
              A different
              <br />
              <i>way of seeing.</i>
            </h2>
            <p>
              A space for Ghanaian art, objects and the stories they carry. Our
              first collection is taking shape.
            </p>
          </div>
          <StudyCollection />
        </section>
        <MotionRibbon />
        <CollectionThemes />
        <MotionStory>
          <div className="section-label">
            <span>03 / THE IDEA</span>
            <span>ROOTED IN CULTURE. OPEN TO EVERYONE.</span>
          </div>
          <div className="story-layout">
            <span className="story-mark" aria-hidden="true">
              A.
            </span>
            <div>
              <ScrollStatement />
              <p>
                AZANIA is a virtual exhibition exploring Ghanaian art and
                cultural heritage. We are bringing the experience of a gallery
                into a space you can visit from anywhere.
              </p>
              <p>
                Look closer. Take your time. Discover the people, materials and
                ideas behind the work.
              </p>
              <a href="#visit" className="underlined-link">
                Discover the space <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </MotionStory>
        <CloserLook />
        <section id="visit" className="visit section-wrap">
          <div className="section-label">
            <span>05 / THE SPACE</span>
            <span>FROM A SCREEN TO A SENSE OF PLACE</span>
          </div>
          <div className="visit-grid">
            <div>
              <h2>
                Beyond
                <br />
                <i>the frame.</i>
              </h2>
              <p>
                A first look inside our gallery. Explore the team’s Blender room
                model and the exhibition studies while the collection develops.
              </p>
              <Link href="/gallery" className="pill-button">
                Explore the room <ArrowUpRight size={20} />
              </Link>
            </div>
            <Link
              href="/gallery"
              className="architecture-preview"
              aria-label="Open the 3D room preview"
            >
              <img
                src="/gallery-poster.svg"
                alt="Schematic perspective of the AZANIA gallery"
              />
              <span>
                THE GALLERY / ROOM PREVIEW <ArrowUpRight size={20} />
              </span>
            </Link>
          </div>
        </section>
        <VisitGuide />
        <AdmissionFinale />
      </main>
      <footer className="site-footer">
        <Link href="/" className="small-logo">
          AZANIA®
        </Link>
        <span>Ghanaian art & cultural heritage.</span>
        <a
          href="https://github.com/Delademddk/virtual-gallery"
          target="_blank"
          rel="noreferrer"
        >
          CSSD 315 / Group project <ArrowUpRight size={13} />
        </a>
        <a href="#top" aria-label="Back to top">
          <ArrowDown className="turn-up" size={18} />
        </a>
      </footer>
    </>
  );
}

# AZANIA: first integration pass

Branch: `codex/azania-redesign`. Retains Next.js and the team's existing `public/models/gallery.glb`. The Sketchfab model is reference material and has not been imported.

## Implemented

- Responsive monochrome homepage, scroll-controlled camera preview and reduced-motion alternative.
- Bodoni Moda (600) for AZANIA, self-hosted with its SIL Open Font License under `public/fonts/`.
- Dark, reflective sculpture opening. Scroll rotates the sculpture one full turn, then fades in the bright room and pulls the camera back. Reverse scrolling reverses the sequence. Reduced motion goes directly to the bright room.
- Warhol-inspired homepage motion: staggered AZANIA glyph entrance and scroll offsets; pinned artwork stack that fans into four selectable studies; opposing scroll-linked typography bands; word-by-word story heading; falling monochrome gallery passes and rolling entry-button label. These use original project assets, not copied Warhol graphics.
- The new scroll sections update CSS custom properties in requestAnimationFrame, use passive listeners and clean up on unmount. No animation library or extra network dependency was added. Mobile uses the ordinary artwork grid; reduced motion removes pinning and transforms.
- Expanded editorial content: three proposed curatorial directions with keyboard-accessible animated theme tabs; an interactive Surface / Composition / Context close-looking exercise with animated image framing and explanatory copy; three visitor steps and four native expandable FAQs. Themes and visual studies are identified as provisional; no artist biographies or cultural histories have been invented.
- Shared React Three Fiber scene loads the existing Blender GLB.
- `/gallery` room preview with orbit/zoom, selectable framed studies and help.
- Four original geometric studies explicitly labelled as placeholders, shared by homepage and scene.
- Loading/error and no-WebGL fallback paths. No remote font or artwork service required.

## Team handoffs

- Member 1: confirm scale (currently roughly a 20 x 14 m room), floor height and spawn. Original GLB is unchanged.
- Member 4: replace temporary materials/lighting with verified textures and baked lighting. Preview lighting does not satisfy all final graphics requirements.
- Member 6: integrate first-person movement, collision, touch and explicit pause/resume. Orbit mode remains labelled as a preview.
- Member 7: replace studies with verified exhibits, metadata, highlighting and audio references using stable exhibit IDs.
- Member 8: review desktop/mobile layout and finalise component states and copy.
- Members 9-10: profile cold loading and FPS on real devices. No loading-time claim has been made.

## Still to implement

Cinematic entry state controller; first-person movement/collision; 15 approved exhibits; audio/transcripts; baked lighting; skybox; cube-map reflection; refraction; device checks; deployment. This pass is a reviewable foundation.

The illustrations and abstract intro sculpture are prototype compositions, not cultural artefacts. Record AI assistance according to the assignment brief.

## Local verification

- Baseline and updated `npm run build` pass, including TypeScript checking.
- Browser checked: model renders, collection anchor, artwork dialog open/close, gallery entry, help and 3D study selection.
- 390 px mobile viewport checked: no horizontal overflow and the 3D scene renders. This is a viewport check, not a physical-phone performance test.
- Cinematic revision checked at 1440 x 900 and 390 x 844: local font loaded; headline/entry controls fit; scroll transitions into the bright room and reverses back to the dark opening; entry still loads `/gallery`. Reduced motion is implemented via the system media preference, with no pinned scroll sequence or sculpture turn.
- Exhibition-motion revision: production build and TypeScript pass; artwork fan transforms checked at start and expanded state; clicking an expanded card opens its detail dialog; 390 px pass finale has no horizontal overflow, leaves the entry link clear and opens the working gallery. Decorative passes use original grayscale studies and are excluded from the accessibility tree.
- Editorial expansion: production build and TypeScript pass; theme selection checked with mouse and ArrowDown keyboard navigation; detail lenses update both framing and explanatory text; FAQs expand; 1440 px and 390 px layouts checked with no horizontal overflow. The mobile detail controls and artwork remain visible together when using the exercise.
- `git diff --check` passes. No push or deployment performed.

Run `npm ci`, then `npm run dev`. If this environment cannot start the filesystem watcher, use `npm run build` followed by `npm run start -- -p 3100` for a production preview.

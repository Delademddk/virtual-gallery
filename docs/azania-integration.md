# AZANIA: first integration pass

Branch: `codex/azania-redesign`. Retains Next.js and imports the team's updated `public/models/gallery.glb` from `origin/development` at `171a19d`. The Sketchfab model is reference material and has not been imported.

## Implemented

- Responsive monochrome homepage, scroll-controlled camera preview and reduced-motion alternative.
- Bodoni Moda (600) for AZANIA, self-hosted with its SIL Open Font License under `public/fonts/`.
- Dark, reflective sculpture opening. Scroll rotates the sculpture one full turn, then fades in the bright room and pulls the camera back. Reverse scrolling reverses the sequence. Reduced motion goes directly to the bright room.
- Warhol-inspired homepage motion: staggered AZANIA glyph entrance and scroll offsets; pinned artwork stack that fans into four selectable studies; opposing scroll-linked typography bands; word-by-word story heading; falling monochrome gallery passes and rolling entry-button label. These use original project assets, not copied Warhol graphics.
- The new scroll sections update CSS custom properties in requestAnimationFrame, use passive listeners and clean up on unmount. No animation library or extra network dependency was added. Mobile uses the ordinary artwork grid; reduced motion removes pinning and transforms.
- Expanded editorial content: three proposed curatorial directions with keyboard-accessible animated theme tabs; an interactive Surface / Composition / Context close-looking exercise with animated image framing and explanatory copy; three visitor steps and four native expandable FAQs. Themes and visual studies are identified as provisional; no artist biographies or cultural histories have been invented.
- Shared React Three Fiber scene loads the existing Blender GLB.
- `/gallery` first-person walkthrough with WASD/arrow keys, mouse look, touch movement, collisions, pause/reset, selectable prototype frames and help.
- Four original geometric studies explicitly labelled as placeholders, shared by homepage and scene.
- Loading/error and no-WebGL fallback paths. No remote font or artwork service required.

## Team handoffs

- Member 1: confirm scale (updated floor spans 36 x 16 model units), floor height and spawn. The GLB is byte-for-byte the uploaded asset; see export cleanup below.
- Member 4: authored wall, trim, ceiling, floor, skylight frame and glass materials are now retained. Verify textures and baked lighting; this GLB contains no textures. Preview lighting does not satisfy all final graphics requirements.
- Member 6: review the implemented first-person controls and collision volumes in `src/components/three/controls/FirstPerson.tsx` and `src/components/three/collision/world.ts`. Calibrate final speed, scale and exhibit clearance with the modelling team.
- Member 7: replace studies with verified exhibits, metadata, highlighting and audio references using stable exhibit IDs.
- Member 8: review desktop/mobile layout and finalise component states and copy.
- Members 9-10: profile cold loading and FPS on real devices. No loading-time claim has been made.

## Still to implement

Cinematic entry state controller; 15 approved exhibits; audio/transcripts; baked lighting; skybox; cube-map reflection; refraction; device checks; deployment. This pass is a reviewable foundation.

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

## Previous gallery upload — 16 November 2026 (superseded below)

- Source: `feature/gallery-building` commit `a35435a` (after `d44b47c` and `3f0ee0c`). Those three commits update only `public/models/gallery.glb`; no new movement or interaction code was supplied on that branch.
- Asset: 183,964 bytes, 107 mesh nodes, seven materials, no textures. Floor bounds: x -18 to 18, z -8 to 8, top y 0; roof peaks reach about y 7.05. Units need the modeller's confirmation.
- Added architecture includes partitions, doors, arched structure and three gabled skylights. Retain authored physical materials, including transmission glass; avoid opaque shadow casting for transmissive meshes. Clone materials per scene so the intro fade cannot mutate cached materials used by the gallery route.
- Repositioned prototype frames against the expanded back wall and the west face of Partition_P1. Shared desktop camera coordinates keep the intro endpoint inside the central room. Narrow viewports target the sculpture directly.
- The original GLB remains unedited. The preview hides exactly 13 confirmed legacy meshes exported at identity transforms, overlapping the new layout and extending below the floor: `Ceiling_Back`, `Ceiling_Front`, `Ceiling_Left`, `Ceiling_Right`, `Skylight_Beam_X`, `Skylight_Beam_Y`, `Skylight_Glass_Panel`, `Wall_Back`, `Wall_Front_Left001`, `Wall_Front_Right001`, `Wall_Front_Top001`, `Wall_Left001`, `Wall_Right001`. The modeller should remove or correctly transform these in Blender and re-export; then remove the preview exclusion list. Other trim geometry is retained for team review.
- Verified: production build and TypeScript pass; desktop 1440 x 900 gallery renders with glass, arch and partitions; selecting the partition artwork opens its detail panel and returns to the room. Homepage dark opening and bright room reveal render. At 390 x 844 the gallery renders, sculpture is centred and there is no horizontal overflow; mobile intro also renders through the reveal. This is viewport QA, not a physical-phone performance test. Browser reports existing Three.js clock/shadow-map deprecation warnings, with no observed render failure.
- Changes remain local on `codex/azania-redesign`; not committed, pushed or deployed in this update.

## Development asset integration — 26 November 2026

Fetched `origin/development` at `171a19d`; imported its `public/models/gallery.glb` and `src/lib/assets.ts` into the existing redesign working tree. This is a selective integration, not a merge of the entire branch; existing local changes are retained. Exhibit assets elsewhere on development were not placed into the scene in this pass.

The requested import now resolves via a specific TypeScript alias:

```ts
import { ASSETS } from "@/lib/assets";
```

The gallery loader uses `ASSETS.gallery`, shared by the intro and `/gallery`. Its configured R2 URL is `https://pub-88143a0f276942df8ffa2728539467a4.r2.dev/models/gallery/gallery-v1.glb`. That exact URL returned HTTP 404 during this check. The loader tries it first, then falls back to `LOCAL_ASSETS.gallery` (`/models/gallery.glb`) on a fetch or parse failure. Both failures still reach the existing scene error UI. Once the hosted upload is fixed, it will load automatically on a fresh page load. The hosted file's contents could not be verified; the checked-in fallback is the file verified here.

The development export is 218,912 bytes with 93 nodes, 77 meshes, seven materials, no textures and 16 punctual lights. It preserves the 36 x 16 unit floor bounds. The earlier legacy objects are absent, so the 13-name preview exclusion list has been removed. Source GLB bytes remain exactly as uploaded on development.

Exported lights initially overexposed the preview (up to about 54,351 candela). In the cloned web scene only, their intensities are scaled by 0.002 alongside the existing preview daylight. The authored placements, colours, cone angles and materials are retained. Intro choreography scales these lights with the room reveal so the dark opening stays dark. This is a visual preview adjustment, not a verified physical lighting calibration.

Verified: production build and TypeScript pass; `/gallery` renders the new room through the fallback, selecting a frame opens its information panel, and returning to the room works. The homepage dark sculpture opening and bright reveal both render with the new asset. This pass used the browser's desktop viewport; earlier mobile checks are recorded above and were not repeated for this upload. No new Next.js feedback candidates were identified. Not pushed or deployed.

## First-person walkthrough — 26 November 2026

The hosted asset now resolves at `models/gallery/Virtual_Gallery_Final.glb` (68,445,992 bytes, Blender glTF exporter v5.2.41). The complete file was downloaded into the task work directory and geometry-inspected: 149 glTF nodes, 128 meshes, 508 materials, one embedded image and 16 lights. The earlier `gallery-v1.glb` 404 does not apply to this corrected URL. `ASSETS.gallery` points to the final hosted file; the checked-in earlier room export remains the network-failure fallback.

- `/gallery` replaces orbit controls with first-person walking. WASD and arrow keys move relative to horizontal camera heading at 2.6 model units/second, with diagonal speed capped. Eye height is 1.65 units above the flat gallery floor; no jumping, flight, steps or sloped-floor physics are implemented.
- Start walking requests mouse lock on a fine-pointer device. Mouse movement changes yaw/pitch; pitch is limited to avoid flipping. Walk with drag look works without mouse lock. Escape/Pause releases lock and stops movement. Blur, hidden tabs, help and exhibit panels clear input and pause. Returning to the entrance resets position and heading.
- Mobile/narrow layouts expose four 48 px directional buttons using pointer capture and cancellation handling. Hold a direction and drag the canvas with another finger to look. Movement buttons also support Space/Enter. Canvas touch action is disabled so looking does not scroll the page. Entry overlays scroll on short screens.
- Collision is built from the loaded scene once it is ready. Named architectural meshes (walls, partitions, doors, windows and arch geometry) use a Three.js octree and vertical capsule. Detailed exhibits and pedestals use conservative world-space bounding boxes. This keeps dense art geometry out of the triangle tree; it can leave extra clearance around irregular objects. Meshes above body height or entirely below floor trim height are ignored. Floor bounds prevent leaving the room. Translation is subdivided into at most 8 cm steps and frame delta is capped to avoid tunnelling after stalls. Walking slides along walls. A clear entrance near `[0, 1.65, 6]` is checked and searched nearby if an exhibit moves there.
- Prototype frames remain selectable. With mouse lock, click the centred crosshair on an unobstructed prototype frame within four units. New GLB exhibits do not yet have researched metadata or interaction IDs. Some supplied blank exhibit panels overlap earlier prototype frames; exhibit curation/layout remains a separate team handoff.
- Homepage camera choreography remains separate from the gallery walking controller. Visitor guidance/FAQs now describe walking instead of orbit/zoom.

Validation: `npm run build` and TypeScript pass. `node --test tests/navigation.test.mjs` passes six checks: both sides of a thin wall without tunnelling, doorway clearance, sliding/eye height, exhibit blocking and clear spawn, rotated wall/floor boundary, and overhead clearance. A separate check using the full new GLB's geometry verified a clear entrance, Partition_P1 stopping x at about 3.96, the back wall stopping z before -8, and a pedestal stopping forward movement. Embedded image loading was excluded only from the Node geometry check; the complete hosted model rendered in browser QA.

Browser QA: desktop WASD, drag look, Escape pause and reset checked; the embedded browser rejected pointer lock, and the fallback notice/drag mode worked. Native mouse-lock behaviour therefore still needs a hands-on browser check. At 390 x 844, directional-button hold and canvas drag worked, no horizontal overflow was detected and the controls clear the footer label. True simultaneous multitouch and performance on a physical phone remain to be checked. No browser render errors were observed. No new Next.js feedback candidates. Changes are local, not pushed or deployed.

Entrance reset follow-up: Return to entrance now resets position/heading, dismisses the pause panel and resumes in drag-look mode with a visible confirmation. Verified by walking/turning away, pausing and returning to the original entrance view. Production build/TypeScript pass. The abstract knot and its white pedestal are code-added prototype elements, not supplied GLB exhibits.

Sculpture redesign: replaced the torus knot with an original rising, tapered ribbon (shared `RibbonSculpture.tsx` geometry/material in both intro and gallery). The closed ribbon has a brushed-silver physical material, crisp edges and a gradual twist; scroll choreography retains a complete turn with gentler tilt. It remains an abstract prototype, not a supplied cultural exhibit. Production build/TypeScript pass and browser render checks show the new form in both bright room and dark introduction, with no observed browser errors.

## Cinematic welcome and separate pause — 26 November 2026

Inspired by the reference at `https://www.createdbycoachb.com/gallery`, with AZANIA's monochrome palette and self-hosted Bodoni Moda. The initial `/gallery` screen now has a full-screen black background, oversized AZANIA wordmark, short introduction, one Enter gallery button and Back to website link. It appears immediately while the actual model loads; entry stays disabled until the scene and collision setup report ready. Load errors offer retry and collection navigation. No invented loading percentage is shown.

Entering fades the screen out over 850 ms and starts first-person controls. The welcome becomes inert and hidden from assistive technology after entry. The movement hint clears after nine seconds. Reduced-motion CSS removes the title and fade animations. The canvas is not keyboard-focusable while inactive, and the gallery frame loop stops while waiting at the loaded welcome or paused, rather than continually drawing behind the overlays.

Escape/Pause now displays a separate dark translucent, blurred-room pause menu: Continue exploring, Continue with drag look, Controls, Return to entrance and Leave gallery. The primary resume button receives focus when paused. Controls opens Help; closing Help returns to the pause menu. Returning to the entrance resets the view and resumes without reopening the welcome.

Validation: production build and TypeScript pass. Browser checked initial loading-to-ready state, entry, Escape pause, entrance return, Controls/Help and drag-mode resume. Desktop and 390 x 844 layouts inspected. The entry/pause pass does not add the optional gallery map or guided tour; these remain separate future work with exhibit metadata and safe destinations. No new Next.js feedback candidates; not pushed or deployed.

## Gallery map and guided tour — 26 November 2026

Added a slide-out Gallery map panel, available from the walkthrough header and pause menu. It shows a schematic plan based on the current 36 x 16 unit layout, an outlined player-position dot, seven selected display stops and rendered thumbnails. Thumbnails are captured once from the loaded scene at 240 x 160 using an offscreen WebGL render target; temporary GPU resources are disposed. Devices unable to capture previews show a neutral AZANIA tile. The display list scrolls independently from its navigation controls.

The route uses First perspective, Rising ribbon, Portrait display, Western display, Board display, Vessel display and Instrument display. `src/components/three/controls/tourStops.ts` contains the editable stop definitions. Targets use bounds of the supplied model's named objects, while the viewing positions are selected for this model layout and checked against the collision world. Missing objects are omitted (the older local fallback therefore has fewer stops). These are preview display labels, not researched exhibit histories.

Map selection fades in the validated viewing position and returns to drag-look walking. Guided Tour follows walking routes at eye height, with smooth camera orientation toward each stop, a 6.5-second viewing pause, automatic advancement, Previous/Next, Pause/Resume, Restart at completion and Walk yourself. Switching to manual walking preserves the current view. Opening Map/Help, opening an exhibit, Escape, window blur or a hidden tab pauses the tour. Closing the map during a tour leaves it paused until resumed. Reduced-motion users change directly between views instead of travelling through the room.

Routes use a 0.5-unit grid with A* search. Every candidate edge and simplified route segment is sampled at up to 0.1-unit intervals against the same capsule/object clearance used for walking; diagonal paths cannot cut through corners. The camera also uses collision-resolved movement while following the path. Blocked/unreachable routes stop with a message and leave map jumps available. Both translation and look smoothing clamp frame delta after pauses. Player map updates are limited to about four per second.

Validation: production build and TypeScript pass. Nine Node navigation tests pass, including partition detours, no corner-cutting, refusing an enclosed target, and starting at manual object clearance. A geometry-only check of the complete final GLB validated all seven selected viewing positions and the consecutive tour routes. Browser checked seven real model thumbnails, a jump to the eastern instrument display, beginning the guided route from there, pause/resume during travel, and automatic progression across the western and eastern galleries. Final physical-phone performance and simultaneous multitouch checks remain a team/device handoff. No new Next.js feedback candidates. Changes remain local, not pushed or deployed.

Final map/tour QA: observed the automatic tour reach “7 of 7 / Tour complete” after visiting the central, western and eastern sections. Verified Previous/Next, tour pause/resume and Walk yourself, plus a portrait-map jump and stop skipping at 390 x 844. At 844 x 390 the compact map retains a scrollable exhibit list and no horizontal overflow. Paused gallery rendering now uses R3F demand mode, so resizing redraws the room without continuous idle rendering; this fixes the cleared background seen during the resize check. The ribbon viewpoint was moved slightly back to z 2.8 for narrow screens. All seven model thumbnails loaded, final browser error log was empty, and the final production build and TypeScript checks passed. Native pointer-lock behaviour and physical-device performance remain the hands-on checks noted above.


## Actual Blender renders on the homepage — 26 November 2026

Replaced the two identified placeholders: Look closer now presents the supplied portrait bust, and Beyond the frame shows the actual gallery interior. Surface and Composition animate between close and full views; Context switches to the same bust on its pedestal beneath the arch. Copy describes visible form and setting, with exhibit identification and historical context marked as pending verification. The intro fallback poster also uses the actual room render.

The images were rendered from the complete hosted Virtual_Gallery_Final.glb using its geometry and materials, with adjusted studio lighting for the isolated portrait. Assets are exhibit-portrait.jpg (1200 × 1500), exhibit-portrait-context.jpg (1200 × 1500), and gallery-interior.jpg (1600 × 1100), approximately 299 KB combined. Static renders keep these homepage sections lightweight without loading additional WebGL scenes. The reproducible renderer is in the task workspace at work/render-home-previews.html.

Validation: production build and TypeScript passed. Browser checked all three detail buttons, image loading, real room preview, and the 390 × 844 layout with no horizontal overflow. No browser errors were observed. The preview remains available on port 3102. No new Next.js feedback candidates; changes have not been pushed or deployed.

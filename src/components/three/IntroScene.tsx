"use client";

import {
  Suspense,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import RibbonSculpture from "./RibbonSculpture";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { LOCAL_ASSETS } from "@/lib/assets";
import {
  SceneBoundary,
  SceneContents,
  galleryView,
  galleryTarget,
  preloadIntroRoom,
} from "./GalleryScene";

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

function Choreography({
  progressRef,
  reduced,
}: {
  progressRef: RefObject<number>;
  reduced: boolean;
}) {
  const { camera, scene, size, invalidate } = useThree();
  const sculpture = useRef<THREE.Mesh>(null);
  const room = useRef<THREE.Group>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const daylight = useRef<THREE.DirectionalLight>(null);
  const smoothed = useRef(reduced ? 1 : progressRef.current);
  const lastOpacity = useRef(-1);
  const roomRequested = useRef(reduced);
  const [showRoom, setShowRoom] = useState(reduced);
  const vectors = useMemo(
    () => ({
      position: new THREE.Vector3(),
      look: new THREE.Vector3(),
      dark: new THREE.Color("#080a09"),
      bright: new THREE.Color("#e6e5df"),
      background: new THREE.Color(),
    }),
    [],
  );

  useFrame((_, delta) => {
    const target = reduced ? 1 : progressRef.current;
    smoothed.current = reduced
      ? 1
      : THREE.MathUtils.damp(
          smoothed.current,
          target,
          7,
          Math.min(delta, 0.1),
        );
    const p = smoothed.current;
    if (!roomRequested.current && p > 0.48) {
      roomRequested.current = true;
      startTransition(() => setShowRoom(true));
    }
    const reveal = THREE.MathUtils.smoothstep(p, 0.57, 0.95);
    const mobile = size.width < 600;
    vectors.position.set(
      THREE.MathUtils.lerp(1.5, galleryView[0], reveal),
      THREE.MathUtils.lerp(2.2, galleryView[1], reveal),
      THREE.MathUtils.lerp(mobile ? 5.9 : 4.7, galleryView[2], reveal),
    );
    vectors.look.set(
      THREE.MathUtils.lerp(
        mobile ? 1.5 : 0.6,
        mobile ? 1.5 : galleryTarget[0],
        reveal,
      ),
      THREE.MathUtils.lerp(2.05, galleryTarget[1], reveal),
      THREE.MathUtils.lerp(-0.5, mobile ? -0.5 : galleryTarget[2], reveal),
    );
    camera.position.copy(vectors.position);
    camera.lookAt(vectors.look);
    scene.background = vectors.background
      .copy(vectors.dark)
      .lerp(vectors.bright, reveal);
    if (sculpture.current) {
      sculpture.current.rotation.set(
        Math.sin(p * Math.PI) * 0.16,
        p * Math.PI * 2 - 0.2,
        Math.sin(p * Math.PI) * 0.12,
      );
      sculpture.current.scale.setScalar(
        THREE.MathUtils.lerp(
          mobile ? 1.55 : size.width < 1000 ? 1.6 : 1.9,
          1,
          reveal,
        ),
      );
    }
    if (ambient.current)
      ambient.current.intensity = THREE.MathUtils.lerp(0.13, 2.1, reveal);
    if (daylight.current) {
      daylight.current.intensity = THREE.MathUtils.lerp(0.2, 3, reveal);
      const cast = reveal > 0.55;
      if (daylight.current.castShadow !== cast) daylight.current.castShadow = cast;
    }
    if (room.current) {
      const visibleRoom = reveal > 0.02;
      if (room.current.visible !== visibleRoom) room.current.visible = visibleRoom;
      const bucket = Math.round(reveal * 32) / 32;
      if (visibleRoom && bucket !== lastOpacity.current) {
        let meshes = 0;
        room.current.traverse((node) => {
          if (node instanceof THREE.Light) {
            node.intensity = node.userData.azaniaBaseIntensity * reveal;
          }
          if (!(node instanceof THREE.Mesh)) return;
          meshes += 1;
          const materials = Array.isArray(node.material)
            ? node.material
            : [node.material];
          materials.forEach((material) => {
            const original = (material.userData.azaniaFade ??= {
              transparent: material.transparent,
              opacity: material.opacity,
              depthWrite: material.depthWrite,
            });
            const transparent = reveal < 0.98 || original.transparent;
            if (material.transparent !== transparent) {
              material.transparent = transparent;
              material.needsUpdate = true;
            }
            material.opacity = reveal * original.opacity;
            material.depthWrite = reveal > 0.95 && original.depthWrite;
          });
        });
        if (meshes > 0) lastOpacity.current = bucket;
      }
    }
    if (Math.abs(smoothed.current - target) > 0.0006) invalidate();
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.13} />
      <directionalLight
        ref={daylight}
        position={[-3, 8, 3]}
        intensity={0.2}
        castShadow={false}
        shadow-mapSize={[512, 512]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.001}
      />
      <spotLight
        position={[2, 5, 3]}
        intensity={60}
        angle={0.55}
        penumbra={1}
        color="#eeeeee"
      />
      <pointLight position={[-2, 2, -2]} intensity={18} color="#bdc9d1" />
      <Environment resolution={128} frames={1}>
        <Lightformer position={[0, 4, 2]} scale={[4, 1, 1]} intensity={4} />
        <Lightformer
          position={[-4, 0, 1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[1, 5, 1]}
          intensity={3}
        />
        <Lightformer
          position={[4, 1, -2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 4, 1]}
          intensity={2}
        />
      </Environment>
      {showRoom && (
        <Suspense fallback={null}>
          <group ref={room} visible={false}>
            <SceneContents
              showSculpture={false}
              modelUrl={LOCAL_ASSETS.gallery}
            />
          </group>
        </Suspense>
      )}
      <mesh
        ref={sculpture}
        position={[1.5, 1.95, -0.5]}
        rotation={[0, -0.2, 0]}
        scale={1.9}
        castShadow
      >
        <RibbonSculpture />
      </mesh>
    </>
  );
}

export default function IntroScene({
  progressRef,
  invalidateRef,
  active,
  reduced,
  onReady,
  onFailure,
}: {
  progressRef: RefObject<number>;
  invalidateRef: RefObject<(() => void) | null>;
  active: boolean;
  reduced: boolean;
  onReady: () => void;
  onFailure: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => preloadIntroRoom(), 700);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (active) invalidateRef.current?.();
  }, [active, invalidateRef]);

  return (
    <SceneBoundary onFailure={onFailure}>
      <Canvas
        shadows
        dpr={[1, 1.25]}
        frameloop={active ? "demand" : "never"}
        camera={{ position: [1.5, 2.2, 4.7], fov: 50, near: 0.1, far: 80 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={(state) => {
          invalidateRef.current = () => state.invalidate();
          state.invalidate();
        }}
        fallback={
          <p>
            AZANIA sculpture and gallery introduction.{" "}
            <a href="#collection">Skip to the collection.</a>
          </p>
        }
      >
        <color attach="background" args={["#080a09"]} />
        <Suspense fallback={null}>
          <Choreography progressRef={progressRef} reduced={reduced} />
          <Ready onReady={onReady} />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}

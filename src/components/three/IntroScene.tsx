"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import RibbonSculpture from "./RibbonSculpture";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import {
  SceneBoundary,
  SceneContents,
  galleryView,
  galleryTarget,
} from "./GalleryScene";

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

function Choreography({
  progress,
  reduced,
}: {
  progress: number;
  reduced: boolean;
}) {
  const { camera, scene, size } = useThree();
  const sculpture = useRef<THREE.Mesh>(null);
  const room = useRef<THREE.Group>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const daylight = useRef<THREE.DirectionalLight>(null);
  const smoothed = useRef(reduced ? 1 : progress);
  const lastOpacity = useRef(-1);
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
    smoothed.current = reduced
      ? 1
      : THREE.MathUtils.damp(
          smoothed.current,
          progress,
          7,
          Math.min(delta, 0.1),
        );
    const p = smoothed.current;
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
    if (daylight.current)
      daylight.current.intensity = THREE.MathUtils.lerp(0.2, 3, reveal);
    if (room.current && Math.abs(lastOpacity.current - reveal) > 0.001) {
      room.current.visible = reveal > 0.001;
      room.current.traverse((node) => {
        if (node instanceof THREE.Light) {
          node.intensity = node.userData.azaniaBaseIntensity * reveal;
        }
        if (!(node instanceof THREE.Mesh)) return;
        const materials = Array.isArray(node.material)
          ? node.material
          : [node.material];
        materials.forEach((material) => {
          const original = (material.userData.azaniaFade ??= {
            transparent: material.transparent,
            opacity: material.opacity,
            depthWrite: material.depthWrite,
          });
          const transparent = reveal < 0.999 || original.transparent;
          if (material.transparent !== transparent) {
            material.transparent = transparent;
            material.needsUpdate = true;
          }
          material.opacity = reveal * original.opacity;
          material.depthWrite = reveal > 0.95 && original.depthWrite;
        });
      });
      lastOpacity.current = reveal;
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.13} />
      <directionalLight
        ref={daylight}
        position={[-3, 8, 3]}
        intensity={0.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
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
      <group ref={room} visible={false}>
        <SceneContents showSculpture={false} />
      </group>
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
  progress,
  active,
  reduced,
  onReady,
  onFailure,
}: {
  progress: number;
  active: boolean;
  reduced: boolean;
  onReady: () => void;
  onFailure: () => void;
}) {
  return (
    <SceneBoundary onFailure={onFailure}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        camera={{ position: [1.5, 2.2, 4.7], fov: 50, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false }}
        fallback={
          <p>
            AZANIA sculpture and gallery introduction.{" "}
            <a href="#collection">Skip to the collection.</a>
          </p>
        }
      >
        <color attach="background" args={["#080a09"]} />
        <Suspense fallback={null}>
          <Choreography progress={progress} reduced={reduced} />
          <Ready onReady={onReady} />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}

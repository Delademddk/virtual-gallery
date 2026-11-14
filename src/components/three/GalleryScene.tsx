"use client";
import { Component, Suspense, useEffect, useMemo, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { studies } from "@/src/data/studies";

function GalleryModel() {
  const { scene } = useGLTF("/models/gallery.glb");
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow = true;
      node.receiveShadow = true;
      node.material = new THREE.MeshStandardMaterial({
        color: node.name.includes("Floor")
          ? "#b9b7af"
          : node.name.includes("Trim") || node.name.includes("Beam")
            ? "#77776f"
            : "#efeee7",
        roughness: node.name.includes("Floor") ? 0.55 : 0.85,
      });
      // Preview-only daylight opening. Final glass is Member 4's integration.
      if (node.name.includes("Glass")) node.visible = false;
    });
    return clone;
  }, [scene]);
  useEffect(
    () => () => {
      model.traverse((node) => {
        if (node instanceof THREE.Mesh)
          (node.material as THREE.Material).dispose();
      });
    },
    [model],
  );
  return <primitive object={model} dispose={null} />;
}
function FramedStudy({
  index,
  position,
  rotation = [0, 0, 0],
  onSelect,
}: {
  index: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  onSelect?: (index: number) => void;
}) {
  const texture = useTexture(studies[index].image);
  return (
    <group
      position={position}
      rotation={rotation}
      onClick={
        onSelect
          ? (event) => {
              event.stopPropagation();
              onSelect(index);
            }
          : undefined
      }
    >
      <mesh castShadow>
        <boxGeometry args={[2.15, 2.65, 0.1]} />
        <meshStandardMaterial color="#24231f" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[1.97, 2.47]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
export function SceneContents({
  onSelect,
  showSculpture = true,
}: {
  onSelect?: (index: number) => void;
  showSculpture?: boolean;
}) {
  return (
    <>
      <GalleryModel />
      <FramedStudy
        index={0}
        position={[-5.2, 2.25, -6.92]}
        onSelect={onSelect}
      />
      <FramedStudy index={1} position={[0, 2.25, -6.92]} onSelect={onSelect} />
      <FramedStudy
        index={2}
        position={[5.2, 2.25, -6.92]}
        onSelect={onSelect}
      />
      <FramedStudy
        index={3}
        position={[-9.92, 2.25, -1.5]}
        rotation={[0, Math.PI / 2, 0]}
        onSelect={onSelect}
      />
      <mesh position={[1.5, 0.65, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.3, 1.2]} />
        <meshStandardMaterial color="#e2e0d7" roughness={0.8} />
      </mesh>
      {showSculpture && (
        <mesh
          position={[1.5, 1.95, -0.5]}
          rotation={[0.25, 0, -0.35]}
          castShadow
        >
          <torusKnotGeometry args={[0.46, 0.14, 96, 12]} />
          <meshStandardMaterial
            color="#343631"
            metalness={0.55}
            roughness={0.3}
          />
        </mesh>
      )}
    </>
  );
}
function CameraPath({ progress }: { progress: number }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    target.set(
      7.1 - progress * 5.8,
      2.8 - progress * 0.9,
      5.8 - progress * 2.7,
    );
    camera.position.lerp(target, 1 - Math.exp(-delta * 4));
    camera.lookAt(-2 + progress * 2, 1.9, -5);
  });
  return null;
}
export class SceneBoundary extends Component<
  { children: ReactNode; onFailure?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure?.();
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <p>The 3D preview couldn’t load.</p>
        <button onClick={() => location.reload()}>Try again</button>
        <a href="/#collection">Browse the collection</a>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Loaded({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}
export default function GalleryScene({
  progress = 0,
  active = true,
  interactive = false,
  onReady,
  onSelect,
  onFailure,
}: {
  progress?: number;
  active?: boolean;
  interactive?: boolean;
  onReady?: () => void;
  onSelect?: (index: number) => void;
  onFailure?: () => void;
}) {
  return (
    <SceneBoundary onFailure={onFailure}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "never"}
        camera={{ position: [7.1, 2.8, 5.8], fov: 65, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false }}
        fallback={
          <div>
            <p>AZANIA 3D room preview.</p>
            <a href="/#collection">
              Browse artwork descriptions in the collection
            </a>
          </div>
        }
      >
        <color attach="background" args={["#e6e5df"]} />
        <ambientLight intensity={1.3} />
        <hemisphereLight args={["#fffef6", "#98968b", 1.6]} />
        <directionalLight
          position={[-3, 8, 3]}
          intensity={3}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.001}
        />
        <Suspense fallback={null}>
          <SceneContents onSelect={active ? onSelect : undefined} />
          <Loaded onReady={onReady} />
        </Suspense>
        {interactive ? (
          <OrbitControls
            enabled={active}
            target={[-1, 1.7, -2]}
            minDistance={2}
            maxDistance={12}
            maxPolarAngle={Math.PI / 2 - 0.03}
            enablePan={false}
          />
        ) : (
          <CameraPath progress={progress} />
        )}
      </Canvas>
    </SceneBoundary>
  );
}

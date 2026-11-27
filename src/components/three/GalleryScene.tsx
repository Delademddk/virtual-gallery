"use client";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ASSETS, LOCAL_ASSETS } from "@/lib/assets";
import type { TourStop, TravelRequest } from "./controls/tourStops";
import RibbonSculpture from "./RibbonSculpture";
import { FirstPerson, type NavigationInput } from "./controls/FirstPerson";
import { studies } from "@/src/data/studies";

// Development's hosted URL may be unavailable during team uploads. Keep the
// matching repository export available without changing the shared remote URL.
class GalleryAssetLoader extends GLTFLoader {
  override load(
    ...[url, onLoad, onProgress, onError]: Parameters<GLTFLoader["load"]>
  ) {
    super.load(url, onLoad, onProgress, (error) => {
      if (url !== ASSETS.gallery) {
        onError?.(error);
        return;
      }
      super.load(LOCAL_ASSETS.gallery, onLoad, onProgress, onError);
    });
  }
}

export const galleryView: [number, number, number] = [2.7, 2.8, 6.6];
export const galleryTarget: [number, number, number] = [-1.5, 2, -3];

function GalleryModel() {
  const { scene } = useLoader(GalleryAssetLoader, ASSETS.gallery);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (node instanceof THREE.Light) {
        // Blender's exported candela values overwhelm the existing web daylight.
        // Tune the preview clone only; retain the original GLB for team review.
        node.intensity *= 0.002;
        node.userData.azaniaBaseIntensity = node.intensity;
      }
      if (!(node instanceof THREE.Mesh)) return;
      // Clone materials so the homepage fade cannot mutate the loader cache.
      const cloneMaterial = (material: THREE.Material) => material.clone();
      node.material = Array.isArray(node.material)
        ? node.material.map(cloneMaterial)
        : cloneMaterial(node.material);
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      node.castShadow = !materials.some(
        (material) =>
          material instanceof THREE.MeshPhysicalMaterial &&
          material.transmission > 0,
      );
      node.receiveShadow = true;
    });
    return clone;
  }, [scene]);
  useEffect(
    () => () => {
      model.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        const materials = Array.isArray(node.material)
          ? node.material
          : [node.material];
        materials.forEach((material) => material.dispose());
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
      userData={{ studyIndex: index }}
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
        position={[-13, 2.25, -7.92]}
        onSelect={onSelect}
      />
      <FramedStudy
        index={1}
        position={[-0.8, 2.25, -7.92]}
        onSelect={onSelect}
      />
      <FramedStudy index={2} position={[8, 2.25, -7.92]} onSelect={onSelect} />
      <FramedStudy
        index={3}
        position={[4.16, 2.25, -0.5]}
        rotation={[0, -Math.PI / 2, 0]}
        onSelect={onSelect}
      />
      <mesh position={[1.5, 0.65, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.3, 1.2]} />
        <meshStandardMaterial color="#e2e0d7" roughness={0.8} />
      </mesh>
      {showSculpture && (
        <mesh position={[1.5, 1.95, -0.5]} rotation={[0, -0.2, 0]} castShadow>
          <RibbonSculpture />
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
      galleryView[0] - progress * 1.4,
      galleryView[1] - progress * 0.9,
      galleryView[2] - progress * 2.7,
    );
    camera.position.lerp(target, 1 - Math.exp(-delta * 4));
    camera.lookAt(...galleryTarget);
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
  walking = false,
  input,
  onPause,
  resetKey = 0,
  travel,
  touring,
  onCatalog,
  onArrive,
  onTravelError,
  onPosition,
}: {
  progress?: number;
  active?: boolean;
  interactive?: boolean;
  onReady?: () => void;
  onSelect?: (index: number) => void;
  onFailure?: () => void;
  walking?: boolean;
  input?: RefObject<NavigationInput>;
  onPause?: () => void;
  resetKey?: number;
  travel?: TravelRequest | null;
  touring?: boolean;
  onCatalog?: (stops: TourStop[]) => void;
  onArrive?: (stopId: string, kind: TravelRequest["kind"]) => void;
  onTravelError?: (message: string) => void;
  onPosition?: (position: [number, number, number]) => void;
}) {
  const world = useRef<THREE.Group>(null);
  return (
    <SceneBoundary onFailure={onFailure}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop={active ? "always" : "demand"}
        camera={{ position: galleryView, fov: 65, near: 0.1, far: 80 }}
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
          <group ref={world}>
            <SceneContents onSelect={active ? onSelect : undefined} />
          </group>
          {interactive && input && onPause ? (
            <FirstPerson
              world={world}
              input={input}
              walking={walking && active}
              onPause={onPause}
              onReady={onReady}
              onSelect={onSelect}
              resetKey={resetKey}
              travel={travel}
              touring={touring}
              onCatalog={onCatalog}
              onArrive={onArrive}
              onTravelError={onTravelError}
              onPosition={onPosition}
            />
          ) : (
            <Loaded onReady={onReady} />
          )}
        </Suspense>
        {!interactive && <CameraPath progress={progress} />}
      </Canvas>
    </SceneBoundary>
  );
}

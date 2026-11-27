import * as THREE from "three";
import type { buildCollisionWorld } from "../collision/world";
export type TourStop = {
  id: string;
  title: string;
  subtitle: string;
  position: [number, number, number];
  target: [number, number, number];
  thumbnail?: string;
};
export type TravelRequest = {
  serial: number;
  stopId: string;
  kind: "jump" | "tour";
};
const definitions: {
  id: string;
  title: string;
  subtitle: string;
  position: [number, number, number];
  target?: [number, number, number];
  node?: string;
}[] = [
  {
    id: "entrance",
    title: "First perspective",
    subtitle: "The gallery entrance",
    position: [0, 1.65, 6],
    target: [-2, 1.9, -2],
  },
  {
    id: "ribbon",
    title: "Rising ribbon",
    subtitle: "Original AZANIA form study",
    position: [1.5, 1.65, 2.8],
    target: [1.5, 2.1, -0.5],
  },
  {
    id: "portrait",
    title: "Portrait display",
    subtitle: "Central gallery",
    node: "African_bust",
    position: [-1.4, 1.65, -0.8],
  },
  {
    id: "western",
    title: "Western display",
    subtitle: "Figures and sculptural objects",
    node: "golden_stool",
    position: [-12, 1.65, 1],
  },
  {
    id: "board",
    title: "Board display",
    subtitle: "Eastern gallery",
    node: "Oware_board",
    position: [11.3, 1.65, 5.8],
  },
  {
    id: "vessel",
    title: "Vessel display",
    subtitle: "Eastern gallery",
    node: "zulu_pot",
    position: [11.3, 1.65, -1.4],
  },
  {
    id: "instrument",
    title: "Instrument display",
    subtitle: "Eastern gallery",
    node: "kora",
    position: [11.3, 1.65, -6],
  },
];
export function resolveTourStops(
  root: THREE.Object3D,
  world: ReturnType<typeof buildCollisionWorld>,
): TourStop[] {
  root.updateWorldMatrix(true, true);
  return definitions.flatMap((def) => {
    const node = def.node ? root.getObjectByName(def.node) : undefined;
    if (def.node && !node) return [];
    const target = node
      ? new THREE.Box3().setFromObject(node).getCenter(new THREE.Vector3())
      : new THREE.Vector3(...def.target!);
    if (def.id === "portrait") target.y = 1.9;
    if (def.id === "western") target.y = 1.7;
    const preferred = new THREE.Vector3(...def.position);
    const position = world.findSpawn(preferred);
    if (position.distanceTo(preferred) > 3) return [];
    return [
      {
        id: def.id,
        title: def.title,
        subtitle: def.subtitle,
        position: position.toArray() as TourStop["position"],
        target: target.toArray() as TourStop["target"],
      },
    ];
  });
}

export function captureStopThumbnails(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  stops: TourStop[],
) {
  const width = 240,
    height = 160;
  const target = new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: true,
  });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 80);
  const previousTarget = renderer.getRenderTarget();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const pixels = new Uint8Array(width * height * 4);
  try {
    if (!context) return stops;
    return stops.map((stop) => {
      camera.position.set(...stop.position);
      camera.lookAt(...stop.target);
      camera.updateMatrixWorld();
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
      const bitmap = context.createImageData(width, height);
      for (let row = 0; row < height; row++)
        bitmap.data.set(
          pixels.subarray(
            (height - 1 - row) * width * 4,
            (height - row) * width * 4,
          ),
          row * width * 4,
        );
      context.putImageData(bitmap, 0, 0);
      return { ...stop, thumbnail: canvas.toDataURL("image/jpeg", 0.8) };
    });
  } finally {
    renderer.setRenderTarget(previousTarget);
    target.dispose();
  }
}

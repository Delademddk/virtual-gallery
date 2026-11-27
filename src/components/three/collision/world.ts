import * as THREE from "three";
import { Octree } from "three/addons/math/Octree.js";
import { Capsule } from "three/addons/math/Capsule.js";

export const PLAYER_RADIUS = 0.3;
export const EYE_HEIGHT = 1.65;
const BODY_TOP = 1.85;

export function buildCollisionWorld(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true);
  const architecture = new THREE.Group();
  const obstacles: THREE.Box3[] = [];
  let floor: THREE.Box3 | undefined;
  root.traverseVisible((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const box = new THREE.Box3().setFromObject(node);
    if (/^Gallery_Floor$/i.test(node.name)) {
      floor = box;
      return;
    }
    // Ignore overhead detail, floor-level moulding and non-solid annotations.
    if (box.min.y >= BODY_TOP || box.max.y <= 0.06 || node.userData.noCollision)
      return;
    if (
      /^(Wall_|Partition_|Arch_(Main|Front)|Main_Door|Rear_Boor|Rear_Door|Window_)/i.test(
        node.name,
      )
    ) {
      const mesh = new THREE.Mesh(node.geometry);
      mesh.matrixAutoUpdate = false;
      mesh.matrix.copy(node.matrixWorld);
      architecture.add(mesh);
    } else {
      // Conservative volumes keep dense art meshes out of the collision tree.
      obstacles.push(box);
    }
  });
  const tree = new Octree().fromGraphNode(architecture);
  const bounds =
    floor ??
    new THREE.Box3(
      new THREE.Vector3(-18, -0.2, -8),
      new THREE.Vector3(18, 0, 8),
    );
  const ground = bounds.max.y;
  const capsule = new Capsule(
    new THREE.Vector3(),
    new THREE.Vector3(),
    PLAYER_RADIUS,
  );
  const correction = new THREE.Vector3();

  function placeCapsule(position: THREE.Vector3) {
    capsule.start.set(position.x, ground + PLAYER_RADIUS + 0.02, position.z);
    capsule.end.set(position.x, ground + BODY_TOP - PLAYER_RADIUS, position.z);
  }

  function resolve(position: THREE.Vector3) {
    placeCapsule(position);
    for (let i = 0; i < 4; i++) {
      const hit = tree.capsuleIntersect(capsule);
      if (!hit || hit.depth < 1e-6) break;
      // Walking stays on the gallery's flat floor; no flight or wall climbing.
      correction.copy(hit.normal).multiplyScalar(hit.depth + 0.0001);
      correction.y = 0;
      capsule.translate(correction);
      position.add(correction);
    }
    for (const box of obstacles) {
      if (box.max.y <= ground + 0.06 || box.min.y >= ground + BODY_TOP)
        continue;
      const x = THREE.MathUtils.clamp(position.x, box.min.x, box.max.x);
      const z = THREE.MathUtils.clamp(position.z, box.min.z, box.max.z);
      const dx = position.x - x,
        dz = position.z - z;
      const distance = Math.hypot(dx, dz);
      if (distance >= PLAYER_RADIUS) continue;
      if (distance > 1e-7) {
        position.x += (dx / distance) * (PLAYER_RADIUS - distance + 0.0001);
        position.z += (dz / distance) * (PLAYER_RADIUS - distance + 0.0001);
      } else {
        const sides = [
          {
            d: position.x - box.min.x,
            x: box.min.x - PLAYER_RADIUS,
            z: position.z,
          },
          {
            d: box.max.x - position.x,
            x: box.max.x + PLAYER_RADIUS,
            z: position.z,
          },
          {
            d: position.z - box.min.z,
            x: position.x,
            z: box.min.z - PLAYER_RADIUS,
          },
          {
            d: box.max.z - position.z,
            x: position.x,
            z: box.max.z + PLAYER_RADIUS,
          },
        ].sort((a, b) => a.d - b.d);
        position.x = sides[0].x;
        position.z = sides[0].z;
      }
    }
    position.x = THREE.MathUtils.clamp(
      position.x,
      bounds.min.x + PLAYER_RADIUS,
      bounds.max.x - PLAYER_RADIUS,
    );
    position.z = THREE.MathUtils.clamp(
      position.z,
      bounds.min.z + PLAYER_RADIUS,
      bounds.max.z - PLAYER_RADIUS,
    );
    position.y = ground + EYE_HEIGHT;
  }

  function move(position: THREE.Vector3, displacement: THREE.Vector3) {
    // At most 8 cm per step prevents tunnelling through thin walls after a stall.
    const steps = Math.max(1, Math.ceil(displacement.length() / 0.08));
    const step = displacement.clone().multiplyScalar(1 / steps);
    for (let i = 0; i < steps; i++) {
      position.add(step);
      resolve(position);
    }
    return position;
  }

  function isClear(position: THREE.Vector3, margin = 0.05) {
    if (
      position.x < bounds.min.x + PLAYER_RADIUS ||
      position.x > bounds.max.x - PLAYER_RADIUS ||
      position.z < bounds.min.z + PLAYER_RADIUS ||
      position.z > bounds.max.z - PLAYER_RADIUS
    )
      return false;
    placeCapsule(position);
    const hit = tree.capsuleIntersect(capsule);
    if (hit && hit.depth > 0.001) return false;
    return !obstacles.some(
      (box) =>
        box.max.y > ground + 0.06 &&
        box.min.y < ground + BODY_TOP &&
        Math.hypot(
          position.x - THREE.MathUtils.clamp(position.x, box.min.x, box.max.x),
          position.z - THREE.MathUtils.clamp(position.z, box.min.z, box.max.z),
        ) <
          PLAYER_RADIUS + margin,
    );
  }

  function findSpawn(preferred = new THREE.Vector3(0, EYE_HEIGHT, 6)) {
    if (isClear(preferred)) return preferred.clone().setY(ground + EYE_HEIGHT);
    // Search nearby space instead of spawning inside a newly moved exhibit.
    for (let radius = 0.5; radius < 35; radius += 0.5) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        const candidate = new THREE.Vector3(
          preferred.x + Math.cos(angle) * radius,
          ground + EYE_HEIGHT,
          preferred.z + Math.sin(angle) * radius,
        );
        if (isClear(candidate)) return candidate;
      }
    }
    throw new Error("No clear gallery starting position found");
  }
  return { move, findSpawn, isClear, bounds, obstacleCount: obstacles.length };
}

"use client";
import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildCollisionWorld } from "../collision/world";
import { createRoutePlanner } from "./routes";
import {
  resolveTourStops,
  captureStopThumbnails,
  type TourStop,
  type TravelRequest,
} from "./tourStops";

export type NavigationInput = {
  move: { x: number; y: number };
  look: { x: number; y: number };
};
export function FirstPerson({
  world,
  input,
  walking,
  onPause,
  onReady,
  onSelect,
  resetKey,
  travel,
  touring = false,
  onCatalog,
  onArrive,
  onTravelError,
  onPosition,
}: {
  world: RefObject<THREE.Group | null>;
  input: RefObject<NavigationInput>;
  walking: boolean;
  onPause: () => void;
  onReady?: () => void;
  onSelect?: (index: number) => void;
  resetKey: number;
  travel?: TravelRequest | null;
  touring?: boolean;
  onCatalog?: (stops: TourStop[]) => void;
  onArrive?: (stopId: string, kind: TravelRequest["kind"]) => void;
  onTravelError?: (message: string) => void;
  onPosition?: (position: [number, number, number]) => void;
}) {
  const { camera, gl, scene } = useThree();
  const collision = useRef<ReturnType<typeof buildCollisionWorld> | null>(null);
  const planner = useRef<ReturnType<typeof createRoutePlanner> | null>(null);
  const catalog = useRef<TourStop[]>([]);
  const autopilot = useRef<{
    stop: TourStop;
    path: THREE.Vector3[];
    index: number;
    stall: number;
  } | null>(null);
  const reportElapsed = useRef(0);
  const lastPosition = useRef(new THREE.Vector3(Infinity, Infinity, Infinity));
  const desiredLook = useRef(new THREE.Quaternion());
  const lookMatrix = useRef(new THREE.Matrix4());
  const lookEuler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const keys = useRef(new Set<string>());
  const orientation = useRef({ yaw: 0, pitch: 0 });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const wasLocked = useRef(false);
  const direction = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    if (!world.current) return;
    collision.current = buildCollisionWorld(world.current);
    planner.current = createRoutePlanner(collision.current);
    catalog.current = resolveTourStops(world.current, collision.current);
    try {
      catalog.current = captureStopThumbnails(gl, scene, catalog.current);
    } catch {
      /* Navigation still works when a device cannot capture thumbnails. */
    }
    onCatalog?.(catalog.current);
    camera.position.copy(collision.current.findSpawn());
    orientation.current = { yaw: 0, pitch: 0 };
    camera.rotation.set(0, 0, 0, "YXZ");
    onPosition?.(camera.position.toArray() as [number, number, number]);
    onReady?.();
  }, [camera, world, gl, scene, onCatalog, onPosition, onReady]);

  useEffect(() => {
    if (!collision.current) return;
    autopilot.current = null;
    camera.position.copy(collision.current.findSpawn());
    orientation.current = { yaw: 0, pitch: 0 };
    camera.rotation.set(0, 0, 0, "YXZ");
    onPosition?.(camera.position.toArray() as [number, number, number]);
  }, [camera, resetKey, onPosition]);

  function syncOrientation() {
    lookEuler.current.setFromQuaternion(camera.quaternion, "YXZ");
    orientation.current.yaw = lookEuler.current.y;
    orientation.current.pitch = lookEuler.current.x;
  }

  useEffect(() => {
    autopilot.current = null;
    if (!travel || !collision.current || !planner.current) return;
    const stop = catalog.current.find((item) => item.id === travel.stopId);
    if (
      !stop ||
      !collision.current.isClear(new THREE.Vector3(...stop.position))
    ) {
      onTravelError?.(
        "This viewing position is unavailable. Choose another stop.",
      );
      return;
    }
    if (
      travel.kind === "jump" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      camera.position.set(...stop.position);
      camera.lookAt(...stop.target);
      syncOrientation();
      onPosition?.(stop.position);
      onArrive?.(stop.id, travel.kind);
      return;
    }
    const path = planner.current.route(
      camera.position,
      new THREE.Vector3(...stop.position),
    );
    if (!path) {
      onTravelError?.(
        "There isn’t a clear walking route to this stop. You can still visit it from the map.",
      );
      return;
    }
    autopilot.current = { stop, path, index: 0, stall: 0 };
  }, [camera, travel, onArrive, onTravelError, onPosition]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.tabIndex = walking ? 0 : -1;
    if (walking) {
      canvas.focus();
      wasLocked.current = document.pointerLockElement === canvas;
    }
    canvas.setAttribute(
      "aria-label",
      "First-person gallery. Use WASD or arrow keys to walk. Drag to look, or use mouse lock. Escape pauses.",
    );
    function clear() {
      keys.current.clear();
      drag.current = null;
      input.current.move.x = input.current.move.y = 0;
      input.current.look.x = input.current.look.y = 0;
    }
    function pause() {
      clear();
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      onPause();
    }
    function keydown(e: KeyboardEvent) {
      if (
        (!walking && !touring) ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.code === "Escape") {
        pause();
        return;
      }
      if (!walking) return;
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.code)
      ) {
        e.preventDefault();
        keys.current.add(e.code);
      }
      if (e.code === "Escape") pause();
    }
    function keyup(e: KeyboardEvent) {
      keys.current.delete(e.code);
    }
    function lockChange() {
      const locked = document.pointerLockElement === canvas;
      if (wasLocked.current && !locked) {
        clear();
        onPause();
      }
      wasLocked.current = locked;
    }
    function visibility() {
      if (document.hidden) pause();
    }
    function down(e: PointerEvent) {
      if (!walking || document.pointerLockElement === canvas || e.button !== 0)
        return;
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    }
    function look(e: PointerEvent) {
      if (!walking) return;
      if (document.pointerLockElement === canvas) {
        input.current.look.x += e.movementX;
        input.current.look.y += e.movementY;
      } else if (drag.current?.id === e.pointerId) {
        input.current.look.x += e.clientX - drag.current.x;
        input.current.look.y += e.clientY - drag.current.y;
        drag.current.x = e.clientX;
        drag.current.y = e.clientY;
      }
    }
    function up(e: PointerEvent) {
      if (drag.current?.id === e.pointerId) drag.current = null;
    }
    function interact() {
      if (!walking || document.pointerLockElement !== canvas || !world.current)
        return;
      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      const hit = raycaster.current.intersectObject(world.current, true)[0];
      if (!hit || hit.distance > 4) return;
      let node: THREE.Object3D | null = hit.object;
      while (node) {
        if (typeof node.userData.studyIndex === "number") {
          onSelect?.(node.userData.studyIndex);
          break;
        }
        node = node.parent;
      }
    }
    if (!walking) {
      clear();
      // Switching to a map or tour deliberately releases the pointer; it must
      // not be mistaken for a visitor pressing Escape to pause the new mode.
      wasLocked.current = false;
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    }
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("pointerlockchange", lockChange);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", look);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("click", interact);
    return () => {
      clear();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("pointerlockchange", lockChange);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", look);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("click", interact);
    };
  }, [camera, gl, walking, touring, input, onPause, onSelect]);

  useEffect(
    () => () => {
      if (document.pointerLockElement === gl.domElement)
        document.exitPointerLock();
    },
    [gl],
  );

  useFrame((_, delta) => {
    if (!collision.current) return;
    reportElapsed.current += delta;
    if (
      reportElapsed.current > 0.25 &&
      camera.position.distanceToSquared(lastPosition.current) > 0.04
    ) {
      reportElapsed.current = 0;
      lastPosition.current.copy(camera.position);
      onPosition?.(camera.position.toArray() as [number, number, number]);
    }
    const auto = autopilot.current;
    if (auto && touring) {
      const point = auto.path[auto.index];
      const before = camera.position.distanceTo(point);
      const step = Math.min(2.8 * Math.min(delta, 0.05), before);
      direction.current
        .copy(point)
        .sub(camera.position)
        .normalize()
        .multiplyScalar(step);
      collision.current.move(camera.position, direction.current);
      const remaining = camera.position.distanceTo(point);
      if (step > 0 && before - remaining < step * 0.1)
        auto.stall += Math.min(delta, 0.05);
      else auto.stall = 0;
      if (auto.stall > 2) {
        autopilot.current = null;
        onTravelError?.(
          "The route is blocked. Choose a viewing position from the map.",
        );
        return;
      }
      const atLast = auto.index === auto.path.length - 1;
      if (remaining < 0.025 && !atLast) auto.index++;
      const finalDistance = camera.position.distanceTo(
        new THREE.Vector3(...auto.stop.position),
      );
      const aim =
        atLast && finalDistance < 1.2
          ? new THREE.Vector3(...auto.stop.target)
          : auto.path[auto.index].clone().setY(camera.position.y);
      if (aim.distanceToSquared(camera.position) > 1e-6) {
        lookMatrix.current.lookAt(
          camera.position,
          aim,
          THREE.Object3D.DEFAULT_UP,
        );
        desiredLook.current.setFromRotationMatrix(lookMatrix.current);
        camera.quaternion.slerp(
          desiredLook.current,
          1 - Math.exp(-Math.min(delta, 0.05) * 5),
        );
        syncOrientation();
      }
      if (
        atLast &&
        remaining < 0.025 &&
        camera.quaternion.angleTo(desiredLook.current) < 0.015
      ) {
        autopilot.current = null;
        onArrive?.(auto.stop.id, "tour");
      }
      return;
    }
    if (!walking) return;
    const look = input.current.look;
    orientation.current.yaw -= look.x * 0.0025;
    orientation.current.pitch = THREE.MathUtils.clamp(
      orientation.current.pitch - look.y * 0.0025,
      -Math.PI / 2 + 0.08,
      Math.PI / 2 - 0.08,
    );
    look.x = look.y = 0;
    camera.rotation.set(
      orientation.current.pitch,
      orientation.current.yaw,
      0,
      "YXZ",
    );
    const held = keys.current;
    let x =
      Number(held.has("KeyD") || held.has("ArrowRight")) -
      Number(held.has("KeyA") || held.has("ArrowLeft")) +
      input.current.move.x;
    let z =
      Number(held.has("KeyS") || held.has("ArrowDown")) -
      Number(held.has("KeyW") || held.has("ArrowUp")) +
      input.current.move.y;
    const magnitude = Math.hypot(x, z);
    if (magnitude > 1) {
      x /= magnitude;
      z /= magnitude;
    }
    direction.current
      .set(x, 0, z)
      .applyAxisAngle(THREE.Object3D.DEFAULT_UP, orientation.current.yaw)
      .multiplyScalar(2.6 * Math.min(delta, 0.05));
    collision.current.move(camera.position, direction.current);
  });
  return null;
}

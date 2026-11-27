import test from "node:test";
import assert from "node:assert/strict";
import { Group, Mesh, BoxGeometry, Vector3 } from "three";
import {
  buildCollisionWorld,
  EYE_HEIGHT,
} from "../src/components/three/collision/world.ts";
function box(root, name, size, position, yaw = 0) {
  const mesh = new Mesh(new BoxGeometry(...size));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.y = yaw;
  root.add(mesh);
  return mesh;
}
function room() {
  const root = new Group();
  box(root, "Gallery_Floor", [20, 0.2, 20], [0, -0.1, 0]);
  return root;
}
test("thin wall blocks a long movement from both sides without tunnelling", () => {
  const root = room();
  box(root, "Wall_Test", [0.1, 3, 10], [0, 1.5, 0]);
  const world = buildCollisionWorld(root);
  const left = new Vector3(-3, EYE_HEIGHT, 0);
  world.move(left, new Vector3(6, 0, 0));
  assert.ok(left.x < -0.34, `left: ${left.x}`);
  const right = new Vector3(3, EYE_HEIGHT, 0);
  world.move(right, new Vector3(-6, 0, 0));
  assert.ok(right.x > 0.34, `right: ${right.x}`);
});
test("walks through a doorway instead of blocking the entire wall bounds", () => {
  const root = room();
  box(root, "Wall_Left", [4, 3, 0.1], [-3, 1.5, 0]);
  box(root, "Wall_Right", [4, 3, 0.1], [3, 1.5, 0]);
  box(root, "Wall_Lintel", [2, 1, 0.1], [0, 2.5, 0]);
  const world = buildCollisionWorld(root);
  const p = new Vector3(0, EYE_HEIGHT, 2);
  world.move(p, new Vector3(0, 0, -4));
  assert.ok(p.z < -1.9);
});
test("slides along a wall while preserving fixed eye height", () => {
  const root = room();
  box(root, "Partition_Test", [0.1, 3, 15], [0, 1.5, 0]);
  const world = buildCollisionWorld(root);
  const p = new Vector3(-1, EYE_HEIGHT, 0);
  world.move(p, new Vector3(3, 4, -3));
  assert.ok(p.x < -0.34);
  assert.ok(p.z < -2.9);
  assert.ok(Math.abs(p.y - EYE_HEIGHT) < 1e-6);
});
test("dense exhibit proxies block the player and clear spawn avoids them", () => {
  const root = room();
  box(root, "Exhibit", [2, 2, 2], [0, 1, 0]);
  const world = buildCollisionWorld(root);
  const p = new Vector3(0, EYE_HEIGHT, 3);
  world.move(p, new Vector3(0, 0, -6));
  assert.ok(p.z >= 1.29);
  assert.equal(world.isClear(new Vector3(0, EYE_HEIGHT, 0)), false);
  assert.equal(
    world.isClear(world.findSpawn(new Vector3(0, EYE_HEIGHT, 0))),
    true,
  );
});
test("respects rotated architecture and outer floor boundary", () => {
  const root = room();
  box(root, "Wall_Rotated", [0.1, 3, 8], [0, 1.5, 0], Math.PI / 4);
  const world = buildCollisionWorld(root);
  const p = new Vector3(-3, EYE_HEIGHT, 0);
  world.move(p, new Vector3(6, 0, 0));
  assert.ok(p.x < 2.5);
  const edge = new Vector3(0, EYE_HEIGHT, 8);
  world.move(edge, new Vector3(0, 0, 10));
  assert.ok(edge.z <= 9.7);
});
test("overhead geometry does not block walking underneath", () => {
  const root = room();
  box(root, "Ceiling", [8, 0.2, 8], [0, 4, 0]);
  const world = buildCollisionWorld(root);
  const p = new Vector3(-2, EYE_HEIGHT, 0);
  world.move(p, new Vector3(4, 0, 0));
  assert.ok(p.x > 1.99);
});

test("guided routes go around a partition and never cut its corners", async () => {
  const { createRoutePlanner } =
    await import("../src/components/three/controls/routes.ts");
  const root = room();
  box(root, "Partition_Test", [0.15, 3, 8], [0, 1.5, 0]);
  const world = buildCollisionWorld(root),
    planner = createRoutePlanner(world);
  const start = new Vector3(-3, EYE_HEIGHT, 0),
    end = new Vector3(3, EYE_HEIGHT, 0);
  const route = planner.route(start, end);
  assert.ok(route && route.length > 1);
  let previous = start;
  for (const point of route) {
    assert.ok(planner.segmentClear(previous, point));
    previous = point;
  }
  assert.ok(route.some((point) => Math.abs(point.z) > 4.3));
});
test("guided routes refuse an enclosed destination", async () => {
  const { createRoutePlanner } =
    await import("../src/components/three/controls/routes.ts");
  const root = room();
  box(root, "Partition_Test", [0.2, 3, 20], [0, 1.5, 0]);
  const planner = createRoutePlanner(buildCollisionWorld(root));
  assert.equal(
    planner.route(
      new Vector3(-3, EYE_HEIGHT, 0),
      new Vector3(3, EYE_HEIGHT, 0),
    ),
    null,
  );
});

test("a tour can begin beside an object at manual walking clearance", async () => {
  const { createRoutePlanner } =
    await import("../src/components/three/controls/routes.ts");
  const root = room();
  box(root, "Exhibit", [2, 2, 2], [0, 1, 0]);
  const planner = createRoutePlanner(buildCollisionWorld(root));
  const route = planner.route(
    new Vector3(1.3001, EYE_HEIGHT, 0),
    new Vector3(4, EYE_HEIGHT, 0),
  );
  assert.ok(route && route.length > 0);
});

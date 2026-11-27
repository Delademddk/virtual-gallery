import { Vector3 } from "three";
import type { buildCollisionWorld } from "../collision/world";
type World = ReturnType<typeof buildCollisionWorld>;

// A static walking grid; its edges and the final simplified path are sampled
// using the same capsule clearance as manual navigation.
export function createRoutePlanner(world: World, spacing = 0.5) {
  const minX = world.bounds.min.x + 0.4,
    minZ = world.bounds.min.z + 0.4;
  const cols = Math.floor((world.bounds.max.x - 0.4 - minX) / spacing) + 1;
  const rows = Math.floor((world.bounds.max.z - 0.4 - minZ) / spacing) + 1;
  const y = world.bounds.max.y + 1.65;
  const nodes: Vector3[] = [],
    clear: boolean[] = [];
  for (let z = 0; z < rows; z++)
    for (let x = 0; x < cols; x++) {
      const point = new Vector3(minX + x * spacing, y, minZ + z * spacing);
      nodes.push(point);
      clear.push(world.isClear(point));
    }
  const sample = new Vector3();
  function segmentClear(a: Vector3, b: Vector3) {
    const steps = Math.max(1, Math.ceil(a.distanceTo(b) / 0.1));
    for (let i = 0; i <= steps; i++)
      if (!world.isClear(sample.lerpVectors(a, b, i / steps), 0)) return false;
    return true;
  }
  function nearest(point: Vector3) {
    return nodes
      .map((node, id) => ({ id, distance: node.distanceToSquared(point) }))
      .filter(({ id }) => clear[id])
      .sort((a, b) => a.distance - b.distance)
      .find(({ id }) => segmentClear(point, nodes[id]))?.id;
  }
  const edgeCache = new Map<string, boolean>();
  function edge(a: number, b: number) {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (!edgeCache.has(key))
      edgeCache.set(key, segmentClear(nodes[a], nodes[b]));
    return edgeCache.get(key)!;
  }
  function route(start: Vector3, finish: Vector3): Vector3[] | null {
    if (!world.isClear(start, 0) || !world.isClear(finish)) return null;
    if (segmentClear(start, finish)) return [finish.clone()];
    const first = nearest(start),
      last = nearest(finish);
    if (first === undefined || last === undefined) return null;
    const open = new Set([first]),
      closed = new Set<number>();
    const came = new Map<number, number>(),
      cost = new Map([[first, 0]]);
    while (open.size) {
      let current = -1,
        best = Infinity;
      for (const id of open) {
        const score = cost.get(id)! + nodes[id].distanceTo(nodes[last]);
        if (score < best) {
          best = score;
          current = id;
        }
      }
      if (current === last) {
        const path = [finish.clone(), nodes[last].clone()];
        while (came.has(current)) {
          current = came.get(current)!;
          path.push(nodes[current].clone());
        }
        path.push(start.clone());
        path.reverse();
        const smooth: Vector3[] = [];
        let from = 0;
        while (from < path.length - 1) {
          let next = path.length - 1;
          while (next > from + 1 && !segmentClear(path[from], path[next]))
            next--;
          smooth.push(path[next]);
          from = next;
        }
        return smooth;
      }
      open.delete(current);
      closed.add(current);
      const x = current % cols,
        z = Math.floor(current / cols);
      for (let dz = -1; dz <= 1; dz++)
        for (let dx = -1; dx <= 1; dx++) {
          if (
            (!dx && !dz) ||
            x + dx < 0 ||
            x + dx >= cols ||
            z + dz < 0 ||
            z + dz >= rows
          )
            continue;
          const next = (z + dz) * cols + x + dx;
          if (!clear[next] || closed.has(next) || !edge(current, next))
            continue;
          const score =
            cost.get(current)! + nodes[current].distanceTo(nodes[next]);
          if (score >= (cost.get(next) ?? Infinity)) continue;
          came.set(next, current);
          cost.set(next, score);
          open.add(next);
        }
    }
    return null;
  }
  return { route, segmentClear };
}

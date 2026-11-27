"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

// Original abstract prototype: a single rising, twisted ribbon, not an artefact.
function createRibbon() {
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.12, -0.65, 0),
    new THREE.Vector3(-0.47, -0.4, 0.06),
    new THREE.Vector3(-0.43, -0.1, 0.12),
    new THREE.Vector3(0.08, 0.16, 0),
    new THREE.Vector3(0.46, 0.44, -0.08),
    new THREE.Vector3(0.38, 0.76, -0.04),
    new THREE.Vector3(0.05, 0.96, 0.05),
  ]);
  const sections = 160;
  const positions: number[] = [];
  const indices: number[] = [];
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const point = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  for (let i = 0; i <= sections; i++) {
    const t = i / sections;
    path.getPointAt(t, point);
    path.getTangentAt(t, tangent);
    normal.set(-tangent.y, tangent.x, 0).normalize();
    normal.applyAxisAngle(tangent, -0.55 + t * 1.65);
    binormal.crossVectors(tangent, normal).normalize();
    const halfWidth = (0.26 + Math.sin(t * Math.PI) * 0.2) / 2;
    // Separate vertices per face preserve a fine, crisp silver edge.
    for (let face = 0; face < 4; face++) {
      for (const corner of [corners[face], corners[(face + 1) % 4]]) {
        vertex
          .copy(point)
          .addScaledVector(normal, corner[0] * halfWidth)
          .addScaledVector(binormal, corner[1] * 0.025);
        positions.push(vertex.x, vertex.y, vertex.z);
      }
      if (i < sections) {
        const a = i * 8 + face * 2;
        indices.push(a, a + 8, a + 1, a + 1, a + 8, a + 9);
      }
    }
  }
  // Close both ends of the ribbon.
  for (const end of [0, sections]) {
    const base = positions.length / 3;
    for (const corner of [0, 2, 4, 6]) {
      const source = (end * 8 + corner) * 3;
      positions.push(...positions.slice(source, source + 3));
    }
    if (end === 0)
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    else indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export default function RibbonSculpture() {
  const geometry = useMemo(createRibbon, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <>
      <primitive object={geometry} attach="geometry" />
      <meshPhysicalMaterial
        color="#c7cbce"
        metalness={0.82}
        roughness={0.28}
        clearcoat={0.35}
        clearcoatRoughness={0.25}
        side={THREE.DoubleSide}
      />
    </>
  );
}

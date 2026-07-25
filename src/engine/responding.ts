// Responding: the dotted counterpart of the contour response field. A dense
// globe grid supports 25 wide ribbon paths whose front-facing dots shimmer
// asynchronously while their rear dots remain quiet and recessed.

import { fibDir, makeProj, paint, radiusScale, type Dot } from './core';
import type { ModeDraw } from './types';

export const drawResponding: ModeDraw = (ctx, size, t, dark, opts) => {
  const center = size / 2;
  const total = Math.max(24, Math.round(opts.pulseN ?? 156));
  const shellCount = Math.max(2, Math.round(opts.shellCount ?? 3));
  const ribbonLineCount = Math.max(
    shellCount,
    Math.round(opts.ribbonLineCount ?? 25)
  );
  const baseLinesPerShell = Math.floor(ribbonLineCount / shellCount);
  const extraLineShells = ribbonLineCount % shellCount;
  const minimumSegments = size >= 64 ? 12 : 8;
  const segments = Math.max(
    minimumSegments,
    Math.floor(
      (total * (opts.dotDensity ?? 2.8))
      / ribbonLineCount
    )
  );
  const rs = radiusScale(size, opts.rsPow ?? 0.6);
  const nearRadius = (
    (opts.rBase ?? 0.7)
    + ((opts.rDepth ?? 1.6) * 0.25)
  ) * (opts.dotScale ?? 1.65) * rs;
  const dots: Dot[] = [];

  // Preserve the original Responding state's continuous Fibonacci dot body;
  // only the foreground response ribbons mirror the contour alternative.
  const bodyCount = Math.max(24, Math.round(total * 0.85));
  const bodyRadius = size * 0.39;
  const bodyProject = makeProj(
    t * 0.1,
    0.34 + (0.055 * Math.sin(t * 0.3)),
    center,
    center,
    bodyRadius
  );

  for (let index = 0; index < bodyCount; index++) {
    const [x, y, z] = bodyProject(...fibDir(index, bodyCount));
    const depth = (z + 1) / 2;

    dots.push({
      x,
      y,
      z,
      r: nearRadius * 0.65 * (0.42 + (0.58 * depth)),
      white: 0.64 - (0.4 * depth),
      a: 0.18 + (0.48 * depth)
    });
  }

  for (let shell = 0; shell < shellCount; shell++) {
    const cycle =
      (t * (opts.pulseSpeed ?? 0.17) * Math.PI * 2)
      + ((shell / shellCount) * Math.PI * 2);
    const pulse = (1 - Math.cos(cycle)) / 2;
    const radius = size * (0.32 + (0.07 * pulse));
    const envelope = 0.45 + (0.55 * ((1 + Math.sin(cycle)) / 2));
    const yaw = (t * 0.1) + (shell * 0.82);
    const tilt = 0.5 + (0.12 * Math.sin((t * 0.25) + shell));
    const ux = Math.cos(yaw);
    const uy = 0;
    const uz = Math.sin(yaw);
    const vx = -uz * Math.sin(tilt);
    const vy = Math.cos(tilt);
    const vz = ux * Math.sin(tilt);
    const nx = (uy * vz) - (uz * vy);
    const ny = (uz * vx) - (ux * vz);
    const nz = (ux * vy) - (uy * vx);
    const project = makeProj(0, 0.18, center, center, radius);
    const laneCount =
      baseLinesPerShell
      + (shell < extraLineShells ? 1 : 0);

    for (let lane = 0; lane < laneCount; lane++) {
      const laneOffset =
        (lane - ((laneCount - 1) / 2))
        * (opts.bandSpread ?? 0.075);

      for (let segment = 0; segment < segments; segment++) {
        const angle = (segment / segments) * Math.PI * 2;
        const wobble = (
          (0.085 * Math.sin(
            (angle * 3)
            - (t * 1.15)
            + (lane * 0.24)
            + shell
          ))
          + (0.032 * Math.sin((angle * 5) + (t * 0.72) - shell))
        ) * (opts.wobMul ?? 1);
        const offset = laneOffset + wobble;
        const x =
          (ux * Math.cos(angle))
          + (vx * Math.sin(angle))
          + (nx * offset);
        const y =
          (uy * Math.cos(angle))
          + (vy * Math.sin(angle))
          + (ny * offset);
        const z =
          (uz * Math.cos(angle))
          + (vz * Math.sin(angle))
          + (nz * offset);
        const length = Math.sqrt((x * x) + (y * y) + (z * z));
        const [px, py, zr] = project(x / length, y / length, z / length);
        const depth = (zr + 1) / 2;
        const frontDepth = Math.min(
          1,
          Math.max(0, (zr + 0.08) / 1.08)
        );
        const shimmerChunk = Math.floor((segment / segments) * 16);
        const shimmerSeed = (shell * 11) + lane;
        const shimmerTime =
          t * ((opts.shimmerSpeed ?? 0.55) / 0.55);
        const sparkle = Math.min(
          1,
          Math.max(
            0,
            0.62
            + (0.25 * Math.sin(
              (shimmerTime * 9.2)
              + (shimmerSeed * 1.71)
              + (shimmerChunk * 2.37)
            ))
            + (0.13 * Math.sin(
              (shimmerTime * 14.3)
              - (shimmerSeed * 0.83)
              + (shimmerChunk * 4.11)
            ))
          )
        );
        const shimmer = frontDepth * (0.48 + (0.52 * sparkle));

        dots.push({
          x: px,
          y: py,
          z: zr + (Math.sin(cycle) * 0.04),
          r: nearRadius * (0.35 + (0.65 * depth)),
          white: 0.62 - (0.38 * depth) - (0.18 * shimmer),
          a: Math.min(
            1,
            0.14 + (envelope * (
              0.34
              + (0.28 * depth)
              + (0.24 * shimmer)
            ))
          )
        });
      }
    }
  }

  paint(ctx, dots, dark, opts.rMin);
};

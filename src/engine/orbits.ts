// Working: two woven orbital ribbons cross a faint spherical body. It shares
// composing's coordinated parallel-strand language, while counter-rotation
// and traveling particles keep this state busier and more task-oriented.

import type { Dot, ModeDraw } from './types';
import { fibDir, makeProj, paint, radiusScale } from './core';

export const drawOrbits: ModeDraw = (ctx, size, t, dark, o) => {
  const cx = size / 2;
  const cy = size / 2;
  const R = (size / 2) * 0.82;
  const pt = makeProj(t * 0.08, 0.3, cx, cy, 1);
  const rs = radiusScale(size, o.rsPow ?? 0.6);

  const dots: Dot[] = [];
  const totalLanes = Math.max(4, o.orbitN ?? 12);
  const bandCount = Math.max(1, Math.round(o.bandCount ?? 2));
  const lanesPerBand = Math.max(2, Math.round(totalLanes / bandCount));
  const segments = Math.max(16, o.ghostN ?? 40);
  const particles = o.particles ?? 5;

  // A quiet sphere anchors the crossing bands, like composing's ghost body.
  const shellCount = Math.max(12, Math.round(segments * 1.2));
  for (let index = 0; index < shellCount; index++) {
    const direction = fibDir(index, shellCount);
    const [px, py, z] = pt(
      direction[0] * R,
      direction[1] * R,
      direction[2] * R
    );
    const depth = (z / R + 1) / 2;
    dots.push({
      x: px,
      y: py,
      z,
      r: (o.ghostR ?? 0.9) * rs,
      white: 0.78,
      a: (o.ghostA ?? 0.5) * (0.18 + (0.34 * depth))
    });
  }

  for (let band = 0; band < bandCount; band++) {
    const direction = band % 2 === 0 ? 1 : -1;
    const phase = (band / bandCount) * Math.PI;
    const yaw = phase + (t * 0.19 * direction);
    const tilt =
      0.5
      + (band * 0.18)
      + (0.08 * Math.sin((t * 0.32) + phase));
    const ux = Math.cos(yaw);
    const uy = 0;
    const uz = Math.sin(yaw);
    const vx = -uz * Math.sin(tilt);
    const vy = Math.cos(tilt);
    const vz = ux * Math.sin(tilt);
    const nx = (uy * vz) - (uz * vy);
    const ny = (uz * vx) - (ux * vz);
    const nz = (ux * vy) - (uy * vx);

    for (let lane = 0; lane < lanesPerBand; lane++) {
      const edge = Math.abs(lane - ((lanesPerBand - 1) / 2))
        / Math.max(1, (lanesPerBand - 1) / 2);
      const laneOffset =
        (lane - ((lanesPerBand - 1) / 2))
        * (o.bandSpread ?? 0.064);

      for (let segment = 0; segment < segments; segment++) {
        const angle = (segment / segments) * Math.PI * 2;
        const wobble = (
          (0.105 * Math.sin(
            (angle * 3)
            - (t * 1.35 * direction)
            + (lane * 0.2)
            + phase
          ))
          + (0.04 * Math.sin((angle * 5) + (t * 0.78) - phase))
        ) * (o.wobMul ?? 1);
        const offset = laneOffset + wobble;
        const x = (ux * Math.cos(angle)) + (vx * Math.sin(angle)) + (nx * offset);
        const y = (uy * Math.cos(angle)) + (vy * Math.sin(angle)) + (ny * offset);
        const z = (uz * Math.cos(angle)) + (vz * Math.sin(angle)) + (nz * offset);
        const length = Math.sqrt((x * x) + (y * y) + (z * z));
        const [px, py, zr] = pt(
          (x / length) * R,
          (y / length) * R,
          (z / length) * R
        );
        const depth = (zr / R + 1) / 2;

        dots.push({
          x: px,
          y: py,
          z: zr,
          r: (
            (o.rBase ?? 1.1)
            + ((o.rDepth ?? 1.7) * depth)
          ) * (1 - (0.25 * edge)) * rs,
          white: 0.52 - (0.44 * depth) + (0.18 * edge),
          a: 0.4 + (0.6 * depth)
        });
      }
    }

    // Bright markers travel through both woven bands in opposite directions.
    for (let particle = 0; particle < particles; particle++) {
      const lane = particle % lanesPerBand;
      const laneOffset =
        (lane - ((lanesPerBand - 1) / 2))
        * (o.bandSpread ?? 0.064);
      const angle =
        (t * (0.72 + (band * 0.08)) * direction)
        + ((particle / particles) * Math.PI * 2)
        + phase;
      const wobble = (
        (0.105 * Math.sin(
          (angle * 3)
          - (t * 1.35 * direction)
          + (lane * 0.2)
          + phase
        ))
        + (0.04 * Math.sin((angle * 5) + (t * 0.78) - phase))
      ) * (o.wobMul ?? 1);
      const offset = laneOffset + wobble;
      const x = (ux * Math.cos(angle)) + (vx * Math.sin(angle)) + (nx * offset);
      const y = (uy * Math.cos(angle)) + (vy * Math.sin(angle)) + (ny * offset);
      const z = (uz * Math.cos(angle)) + (vz * Math.sin(angle)) + (nz * offset);
      const length = Math.sqrt((x * x) + (y * y) + (z * z));
      const [px, py, zr] = pt(
        (x / length) * R,
        (y / length) * R,
        (z / length) * R
      );
      const depth = (zr / R + 1) / 2;

      dots.push({
        x: px,
        y: py,
        z: zr + 1,
        r: ((o.partR ?? 1.55) + ((o.partRDepth ?? 2.1) * depth)) * rs,
        white: 0.14 - (0.1 * depth)
      });
    }
  }

  paint(ctx, dots, dark, o.rMin);
};

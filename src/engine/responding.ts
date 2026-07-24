// Expanding spherical wavefronts for the "responding" state. Three staggered
// shells carry dots away from a steady inner core, suggesting information
// flowing from the assistant toward the user.

import {
  fibDir,
  makeProj,
  paint,
  radiusScale,
  type Dot
} from './core';
import type { ModeDraw } from './types';

export const drawResponding: ModeDraw = (ctx, size, t, dark, opts) => {
  const center = size / 2;
  const total = Math.max(24, Math.round(opts.pulseN ?? 156));
  const shellCount = Math.max(2, Math.round(opts.shellCount ?? 3));
  const dotsPerShell = Math.max(8, Math.floor(total / shellCount));
  const rs = radiusScale(size, opts.rsPow ?? 0.6);
  const dots: Dot[] = [];

  for (let shell = 0; shell < shellCount; shell++) {
    const phase = ((t * (opts.pulseSpeed ?? 0.17)) + (shell / shellCount)) % 1;
    const easedPhase = phase * (2 - phase);
    const radius = size * (0.1 + (0.36 * easedPhase));
    const envelope = Math.pow(Math.sin(Math.PI * phase), 0.7);
    const project = makeProj(
      (t * 0.14) + (shell * 0.7),
      0.38,
      center,
      center,
      radius
    );

    for (let index = 0; index < dotsPerShell; index++) {
      const direction = fibDir(index, dotsPerShell);
      const [x, y, z] = project(...direction);
      const depth = (z + 1) / 2;

      dots.push({
        x,
        y,
        z,
        r: (
          (opts.rBase ?? 0.7)
          + ((opts.rDepth ?? 1.6) * depth)
        ) * rs * (0.8 + (0.25 * phase)),
        white: 0.7 - (0.58 * depth),
        a: envelope * (0.45 + (0.55 * depth))
      });
    }
  }

  const coreCount = Math.max(8, Math.round(total * 0.16));
  const coreRadius = size * (0.105 + (0.012 * Math.sin(t * 1.8)));
  const coreProject = makeProj(t * 0.2, 0.38, center, center, coreRadius);

  for (let index = 0; index < coreCount; index++) {
    const direction = fibDir(index, coreCount);
    const [x, y, z] = coreProject(...direction);
    const depth = (z + 1) / 2;

    dots.push({
      x,
      y,
      z: z + 2,
      r: (
        (opts.rBase ?? 0.7)
        + ((opts.rDepth ?? 1.6) * depth)
      ) * rs,
      white: 0.62 - (0.54 * depth),
      a: 0.65 + (0.35 * depth)
    });
  }

  paint(ctx, dots, dark, opts.rMin);
};

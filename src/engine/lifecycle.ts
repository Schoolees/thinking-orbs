// Additional AI lifecycle signals. These modes stay monochrome like the
// original orb family while using distinct silhouettes at every supported
// size.

import {
  fibDir,
  makeProj,
  paint,
  radiusScale,
  type Dot
} from './core';
import type { ModeDraw } from './types';

function pointCount(opts: Record<string, number | undefined>, fallback: number): number {
  return Math.max(12, Math.round(opts.pointN ?? fallback));
}

function dotRadius(
  size: number,
  depth: number,
  opts: Record<string, number | undefined>
): number {
  return (
    (opts.rBase ?? 0.7)
    + ((opts.rDepth ?? 1.5) * depth)
  ) * radiusScale(size, opts.rsPow ?? 0.6);
}

export const drawIdle: ModeDraw = (ctx, size, t, dark, opts) => {
  const center = size / 2;
  const count = pointCount(opts, 132);
  const breath = 0.94 + (0.055 * Math.sin(t * 0.85));
  const project = makeProj(t * 0.08, 0.34, center, center, size * 0.38 * breath);
  const dots: Dot[] = [];

  for (let index = 0; index < count; index++) {
    const [x, y, z] = project(...fibDir(index, count));
    const depth = (z + 1) / 2;

    dots.push({
      x,
      y,
      z,
      r: dotRadius(size, depth, opts),
      white: 0.7 - (0.58 * depth),
      a: 0.5 + (0.5 * depth)
    });
  }

  paint(ctx, dots, dark, opts.rMin);
};

export const drawConnecting: ModeDraw = (ctx, size, t, dark, opts) => {
  const center = size / 2;
  const count = pointCount(opts, 108);
  const lobeCount = Math.max(8, Math.floor(count * 0.38));
  const bridgeCount = Math.max(8, count - (lobeCount * 2));
  const gap = size * (
    (opts.lobeGap ?? 0.16)
    + ((opts.gapPulse ?? 0.01) * Math.sin(t * 1.5))
  );
  const lobeRadius = size * (opts.lobeRadius ?? 0.32);
  const dots: Dot[] = [];

  for (const side of [-1, 1]) {
    const project = makeProj(
      (t * 0.42) * side,
      0.32,
      center + (gap * side),
      center,
      lobeRadius
    );

    for (let index = 0; index < lobeCount; index++) {
      const [x, y, z] = project(...fibDir(index, lobeCount));
      const depth = (z + 1) / 2;

      dots.push({
        x,
        y,
        z,
        r: dotRadius(size, depth, opts),
        white: 0.7 - (0.56 * depth),
        a: 0.45 + (0.55 * depth)
      });
    }
  }

  for (let index = 0; index < bridgeCount; index++) {
    const amount = bridgeCount === 1 ? 0.5 : index / (bridgeCount - 1);
    const signal = (amount + (t * 0.32)) % 1;
    const emphasis = Math.exp(-Math.pow((signal - 0.5) / 0.18, 2));

    dots.push({
      x: center - gap + (amount * gap * 2),
      y: center + (Math.sin((amount * Math.PI * 2) + t) * size * 0.018),
      z: 2 + emphasis,
      r: dotRadius(size, 0.75, opts) * (0.75 + (0.5 * emphasis)),
      white: 0.48 - (0.3 * emphasis),
      a: 0.35 + (0.65 * emphasis)
    });
  }

  paint(ctx, dots, dark, opts.rMin);
};

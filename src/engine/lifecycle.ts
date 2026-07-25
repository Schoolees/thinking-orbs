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
  const tau = Math.PI * 2;
  const gap = size * (
    (opts.lobeGap ?? 0.17)
    + ((opts.gapPulse ?? 0.012) * Math.sin(t * 1.15))
  );
  const lobeRadius = size * (opts.lobeRadius ?? 0.2);
  const laneCount = size >= 64
    ? Math.max(2, Math.round(opts.laneCount ?? 3))
    : 2;
  const minimumNodeSegments = size >= 64
    ? Math.max(8, Math.round(opts.nodeMinSegments ?? 10))
    : 8;
  const nodeSegments = Math.max(
    minimumNodeSegments,
    Math.round((count * 0.38) / (laneCount * 2))
  );
  const markersPerNode = size >= 64
    ? Math.max(2, Math.round(opts.bridgeStrands ?? 3))
    : 2;
  const dots: Dot[] = [];

  // Match the contour's rotating latitude/longitude cage with dotted paths.
  const bodyCount = Math.max(16, Math.round(count * 0.34));
  const bodyRadius = size * (opts.bodyRadius ?? 0.39);
  const bodyProject = makeProj(
    t * 0.07,
    0.34 + (0.055 * Math.sin(t * 0.3)),
    center,
    center,
    bodyRadius
  );
  const bodyMeridians = Math.max(
    4,
    Math.round(Math.sqrt(count) * 0.55)
  );
  const bodyLatitudes = Math.max(
    2,
    Math.round(Math.sqrt(count) * 0.3)
  );
  const bodySegments = Math.max(
    8,
    Math.round(bodyCount / (bodyMeridians + bodyLatitudes))
  );
  const addBodyDot = (x: number, y: number, z: number) => {
    const depth = (z + 1) / 2;

    dots.push({
      x,
      y,
      z,
      r: dotRadius(size, depth, opts) * 0.92,
      white: 0.58 - (0.4 * depth),
      a: 0.38 + (0.42 * depth)
    });
  };

  for (let meridian = 0; meridian < bodyMeridians; meridian++) {
    const longitude =
      -Math.PI / 2
      + ((meridian / (bodyMeridians - 1)) * Math.PI);

    for (let segment = 0; segment < bodySegments; segment++) {
      const angle = ((segment / bodySegments) * tau) - (Math.PI / 2);
      const sin = Math.sin(angle);

      addBodyDot(...bodyProject(
        sin * Math.cos(longitude),
        Math.cos(angle),
        sin * Math.sin(longitude)
      ));
    }
  }

  for (let latitudeIndex = 0; latitudeIndex < bodyLatitudes; latitudeIndex++) {
    const latitude =
      -Math.PI / 2
      + (((latitudeIndex + 1) / (bodyLatitudes + 1)) * Math.PI);
    const ringRadius = Math.cos(latitude);

    for (let segment = 0; segment < bodySegments; segment++) {
      const longitude = (segment / bodySegments) * tau;

      addBodyDot(...bodyProject(
        Math.cos(longitude) * ringRadius,
        Math.sin(latitude),
        Math.sin(longitude) * ringRadius
      ));
    }
  }

  // Two mini-globe grids counter-rotate with the same paths and marker timing
  // as their contour equivalents.
  const signalPosition = (t * (opts.signalSpeed ?? 0.28)) % 1;

  for (const side of [-1, 1]) {
    const project = makeProj(
      (t * 0.48) * side,
      0.46,
      center + (gap * side),
      center,
      lobeRadius
    );
    const nodePoint = (
      lane: number,
      amount: number
    ): [number, number, number] => {
      const latitude =
        (lane - ((laneCount - 1) / 2))
        * 0.38;
      const ringRadius = Math.sqrt(Math.max(0, 1 - (latitude * latitude)));
      const angle = (amount * tau) + (lane * 0.18);

      return project(
        Math.cos(angle) * ringRadius,
        latitude,
        Math.sin(angle) * ringRadius
      );
    };

    for (let lane = 0; lane < laneCount; lane++) {
      const latitude =
        (lane - ((laneCount - 1) / 2))
        * 0.38;
      const ringRadius = Math.sqrt(Math.max(0, 1 - (latitude * latitude)));

      for (let segment = 0; segment < nodeSegments; segment++) {
        const angle =
          (segment / nodeSegments) * Math.PI * 2
          + (lane * 0.18);
        const [x, y, z] = project(
          Math.cos(angle) * ringRadius,
          latitude,
          Math.sin(angle) * ringRadius
        );
        const depth = (z + 1) / 2;

        dots.push({
          x,
          y,
          z,
          r: dotRadius(size, depth, opts),
          white: 0.58 - (0.46 * depth),
          a: 0.55 + (0.4 * depth)
        });
      }

      const longitude =
        -Math.PI / 2
        + ((lane / (laneCount - 1)) * Math.PI);

      for (let segment = 0; segment < nodeSegments; segment++) {
        const angle = ((segment / nodeSegments) * tau) - (Math.PI / 2);
        const sin = Math.sin(angle);
        const [x, y, z] = project(
          sin * Math.cos(longitude),
          Math.cos(angle),
          sin * Math.sin(longitude)
        );
        const depth = (z + 1) / 2;

        dots.push({
          x,
          y,
          z,
          r: dotRadius(size, depth, opts),
          white: 0.62 - (0.48 * depth),
          a: 0.5 + (0.4 * depth)
        });
      }
    }

    for (let marker = 0; marker < markersPerNode; marker++) {
      const direction = side < 0 ? 1 : -1;
      const markerPosition = (
        1
        + ((marker / markersPerNode) * 0.68)
        + (signalPosition * direction)
      ) % 1;
      const markerLane = marker % laneCount;
      const [x, y, z] = nodePoint(markerLane, markerPosition);
      const depth = (z + 1) / 2;
      const nearRadius = Math.max(0.8, size / 54);

      dots.push({
        x,
        y,
        z: z + 0.04,
        r: Math.max(0.5, nearRadius * (0.35 + (0.65 * depth))),
        white: 0.14 - (0.1 * depth),
        a: 0.42 + (0.58 * depth)
      });
    }
  }

  paint(ctx, dots, dark, opts.rMin);
};

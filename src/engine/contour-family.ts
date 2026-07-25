// Line-based alternatives for the classic dotted state family. Each painter
// reuses the original state's geometry, timing, density inputs, and projection
// so `variant="contour"` changes the mark-making rather than the meaning.

import { makeProj } from './core';
import {
  applyMoves,
  makeMoves,
  solveCycle
} from './lattice';
import { resolveMorphOutline } from './morph';
import type { ModeDraw } from './types';

type Point = readonly [number, number];
type Path = (amount: number) => Point;
type SpatialPoint = readonly [number, number, number];
type SpatialPath = (amount: number) => SpatialPoint;

const TAU = Math.PI * 2;

function ink(dark: boolean, alpha: number): string {
  return dark
    ? `rgba(250,250,250,${alpha})`
    : `rgba(24,24,27,${alpha})`;
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  path: Path,
  samples: number,
  dark: boolean,
  alpha: number,
  width: number,
  closed = true
): void {
  ctx.beginPath();

  for (let index = 0; index <= samples; index++) {
    const [x, y] = path(index / samples);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  if (closed) {
    ctx.closePath();
  }

  ctx.strokeStyle = ink(dark, alpha);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function strokeDepthPath(
  ctx: CanvasRenderingContext2D,
  path: SpatialPath,
  samples: number,
  dark: boolean,
  farAlpha: number,
  nearAlpha: number,
  farWidth: number,
  nearWidth: number,
  time?: number,
  seed = 0
): void {
  strokePath(
    ctx,
    (amount) => {
      const [x, y] = path(amount);
      return [x, y];
    },
    samples,
    dark,
    farAlpha,
    farWidth
  );

  if (time == null) {
    ctx.beginPath();
    let drawingFront = false;

    for (let index = 0; index <= samples; index++) {
      const [x, y, z] = path(index / samples);

      if (z < 0) {
        drawingFront = false;
        continue;
      }

      if (!drawingFront) {
        ctx.moveTo(x, y);
        drawingFront = true;
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = ink(dark, nearAlpha);
    ctx.lineWidth = nearWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    return;
  }

  // Shimmer is a field of asynchronous front-surface fluctuations, not one
  // bright segment orbiting the line. The stable far layer above preserves
  // continuity while these short overlays twinkle independently.
  const shimmerChunks = 16;
  const samplesPerChunk = Math.max(3, Math.round(samples / shimmerChunks));

  for (let chunk = 0; chunk < shimmerChunks; chunk++) {
    const start = chunk / shimmerChunks;
    const end = (chunk + 1) / shimmerChunks;
    const middle = (start + end) / 2;
    const [, , z] = path(middle);

    if (z < -0.08) {
      continue;
    }
    const frontDepth = Math.min(1, Math.max(0, (z + 0.08) / 1.08));
    const sparkle = Math.min(
      1,
      Math.max(
        0,
        0.62
        + (0.25 * Math.sin(
          (time * 9.2)
          + (seed * 1.71)
          + (chunk * 2.37)
        ))
        + (0.13 * Math.sin(
          (time * 14.3)
          - (seed * 0.83)
          + (chunk * 4.11)
        ))
      )
    );

    strokePath(
      ctx,
      (amount) => {
        const [x, y] = path(start + ((end - start) * amount));
        return [x, y];
      },
      samplesPerChunk,
      dark,
      nearAlpha * frontDepth * (0.48 + (0.52 * sparkle)),
      farWidth + (
        (nearWidth - farWidth)
        * frontDepth
        * (0.76 + (0.24 * sparkle))
      ),
      false
    );
  }
}

function denseGlobeLineCounts(size: number): readonly [number, number] {
  if (size >= 128) {
    return [17, 11];
  }
  if (size >= 96) {
    return [14, 9];
  }
  if (size >= 64) {
    return [12, 8];
  }

  return [6, 4];
}

function strokeSphereCage(
  ctx: CanvasRenderingContext2D,
  size: number,
  dark: boolean,
  yaw: number,
  tilt: number,
  radius: number,
  meridianCount: number,
  latitudeCount: number,
  alpha: number
): void {
  const center = size / 2;
  const project = makeProj(yaw, tilt, center, center, radius);
  const width = Math.max(0.38, size / 190);
  const samples = size >= 96 ? 80 : 48;

  for (let meridian = 0; meridian < meridianCount; meridian++) {
    const longitude =
      -Math.PI / 2
      + ((meridian / Math.max(1, meridianCount - 1)) * Math.PI);

    strokeDepthPath(
      ctx,
      (amount) => {
        const angle = (amount * TAU) - (Math.PI / 2);
        const sin = Math.sin(angle);
        return project(
          sin * Math.cos(longitude),
          Math.cos(angle),
          sin * Math.sin(longitude)
        );
      },
      samples,
      dark,
      alpha * 0.5,
      alpha,
      width * 0.72,
      width * 1.15
    );
  }

  for (let latitudeIndex = 0; latitudeIndex < latitudeCount; latitudeIndex++) {
    const latitude =
      -Math.PI / 2
      + (((latitudeIndex + 1) / (latitudeCount + 1)) * Math.PI);
    const ringRadius = Math.cos(latitude);

    strokeDepthPath(
      ctx,
      (amount) => {
        const longitude = amount * TAU;
        return project(
          Math.cos(longitude) * ringRadius,
          Math.sin(latitude),
          Math.sin(longitude) * ringRadius
        );
      },
      samples,
      dark,
      alpha * 0.45,
      alpha * 0.9,
      width * 0.72,
      width * 1.15
    );
  }
}

function fillMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  dark: boolean,
  alpha = 1
): void {
  ctx.fillStyle = ink(dark, alpha);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
}

export const drawContourIdle: ModeDraw = (ctx, size, t, dark, _opts) => {
  const breath = 0.94 + (0.055 * Math.sin(t * 0.85));
  const [meridians, latitudes] = denseGlobeLineCounts(size);

  strokeSphereCage(
    ctx,
    size,
    dark,
    t * 0.08,
    0.34,
    size * 0.38 * breath,
    meridians,
    latitudes,
    0.55
  );
};

export const drawContourConnecting: ModeDraw = (ctx, size, t, dark, opts) => {
  const center = size / 2;
  const gap = size * (
    (opts.lobeGap ?? 0.17)
    + ((opts.gapPulse ?? 0.012) * Math.sin(t * 1.15))
  );
  const lobeRadius = size * (opts.lobeRadius ?? 0.2);
  const laneCount = size >= 64
    ? Math.max(2, Math.round(opts.laneCount ?? 3))
    : 2;
  const markersPerNode = size >= 64
    ? Math.max(2, Math.round(opts.bridgeStrands ?? 3))
    : 2;
  const signalPosition = (t * (opts.signalSpeed ?? 0.28)) % 1;
  const [globeMeridians, globeLatitudes] = denseGlobeLineCounts(size);

  strokeSphereCage(
    ctx,
    size,
    dark,
    t * 0.07,
    0.34 + (0.055 * Math.sin(t * 0.3)),
    size * (opts.bodyRadius ?? 0.39),
    globeMeridians,
    globeLatitudes,
    0.3
  );

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
    ): readonly [number, number, number] => {
      const latitude =
        (lane - ((laneCount - 1) / 2))
        * 0.38;
      const ringRadius = Math.sqrt(Math.max(0, 1 - (latitude * latitude)));
      const angle = (amount * TAU) + (lane * 0.18);
      return project(
        Math.cos(angle) * ringRadius,
        latitude,
        Math.sin(angle) * ringRadius
      );
    };
    const nodeMeridianPath = (
      lane: number,
      amount: number
    ): SpatialPoint => {
      const longitude =
        -Math.PI / 2
        + ((lane / (laneCount - 1)) * Math.PI);
      const angle = (amount * TAU) - (Math.PI / 2);
      const sin = Math.sin(angle);
      return project(
        sin * Math.cos(longitude),
        Math.cos(angle),
        sin * Math.sin(longitude)
      );
    };

    for (let lane = 0; lane < laneCount; lane++) {
      strokeDepthPath(
        ctx,
        (amount) => nodePoint(lane, amount),
        size >= 96 ? 72 : 44,
        dark,
        0.34,
        0.72,
        Math.max(0.34, size / 205),
        Math.max(0.48, size / 145)
      );
      strokeDepthPath(
        ctx,
        (amount) => nodeMeridianPath(lane, amount),
        size >= 96 ? 72 : 44,
        dark,
        0.3,
        0.66,
        Math.max(0.32, size / 215),
        Math.max(0.46, size / 155)
      );
    }

    for (let marker = 0; marker < markersPerNode; marker++) {
      const direction = side < 0 ? 1 : -1;
      const markerPosition = (
        1
        + ((marker / markersPerNode) * 0.68)
        + (signalPosition * direction)
      ) % 1;
      const markerLane = marker % laneCount;
      const [markerX, markerY, markerZ] = nodePoint(
        markerLane,
        markerPosition
      );
      const depth = (markerZ + 1) / 2;
      const nearRadius = Math.max(0.8, size / 54);
      const markerRadius = Math.max(
        0.5,
        nearRadius * (0.35 + (0.65 * depth))
      );

      fillMarker(
        ctx,
        markerX,
        markerY,
        markerRadius,
        dark,
        0.42 + (0.58 * depth)
      );
    }
  }
};

export const drawContourGlobe: ModeDraw = (ctx, size, t, dark, opts) => {
  const center = size / 2;
  const radius = (size / 2) * 0.82;
  const project = makeProj(0.5, 0.42, center, center, radius);
  const latitudeRings = Math.max(2, Math.round(opts.latRings ?? 17));
  const samples = size >= 96 ? 88 : 52;
  const lineWidth = Math.max(0.4, size / 175);

  for (let ring = 0; ring <= latitudeRings; ring++) {
    const latitude =
      -Math.PI / 2
      + ((ring / latitudeRings) * Math.PI);
    const cosLatitude = Math.cos(latitude);
    const sinLatitude = Math.sin(latitude);

    strokePath(
      ctx,
      (amount) => {
        const longitude = amount * TAU;
        const [x, y] = project(
          cosLatitude * Math.cos(longitude),
          sinLatitude,
          cosLatitude * Math.sin(longitude)
        );

        return [x, y];
      },
      samples,
      dark,
      opts.dimBase ?? 0.45,
      lineWidth
    );
  }

  // Searching shimmers across several contour fragments instead of sweeping
  // one rigid meridian around the sphere. Each ring has a different pulse and
  // a gentle back-and-forth highlight, while the globe itself stays anchored.
  const shimmerSpeed = 0.34 * (opts.scanMul ?? 1);
  const shimmerSamples = size >= 96 ? 16 : 10;

  for (let ring = 1; ring < latitudeRings; ring++) {
    const latitude =
      -Math.PI / 2
      + ((ring / latitudeRings) * Math.PI);
    const cosLatitude = Math.cos(latitude);
    const sinLatitude = Math.sin(latitude);
    const pulse =
      0.5
      + (0.5 * Math.sin((t * shimmerSpeed * 2.2) + (ring * 1.73)));
    const centerAmount =
      0.5
      + (
        0.39
        * Math.sin((t * shimmerSpeed * 0.72) + (ring * 2.41))
      );
    const span = 0.035 + (0.025 * pulse);
    const start = centerAmount - span;
    const end = centerAmount + span;

    strokePath(
      ctx,
      (amount) => {
        const longitude = (start + ((end - start) * amount)) * TAU;
        const [x, y] = project(
          cosLatitude * Math.cos(longitude),
          sinLatitude,
          cosLatitude * Math.sin(longitude)
        );

        return [x, y];
      },
      shimmerSamples,
      dark,
      0.2 + (0.76 * pulse),
      lineWidth * (1.25 + (0.75 * pulse)),
      false
    );
  }
};

export const drawContourRubik: ModeDraw = (ctx, size, t, dark, opts) => {
  const center = size / 2;
  const radius = (size / 2) * 0.82;
  const project = makeProj(
    t * 0.55,
    0.35 + (0.1 * Math.sin(t * 0.9)),
    center,
    center,
    radius
  );
  const moveCount = Math.max(1, Math.round(opts.moveCount ?? 14));
  const moves = makeMoves(moveCount);
  const cycle = solveCycle(t, moveCount, 0.42, 1.2);
  const latitudeRings = Math.max(2, Math.round(opts.latRings ?? 15));
  const samples = size >= 96 ? 96 : 56;

  for (let ring = 0; ring <= latitudeRings; ring++) {
    const latitude =
      -Math.PI / 2
      + ((ring / latitudeRings) * Math.PI);
    const cosLatitude = Math.cos(latitude);
    const sinLatitude = Math.sin(latitude);
    let previous: Point | null = null;

    ctx.beginPath();
    for (let segment = 0; segment <= samples; segment++) {
      const longitude = (segment / samples) * TAU;
      const [x, y, z] = applyMoves(
        [
          cosLatitude * Math.cos(longitude),
          sinLatitude,
          cosLatitude * Math.sin(longitude)
        ],
        moves,
        cycle
      );
      const [px, py] = project(x, y, z);
      const jump = previous
        ? Math.hypot(px - previous[0], py - previous[1])
        : 0;

      if (!previous || jump > size * 0.2) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
      previous = [px, py];
    }
    ctx.closePath();
    ctx.strokeStyle = ink(dark, 0.56 + (0.24 * (ring / latitudeRings)));
    ctx.lineWidth = Math.max(0.42, size / 160);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
};

export const drawContourRibbon: ModeDraw = (ctx, size, t, dark, opts) => {
  const center = size / 2;
  const radius = (size / 2) * 0.78;
  const spin = opts.spin ?? 1;
  const project = makeProj(t * 0.1 * spin, 0.3, center, center, 1);
  const yaw = t * 0.24 * spin;
  const tilt = 0.55 + (0.3 * Math.sin(t * 0.18) * spin);
  const ux = Math.cos(yaw);
  const uy = 0;
  const uz = Math.sin(yaw);
  const vx = -uz * Math.sin(tilt);
  const vy = Math.cos(tilt);
  const vz = ux * Math.sin(tilt);
  const nx = (uy * vz) - (uz * vy);
  const ny = (uz * vx) - (ux * vz);
  const nz = (ux * vy) - (uy * vx);
  const baseLanes = Math.max(1, Math.round(opts.lanes ?? 5));
  const lanes = Math.max(1, Math.round(baseLanes * (opts.bandMul ?? 1)));
  const [globeMeridians, globeLatitudes] = denseGlobeLineCounts(size);

  strokeSphereCage(
    ctx,
    size,
    dark,
    t * 0.1,
    0.3 + (0.055 * Math.sin(t * 0.3)),
    radius,
    globeMeridians,
    globeLatitudes,
    0.18
  );

  for (let lane = 0; lane < lanes; lane++) {
    const laneOffset = (lane - ((lanes - 1) / 2)) * 0.075;
    const edge = Math.abs(lane - ((lanes - 1) / 2))
      / Math.max(1, (lanes - 1) / 2);

    const ribbonPath: SpatialPath = (amount) => {
        const angle = amount * TAU;
        const wobble = (
          (0.16 * Math.sin(
            (angle * 3)
            - (t * 1.7)
            + (lane * 0.22)
          ))
          + (0.07 * Math.sin((angle * 5) + (t * 1.1)))
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
        const [px, py, projectedZ] = project(
          (x / length) * radius,
          (y / length) * radius,
          (z / length) * radius
        );

        return [px, py, projectedZ / radius];
      };

    strokeDepthPath(
      ctx,
      ribbonPath,
      size >= 96 ? 96 : 60,
      dark,
      0.16 + (0.22 * (1 - edge)),
      0.48 + (0.42 * (1 - edge)),
      Math.max(0.32, size / 220),
      Math.max(0.5, size / 135)
    );
  }
};

export const drawContourResponding: ModeDraw = (ctx, size, t, dark, opts) => {
  const center = size / 2;
  const shellCount = Math.max(2, Math.round(opts.shellCount ?? 3));
  const ribbonLineCount = Math.max(
    shellCount,
    Math.round(opts.ribbonLineCount ?? 25)
  );
  const baseLinesPerShell = Math.floor(ribbonLineCount / shellCount);
  const extraLineShells = ribbonLineCount % shellCount;
  const [globeMeridians, globeLatitudes] = denseGlobeLineCounts(size);

  strokeSphereCage(
    ctx,
    size,
    dark,
    t * 0.1,
    0.34 + (0.055 * Math.sin(t * 0.3)),
    size * 0.39,
    globeMeridians,
    globeLatitudes,
    0.28
  );

  for (let shell = 0; shell < shellCount; shell++) {
    const cycle =
      (t * (opts.pulseSpeed ?? 0.17) * TAU)
      + ((shell / shellCount) * TAU);
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
    const laneSpacing = opts.bandSpread ?? 0.075;

    for (let lane = 0; lane < laneCount; lane++) {
      const laneOffset =
        (lane - ((laneCount - 1) / 2))
        * laneSpacing;
      const pathForAngle = (angle: number): SpatialPoint => {
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
        const [px, py, projectedZ] = project(
          x / length,
          y / length,
          z / length
        );

        return [px, py, projectedZ];
      };

      strokeDepthPath(
        ctx,
        (amount) => pathForAngle(amount * TAU),
        size >= 96 ? 88 : 52,
        dark,
        0.16 + (0.22 * envelope),
        0.42 + (0.46 * envelope),
        Math.max(0.32, size / 220),
        Math.max(0.5, size / 130),
        t * ((opts.shimmerSpeed ?? 0.55) / 0.55),
        (shell * 11) + lane
      );
    }
  }
};

export const drawContourMorph: ModeDraw = (ctx, size, t, dark, opts) => {
  const { points, pulse } = resolveMorphOutline(t, opts);
  const center = size / 2;

  strokePath(
    ctx,
    (amount) => {
      const index = amount * points.length;
      const from = Math.floor(index) % points.length;
      const to = (from + 1) % points.length;
      const fraction = index - Math.floor(index);
      const a = points[from];
      const b = points[to];

      return [
        center + (
          (a[0] + ((b[0] - a[0]) * fraction))
          * pulse
          * size
        ),
        center + (
          (a[1] + ((b[1] - a[1]) * fraction))
          * pulse
          * size
        )
      ];
    },
    points.length,
    dark,
    0.94,
    Math.max(0.75, size / 90)
  );
};

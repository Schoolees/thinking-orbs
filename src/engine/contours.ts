// Optional fine-line alternatives for working and listening. The default
// orb family remains untouched; these painters are selected explicitly with
// variant="contour".

import { radiusScale } from './core';
import type { ModeDraw } from './types';

type Point = readonly [number, number];
type WorkingPoint = readonly [number, number, number];
type Path = (amount: number) => Point;
type WorkingPath = (amount: number) => WorkingPoint;

interface OrbPainter {
  path: Path;
  alpha: number;
  width?: number;
  depthPath?: WorkingPath;
  nearAlpha?: number;
  nearWidth?: number;
}

const TAU = Math.PI * 2;

function samples(size: number): number {
  return size >= 96 ? 96 : size >= 64 ? 72 : 48;
}

function denseGlobeLineCounts(size: number): readonly [number, number] {
  if (size >= 128) return [17, 11];
  if (size >= 96) return [14, 9];
  if (size >= 64) return [12, 8];
  return [6, 4];
}

function ink(dark: boolean, alpha: number): string {
  return dark
    ? `rgba(250,250,250,${alpha})`
    : `rgba(24,24,27,${alpha})`;
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  size: number,
  painter: OrbPainter
): void {
  const total = samples(size);
  ctx.beginPath();

  for (let index = 0; index <= total; index++) {
    const [x, y] = painter.path(index / total);
    const px = (size / 2) + (x * size);
    const py = (size / 2) + (y * size);

    if (index === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.closePath();
  ctx.stroke();
}

function drawFrontDepthPath(
  ctx: CanvasRenderingContext2D,
  size: number,
  painter: OrbPainter
): void {
  if (!painter.depthPath) {
    return;
  }

  const total = samples(size);
  ctx.beginPath();
  let drawingFront = false;

  for (let index = 0; index <= total; index++) {
    const [x, y, z] = painter.depthPath(index / total);

    if (z < 0) {
      drawingFront = false;
      continue;
    }

    const px = (size / 2) + (x * size);
    const py = (size / 2) + (y * size);

    if (!drawingFront) {
      ctx.moveTo(px, py);
      drawingFront = true;
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.stroke();
}

function depthPainter(
  path: WorkingPath,
  alpha: number,
  width: number
): OrbPainter {
  return {
    path: (amount) => {
      const [x, y] = path(amount);
      return [x, y];
    },
    depthPath: path,
    alpha: alpha * 0.5,
    width: width * 0.72,
    nearAlpha: alpha,
    nearWidth: width * 1.15
  };
}

function paintOrb(
  ctx: CanvasRenderingContext2D,
  size: number,
  dark: boolean,
  painters: OrbPainter[],
  boundaryAlpha = 0.86,
  boundaryPath?: Path
): void {
  const center = size / 2;
  const radius = size * 0.405;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TAU);
  ctx.clip();

  for (const painter of painters) {
    ctx.strokeStyle = ink(dark, painter.alpha);
    ctx.lineWidth = painter.width ?? Math.max(0.42, size / 150);
    drawPath(ctx, size, painter);

    if (painter.depthPath) {
      ctx.strokeStyle = ink(
        dark,
        painter.nearAlpha ?? Math.min(1, painter.alpha * 1.8)
      );
      ctx.lineWidth =
        painter.nearWidth
        ?? ((painter.width ?? Math.max(0.42, size / 150)) * 1.2);
      drawFrontDepthPath(ctx, size, painter);
    }
  }

  ctx.restore();

  if (boundaryAlpha <= 0) {
    return;
  }

  ctx.strokeStyle = ink(dark, boundaryAlpha);
  ctx.lineWidth = Math.max(0.5, size / 135);

  if (boundaryPath) {
    drawPath(ctx, size, {
      path: boundaryPath,
      alpha: boundaryAlpha,
      width: ctx.lineWidth
    });
    return;
  }

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TAU);
  ctx.stroke();
}

function projectWorkingBand(
  amount: number,
  band: number,
  lane: number,
  lanesPerBand: number,
  bandCount: number,
  time: number,
  bandSpread: number,
  wobbleMultiplier: number
): WorkingPoint {
  const direction = band % 2 === 0 ? 1 : -1;
  const phase = (band / bandCount) * Math.PI;
  const yaw = phase + (time * 0.19 * direction);
  const tilt =
    0.5
    + (band * 0.18)
    + (0.08 * Math.sin((time * 0.32) + phase));
  const ux = Math.cos(yaw);
  const uy = 0;
  const uz = Math.sin(yaw);
  const vx = -uz * Math.sin(tilt);
  const vy = Math.cos(tilt);
  const vz = ux * Math.sin(tilt);
  const nx = (uy * vz) - (uz * vy);
  const ny = (uz * vx) - (ux * vz);
  const nz = (ux * vy) - (uy * vx);
  const angle = amount * TAU;
  const laneOffset =
    (lane - ((lanesPerBand - 1) / 2))
    * bandSpread;
  const wobble = (
    (0.105 * Math.sin(
      (angle * 3)
      - (time * 1.35 * direction)
      + (lane * 0.2)
      + phase
    ))
    + (0.04 * Math.sin((angle * 5) + (time * 0.78) - phase))
  ) * wobbleMultiplier;
  const offset = laneOffset + wobble;
  const x = (ux * Math.cos(angle)) + (vx * Math.sin(angle)) + (nx * offset);
  const y = (uy * Math.cos(angle)) + (vy * Math.sin(angle)) + (ny * offset);
  const z = (uz * Math.cos(angle)) + (vz * Math.sin(angle)) + (nz * offset);
  const length = Math.sqrt((x * x) + (y * y) + (z * z));
  const normalizedX = x / length;
  const normalizedY = y / length;
  const normalizedZ = z / length;
  const globalYaw = time * 0.08;
  const globalTilt = 0.3;
  const cosYaw = Math.cos(globalYaw);
  const sinYaw = Math.sin(globalYaw);
  const x1 = (normalizedX * cosYaw) + (normalizedZ * sinYaw);
  const z1 = (-normalizedX * sinYaw) + (normalizedZ * cosYaw);
  const cosTilt = Math.cos(globalTilt);
  const sinTilt = Math.sin(globalTilt);

  return [
    x1 * 0.405,
    ((normalizedY * cosTilt) - (z1 * sinTilt)) * 0.405,
    (normalizedY * sinTilt) + (z1 * cosTilt)
  ];
}

function projectSpherePoint(
  x: number,
  y: number,
  z: number,
  time: number
): WorkingPoint {
  const yaw = time * 0.08;
  const tilt = 0.3 + (0.055 * Math.sin(time * 0.3));
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const x1 = (x * cosYaw) + (z * sinYaw);
  const z1 = (-x * sinYaw) + (z * cosYaw);
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);

  return [
    x1 * 0.405,
    ((y * cosTilt) - (z1 * sinTilt)) * 0.405,
    (y * sinTilt) + (z1 * cosTilt)
  ];
}

function projectSphereMeridian(
  amount: number,
  longitude: number,
  time: number
): WorkingPoint {
  const angle = (amount * TAU) - (Math.PI / 2);
  const sin = Math.sin(angle);

  return projectSpherePoint(
    sin * Math.cos(longitude),
    Math.cos(angle),
    sin * Math.sin(longitude),
    time
  );
}

function projectSphereLatitude(
  amount: number,
  latitude: number,
  time: number
): WorkingPoint {
  const angle = amount * TAU;
  const ringRadius = Math.cos(latitude);

  return projectSpherePoint(
    Math.cos(angle) * ringRadius,
    Math.sin(latitude),
    Math.sin(angle) * ringRadius,
    time
  );
}

export const drawContourWorking: ModeDraw = (ctx, size, t, dark, opts) => {
  // Resolve the exact same lane population as the classic working painter.
  const totalLanes = Math.max(4, Math.round(opts.orbitN ?? 12));
  const bandCount = Math.max(2, Math.round(opts.bandCount ?? 2));
  const lanesPerBand = Math.max(2, Math.round(totalLanes / bandCount));
  const particles = Math.max(1, Math.round(opts.particles ?? 5));
  const rs = radiusScale(size, opts.rsPow ?? 0.6);
  const painters: OrbPainter[] = [];

  // A rotating latitude/longitude cage carries spherical volume at every
  // supported size without relying on a fixed circular perimeter.
  const [meridianCount, latitudeCount] = denseGlobeLineCounts(size);

  for (let index = 0; index < meridianCount; index++) {
    const lane = index / Math.max(1, meridianCount - 1);
    const longitude = -Math.PI / 2 + (lane * Math.PI);
    const path: WorkingPath = (amount) => projectSphereMeridian(
      amount,
      longitude,
      t
    );

    painters.push(depthPainter(
      path,
      0.2 + (0.14 * (1 - Math.abs((lane * 2) - 1))),
      Math.max(0.38, size / 190)
    ));
  }

  for (let index = 0; index < latitudeCount; index++) {
    const latitude =
      -Math.PI / 2
      + (((index + 1) / (latitudeCount + 1)) * Math.PI);
    const path: WorkingPath = (amount) => projectSphereLatitude(
      amount,
      latitude,
      t
    );

    painters.push(depthPainter(
      path,
      0.22,
      Math.max(0.38, size / 190)
    ));
  }

  for (let band = 0; band < bandCount; band++) {
    for (let lane = 0; lane < lanesPerBand; lane++) {
      const edge = Math.abs(lane - ((lanesPerBand - 1) / 2))
        / Math.max(1, (lanesPerBand - 1) / 2);

      const path: WorkingPath = (amount) => projectWorkingBand(
        amount,
        band,
        lane,
        lanesPerBand,
        bandCount,
        t,
        opts.bandSpread ?? 0.064,
        opts.wobMul ?? 1
      );

      painters.push(depthPainter(
        path,
        0.48 + (0.32 * (1 - edge)) + (band * 0.04),
        Math.max(0.45, size / 145)
      ));
    }
  }

  // The moving cage and bands define the silhouette; no static ring is used.
  paintOrb(ctx, size, dark, painters, 0);

  // Place the classic state's active markers directly on the contour paths.
  for (let band = 0; band < bandCount; band++) {
    const direction = band % 2 === 0 ? 1 : -1;
    const phase = (band / bandCount) * Math.PI;

    for (let particle = 0; particle < particles; particle++) {
      const lane = particle % lanesPerBand;
      const angle =
        (t * (0.72 + (band * 0.08)) * direction)
        + ((particle / particles) * TAU)
        + phase;
      const [x, y, z] = projectWorkingBand(
        angle / TAU,
        band,
        lane,
        lanesPerBand,
        bandCount,
        t,
        opts.bandSpread ?? 0.064,
        opts.wobMul ?? 1
      );
      const depth = (z + 1) / 2;
      const white = Math.min(1, Math.max(0, 0.14 - (0.1 * depth)));
      const gray = Math.round((dark ? 1 - white : white) * 255);
      const nearRadius = (
        (opts.partR ?? 1.55)
        + (opts.partRDepth ?? 2.1)
      ) * rs;
      const markerRadius = nearRadius * (0.35 + (0.65 * depth));
      const markerAlpha = 0.42 + (0.58 * depth);

      ctx.fillStyle = `rgba(${gray},${gray},${gray},${markerAlpha})`;
      ctx.beginPath();
      ctx.arc(
        (size / 2) + (x * size),
        (size / 2) + (y * size),
        markerRadius,
        0,
        TAU
      );
      ctx.fill();
    }
  }
};

export const drawContourListening: ModeDraw = (ctx, size, t, dark, opts) => {
  const rings = Math.max(2, Math.round(opts.rings ?? 15));
  const painters: OrbPainter[] = [];

  for (let ring = 0; ring <= rings; ring++) {
    const latitude = -Math.PI / 2 + ((ring / rings) * Math.PI);
    const cosLatitude = Math.cos(latitude);
    const sinLatitude = Math.sin(latitude);
    const wave =
      (0.62 * Math.sin((t * 2.1) - (ring * 0.52)))
      + (0.38 * Math.sin((t * 1.27) + (ring * 0.83)));
    // Taper displacement near the poles so adjacent rings cannot overtake
    // each other at the silhouette. The 0.4 cap also leaves enough room for
    // the stroke width inside paintOrb's invisible 0.405 clipping edge.
    const edgeEnvelope = Math.pow(Math.abs(cosLatitude), 0.72);
    const radius = 0.4 * (
      0.92
      + (0.075 * wave * edgeEnvelope)
    );

    painters.push({
      path: (amount) => {
        const longitude = amount * TAU;
        const x =
          cosLatitude
          * Math.cos(longitude)
          * radius;
        const y = sinLatitude * radius;
        const z =
          cosLatitude
          * Math.sin(longitude)
          * radius;
        const yaw = t * 0.18;
        const tilt = 0.38;
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const x1 = (x * cosYaw) + (z * sinYaw);
        const z1 = (-x * sinYaw) + (z * cosYaw);
        const cosTilt = Math.cos(tilt);
        const sinTilt = Math.sin(tilt);

        return [
          x1,
          (y * cosTilt) - (z1 * sinTilt)
        ];
      },
      alpha: 0.42 + (0.38 * (ring / rings)),
      width: Math.max(0.42, size / 155)
    });
  }

  // The animated wave rings define the orb silhouette without an additional
  // perimeter, keeping the listening state light and responsive.
  paintOrb(ctx, size, dark, painters, 0);
};

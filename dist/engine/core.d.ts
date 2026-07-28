export interface Dot {
    x: number;
    y: number;
    z: number;
    r: number;
    /** Ink value: 0 = darkest ink on paper. Mirrored on dark themes. */
    white: number;
    a?: number;
    /** Allows intentional shimmer marks to exceed the shared base intensity. */
    shimmer?: boolean;
}
export declare const ORB_MAX_ALPHA = 0.72;
export declare const ORB_SHIMMER_MAX_ALPHA = 0.92;
export declare function capOrbAlpha(alpha: number, maximum?: number): number;
export type Projector = (x: number, y: number, z: number) => [number, number, number];
/** Deterministic hash in [0, 1). */
export declare function hashD(a: number, b: number): number;
/** Stable directions on a unit sphere (Fibonacci lattice). */
export declare function fibDir(i: number, n: number): [number, number, number];
/** Shortest signed angular distance, wrapped to (-π, π]. */
export declare function angleDelta(a: number, b: number): number;
/** Shared spin + tilt + orthographic projection. */
export declare function makeProj(yaw: number, tilt: number, cx: number, cy: number, scale: number): Projector;
/**
 * Painter: z-sort far→near, matte grayscale dots. On dark substrates the
 * ink value is mirrored (1 - white) so near dots read bright — the same
 * depth language on an inverted substrate.
 */
export declare function paint(ctx: CanvasRenderingContext2D, dots: Dot[], dark: boolean, rMin?: number): void;
/**
 * Dot radii were tuned for a 300pt frame; sub-linear scaling keeps small
 * spinners legible. Lower pow = radii shrink less with size.
 */
export declare function radiusScale(size: number, pow: number): number;

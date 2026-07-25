export const ORB_STATES = [
  'idle',
  'working',
  'connecting',
  'searching',
  'solving',
  'listening',
  'composing',
  'responding',
  'shaping'
] as const;

export const ORB_SIZES = [32, 64, 96, 128] as const;
export const ORB_THEMES = ['auto', 'dark', 'light'] as const;
export const ORB_VARIANTS = ['classic', 'contour'] as const;

export type OrbState = (typeof ORB_STATES)[number];
export type OrbSize = (typeof ORB_SIZES)[number];
export type OrbTheme = (typeof ORB_THEMES)[number];
export type OrbVariant = (typeof ORB_VARIANTS)[number];
export type ThinkingOrbTarget = HTMLCanvasElement | Element | string;

export interface ThinkingOrbOptions {
  /** Which AI activity animation to show. @default 'working' */
  state?: OrbState;

  /** Purpose-tuned canvas size in CSS pixels. @default 64 */
  size?: OrbSize;

  /** Explicit theme or automatic host/OS detection. @default 'auto' */
  theme?: OrbTheme;

  /** Visual treatment. Every state supports classic and contour. */
  variant?: OrbVariant;

  /** Multiplier applied to the state's tuned animation speed. @default 1 */
  speed?: number;

  /** Freeze the animation on its current frame. @default false */
  paused?: boolean;

  /** Enable smooth pointer-driven orb distortion. @default false */
  interactive?: boolean;

  /** Accessible label. Defaults to a label derived from the active state. */
  ariaLabel?: string | null;

  /** Optional class applied to a canvas created for a container target. */
  className?: string;
}

export interface ThinkingOrbSnapshot {
  state: OrbState;
  size: OrbSize;
  theme: OrbTheme;
  variant: OrbVariant;
  speed: number;
  paused: boolean;
  interactive: boolean;
  dark: boolean;
  reducedMotion: boolean;
  visible: boolean;
}

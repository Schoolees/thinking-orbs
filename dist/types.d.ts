export declare const ORB_STATES: readonly ["idle", "working", "connecting", "searching", "solving", "listening", "composing", "responding", "shaping"];
export declare const ORB_SIZES: readonly [32, 64, 96, 128];
export declare const ORB_THEMES: readonly ["auto", "dark", "light"];
export type OrbState = (typeof ORB_STATES)[number];
export type OrbSize = (typeof ORB_SIZES)[number];
export type OrbTheme = (typeof ORB_THEMES)[number];
export type ThinkingOrbTarget = HTMLCanvasElement | Element | string;
export interface ThinkingOrbOptions {
    /** Which AI activity animation to show. @default 'working' */
    state?: OrbState;
    /** Purpose-tuned canvas size in CSS pixels. @default 64 */
    size?: OrbSize;
    /** Explicit theme or automatic host/OS detection. @default 'auto' */
    theme?: OrbTheme;
    /** Multiplier applied to the state's tuned animation speed. @default 1 */
    speed?: number;
    /** Freeze the animation on its current frame. @default false */
    paused?: boolean;
    /** Accessible label. Defaults to a label derived from the active state. */
    ariaLabel?: string | null;
    /** Optional class applied to a canvas created for a container target. */
    className?: string;
}
export interface ThinkingOrbSnapshot {
    state: OrbState;
    size: OrbSize;
    theme: OrbTheme;
    speed: number;
    paused: boolean;
    dark: boolean;
    reducedMotion: boolean;
    visible: boolean;
}

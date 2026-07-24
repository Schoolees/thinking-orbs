import { ModeOpts } from './engine/profiles';
import { OrbSize, OrbState } from './types';
export type ModeKey = 'orbits' | 'globe' | 'rubik' | 'wave' | 'ribbon' | 'morph';
export declare const STATE_TO_MODE: Record<OrbState, ModeKey>;
export interface Resolved {
    mode: ModeKey;
    speed: number;
    opts: ModeOpts;
}
/** Resolve a (state, size) pair to its mode + fully-scaled draw options. */
export declare function resolvePreset(state: OrbState, size: OrbSize): Resolved;

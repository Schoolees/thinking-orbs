// The shipped tunings: nine states × four sizes, baked from the inkform
// mini-page tuning session. `count`/`size` are multipliers over the base
// fine profiles; `speed` multiplies the shared clock. Resolved once per
// (state, size) pair and cached — the render loop sees plain numbers.

import type { ModeOpts } from './engine/profiles';
import { BASE_PROFILES, scaleCounts, scaleRadii } from './engine/profiles';
import type { OrbSize, OrbState } from './types';

export type ModeKey =
  | 'idle'
  | 'orbits'
  | 'connecting'
  | 'globe'
  | 'rubik'
  | 'wave'
  | 'ribbon'
  | 'responding'
  | 'morph';

export const STATE_TO_MODE: Record<OrbState, ModeKey> = {
  idle: 'idle',
  working: 'orbits',
  connecting: 'connecting',
  searching: 'globe',
  solving: 'rubik',
  listening: 'wave',
  composing: 'ribbon',
  responding: 'responding',
  shaping: 'morph'
};

interface Preset {
  speed: number;
  count: number;
  size: number;
  /** Extra mode opts merged verbatim after scaling. */
  extra?: ModeOpts;
}

const PRESETS: Record<ModeKey, Record<OrbSize, Preset>> = {
  idle: {
    128: { speed: 0.72, count: 1.55, size: 0.95 },
    96: { speed: 0.76, count: 1.15, size: 0.98 },
    64: { speed: 0.8, count: 0.78, size: 1 },
    32: { speed: 1, count: 0.2, size: 1.95 }
  },
  orbits: {
    128: { speed: 1.7, count: 1.9, size: 0.92 },
    96: { speed: 1.8, count: 1.45, size: 0.96 },
    64: { speed: 1.885, count: 1, size: 1 },
    32: { speed: 3.9, count: 0.238, size: 2.4 }
  },
  connecting: {
    128: { speed: 2.15, count: 1.4, size: 0.94 },
    96: { speed: 2.3, count: 1.05, size: 0.97 },
    64: { speed: 2.4, count: 0.72, size: 1 },
    32: { speed: 3, count: 0.24, size: 1.85 }
  },
  globe: {
    128: { speed: 1.85, count: 0.95, size: 1.02, extra: { scanMul: 4.08, dimBase: 0.45 } },
    96: { speed: 1.95, count: 0.68, size: 1.08, extra: { scanMul: 4.08, dimBase: 0.45 } },
    64: { speed: 2.015, count: 0.42, size: 1.15, extra: { scanMul: 4.08, dimBase: 0.45 } },
    32: { speed: 2.665, count: 0.105, size: 1.75, extra: { scanMul: 4.335, dimBase: 0.45 } }
  },
  rubik: {
    128: { speed: 1.65, count: 0.82, size: 0.95 },
    96: { speed: 1.72, count: 0.58, size: 1 },
    64: { speed: 1.82, count: 0.35, size: 1.05 },
    32: { speed: 1.95, count: 0.088, size: 1.9 }
  },
  wave: {
    128: { speed: 3.8, count: 0.8, size: 0.92 },
    96: { speed: 4.05, count: 0.56, size: 0.96 },
    64: { speed: 4.388, count: 0.341, size: 1 },
    32: { speed: 3.998, count: 0.105, size: 1.6 }
  },
  ribbon: {
    128: { speed: 2.1, count: 0.65, size: 0.78, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    96: { speed: 2.2, count: 0.44, size: 0.82, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    64: { speed: 2.34, count: 0.25, size: 0.85, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    32: { speed: 3.12, count: 0.051, size: 1.073, extra: { spin: 0, bandMul: 4.94, wobMul: 1 } }
  },
  responding: {
    128: { speed: 2.2, count: 1.75, size: 0.92 },
    96: { speed: 2.35, count: 1.3, size: 0.96 },
    64: { speed: 2.5, count: 0.9, size: 1 },
    32: { speed: 3.1, count: 0.22, size: 1.8 }
  },
  morph: {
    128: { speed: 2.1, count: 1, size: 0.3, extra: { spread: 1.45 } },
    96: { speed: 2.25, count: 0.75, size: 0.34, extra: { spread: 1.45 } },
    64: { speed: 2.405, count: 0.54, size: 0.395, extra: { spread: 1.45 } },
    32: { speed: 2.08, count: 0.53, size: 1.011, extra: { spread: 1.45 } }
  }
};

export interface Resolved {
  mode: ModeKey;
  speed: number;
  opts: ModeOpts;
}

const cache = new Map<string, Resolved>();

/** Resolve a (state, size) pair to its mode + fully-scaled draw options. */
export function resolvePreset(state: OrbState, size: OrbSize): Resolved {
  const key = `${state}-${size}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const mode = STATE_TO_MODE[state];
  const preset = PRESETS[mode][size];
  let opts: ModeOpts = { ...BASE_PROFILES[mode] };
  if (preset.count !== 1) opts = scaleCounts(opts, preset.count);
  if (preset.size !== 1) opts = scaleRadii(opts, preset.size);
  if (preset.extra) opts = { ...opts, ...preset.extra };

  const resolved: Resolved = { mode, speed: preset.speed, opts };
  cache.set(key, resolved);
  return resolved;
}

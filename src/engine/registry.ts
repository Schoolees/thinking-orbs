// Mode key → frame painter. Kept separate from the presets so tree
// shaking can in principle drop unused modes in custom builds.

import type { ModeKey } from '../presets';
import type { ModeDraw } from './types';
import { drawGlobe, drawRubik, drawWave } from './lattice';
import {
  drawConnecting,
  drawIdle
} from './lifecycle';
import { drawMorph } from './morph';
import { drawOrbits } from './orbits';
import { drawResponding } from './responding';
import { drawRibbon } from './ribbon';

export const MODE_DRAWS: Record<ModeKey, ModeDraw> = {
  idle: drawIdle,
  orbits: drawOrbits,
  connecting: drawConnecting,
  globe: drawGlobe,
  rubik: drawRubik,
  wave: drawWave,
  ribbon: drawRibbon,
  responding: drawResponding,
  morph: drawMorph
};

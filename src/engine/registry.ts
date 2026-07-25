// Mode key → frame painter. The classic registry preserves the original orb
// family; contour alternatives are opt-in and intentionally limited.

import type { ModeKey } from '../presets';
import type { ModeDraw } from './types';
import {
  drawContourConnecting,
  drawContourGlobe,
  drawContourIdle,
  drawContourMorph,
  drawContourResponding,
  drawContourRibbon,
  drawContourRubik
} from './contour-family';
import {
  drawContourListening,
  drawContourWorking
} from './contours';
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

export const CONTOUR_MODE_DRAWS: Record<ModeKey, ModeDraw> = {
  idle: drawContourIdle,
  orbits: drawContourWorking,
  connecting: drawContourConnecting,
  globe: drawContourGlobe,
  rubik: drawContourRubik,
  wave: drawContourListening,
  ribbon: drawContourRibbon,
  responding: drawContourResponding,
  morph: drawContourMorph
};

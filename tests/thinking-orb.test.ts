import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONTOUR_MODE_DRAWS,
  ORB_SIZES,
  ORB_STATES,
  ThinkingOrb,
  defineThinkingOrb,
  resolvePreset,
  type ThinkingOrbElement
} from '../src';
import '../src/register';
import { canvasContextMock } from './setup';

describe('ThinkingOrb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-coreui-theme');
    document.body.replaceChildren();
  });

  it('creates an accessible canvas in a container', () => {
    const host = document.createElement('div');
    document.body.append(host);

    const orb = new ThinkingOrb(host, {
      state: 'searching',
      size: 32,
      theme: 'light',
      paused: true
    });

    expect(orb.canvas.parentElement).toBe(host);
    expect(orb.canvas.getAttribute('role')).toBe('img');
    expect(orb.canvas.getAttribute('aria-label')).toBe('Searching…');
    expect(orb.canvas.style.width).toBe('32px');
    expect(orb.canvas.width).toBe(32);
    expect(orb.snapshot).toMatchObject({
      state: 'searching',
      size: 32,
      theme: 'light',
      paused: true,
      dark: false
    });

    orb.destroy();

    expect(host.childElementCount).toBe(0);
  });

  it('updates all animation states without replacing the canvas', () => {
    const canvas = document.createElement('canvas');
    document.body.append(canvas);
    const orb = new ThinkingOrb(canvas, { paused: true });

    for (const state of ORB_STATES) {
      orb.setState(state).render(1);
      expect(orb.state).toBe(state);
      expect(canvas.dataset.thinkingOrbState).toBe(state);
    }

    expect(orb.canvas).toBe(canvas);
    orb.destroy();
    expect(canvas.isConnected).toBe(true);
  });

  it.each(['classic', 'contour'] as const)(
    'distorts and restores %s geometry through pointer interaction',
    (variant) => {
      const canvas = document.createElement('canvas');
      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        top: 0,
        right: 64,
        bottom: 64,
        left: 0,
        width: 64,
        height: 64,
        toJSON: () => ({})
      });
      const orb = new ThinkingOrb(canvas, {
        state: 'idle',
        size: 64,
        variant,
        interactive: true,
        paused: true
      });
      const geometryCalls = () => variant === 'classic'
        ? canvasContextMock.arc.mock.calls.map(([x, y]) => [x, y])
        : canvasContextMock.lineTo.mock.calls.map(([x, y]) => [x, y]);

      vi.clearAllMocks();
      orb.render(1);
      const restingGeometry = geometryCalls();

      vi.clearAllMocks();
      canvas.dispatchEvent(new MouseEvent('pointermove', {
        clientX: 18,
        clientY: 22
      }));
      const distortedGeometry = geometryCalls();

      expect(distortedGeometry).not.toEqual(restingGeometry);
      expect(orb.snapshot.interactive).toBe(true);
      expect(canvas.dataset.thinkingOrbInteractive).toBe('true');
      expect(canvas.style.cursor).toBe('crosshair');

      for (let index = 0; index < 60; index++) {
        canvas.dispatchEvent(new MouseEvent('pointerleave'));
      }

      vi.clearAllMocks();
      orb.render(1);
      const restoredGeometry = geometryCalls();
      const maximumDifference = Math.max(
        ...restoredGeometry.map(([x, y], index) => Math.hypot(
          x - restingGeometry[index][0],
          y - restingGeometry[index][1]
        ))
      );

      expect(maximumDifference).toBeLessThan(0.02);

      orb.destroy();
    }
  );

  it('keeps pointer distortion opt-in', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'idle',
      paused: true
    });

    vi.clearAllMocks();
    orb.render(1);
    const restingDots = canvasContextMock.arc.mock.calls.map(
      ([x, y]) => [x, y]
    );

    vi.clearAllMocks();
    canvas.dispatchEvent(new MouseEvent('pointermove', {
      clientX: 18,
      clientY: 22
    }));
    orb.render(1);

    expect(canvasContextMock.arc.mock.calls.map(
      ([x, y]) => [x, y]
    )).toEqual(restingDots);
    expect(canvas.dataset.thinkingOrbInteractive).toBe('false');

    orb.destroy();
  });

  it('renders every supported canvas size', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, { paused: true });

    for (const state of ORB_STATES) {
      for (const size of ORB_SIZES) {
        orb.update({ state, size }).render(1);
        expect(orb.state).toBe(state);
        expect(orb.size).toBe(size);
        expect(canvas.style.width).toBe(`${size}px`);
        expect(canvas.style.height).toBe(`${size}px`);
      }
    }

    orb.destroy();
  });

  it.each(ORB_STATES)(
    'renders a motion-matched contour variant for %s at every size',
    (state) => {
      const canvas = document.createElement('canvas');
      const orb = new ThinkingOrb(canvas, {
        state,
        theme: 'dark',
        variant: 'contour',
        paused: true
      });

      for (const size of ORB_SIZES) {
        orb.update({ size }).render(1);

        expect(canvasContextMock.moveTo).toHaveBeenCalled();
        expect(canvasContextMock.lineTo).toHaveBeenCalled();
        expect(canvasContextMock.stroke).toHaveBeenCalled();
        expect(orb.size).toBe(size);
      }

      expect(orb.variant).toBe('contour');
      expect(canvas.dataset.thinkingOrbVariant).toBe('contour');

      orb.destroy();
    }
  );

  it('provides a contour renderer for every classic mode', () => {
    expect(Object.keys(CONTOUR_MODE_DRAWS).sort()).toEqual([
      'connecting',
      'globe',
      'idle',
      'morph',
      'orbits',
      'responding',
      'ribbon',
      'rubik',
      'wave'
    ]);
  });

  it('keeps the searching contour anchored while its highlights shimmer', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'searching',
      size: 128,
      theme: 'dark',
      variant: 'contour',
      paused: true
    });

    orb.render(0);

    const firstCalls = canvasContextMock.moveTo.mock.calls;
    const anchoredLine = [...firstCalls[5]];
    const firstShimmer = [...firstCalls[firstCalls.length - 1]];

    vi.clearAllMocks();
    orb.render(1);

    const secondCalls = canvasContextMock.moveTo.mock.calls;
    const secondShimmer = secondCalls[secondCalls.length - 1];

    expect(secondCalls[5]).toEqual(anchoredLine);
    expect(secondShimmer).not.toEqual(firstShimmer);

    orb.destroy();
  });

  it.each([
    'working',
    'connecting',
    'composing',
    'responding'
  ] as const)(
    'rotates and tilts the %s contour globe lines',
    (state) => {
      const canvas = document.createElement('canvas');
      const orb = new ThinkingOrb(canvas, {
        state,
        size: 128,
        theme: 'dark',
        variant: 'contour',
        paused: true
      });

      orb.render(0);
      const [firstX, firstY] = canvasContextMock.moveTo.mock.calls[0];

      vi.clearAllMocks();
      orb.render(1);

      const [secondX, secondY] = canvasContextMock.moveTo.mock.calls[0];

      expect(Math.abs(secondX - firstX)).toBeGreaterThan(0.01);
      expect(Math.abs(secondY - firstY)).toBeGreaterThan(0.01);

      orb.destroy();
    }
  );

  it('uses exactly 25 clean ribbon lines for the responding contour', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'responding',
      size: 128,
      theme: 'dark',
      variant: 'contour',
      paused: true
    });

    vi.clearAllMocks();
    orb.render(1);

    // The 25 stable rear ribbons gain many short, independently shimmering
    // front-depth segments without adding another rotating highlight line.
    expect(canvasContextMock.stroke.mock.calls.length).toBeGreaterThan(150);

    orb.destroy();
  });

  it('applies responding-style globe density and depth to composing', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'composing',
      size: 128,
      theme: 'dark',
      variant: 'contour',
      paused: true
    });

    vi.clearAllMocks();
    orb.render(1);

    // Rear/front depth layers for 28 globe lines and 16 composing ribbons.
    expect(canvasContextMock.stroke).toHaveBeenCalledTimes(88);

    orb.destroy();
  });

  it('moves connecting contour dots on two inner globe grids', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'connecting',
      size: 128,
      theme: 'dark',
      variant: 'contour',
      paused: true
    });

    vi.clearAllMocks();
    orb.render(0);

    const firstMarkers = canvasContextMock.arc.mock.calls.map(
      ([x, y]) => [x, y]
    );
    const firstMarkerRadii = canvasContextMock.arc.mock.calls.map(
      ([, , radius]) => radius
    );

    expect(canvasContextMock.stroke).toHaveBeenCalledTimes(80);
    expect(canvasContextMock.fill).toHaveBeenCalledTimes(6);
    expect(firstMarkers).toHaveLength(6);
    expect(Math.max(...firstMarkerRadii)).toBeLessThanOrEqual(
      (128 / 54) + 0.001
    );
    expect(
      Math.max(...firstMarkerRadii) - Math.min(...firstMarkerRadii)
    ).toBeGreaterThan(0.5);

    vi.clearAllMocks();
    orb.render(1);

    const secondMarkers = canvasContextMock.arc.mock.calls.map(
      ([x, y]) => [x, y]
    );

    expect(canvasContextMock.stroke).toHaveBeenCalledTimes(80);
    expect(secondMarkers).not.toEqual(firstMarkers);

    orb.destroy();
  });

  it('keeps the classic orb variant as the default', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'working',
      paused: true
    });

    expect(orb.variant).toBe('classic');
    expect(canvas.dataset.thinkingOrbVariant).toBe('classic');
    expect(canvasContextMock.fill).toHaveBeenCalled();

    orb.destroy();
  });

  it('uses woven dual ribbons for the classic working orb', () => {
    expect(resolvePreset('working', 64).opts).toMatchObject({
      bandCount: 2,
      bandSpread: 0.064,
      wobMul: 1,
      ghostN: 30,
      rBase: 1.1,
      rDepth: 1.7,
      particles: 5,
      partR: 1.55,
      partRDepth: 2.1
    });

    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'working',
      variant: 'classic',
      paused: true
    });

    expect(() => orb.render(1)).not.toThrow();
    expect(canvasContextMock.fill).toHaveBeenCalled();

    orb.destroy();
  });

  it('aligns contour working markers to its woven line paths', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'working',
      size: 128,
      variant: 'contour',
      paused: true
    });

    vi.clearAllMocks();
    orb.render(1);

    expect(canvasContextMock.fill).toHaveBeenCalledTimes(10);
    expect(canvasContextMock.stroke).toHaveBeenCalledTimes(104);

    const opts = resolvePreset('working', 128).opts;
    const nearRadius = (
      (opts.partR ?? 1.55)
      + (opts.partRDepth ?? 2.1)
    ) * ((128 / 300) ** (opts.rsPow ?? 0.6));
    const sampledRadii: number[] = [];

    for (let time = 0; time <= 4; time += 0.5) {
      vi.clearAllMocks();
      orb.render(time);
      sampledRadii.push(
        ...canvasContextMock.arc.mock.calls
          .slice(-10)
          .map(([, , radius]) => radius)
      );
    }

    expect(Math.max(...sampledRadii)).toBeLessThanOrEqual(
      nearRadius + 0.001
    );
    expect(Math.max(...sampledRadii)).toBeGreaterThan(nearRadius * 0.95);
    expect(Math.min(...sampledRadii)).toBeLessThan(nearRadius * 0.55);

    orb.destroy();
  });

  it('preserves the contour working shell at inline size', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'working',
      size: 32,
      variant: 'contour',
      paused: true
    });

    vi.clearAllMocks();
    orb.render(1);

    expect(canvasContextMock.fill).toHaveBeenCalledTimes(10);
    expect(canvasContextMock.stroke).toHaveBeenCalledTimes(28);

    orb.destroy();
  });

  it('keeps the listening contour animated without an outer boundary', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'listening',
      size: 128,
      variant: 'contour',
      paused: true
    });
    const resolvedRings = resolvePreset('listening', 128).opts.rings ?? 15;
    const waveLineAt = (time: number) => {
      vi.clearAllMocks();
      orb.render(time);
      const calls = canvasContextMock.moveTo.mock.calls;

      expect(canvasContextMock.stroke).toHaveBeenCalledTimes(
        resolvedRings + 1
      );
      const points = [
        ...canvasContextMock.moveTo.mock.calls,
        ...canvasContextMock.lineTo.mock.calls
      ];
      const furthestPoint = Math.max(
        ...points.map(([x, y]) => Math.hypot(x - 64, y - 64))
      );

      expect(furthestPoint).toBeLessThanOrEqual((128 * 0.4) + 0.001);

      return calls[Math.floor(resolvedRings / 2)];
    };
    const first = waveLineAt(0);
    const second = waveLineAt(0.6);

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(Math.abs(first![0] - second![0])).toBeGreaterThan(0.5);

    orb.destroy();
  });

  it('connects each original listening dot ring with a contour line', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'listening',
      size: 64,
      variant: 'contour',
      paused: true
    });

    vi.clearAllMocks();
    orb.render(1);

    const resolvedRings = resolvePreset('listening', 64).opts.rings ?? 15;
    expect(canvasContextMock.stroke).toHaveBeenCalledTimes(
      resolvedRings + 1
    );

    orb.destroy();
  });

  it('renders responding as an outward wave state', () => {
    expect(ORB_STATES).toContain('responding');
    expect(resolvePreset('responding', 64)).toMatchObject({
      mode: 'responding',
      speed: 2.5
    });

    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'responding',
      paused: true
    });

    expect(canvas.getAttribute('aria-label')).toBe('Responding…');
    expect(() => orb.render(1)).not.toThrow();

    orb.destroy();
  });

  it('renders responding as shimmering ribbon wavefronts', () => {
    expect(resolvePreset('responding', 64).opts).toMatchObject({
      ribbonLineCount: 25,
      bandSpread: 0.075,
      wobMul: 1,
      dotDensity: 2.8,
      dotScale: 1.65,
      shimmerSpeed: 0.55
    });

    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'responding',
      variant: 'classic',
      paused: true
    });

    vi.clearAllMocks();
    expect(() => orb.render(1.4)).not.toThrow();
    expect(canvasContextMock.fill).toHaveBeenCalledTimes(494);
    const radii = canvasContextMock.arc.mock.calls.map((call) => call[2]);
    expect(new Set(radii.map((radius) => radius.toFixed(6))).size)
      .toBeGreaterThan(8);
    const centers = canvasContextMock.arc.mock.calls.map((call) => [
      call[0],
      call[1]
    ]);
    expect(Math.min(...centers.map(([x]) => x))).toBeLessThan(10);
    expect(Math.max(...centers.map(([x]) => x))).toBeGreaterThan(54);
    expect(Math.min(...centers.map(([, y]) => y))).toBeLessThan(10);
    expect(Math.max(...centers.map(([, y]) => y))).toBeGreaterThan(54);

    orb.destroy();
  });

  it('keeps the responding pulse continuous across its cycle seam', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'responding',
      size: 64,
      variant: 'classic',
      paused: true
    });
    const period = 1 / 0.17;
    const boundsAt = (time: number) => {
      vi.clearAllMocks();
      orb.render(time);
      const calls = canvasContextMock.arc.mock.calls;
      const xs = calls.map((call) => call[0]);
      const ys = calls.map((call) => call[1]);

      return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys)
      };
    };
    const before = boundsAt(period - 0.001);
    const after = boundsAt(period + 0.001);

    expect(Math.abs(before.minX - after.minX)).toBeLessThan(0.25);
    expect(Math.abs(before.maxX - after.maxX)).toBeLessThan(0.25);
    expect(Math.abs(before.minY - after.minY)).toBeLessThan(0.25);
    expect(Math.abs(before.maxY - after.maxY)).toBeLessThan(0.25);

    orb.destroy();
  });

  it.each([
    ['idle', 'idle', 'Ready'],
    ['connecting', 'connecting', 'Connecting…']
  ] as const)(
    'renders the %s lifecycle state',
    (state, mode, label) => {
      expect(ORB_STATES).toContain(state);
      expect(resolvePreset(state, 64).mode).toBe(mode);

      const canvas = document.createElement('canvas');
      const orb = new ThinkingOrb(canvas, {
        state,
        paused: true
      });

      expect(canvas.getAttribute('aria-label')).toBe(label);
      expect(() => orb.render(1)).not.toThrow();

      orb.destroy();
    }
  );

  it('builds the connecting orb from matching dotted globe grids', () => {
    expect(resolvePreset('connecting', 64).opts).toMatchObject({
      bodyRadius: 0.39,
      lobeRadius: 0.2,
      lobeGap: 0.17,
      gapPulse: 0.012,
      laneCount: 3,
      nodeMinSegments: 10,
      bridgeStrands: 3,
      signalSpeed: 0.28,
      pointN: 95,
      rBase: 1.1,
      rDepth: 1.8
    });

    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, {
      state: 'connecting',
      size: 64,
      variant: 'classic',
      paused: true
    });

    vi.clearAllMocks();
    orb.render(1);

    expect(canvasContextMock.fill).toHaveBeenCalledTimes(190);

    orb.destroy();
  });

  it('follows ancestor themes and supports explicit overrides', () => {
    const host = document.createElement('div');
    host.dataset.theme = 'dark';
    document.body.append(host);

    const orb = new ThinkingOrb(host, {
      theme: 'auto',
      paused: true
    });

    expect(orb.snapshot.dark).toBe(true);

    orb.setTheme('light');
    expect(orb.snapshot.dark).toBe(false);

    orb.destroy();
  });

  it('follows the CoreUI theme attribute', async () => {
    document.documentElement.setAttribute('data-coreui-theme', 'dark');
    const canvas = document.createElement('canvas');
    document.body.append(canvas);
    const orb = new ThinkingOrb(canvas, {
      theme: 'auto',
      paused: true
    });

    expect(orb.snapshot.dark).toBe(true);

    document.documentElement.setAttribute('data-coreui-theme', 'light');
    await new Promise((resolve) => window.setTimeout(resolve, 0));

    expect(orb.snapshot.dark).toBe(false);

    orb.destroy();
  });

  it('validates state, size, speed, and theme options', () => {
    const canvas = document.createElement('canvas');
    const orb = new ThinkingOrb(canvas, { paused: true });

    expect(() => orb.update({ state: 'dancing' as never })).toThrow(
      'Unknown ThinkingOrb state'
    );
    expect(() => orb.update({ size: 20 as never })).toThrow(
      'size must be 32, 64, 96, or 128'
    );
    expect(() => orb.setSpeed(0)).toThrow(
      'speed must be a positive number'
    );
    expect(() => orb.update({ theme: 'system' as never })).toThrow(
      'Unknown ThinkingOrb theme'
    );
    expect(() => orb.update({ variant: 'wire' as never })).toThrow(
      'Unknown ThinkingOrb variant'
    );

    orb.destroy();
  });

  it('registers a reactive custom element', () => {
    expect(customElements.get('thinking-orb')).toBe(defineThinkingOrb());

    const element = document.createElement('thinking-orb') as ThinkingOrbElement;
    element.setAttribute('state', 'listening');
    element.setAttribute('size', '32');
    element.setAttribute('theme', 'light');
    element.setAttribute('variant', 'contour');
    element.setAttribute('interactive', '');
    document.body.append(element);

    expect(element.orb?.state).toBe('listening');
    expect(element.orb?.size).toBe(32);
    expect(element.orb?.variant).toBe('contour');
    expect(element.orb?.interactive).toBe(true);
    expect(element.querySelector('canvas')).not.toBeNull();

    element.state = 'composing';
    element.paused = true;
    element.interactive = false;

    expect(element.orb?.state).toBe('composing');
    expect(element.orb?.paused).toBe(true);
    expect(element.orb?.interactive).toBe(false);

    element.remove();
    expect(element.orb).toBeNull();
  });
});

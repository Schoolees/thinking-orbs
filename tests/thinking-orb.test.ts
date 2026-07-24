import { beforeEach, describe, expect, it } from 'vitest';
import {
  ORB_SIZES,
  ORB_STATES,
  ThinkingOrb,
  defineThinkingOrb,
  resolvePreset,
  type ThinkingOrbElement
} from '../src';
import '../src/register';

describe('ThinkingOrb', () => {
  beforeEach(() => {
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
      size: 20,
      theme: 'light',
      paused: true
    });

    expect(orb.canvas.parentElement).toBe(host);
    expect(orb.canvas.getAttribute('role')).toBe('img');
    expect(orb.canvas.getAttribute('aria-label')).toBe('Searching…');
    expect(orb.canvas.style.width).toBe('20px');
    expect(orb.canvas.width).toBe(20);
    expect(orb.snapshot).toMatchObject({
      state: 'searching',
      size: 20,
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

  it('keeps the connecting lobes visually prominent', () => {
    expect(resolvePreset('connecting', 64).opts).toMatchObject({
      lobeRadius: 0.32,
      lobeGap: 0.16,
      gapPulse: 0.01
    });
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
    expect(() => orb.update({ size: 32 as never })).toThrow(
      'size must be 20, 64, 96, or 128'
    );
    expect(() => orb.setSpeed(0)).toThrow(
      'speed must be a positive number'
    );
    expect(() => orb.update({ theme: 'system' as never })).toThrow(
      'Unknown ThinkingOrb theme'
    );

    orb.destroy();
  });

  it('registers a reactive custom element', () => {
    expect(customElements.get('thinking-orb')).toBe(defineThinkingOrb());

    const element = document.createElement('thinking-orb') as ThinkingOrbElement;
    element.setAttribute('state', 'listening');
    element.setAttribute('size', '20');
    element.setAttribute('theme', 'light');
    document.body.append(element);

    expect(element.orb?.state).toBe('listening');
    expect(element.orb?.size).toBe(20);
    expect(element.querySelector('canvas')).not.toBeNull();

    element.state = 'composing';
    element.paused = true;

    expect(element.orb?.state).toBe('composing');
    expect(element.orb?.paused).toBe(true);

    element.remove();
    expect(element.orb).toBeNull();
  });
});

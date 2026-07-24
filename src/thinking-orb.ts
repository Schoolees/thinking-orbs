import { MODE_DRAWS } from './engine/registry';
import { resolvePreset } from './presets';
import { addMediaListener, resolveDark } from './theme';
import {
  ORB_SIZES,
  ORB_STATES,
  ORB_THEMES,
  type OrbSize,
  type OrbState,
  type OrbTheme,
  type ThinkingOrbOptions,
  type ThinkingOrbSnapshot,
  type ThinkingOrbTarget
} from './types';

const DEFAULT_LABELS: Record<OrbState, string> = {
  idle: 'Ready',
  working: 'Working…',
  connecting: 'Connecting…',
  searching: 'Searching…',
  solving: 'Solving…',
  listening: 'Listening…',
  composing: 'Composing…',
  responding: 'Responding…',
  shaping: 'Shaping…'
};

function includesValue<T>(values: readonly T[], value: unknown): value is T {
  return values.includes(value as T);
}

function resolveTarget(target: ThinkingOrbTarget): {
  canvas: HTMLCanvasElement;
  createdCanvas: boolean;
} {
  const resolved = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (!resolved) {
    throw new Error('ThinkingOrb target was not found.');
  }

  if (resolved instanceof HTMLCanvasElement) {
    return { canvas: resolved, createdCanvas: false };
  }

  const canvas = document.createElement('canvas');
  canvas.dataset.thinkingOrbCanvas = '';
  resolved.append(canvas);

  return { canvas, createdCanvas: true };
}

function requestFrame(callback: FrameRequestCallback): number {
  return typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(callback)
    : window.setTimeout(() => callback(performance.now()), 16);
}

function cancelFrame(handle: number): void {
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(handle);
    return;
  }

  window.clearTimeout(handle);
}

export class ThinkingOrb {
  readonly canvas: HTMLCanvasElement;

  private readonly createdCanvas: boolean;
  private readonly context: CanvasRenderingContext2D;
  private stateValue: OrbState = 'working';
  private sizeValue: OrbSize = 64;
  private themeValue: OrbTheme = 'auto';
  private speedValue = 1;
  private pausedValue = false;
  private customAriaLabel: string | null = null;
  private darkValue = true;
  private reducedMotionValue = false;
  private visibleValue = true;
  private destroyed = false;
  private running = false;
  private frameHandle = 0;
  private intersectionObserver: IntersectionObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private removeDarkMediaListener: () => void = () => undefined;
  private removeMotionMediaListener: () => void = () => undefined;

  private readonly onVisibilityChange = (): void => {
    this.syncAnimation();
  };

  private readonly onThemeChange = (): void => {
    const nextDark = resolveDark(this.themeValue, this.canvas);

    if (nextDark === this.darkValue) {
      return;
    }

    this.darkValue = nextDark;
    this.render();
  };

  private readonly onReducedMotionChange = (event: MediaQueryListEvent): void => {
    this.reducedMotionValue = event.matches;
    this.render();
    this.syncAnimation();
  };

  constructor(target: ThinkingOrbTarget, options: ThinkingOrbOptions = {}) {
    if (typeof document === 'undefined') {
      throw new Error('ThinkingOrb requires a browser DOM.');
    }

    const { canvas, createdCanvas } = resolveTarget(target);
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('ThinkingOrb requires CanvasRenderingContext2D support.');
    }

    this.canvas = canvas;
    this.createdCanvas = createdCanvas;
    this.context = context;

    if (options.className && createdCanvas) {
      canvas.className = options.className;
    }

    this.setupObservers();
    this.update(options);
  }

  get state(): OrbState {
    return this.stateValue;
  }

  get size(): OrbSize {
    return this.sizeValue;
  }

  get theme(): OrbTheme {
    return this.themeValue;
  }

  get speed(): number {
    return this.speedValue;
  }

  get paused(): boolean {
    return this.pausedValue;
  }

  get snapshot(): ThinkingOrbSnapshot {
    return {
      state: this.stateValue,
      size: this.sizeValue,
      theme: this.themeValue,
      speed: this.speedValue,
      paused: this.pausedValue,
      dark: this.darkValue,
      reducedMotion: this.reducedMotionValue,
      visible: this.visibleValue
    };
  }

  update(options: ThinkingOrbOptions = {}): this {
    this.assertActive();

    if (options.state !== undefined) {
      if (!includesValue(ORB_STATES, options.state)) {
        throw new TypeError(`Unknown ThinkingOrb state: ${String(options.state)}`);
      }

      this.stateValue = options.state;
    }

    if (options.size !== undefined) {
      if (!includesValue(ORB_SIZES, options.size)) {
        throw new TypeError('ThinkingOrb size must be 32, 64, 96, or 128.');
      }

      this.sizeValue = options.size;
    }

    if (options.theme !== undefined) {
      if (!includesValue(ORB_THEMES, options.theme)) {
        throw new TypeError(`Unknown ThinkingOrb theme: ${String(options.theme)}`);
      }

      this.themeValue = options.theme;
    }

    if (options.speed !== undefined) {
      if (!Number.isFinite(options.speed) || options.speed <= 0) {
        throw new TypeError('ThinkingOrb speed must be a positive number.');
      }

      this.speedValue = options.speed;
    }

    if (options.paused !== undefined) {
      this.pausedValue = Boolean(options.paused);
    }

    if ('ariaLabel' in options) {
      this.customAriaLabel = options.ariaLabel?.trim() || null;
    }

    this.darkValue = resolveDark(this.themeValue, this.canvas);
    this.configureCanvas();
    this.render();
    this.syncAnimation();

    return this;
  }

  setState(state: OrbState): this {
    return this.update({ state });
  }

  setTheme(theme: OrbTheme): this {
    return this.update({ theme });
  }

  setSpeed(speed: number): this {
    return this.update({ speed });
  }

  pause(): this {
    return this.update({ paused: true });
  }

  resume(): this {
    return this.update({ paused: false });
  }

  render(timeSeconds?: number): this {
    this.assertActive();
    this.resizeBackingStore();

    const { mode, speed: baseSpeed, opts } = resolvePreset(
      this.stateValue,
      this.sizeValue
    );
    const effectiveTime = timeSeconds
      ?? (this.reducedMotionValue
        ? 0.6
        : (performance.now() / 1000) * baseSpeed * this.speedValue);
    const dpr = this.getDevicePixelRatio();

    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.context.clearRect(0, 0, this.sizeValue, this.sizeValue);
    MODE_DRAWS[mode](
      this.context,
      this.sizeValue,
      effectiveTime,
      this.darkValue,
      opts
    );

    return this;
  }

  destroy(options: { removeCanvas?: boolean } = {}): void {
    if (this.destroyed) {
      return;
    }

    this.stop();
    this.intersectionObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.removeDarkMediaListener();
    this.removeMotionMediaListener();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    if ((options.removeCanvas ?? this.createdCanvas) && this.canvas.isConnected) {
      this.canvas.remove();
    }

    this.destroyed = true;
  }

  private setupObservers(): void {
    const darkQuery = typeof matchMedia === 'function'
      ? matchMedia('(prefers-color-scheme: dark)')
      : null;
    const motionQuery = typeof matchMedia === 'function'
      ? matchMedia('(prefers-reduced-motion: reduce)')
      : null;

    this.reducedMotionValue = motionQuery?.matches ?? false;
    this.removeDarkMediaListener = addMediaListener(
      darkQuery,
      this.onThemeChange
    );
    this.removeMotionMediaListener = addMediaListener(
      motionQuery,
      this.onReducedMotionChange
    );

    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(this.onThemeChange);
      this.mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-coreui-theme'],
        subtree: true
      });
    }

    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.visibleValue = entry?.isIntersecting ?? true;
        this.syncAnimation();
      });
      this.intersectionObserver.observe(this.canvas);
    }

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private configureCanvas(): void {
    this.canvas.dataset.thinkingOrbState = this.stateValue;
    this.canvas.dataset.thinkingOrbTheme = this.themeValue;
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute(
      'aria-label',
      this.customAriaLabel ?? DEFAULT_LABELS[this.stateValue]
    );
    this.canvas.style.width = `${this.sizeValue}px`;
    this.canvas.style.height = `${this.sizeValue}px`;
    this.canvas.style.display = 'block';
  }

  private resizeBackingStore(): void {
    const dpr = this.getDevicePixelRatio();
    const width = Math.round(this.sizeValue * dpr);

    if (this.canvas.width !== width) {
      this.canvas.width = width;
    }

    if (this.canvas.height !== width) {
      this.canvas.height = width;
    }
  }

  private getDevicePixelRatio(): number {
    return Math.min(2, window.devicePixelRatio || 1);
  }

  private syncAnimation(): void {
    if (this.shouldAnimate()) {
      this.start();
      return;
    }

    this.stop();
  }

  private shouldAnimate(): boolean {
    return !this.destroyed
      && !this.pausedValue
      && !this.reducedMotionValue
      && this.visibleValue
      && document.visibilityState !== 'hidden';
  }

  private start(): void {
    if (this.running) {
      return;
    }

    this.running = true;

    const loop = (): void => {
      if (!this.running) {
        return;
      }

      this.render();
      this.frameHandle = requestFrame(loop);
    };

    this.frameHandle = requestFrame(loop);
  }

  private stop(): void {
    this.running = false;
    cancelFrame(this.frameHandle);
  }

  private assertActive(): void {
    if (this.destroyed) {
      throw new Error('ThinkingOrb has been destroyed.');
    }
  }
}

export function createThinkingOrb(
  target: ThinkingOrbTarget,
  options: ThinkingOrbOptions = {}
): ThinkingOrb {
  return new ThinkingOrb(target, options);
}

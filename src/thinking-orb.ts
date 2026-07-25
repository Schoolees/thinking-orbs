import { CONTOUR_MODE_DRAWS, MODE_DRAWS } from './engine/registry';
import { resolvePreset } from './presets';
import { addMediaListener, resolveDark } from './theme';
import {
  ORB_SIZES,
  ORB_STATES,
  ORB_THEMES,
  ORB_VARIANTS,
  type OrbSize,
  type OrbState,
  type OrbTheme,
  type OrbVariant,
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

type DistortedPoint = readonly [number, number, number];
type PointDistorter = (x: number, y: number) => DistortedPoint;
type PendingArc = readonly [
  number,
  number,
  number,
  number,
  number,
  boolean | undefined
];

function createDistortionContext(
  context: CanvasRenderingContext2D,
  distort: PointDistorter
): CanvasRenderingContext2D {
  let pendingArcs: PendingArc[] = [];
  const flushArcs = (mode: 'draw' | 'clip'): void => {
    for (const [
      x,
      y,
      radius,
      startAngle,
      endAngle,
      counterclockwise
    ] of pendingArcs) {
      if (mode === 'clip') {
        context.arc(
          x,
          y,
          radius * 1.14,
          startAngle,
          endAngle,
          counterclockwise ?? false
        );
        continue;
      }

      const [nextX, nextY, influence] = distort(x, y);
      context.arc(
        nextX,
        nextY,
        radius * (1 + (0.16 * influence)),
        startAngle,
        endAngle,
        counterclockwise ?? false
      );
    }

    pendingArcs = [];
  };

  return new Proxy(context, {
    get(target, property) {
      if (property === 'beginPath') {
        return (): void => {
          pendingArcs = [];
          target.beginPath();
        };
      }
      if (property === 'moveTo') {
        return (x: number, y: number): void => {
          const [nextX, nextY] = distort(x, y);
          target.moveTo(nextX, nextY);
        };
      }
      if (property === 'lineTo') {
        return (x: number, y: number): void => {
          const [nextX, nextY] = distort(x, y);
          target.lineTo(nextX, nextY);
        };
      }
      if (property === 'arc') {
        return (
          x: number,
          y: number,
          radius: number,
          startAngle: number,
          endAngle: number,
          counterclockwise?: boolean
        ): void => {
          pendingArcs.push([
            x,
            y,
            radius,
            startAngle,
            endAngle,
            counterclockwise
          ]);
        };
      }
      if (property === 'fill') {
        return (): void => {
          flushArcs('draw');
          target.fill();
        };
      }
      if (property === 'stroke') {
        return (): void => {
          flushArcs('draw');
          target.stroke();
        };
      }
      if (property === 'clip') {
        return (): void => {
          flushArcs('clip');
          target.clip();
        };
      }

      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
    set(target, property, value) {
      return Reflect.set(target, property, value, target);
    }
  }) as CanvasRenderingContext2D;
}

export class ThinkingOrb {
  readonly canvas: HTMLCanvasElement;

  private readonly createdCanvas: boolean;
  private readonly context: CanvasRenderingContext2D;
  private readonly distortionContext: CanvasRenderingContext2D;
  private stateValue: OrbState = 'working';
  private sizeValue: OrbSize = 64;
  private themeValue: OrbTheme = 'auto';
  private variantValue: OrbVariant = 'classic';
  private speedValue = 1;
  private pausedValue = false;
  private interactiveValue = false;
  private customAriaLabel: string | null = null;
  private darkValue = true;
  private reducedMotionValue = false;
  private visibleValue = true;
  private destroyed = false;
  private running = false;
  private frameHandle = 0;
  private lastRenderedTime = 0.6;
  private pointerX = 32;
  private pointerY = 32;
  private pointerStrength = 0;
  private pointerTargetX = 32;
  private pointerTargetY = 32;
  private pointerTargetStrength = 0;
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
    if (event.matches) {
      this.pointerStrength = 0;
      this.pointerTargetStrength = 0;
    }
    this.render();
    this.syncAnimation();
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.interactiveValue || this.reducedMotionValue) {
      return;
    }

    const bounds = this.canvas.getBoundingClientRect();
    const width = bounds.width || this.sizeValue;
    const height = bounds.height || this.sizeValue;
    this.pointerTargetX = Math.min(
      this.sizeValue,
      Math.max(0, ((event.clientX - bounds.left) / width) * this.sizeValue)
    );
    this.pointerTargetY = Math.min(
      this.sizeValue,
      Math.max(0, ((event.clientY - bounds.top) / height) * this.sizeValue)
    );
    this.pointerTargetStrength = 1;
    this.stepInteraction();
    this.render(this.pausedValue ? this.lastRenderedTime : undefined);
    this.syncAnimation();
  };

  private readonly onPointerLeave = (): void => {
    if (!this.interactiveValue) {
      return;
    }

    this.pointerTargetStrength = 0;
    this.stepInteraction();
    this.render(this.pausedValue ? this.lastRenderedTime : undefined);
    this.syncAnimation();
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!this.interactiveValue || this.reducedMotionValue) {
      return;
    }

    if (event.pointerType !== 'mouse') {
      event.preventDefault();
    }
    this.canvas.setPointerCapture?.(event.pointerId);
    this.onPointerMove(event);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    this.canvas.releasePointerCapture?.(event.pointerId);

    if (event.pointerType !== 'mouse') {
      this.onPointerLeave();
    }
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
    this.distortionContext = createDistortionContext(
      context,
      (x, y) => this.distortPoint(x, y)
    );

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

  get variant(): OrbVariant {
    return this.variantValue;
  }

  get speed(): number {
    return this.speedValue;
  }

  get paused(): boolean {
    return this.pausedValue;
  }

  get interactive(): boolean {
    return this.interactiveValue;
  }

  get snapshot(): ThinkingOrbSnapshot {
    return {
      state: this.stateValue,
      size: this.sizeValue,
      theme: this.themeValue,
      variant: this.variantValue,
      speed: this.speedValue,
      paused: this.pausedValue,
      interactive: this.interactiveValue,
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

    if (options.variant !== undefined) {
      if (!includesValue(ORB_VARIANTS, options.variant)) {
        throw new TypeError(`Unknown ThinkingOrb variant: ${String(options.variant)}`);
      }

      this.variantValue = options.variant;
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

    if (options.interactive !== undefined) {
      this.interactiveValue = Boolean(options.interactive);

      if (!this.interactiveValue) {
        this.pointerStrength = 0;
        this.pointerTargetStrength = 0;
      }
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

  setVariant(variant: OrbVariant): this {
    return this.update({ variant });
  }

  setSpeed(speed: number): this {
    return this.update({ speed });
  }

  setInteractive(interactive: boolean): this {
    return this.update({ interactive });
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
    const drawContext = (
      this.interactiveValue
      && !this.reducedMotionValue
      && this.pointerStrength > 0.001
    )
      ? this.distortionContext
      : this.context;

    this.lastRenderedTime = effectiveTime;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.context.clearRect(0, 0, this.sizeValue, this.sizeValue);
    const draw = this.variantValue === 'contour'
      ? CONTOUR_MODE_DRAWS[mode] ?? MODE_DRAWS[mode]
      : MODE_DRAWS[mode];

    draw(
      drawContext,
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
    this.canvas.removeEventListener('pointerenter', this.onPointerMove);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.canvas.removeEventListener('pointercancel', this.onPointerLeave);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);

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
    this.canvas.addEventListener('pointerenter', this.onPointerMove);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerleave', this.onPointerLeave);
    this.canvas.addEventListener('pointercancel', this.onPointerLeave);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
  }

  private configureCanvas(): void {
    this.canvas.dataset.thinkingOrbState = this.stateValue;
    this.canvas.dataset.thinkingOrbTheme = this.themeValue;
    this.canvas.dataset.thinkingOrbVariant = this.variantValue;
    this.canvas.dataset.thinkingOrbInteractive = String(this.interactiveValue);
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute(
      'aria-label',
      this.customAriaLabel ?? DEFAULT_LABELS[this.stateValue]
    );
    this.canvas.style.width = `${this.sizeValue}px`;
    this.canvas.style.height = `${this.sizeValue}px`;
    this.canvas.style.display = 'block';
    this.canvas.style.cursor = this.interactiveValue ? 'crosshair' : '';
    this.canvas.style.touchAction = this.interactiveValue ? 'none' : '';
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
    const baseAnimation = !this.pausedValue && !this.reducedMotionValue;
    const pointerAnimation = this.interactionNeedsFrame();

    return !this.destroyed
      && this.visibleValue
      && document.visibilityState !== 'hidden'
      && (baseAnimation || pointerAnimation);
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

      this.stepInteraction();
      this.render(
        this.pausedValue || this.reducedMotionValue
          ? this.lastRenderedTime
          : undefined
      );

      if (!this.shouldAnimate()) {
        this.running = false;
        return;
      }

      this.frameHandle = requestFrame(loop);
    };

    this.frameHandle = requestFrame(loop);
  }

  private stop(): void {
    this.running = false;
    cancelFrame(this.frameHandle);
  }

  private stepInteraction(): void {
    const positionEase = 0.2;
    const strengthEase = this.pointerTargetStrength > this.pointerStrength
      ? 0.24
      : 0.14;

    this.pointerX += (this.pointerTargetX - this.pointerX) * positionEase;
    this.pointerY += (this.pointerTargetY - this.pointerY) * positionEase;
    this.pointerStrength += (
      this.pointerTargetStrength - this.pointerStrength
    ) * strengthEase;

    if (Math.abs(this.pointerStrength) < 0.0005) {
      this.pointerStrength = 0;
    }
  }

  private interactionNeedsFrame(): boolean {
    if (!this.interactiveValue || this.reducedMotionValue) {
      return false;
    }

    return this.pointerTargetStrength > 0.001
      || this.pointerStrength > 0.001
      || Math.abs(this.pointerTargetX - this.pointerX) > 0.05
      || Math.abs(this.pointerTargetY - this.pointerY) > 0.05;
  }

  private distortPoint(x: number, y: number): DistortedPoint {
    const deltaX = x - this.pointerX;
    const deltaY = y - this.pointerY;
    const distance = Math.hypot(deltaX, deltaY);
    const radius = this.sizeValue * 0.55;

    if (
      this.pointerStrength <= 0.001
      || distance >= radius
      || distance <= 0.0001
    ) {
      return [x, y, 0];
    }

    const normalized = 1 - (distance / radius);
    const influence =
      normalized
      * normalized
      * (3 - (2 * normalized))
      * this.pointerStrength;
    const directionX = deltaX / distance;
    const directionY = deltaY / distance;
    const push = this.sizeValue * 0.105 * influence;
    const twist = this.sizeValue * 0.018 * influence;

    return [
      x + (directionX * push) - (directionY * twist),
      y + (directionY * push) + (directionX * twist),
      influence
    ];
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

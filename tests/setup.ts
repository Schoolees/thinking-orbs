import { vi } from 'vitest';

export const canvasContextMock = {
  beginPath: vi.fn(),
  arc: vi.fn(),
  clip: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  restore: vi.fn(),
  save: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  setTransform: vi.fn(),
  fillStyle: '',
  lineCap: 'butt',
  lineJoin: 'miter',
  lineWidth: 1,
  strokeStyle: ''
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: vi.fn(() => canvasContextMock)
});

Object.defineProperty(window, 'devicePixelRatio', {
  configurable: true,
  value: 1
});

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

Object.defineProperty(window, 'requestAnimationFrame', {
  configurable: true,
  value: vi.fn(() => 1)
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  configurable: true,
  value: vi.fn()
});

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];

  constructor(
    private readonly callback: IntersectionObserverCallback
  ) {}

  disconnect = vi.fn();
  observe = vi.fn((target: Element) => {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this
    );
  });
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  configurable: true,
  value: IntersectionObserverMock
});

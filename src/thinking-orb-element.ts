import { ThinkingOrb } from './thinking-orb';
import {
  ORB_SIZES,
  ORB_STATES,
  ORB_THEMES,
  ORB_VARIANTS,
  type OrbSize,
  type OrbState,
  type OrbTheme,
  type OrbVariant,
  type ThinkingOrbOptions
} from './types';

const HTMLElementBase = (
  typeof globalThis.HTMLElement === 'undefined'
    ? class {}
    : globalThis.HTMLElement
) as typeof HTMLElement;

function stateAttribute(value: string | null): OrbState {
  return ORB_STATES.includes(value as OrbState)
    ? value as OrbState
    : 'working';
}

function sizeAttribute(value: string | null): OrbSize {
  const size = Number(value);

  return ORB_SIZES.includes(size as OrbSize)
    ? size as OrbSize
    : 64;
}

function themeAttribute(value: string | null): OrbTheme {
  return ORB_THEMES.includes(value as OrbTheme)
    ? value as OrbTheme
    : 'auto';
}

function variantAttribute(value: string | null): OrbVariant {
  return ORB_VARIANTS.includes(value as OrbVariant)
    ? value as OrbVariant
    : 'classic';
}

function speedAttribute(value: string | null): number {
  const speed = Number(value);

  return Number.isFinite(speed) && speed > 0 ? speed : 1;
}

export class ThinkingOrbElement extends HTMLElementBase {
  static readonly observedAttributes = [
    'state',
    'size',
    'theme',
    'variant',
    'speed',
    'paused',
    'interactive',
    'aria-label'
  ];

  private controller: ThinkingOrb | null = null;

  connectedCallback(): void {
    if (this.controller || !(this instanceof HTMLElement)) {
      return;
    }

    this.style.display ||= 'inline-block';
    this.style.lineHeight ||= '0';
    this.style.verticalAlign ||= 'middle';

    const canvas = document.createElement('canvas');
    canvas.dataset.thinkingOrbCanvas = '';
    this.replaceChildren(canvas);
    this.controller = new ThinkingOrb(canvas, this.readOptions());
  }

  disconnectedCallback(): void {
    this.controller?.destroy({ removeCanvas: false });
    this.controller = null;
  }

  attributeChangedCallback(): void {
    this.controller?.update(this.readOptions());
  }

  get orb(): ThinkingOrb | null {
    return this.controller;
  }

  get state(): OrbState {
    return stateAttribute(this.getAttribute('state'));
  }

  set state(value: OrbState) {
    this.setAttribute('state', value);
  }

  get variant(): OrbVariant {
    return variantAttribute(this.getAttribute('variant'));
  }

  set variant(value: OrbVariant) {
    this.setAttribute('variant', value);
  }

  get paused(): boolean {
    return this.hasAttribute('paused');
  }

  set paused(value: boolean) {
    this.toggleAttribute('paused', value);
  }

  get interactive(): boolean {
    return this.hasAttribute('interactive');
  }

  set interactive(value: boolean) {
    this.toggleAttribute('interactive', value);
  }

  private readOptions(): ThinkingOrbOptions {
    return {
      state: stateAttribute(this.getAttribute('state')),
      size: sizeAttribute(this.getAttribute('size')),
      theme: themeAttribute(this.getAttribute('theme')),
      variant: variantAttribute(this.getAttribute('variant')),
      speed: speedAttribute(this.getAttribute('speed')),
      paused: this.hasAttribute('paused'),
      interactive: this.hasAttribute('interactive'),
      ariaLabel: this.getAttribute('aria-label')
    };
  }
}

export function defineThinkingOrb(tagName = 'thinking-orb'): typeof ThinkingOrbElement {
  if (!tagName.includes('-')) {
    throw new TypeError('A custom-element name must contain a hyphen.');
  }

  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, ThinkingOrbElement);
  }

  return ThinkingOrbElement;
}

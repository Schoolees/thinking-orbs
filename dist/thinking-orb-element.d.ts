import { ThinkingOrb } from './thinking-orb';
import { OrbState, OrbVariant } from './types';
declare const HTMLElementBase: typeof HTMLElement;
export declare class ThinkingOrbElement extends HTMLElementBase {
    static readonly observedAttributes: string[];
    private controller;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    get orb(): ThinkingOrb | null;
    get state(): OrbState;
    set state(value: OrbState);
    get variant(): OrbVariant;
    set variant(value: OrbVariant);
    get paused(): boolean;
    set paused(value: boolean);
    get interactive(): boolean;
    set interactive(value: boolean);
    private readOptions;
}
export declare function defineThinkingOrb(tagName?: string): typeof ThinkingOrbElement;
export {};

import { OrbTheme } from './types';
export declare function ancestorTheme(element: Element | null): boolean | null;
export declare function systemPrefersDark(): boolean;
export declare function resolveDark(theme: OrbTheme, element: Element | null): boolean;
export declare function addMediaListener(mediaQuery: MediaQueryList | null, listener: (event: MediaQueryListEvent) => void): () => void;

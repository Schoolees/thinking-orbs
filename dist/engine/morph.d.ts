import { ModeDraw } from './types';
interface MorphOutline {
    points: Array<[number, number]>;
    pulse: number;
}
export declare function resolveMorphOutline(t: number, o: Record<string, number | undefined>): MorphOutline;
export declare const drawMorph: ModeDraw;
export {};

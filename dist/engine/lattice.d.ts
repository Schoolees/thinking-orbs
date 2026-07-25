import { ModeDraw } from './types';
export interface Move {
    axis: 0 | 1 | 2;
    lo: number;
    hi: number;
    ang: number;
}
export declare function solveCycle(time: number, count: number, slotDur: number, rest: number): {
    amount: number[];
    active: number;
};
export declare function applyMoves(pt3: [number, number, number], moves: Move[], sc: {
    amount: number[];
    active: number;
}): [number, number, number, boolean];
export declare function makeMoves(count: number): Move[];
export declare const drawGlobe: ModeDraw;
export declare const drawRubik: ModeDraw;
export declare const drawWave: ModeDraw;

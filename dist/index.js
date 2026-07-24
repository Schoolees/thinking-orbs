var ht = Object.defineProperty;
var ut = (n, t, e) => t in n ? ht(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var y = (n, t, e) => ut(n, typeof t != "symbol" ? t + "" : t, e);
function F(n, t) {
  const e = Math.sin(n * 12.9898 + t * 78.233) * 43758.5453;
  return e - Math.floor(e);
}
function lt(n, t) {
  const e = Math.PI * (3 - Math.sqrt(5)), a = 1 - 2 * (n + 0.5) / t, s = Math.sqrt(1 - a * a), i = n * e;
  return [s * Math.cos(i), a, s * Math.sin(i)];
}
function dt(n, t) {
  return Math.atan2(Math.sin(n - t), Math.cos(n - t));
}
function _(n, t, e, a, s) {
  const i = Math.sin(t), o = Math.cos(t), r = Math.sin(n), c = Math.cos(n);
  return (g, b, p) => {
    const l = g * c + p * r, h = -g * r + p * c, M = b * o - h * i, w = b * i + h * o;
    return [e + l * s, a - M * s, w];
  };
}
function H(n, t, e, a = 0.3) {
  t.sort((s, i) => s.z - i.z);
  for (const s of t) {
    const i = s.a ?? 1;
    if (i < 0.02) continue;
    const o = Math.min(1, Math.max(0, s.white)), r = Math.round((e ? 1 - o : o) * 255);
    n.fillStyle = `rgba(${r},${r},${r},${i})`, n.beginPath(), n.arc(s.x, s.y, Math.max(a, s.r), 0, Math.PI * 2), n.fill();
  }
}
function q(n, t) {
  return (n / 300) ** t;
}
function pt(n, t, e, a) {
  const s = 2 * t * e + a, i = n % s, o = new Array(t).fill(0);
  let r = -1;
  if (i < 2 * t * e) {
    const c = Math.floor(i / e), g = (i - c * e) / e, p = 1 - (1 - Math.min(1, g / 0.7)) ** 3;
    if (c < t) {
      for (let l = 0; l < c; l++) o[l] = 1;
      o[c] = p, r = c;
    } else {
      const l = 2 * t - 1 - c;
      for (let h = 0; h < l; h++) o[h] = 1;
      o[l] = 1 - p, r = l;
    }
  }
  return { amount: o, active: r };
}
function Mt(n, t, e) {
  let [a, s, i] = n, o = !1;
  for (let r = 0; r < t.length; r++) {
    if (e.amount[r] <= 0) continue;
    const c = t[r], g = c.axis === 0 ? a : c.axis === 1 ? s : i;
    if (g < c.lo || g >= c.hi) continue;
    r === e.active && (o = !0);
    const b = c.ang * e.amount[r], p = Math.cos(b), l = Math.sin(b);
    if (c.axis === 0) {
      const h = s * p - i * l;
      i = s * l + i * p, s = h;
    } else if (c.axis === 1) {
      const h = a * p + i * l;
      i = -a * l + i * p, a = h;
    } else {
      const h = a * p - s * l;
      s = a * l + s * p, a = h;
    }
  }
  return [a, s, i, o];
}
function ft(n) {
  const t = [];
  for (let e = 0; e < n; e++) {
    const a = Math.min(2, Math.floor(F(e, 2.3) * 3)), s = -1 + 0.5 * Math.min(3, Math.floor(F(e, 5.9) * 4)), i = F(e, 7.7) < 0.5 ? 1 : -1;
    t.push({ axis: a, lo: s, hi: s + 0.5, ang: i * Math.PI / 2 });
  }
  return t;
}
const mt = (n, t, e, a, s) => {
  const o = t / 2, r = t / 2, c = t / 2 * 0.82, g = 0.4 + 0.06 * Math.sin(e * 0.35), b = _(e * 0.5, g, o, r, c), p = e * (0.5 + (1.7 - 0.5) * (s.scanMul ?? 1)), l = q(t, s.rsPow ?? 0.6), h = s.dimBase ?? 1, M = [], w = s.latRings ?? 17, O = s.lonDensity ?? 44;
  for (let k = 0; k <= w; k++) {
    const v = -Math.PI / 2 + k / w * Math.PI, V = Math.cos(v), A = Math.sin(v), E = Math.max(1, Math.round(Math.abs(V) * O));
    for (let x = 0; x < E; x++) {
      const D = x / E * 2 * Math.PI, [d, f, u] = b(V * Math.cos(D), A, V * Math.sin(D)), m = (u + 1) / 2, T = dt(D + e * 0.5, p), L = Math.exp(-(T * T) / 0.18) * Math.max(0, u);
      M.push({
        x: d,
        y: f,
        z: u,
        r: ((s.rBase ?? 0.6) + (s.rDepth ?? 1.7) * m + (s.rBoost ?? 1) * L) * l,
        white: (s.inkFar ?? 0.62) - (s.inkSpan ?? 0.54) * m,
        // dimBase < 1 fades un-scanned dots so the meridian reads clearly
        a: h + (1 - h) * Math.min(1, L)
      });
    }
  }
  H(n, M, a, s.rMin);
}, gt = (n, t, e, a, s) => {
  const i = t / 2, o = t / 2, r = t / 2 * 0.82, c = _(e * 0.55, 0.35 + 0.1 * Math.sin(e * 0.9), i, o, r), g = q(t, s.rsPow ?? 0.6), b = s.moveCount ?? 14, p = ft(b), l = pt(e, b, 0.42, 1.2), h = [], M = s.latRings ?? 15, w = s.lonDensity ?? 40;
  for (let O = 0; O <= M; O++) {
    const k = -Math.PI / 2 + O / M * Math.PI, v = Math.cos(k), V = Math.sin(k), A = Math.max(1, Math.round(Math.abs(v) * w));
    for (let E = 0; E < A; E++) {
      const x = E / A * 2 * Math.PI, [D, d, f, u] = Mt([v * Math.cos(x), V, v * Math.sin(x)], p, l), [m, T, L] = c(D, d, f), z = (L + 1) / 2;
      h.push({
        x: m,
        y: T,
        z: L,
        r: ((s.rBase ?? 0.6) + (s.rDepth ?? 1.7) * z + (u ? s.rActive ?? 0.3 : 0)) * g,
        white: (s.inkFar ?? 0.62) - (s.inkSpan ?? 0.54) * z - (u ? 0.14 : 0)
      });
    }
  }
  H(n, h, a, s.rMin);
}, bt = (n, t, e, a, s) => {
  const i = t / 2, o = t / 2, r = t / 2 * 0.874, c = _(e * 0.18, 0.38, i, o, 1), g = q(t, s.rsPow ?? 0.6), b = [], p = s.rings ?? 15, l = s.lonDensity ?? 40;
  for (let h = 0; h <= p; h++) {
    const M = -Math.PI / 2 + h / p * Math.PI, w = Math.cos(M), O = Math.sin(M), k = 0.62 * Math.sin(e * 2.1 - h * 0.52) + 0.38 * Math.sin(e * 1.27 + h * 0.83), v = r * (0.88 + 0.105 * k), V = Math.max(1, Math.round(Math.abs(w) * l));
    for (let A = 0; A < V; A++) {
      const E = A / V * 2 * Math.PI, [x, D, d] = c(w * Math.cos(E) * v, O * v, w * Math.sin(E) * v), f = (d / r + 1) / 2, u = Math.max(0, k);
      b.push({
        x,
        y: D,
        z: d,
        r: ((s.rBase ?? 0.6) + (s.rDepth ?? 1.7) * f) * (1 + 0.4 * u) * g,
        white: 0.66 - 0.56 * f - 0.1 * u
      });
    }
  }
  H(n, b, a, s.rMin);
};
function vt(n) {
  return n * n * (3 - 2 * n);
}
function et(n) {
  const t = n.length, e = [];
  let a = 0;
  for (let s = 0; s < t; s++) {
    const i = n[s], o = n[(s + 1) % t], r = Math.hypot(o[0] - i[0], o[1] - i[1]);
    e.push(r), a += r;
  }
  return (s) => {
    let i = s * a, o = 0;
    for (; i > e[o] && o < t - 1; )
      i -= e[o], o++;
    const r = n[o], c = n[(o + 1) % t], g = e[o] ? Math.min(1, i / e[o]) : 0;
    return [r[0] + (c[0] - r[0]) * g, r[1] + (c[1] - r[1]) * g];
  };
}
const yt = (n) => {
  const t = -Math.PI / 2 + n * 2 * Math.PI;
  return [Math.cos(t) * 0.24, Math.sin(t) * 0.24];
}, wt = et([
  [0, -0.26],
  [0.24, 0.16],
  [-0.24, 0.16]
]), xt = et([
  [0, -0.2],
  [0.2, -0.2],
  [0.2, 0.2],
  [-0.2, 0.2],
  [-0.2, -0.2]
]), U = [yt, wt, xt];
function kt(n) {
  return Math.max(6, Math.round(34 * n));
}
const K = 1.4, st = 0.9, Y = K + st, At = (n, t, e, a, s) => {
  const i = U.length, o = e % (Y * i), r = Math.floor(o / Y), c = o - r * Y, g = c > K ? vt((c - K) / st) : 0, b = s.spread ?? 1, p = U[r], l = U[(r + 1) % i], h = 160, M = [];
  for (let d = 0; d < h; d++) {
    const f = d / h, u = p(f), m = l(f);
    M.push([(u[0] + (m[0] - u[0]) * g) * b, (u[1] + (m[1] - u[1]) * g) * b]);
  }
  const w = [];
  let O = 0;
  for (let d = 0; d < h; d++) {
    const f = M[d], u = M[(d + 1) % h], m = Math.hypot(u[0] - f[0], u[1] - f[1]);
    w.push(m), O += m;
  }
  const k = kt(s.iconD ?? 1), v = (s.rDot ?? 0.021) * 1.35 * b, V = 1 + 0.02 * Math.sin(c * 3.1), A = [], E = t / 2;
  let x = 0, D = 0;
  for (let d = 0; d < k; d++) {
    const f = d / k * O;
    for (; D + w[x] < f && x < h - 1; )
      D += w[x], x++;
    const u = M[x], m = M[(x + 1) % h], T = w[x] ? Math.min(1, (f - D) / w[x]) : 0, L = (u[0] + (m[0] - u[0]) * T) * V, z = (u[1] + (m[1] - u[1]) * T) * V;
    A.push({
      x: E + L * t,
      y: E + z * t,
      z: 0,
      r: Math.max(0.35, v * t),
      white: 0.1
    });
  }
  H(n, A, a, s.rMin);
}, Vt = (n, t, e, a, s) => {
  const i = t / 2, o = t / 2, r = t / 2 * 0.82, c = _(e * 0.12, 0.3, i, o, 1), g = q(t, s.rsPow ?? 0.6), b = [], p = s.orbitN ?? 12, l = s.ghostN ?? 40, h = s.particles ?? 3;
  for (let M = 0; M < p; M++) {
    const w = F(M, 1.7), O = F(M, 5.2), k = F(M, 8.9), v = r * (0.45 + 0.52 * w), V = w * 2 * Math.PI, A = Math.acos(2 * O - 1), E = Math.sin(A) * Math.cos(V), x = Math.cos(A), D = Math.sin(A) * Math.sin(V);
    let d = -x, f = E;
    const u = 0, m = Math.max(1e-6, Math.sqrt(d * d + f * f));
    d /= m, f /= m;
    const T = x * u - D * f, L = D * d - E * u, z = E * f - x * d, R = (0.25 + 0.55 * k) * (k > 0.5 ? 1 : -1);
    for (let S = 0; S < l; S++) {
      const C = S / l * 2 * Math.PI, [B, N, P] = c(
        (d * Math.cos(C) + T * Math.sin(C)) * v,
        (f * Math.cos(C) + L * Math.sin(C)) * v,
        (u * Math.cos(C) + z * Math.sin(C)) * v
      ), I = (P / v + 1) / 2;
      b.push({
        x: B,
        y: N,
        z: P,
        r: (s.ghostR ?? 0.9) * g,
        white: 0.72,
        a: (s.ghostA ?? 0.5) * (0.4 + 0.6 * I)
      });
    }
    for (let S = 0; S < h; S++) {
      const C = e * R + S / h * 2 * Math.PI + O * 6, [B, N, P] = c(
        (d * Math.cos(C) + T * Math.sin(C)) * v,
        (f * Math.cos(C) + L * Math.sin(C)) * v,
        (u * Math.cos(C) + z * Math.sin(C)) * v
      ), I = (P / v + 1) / 2;
      b.push({
        x: B,
        y: N,
        z: P,
        r: ((s.partR ?? 1.2) + (s.partRDepth ?? 1.6) * I) * g,
        white: 0.3 - 0.22 * I
      });
    }
  }
  H(n, b, a, s.rMin);
}, Et = (n, t, e, a, s) => {
  const i = t / 2, o = t / 2, r = t / 2 * 0.78, c = s.spin ?? 1, g = _(e * 0.1 * c, 0.3, i, o, 1), b = q(t, s.rsPow ?? 0.6), p = [], l = s.ghostN ?? 150;
  for (let m = 0; m < l; m++) {
    const T = lt(m, l), [L, z, R] = g(T[0] * r, T[1] * r, T[2] * r), S = (R / r + 1) / 2;
    p.push({ x: L, y: z, z: R, r: 0.8 * b, white: 0.78, a: 0.1 + 0.22 * S });
  }
  const h = e * 0.24 * c, M = 0.55 + 0.3 * Math.sin(e * 0.18) * c, w = Math.cos(h), O = 0, k = Math.sin(h), v = -k * Math.sin(M), V = Math.cos(M), A = w * Math.sin(M), E = O * A - k * V, x = k * v - w * A, D = w * V - O * v, d = s.lanes ?? 5, f = s.segs ?? 88, u = Math.max(1, Math.round(d * (s.bandMul ?? 1)));
  for (let m = 0; m < u; m++) {
    const T = (m - (u - 1) / 2) * 0.075, L = Math.abs(m - (u - 1) / 2) / Math.max(1, (u - 1) / 2);
    for (let z = 0; z < f; z++) {
      const R = z / f * 2 * Math.PI, S = (0.16 * Math.sin(R * 3 - e * 1.7 + m * 0.22) + 0.07 * Math.sin(R * 5 + e * 1.1)) * (s.wobMul ?? 1), C = T + S, B = w * Math.cos(R) + v * Math.sin(R) + E * C, N = O * Math.cos(R) + V * Math.sin(R) + x * C, P = k * Math.cos(R) + A * Math.sin(R) + D * C, I = Math.sqrt(B * B + N * N + P * P), [rt, ct, W] = g(B / I * r, N / I * r, P / I * r), $ = (W / r + 1) / 2;
      p.push({
        x: rt,
        y: ct,
        z: W,
        r: ((s.rBase ?? 1.1) + (s.rDepth ?? 1.7) * $) * (1 - 0.25 * L) * b,
        white: 0.52 - 0.44 * $ + 0.18 * L,
        a: 0.4 + 0.6 * $
      });
    }
  }
  H(n, p, a, s.rMin);
}, Ot = {
  orbits: Vt,
  globe: mt,
  rubik: gt,
  wave: bt,
  ribbon: Et,
  morph: At
}, Ct = [
  ["latRings", "lonDensity"],
  ["rings", "lonDensity"],
  ["lanes", "segs"]
], Dt = ["orbitN", "ghostN"], Tt = ["iconD"], Lt = ["rBase", "rDepth", "rActive", "rDot", "ghostR", "partR", "partRDepth"];
function zt(n, t) {
  const e = { ...n }, a = /* @__PURE__ */ new Set(), s = Math.sqrt(t);
  for (const [i, o] of Ct) {
    const r = e[i], c = e[o];
    r != null && c != null && !a.has(i) && !a.has(o) && (e[i] = Math.max(2, Math.round(r * s)), e[o] = Math.max(2, Math.round(c * s)), a.add(i), a.add(o));
  }
  for (const i of Dt) {
    const o = e[i];
    o != null && !a.has(i) && (e[i] = Math.max(1, Math.round(o * t)));
  }
  for (const i of Tt) {
    const o = e[i];
    o != null && (e[i] = Math.max(0.02, o * t));
  }
  return e;
}
function Rt(n, t) {
  const e = { ...n };
  for (const a of Lt) {
    const s = e[a];
    s != null && (e[a] = s * t);
  }
  return e.rSizeMul = (e.rSizeMul ?? 1) * t, e;
}
const St = {
  globe: {
    latRings: 17,
    lonDensity: 44,
    rBase: 0.6,
    rDepth: 1.7,
    rBoost: 1,
    inkFar: 0.62,
    inkSpan: 0.54,
    rsPow: 0.6,
    rMin: 0.3
  },
  orbits: {
    orbitN: 12,
    ghostN: 40,
    ghostR: 0.9,
    ghostA: 0.5,
    particles: 3,
    partR: 1.2,
    partRDepth: 1.6,
    rsPow: 0.6,
    rMin: 0.3
  },
  rubik: {
    latRings: 15,
    lonDensity: 40,
    moveCount: 14,
    rBase: 0.6,
    rDepth: 1.7,
    rActive: 0.3,
    inkFar: 0.62,
    inkSpan: 0.54,
    rsPow: 0.6,
    rMin: 0.3
  },
  wave: {
    rings: 15,
    lonDensity: 40,
    rBase: 0.6,
    rDepth: 1.7,
    rsPow: 0.6,
    rMin: 0.3
  },
  ribbon: {
    lanes: 5,
    segs: 88,
    ghostN: 150,
    rBase: 1.1,
    rDepth: 1.7,
    rsPow: 0.6,
    rMin: 0.3
  },
  morph: {
    rDot: 0.021,
    iconD: 1,
    rMin: 0.25
  }
}, Pt = {
  working: "orbits",
  searching: "globe",
  solving: "rubik",
  listening: "wave",
  composing: "ribbon",
  shaping: "morph"
}, It = {
  orbits: {
    64: { speed: 1.885, count: 1, size: 1 },
    20: { speed: 3.9, count: 0.238, size: 2.4 }
  },
  globe: {
    64: { speed: 2.015, count: 0.42, size: 1.15, extra: { scanMul: 4.08, dimBase: 0.45 } },
    20: { speed: 2.665, count: 0.105, size: 1.75, extra: { scanMul: 4.335, dimBase: 0.45 } }
  },
  rubik: {
    64: { speed: 1.82, count: 0.35, size: 1.05 },
    20: { speed: 1.95, count: 0.088, size: 1.9 }
  },
  wave: {
    64: { speed: 4.388, count: 0.341, size: 1 },
    20: { speed: 3.998, count: 0.105, size: 1.6 }
  },
  ribbon: {
    64: { speed: 2.34, count: 0.25, size: 0.85, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    20: { speed: 3.12, count: 0.051, size: 1.073, extra: { spin: 0, bandMul: 4.94, wobMul: 1 } }
  },
  morph: {
    64: { speed: 2.405, count: 0.54, size: 0.395, extra: { spread: 1.45 } },
    20: { speed: 2.08, count: 0.53, size: 1.011, extra: { spread: 1.45 } }
  }
}, Z = /* @__PURE__ */ new Map();
function Bt(n, t) {
  const e = `${n}-${t}`, a = Z.get(e);
  if (a) return a;
  const s = Pt[n], i = It[s][t];
  let o = { ...St[s] };
  i.count !== 1 && (o = zt(o, i.count)), i.size !== 1 && (o = Rt(o, i.size)), i.extra && (o = { ...o, ...i.extra });
  const r = { mode: s, speed: i.speed, opts: o };
  return Z.set(e, r), r;
}
function Nt(n) {
  let t = n;
  for (; t; ) {
    const e = t.getAttribute("data-theme") ?? t.getAttribute("data-coreui-theme");
    if (e === "dark")
      return !0;
    if (e === "light")
      return !1;
    if (t.classList.contains("dark"))
      return !0;
    if (t.classList.contains("light"))
      return !1;
    t = t.parentElement;
  }
  return null;
}
function Ft() {
  return typeof matchMedia > "u" || matchMedia("(prefers-color-scheme: dark)").matches;
}
function J(n, t) {
  return n === "dark" ? !0 : n === "light" ? !1 : Nt(t) ?? Ft();
}
function X(n, t) {
  return n ? typeof n.addEventListener == "function" ? (n.addEventListener("change", t), () => n.removeEventListener("change", t)) : (n.addListener(t), () => n.removeListener(t)) : () => {
  };
}
const nt = [
  "working",
  "searching",
  "solving",
  "listening",
  "composing",
  "shaping"
], it = [20, 64], at = ["auto", "dark", "light"], Ht = {
  working: "Working…",
  searching: "Searching…",
  solving: "Solving…",
  listening: "Listening…",
  composing: "Composing…",
  shaping: "Shaping…"
};
function j(n, t) {
  return n.includes(t);
}
function _t(n) {
  const t = typeof n == "string" ? document.querySelector(n) : n;
  if (!t)
    throw new Error("ThinkingOrb target was not found.");
  if (t instanceof HTMLCanvasElement)
    return { canvas: t, createdCanvas: !1 };
  const e = document.createElement("canvas");
  return e.dataset.thinkingOrbCanvas = "", t.append(e), { canvas: e, createdCanvas: !0 };
}
function Q(n) {
  return typeof requestAnimationFrame == "function" ? requestAnimationFrame(n) : window.setTimeout(() => n(performance.now()), 16);
}
function qt(n) {
  if (typeof cancelAnimationFrame == "function") {
    cancelAnimationFrame(n);
    return;
  }
  window.clearTimeout(n);
}
class ot {
  constructor(t, e = {}) {
    y(this, "canvas");
    y(this, "createdCanvas");
    y(this, "context");
    y(this, "stateValue", "working");
    y(this, "sizeValue", 64);
    y(this, "themeValue", "auto");
    y(this, "speedValue", 1);
    y(this, "pausedValue", !1);
    y(this, "customAriaLabel", null);
    y(this, "darkValue", !0);
    y(this, "reducedMotionValue", !1);
    y(this, "visibleValue", !0);
    y(this, "destroyed", !1);
    y(this, "running", !1);
    y(this, "frameHandle", 0);
    y(this, "intersectionObserver", null);
    y(this, "mutationObserver", null);
    y(this, "removeDarkMediaListener", () => {
    });
    y(this, "removeMotionMediaListener", () => {
    });
    y(this, "onVisibilityChange", () => {
      this.syncAnimation();
    });
    y(this, "onThemeChange", () => {
      const t = J(this.themeValue, this.canvas);
      t !== this.darkValue && (this.darkValue = t, this.render());
    });
    y(this, "onReducedMotionChange", (t) => {
      this.reducedMotionValue = t.matches, this.render(), this.syncAnimation();
    });
    if (typeof document > "u")
      throw new Error("ThinkingOrb requires a browser DOM.");
    const { canvas: a, createdCanvas: s } = _t(t), i = a.getContext("2d");
    if (!i)
      throw new Error("ThinkingOrb requires CanvasRenderingContext2D support.");
    this.canvas = a, this.createdCanvas = s, this.context = i, e.className && s && (a.className = e.className), this.setupObservers(), this.update(e);
  }
  get state() {
    return this.stateValue;
  }
  get size() {
    return this.sizeValue;
  }
  get theme() {
    return this.themeValue;
  }
  get speed() {
    return this.speedValue;
  }
  get paused() {
    return this.pausedValue;
  }
  get snapshot() {
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
  update(t = {}) {
    var e;
    if (this.assertActive(), t.state !== void 0) {
      if (!j(nt, t.state))
        throw new TypeError(`Unknown ThinkingOrb state: ${String(t.state)}`);
      this.stateValue = t.state;
    }
    if (t.size !== void 0) {
      if (!j(it, t.size))
        throw new TypeError("ThinkingOrb size must be 20 or 64.");
      this.sizeValue = t.size;
    }
    if (t.theme !== void 0) {
      if (!j(at, t.theme))
        throw new TypeError(`Unknown ThinkingOrb theme: ${String(t.theme)}`);
      this.themeValue = t.theme;
    }
    if (t.speed !== void 0) {
      if (!Number.isFinite(t.speed) || t.speed <= 0)
        throw new TypeError("ThinkingOrb speed must be a positive number.");
      this.speedValue = t.speed;
    }
    return t.paused !== void 0 && (this.pausedValue = !!t.paused), "ariaLabel" in t && (this.customAriaLabel = ((e = t.ariaLabel) == null ? void 0 : e.trim()) || null), this.darkValue = J(this.themeValue, this.canvas), this.configureCanvas(), this.render(), this.syncAnimation(), this;
  }
  setState(t) {
    return this.update({ state: t });
  }
  setTheme(t) {
    return this.update({ theme: t });
  }
  setSpeed(t) {
    return this.update({ speed: t });
  }
  pause() {
    return this.update({ paused: !0 });
  }
  resume() {
    return this.update({ paused: !1 });
  }
  render(t) {
    this.assertActive(), this.resizeBackingStore();
    const { mode: e, speed: a, opts: s } = Bt(
      this.stateValue,
      this.sizeValue
    ), i = t ?? (this.reducedMotionValue ? 0.6 : performance.now() / 1e3 * a * this.speedValue), o = this.getDevicePixelRatio();
    return this.context.setTransform(o, 0, 0, o, 0, 0), this.context.clearRect(0, 0, this.sizeValue, this.sizeValue), Ot[e](
      this.context,
      this.sizeValue,
      i,
      this.darkValue,
      s
    ), this;
  }
  destroy(t = {}) {
    var e, a;
    this.destroyed || (this.stop(), (e = this.intersectionObserver) == null || e.disconnect(), (a = this.mutationObserver) == null || a.disconnect(), this.removeDarkMediaListener(), this.removeMotionMediaListener(), document.removeEventListener("visibilitychange", this.onVisibilityChange), (t.removeCanvas ?? this.createdCanvas) && this.canvas.isConnected && this.canvas.remove(), this.destroyed = !0);
  }
  setupObservers() {
    const t = typeof matchMedia == "function" ? matchMedia("(prefers-color-scheme: dark)") : null, e = typeof matchMedia == "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
    this.reducedMotionValue = (e == null ? void 0 : e.matches) ?? !1, this.removeDarkMediaListener = X(
      t,
      this.onThemeChange
    ), this.removeMotionMediaListener = X(
      e,
      this.onReducedMotionChange
    ), typeof MutationObserver < "u" && (this.mutationObserver = new MutationObserver(this.onThemeChange), this.mutationObserver.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["class", "data-theme", "data-coreui-theme"],
      subtree: !0
    })), typeof IntersectionObserver < "u" && (this.intersectionObserver = new IntersectionObserver(([a]) => {
      this.visibleValue = (a == null ? void 0 : a.isIntersecting) ?? !0, this.syncAnimation();
    }), this.intersectionObserver.observe(this.canvas)), document.addEventListener("visibilitychange", this.onVisibilityChange);
  }
  configureCanvas() {
    this.canvas.dataset.thinkingOrbState = this.stateValue, this.canvas.dataset.thinkingOrbTheme = this.themeValue, this.canvas.setAttribute("role", "img"), this.canvas.setAttribute(
      "aria-label",
      this.customAriaLabel ?? Ht[this.stateValue]
    ), this.canvas.style.width = `${this.sizeValue}px`, this.canvas.style.height = `${this.sizeValue}px`, this.canvas.style.display = "block";
  }
  resizeBackingStore() {
    const t = this.getDevicePixelRatio(), e = Math.round(this.sizeValue * t);
    this.canvas.width !== e && (this.canvas.width = e), this.canvas.height !== e && (this.canvas.height = e);
  }
  getDevicePixelRatio() {
    return Math.min(2, window.devicePixelRatio || 1);
  }
  syncAnimation() {
    if (this.shouldAnimate()) {
      this.start();
      return;
    }
    this.stop();
  }
  shouldAnimate() {
    return !this.destroyed && !this.pausedValue && !this.reducedMotionValue && this.visibleValue && document.visibilityState !== "hidden";
  }
  start() {
    if (this.running)
      return;
    this.running = !0;
    const t = () => {
      this.running && (this.render(), this.frameHandle = Q(t));
    };
    this.frameHandle = Q(t);
  }
  stop() {
    this.running = !1, qt(this.frameHandle);
  }
  assertActive() {
    if (this.destroyed)
      throw new Error("ThinkingOrb has been destroyed.");
  }
}
function Gt(n, t = {}) {
  return new ot(n, t);
}
const $t = typeof globalThis.HTMLElement > "u" ? class {
} : globalThis.HTMLElement;
function tt(n) {
  return nt.includes(n) ? n : "working";
}
function Ut(n) {
  const t = Number(n);
  return it.includes(t) ? t : 64;
}
function Yt(n) {
  return at.includes(n) ? n : "auto";
}
function jt(n) {
  const t = Number(n);
  return Number.isFinite(t) && t > 0 ? t : 1;
}
class G extends $t {
  constructor() {
    super(...arguments);
    y(this, "controller", null);
  }
  connectedCallback() {
    var a, s, i;
    if (this.controller || !(this instanceof HTMLElement))
      return;
    (a = this.style).display || (a.display = "inline-block"), (s = this.style).lineHeight || (s.lineHeight = "0"), (i = this.style).verticalAlign || (i.verticalAlign = "middle");
    const e = document.createElement("canvas");
    e.dataset.thinkingOrbCanvas = "", this.replaceChildren(e), this.controller = new ot(e, this.readOptions());
  }
  disconnectedCallback() {
    var e;
    (e = this.controller) == null || e.destroy({ removeCanvas: !1 }), this.controller = null;
  }
  attributeChangedCallback() {
    var e;
    (e = this.controller) == null || e.update(this.readOptions());
  }
  get orb() {
    return this.controller;
  }
  get state() {
    return tt(this.getAttribute("state"));
  }
  set state(e) {
    this.setAttribute("state", e);
  }
  get paused() {
    return this.hasAttribute("paused");
  }
  set paused(e) {
    this.toggleAttribute("paused", e);
  }
  readOptions() {
    return {
      state: tt(this.getAttribute("state")),
      size: Ut(this.getAttribute("size")),
      theme: Yt(this.getAttribute("theme")),
      speed: jt(this.getAttribute("speed")),
      paused: this.hasAttribute("paused"),
      ariaLabel: this.getAttribute("aria-label")
    };
  }
}
y(G, "observedAttributes", [
  "state",
  "size",
  "theme",
  "speed",
  "paused",
  "aria-label"
]);
function Wt(n = "thinking-orb") {
  if (!n.includes("-"))
    throw new TypeError("A custom-element name must contain a hyphen.");
  return typeof customElements < "u" && !customElements.get(n) && customElements.define(n, G), G;
}
export {
  Ot as MODE_DRAWS,
  it as ORB_SIZES,
  nt as ORB_STATES,
  at as ORB_THEMES,
  Pt as STATE_TO_MODE,
  ot as ThinkingOrb,
  G as ThinkingOrbElement,
  Gt as createThinkingOrb,
  Wt as defineThinkingOrb,
  Bt as resolvePreset
};

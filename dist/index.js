var dt = Object.defineProperty;
var pt = (s, t, e) => t in s ? dt(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var k = (s, t, e) => pt(s, typeof t != "symbol" ? t + "" : t, e);
function q(s, t) {
  const e = Math.sin(s * 12.9898 + t * 78.233) * 43758.5453;
  return e - Math.floor(e);
}
function $(s, t) {
  const e = Math.PI * (3 - Math.sqrt(5)), a = 1 - 2 * (s + 0.5) / t, n = Math.sqrt(1 - a * a), i = s * e;
  return [n * Math.cos(i), a, n * Math.sin(i)];
}
function Mt(s, t) {
  return Math.atan2(Math.sin(s - t), Math.cos(s - t));
}
function B(s, t, e, a, n) {
  const i = Math.sin(t), o = Math.cos(t), r = Math.sin(s), c = Math.cos(s);
  return (M, f, p) => {
    const l = M * c + p * r, h = -M * r + p * c, u = f * o - h * i, d = f * i + h * o;
    return [e + l * n, a - u * n, d];
  };
}
function I(s, t, e, a = 0.3) {
  t.sort((n, i) => n.z - i.z);
  for (const n of t) {
    const i = n.a ?? 1;
    if (i < 0.02) continue;
    const o = Math.min(1, Math.max(0, n.white)), r = Math.round((e ? 1 - o : o) * 255);
    s.fillStyle = `rgba(${r},${r},${r},${i})`, s.beginPath(), s.arc(n.x, n.y, Math.max(a, n.r), 0, Math.PI * 2), s.fill();
  }
}
function _(s, t) {
  return (s / 300) ** t;
}
function ft(s, t, e, a) {
  const n = 2 * t * e + a, i = s % n, o = new Array(t).fill(0);
  let r = -1;
  if (i < 2 * t * e) {
    const c = Math.floor(i / e), M = (i - c * e) / e, p = 1 - (1 - Math.min(1, M / 0.7)) ** 3;
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
function mt(s, t, e) {
  let [a, n, i] = s, o = !1;
  for (let r = 0; r < t.length; r++) {
    if (e.amount[r] <= 0) continue;
    const c = t[r], M = c.axis === 0 ? a : c.axis === 1 ? n : i;
    if (M < c.lo || M >= c.hi) continue;
    r === e.active && (o = !0);
    const f = c.ang * e.amount[r], p = Math.cos(f), l = Math.sin(f);
    if (c.axis === 0) {
      const h = n * p - i * l;
      i = n * l + i * p, n = h;
    } else if (c.axis === 1) {
      const h = a * p + i * l;
      i = -a * l + i * p, a = h;
    } else {
      const h = a * p - n * l;
      n = a * l + n * p, a = h;
    }
  }
  return [a, n, i, o];
}
function gt(s) {
  const t = [];
  for (let e = 0; e < s; e++) {
    const a = Math.min(2, Math.floor(q(e, 2.3) * 3)), n = -1 + 0.5 * Math.min(3, Math.floor(q(e, 5.9) * 4)), i = q(e, 7.7) < 0.5 ? 1 : -1;
    t.push({ axis: a, lo: n, hi: n + 0.5, ang: i * Math.PI / 2 });
  }
  return t;
}
const bt = (s, t, e, a, n) => {
  const o = t / 2, r = t / 2, c = t / 2 * 0.82, M = 0.4 + 0.06 * Math.sin(e * 0.35), f = B(e * 0.5, M, o, r, c), p = e * (0.5 + (1.7 - 0.5) * (n.scanMul ?? 1)), l = _(t, n.rsPow ?? 0.6), h = n.dimBase ?? 1, u = [], d = n.latRings ?? 17, A = n.lonDensity ?? 44;
  for (let w = 0; w <= d; w++) {
    const m = -Math.PI / 2 + w / d * Math.PI, z = Math.cos(m), V = Math.sin(m), C = Math.max(1, Math.round(Math.abs(z) * A));
    for (let y = 0; y < C; y++) {
      const P = y / C * 2 * Math.PI, [g, v, b] = f(z * Math.cos(P), V, z * Math.sin(P)), x = (b + 1) / 2, R = Mt(P + e * 0.5, p), E = Math.exp(-(R * R) / 0.18) * Math.max(0, b);
      u.push({
        x: g,
        y: v,
        z: b,
        r: ((n.rBase ?? 0.6) + (n.rDepth ?? 1.7) * x + (n.rBoost ?? 1) * E) * l,
        white: (n.inkFar ?? 0.62) - (n.inkSpan ?? 0.54) * x,
        // dimBase < 1 fades un-scanned dots so the meridian reads clearly
        a: h + (1 - h) * Math.min(1, E)
      });
    }
  }
  I(s, u, a, n.rMin);
}, vt = (s, t, e, a, n) => {
  const i = t / 2, o = t / 2, r = t / 2 * 0.82, c = B(e * 0.55, 0.35 + 0.1 * Math.sin(e * 0.9), i, o, r), M = _(t, n.rsPow ?? 0.6), f = n.moveCount ?? 14, p = gt(f), l = ft(e, f, 0.42, 1.2), h = [], u = n.latRings ?? 15, d = n.lonDensity ?? 40;
  for (let A = 0; A <= u; A++) {
    const w = -Math.PI / 2 + A / u * Math.PI, m = Math.cos(w), z = Math.sin(w), V = Math.max(1, Math.round(Math.abs(m) * d));
    for (let C = 0; C < V; C++) {
      const y = C / V * 2 * Math.PI, [P, g, v, b] = mt([m * Math.cos(y), z, m * Math.sin(y)], p, l), [x, R, E] = c(P, g, v), O = (E + 1) / 2;
      h.push({
        x,
        y: R,
        z: E,
        r: ((n.rBase ?? 0.6) + (n.rDepth ?? 1.7) * O + (b ? n.rActive ?? 0.3 : 0)) * M,
        white: (n.inkFar ?? 0.62) - (n.inkSpan ?? 0.54) * O - (b ? 0.14 : 0)
      });
    }
  }
  I(s, h, a, n.rMin);
}, wt = (s, t, e, a, n) => {
  const i = t / 2, o = t / 2, r = t / 2 * 0.874, c = B(e * 0.18, 0.38, i, o, 1), M = _(t, n.rsPow ?? 0.6), f = [], p = n.rings ?? 15, l = n.lonDensity ?? 40;
  for (let h = 0; h <= p; h++) {
    const u = -Math.PI / 2 + h / p * Math.PI, d = Math.cos(u), A = Math.sin(u), w = 0.62 * Math.sin(e * 2.1 - h * 0.52) + 0.38 * Math.sin(e * 1.27 + h * 0.83), m = r * (0.88 + 0.105 * w), z = Math.max(1, Math.round(Math.abs(d) * l));
    for (let V = 0; V < z; V++) {
      const C = V / z * 2 * Math.PI, [y, P, g] = c(d * Math.cos(C) * m, A * m, d * Math.sin(C) * m), v = (g / r + 1) / 2, b = Math.max(0, w);
      f.push({
        x: y,
        y: P,
        z: g,
        r: ((n.rBase ?? 0.6) + (n.rDepth ?? 1.7) * v) * (1 + 0.4 * b) * M,
        white: 0.66 - 0.56 * v - 0.1 * b
      });
    }
  }
  I(s, f, a, n.rMin);
};
function st(s, t) {
  return Math.max(12, Math.round(s.pointN ?? t));
}
function K(s, t, e) {
  return ((e.rBase ?? 0.7) + (e.rDepth ?? 1.5) * t) * _(s, e.rsPow ?? 0.6);
}
const xt = (s, t, e, a, n) => {
  const i = t / 2, o = st(n, 132), r = 0.94 + 0.055 * Math.sin(e * 0.85), c = B(e * 0.08, 0.34, i, i, t * 0.38 * r), M = [];
  for (let f = 0; f < o; f++) {
    const [p, l, h] = c(...$(f, o)), u = (h + 1) / 2;
    M.push({
      x: p,
      y: l,
      z: h,
      r: K(t, u, n),
      white: 0.7 - 0.58 * u,
      a: 0.5 + 0.5 * u
    });
  }
  I(s, M, a, n.rMin);
}, yt = (s, t, e, a, n) => {
  const i = t / 2, o = st(n, 108), r = Math.max(8, Math.floor(o * 0.38)), c = Math.max(8, o - r * 2), M = t * ((n.lobeGap ?? 0.16) + (n.gapPulse ?? 0.01) * Math.sin(e * 1.5)), f = t * (n.lobeRadius ?? 0.32), p = [];
  for (const l of [-1, 1]) {
    const h = B(
      e * 0.42 * l,
      0.32,
      i + M * l,
      i,
      f
    );
    for (let u = 0; u < r; u++) {
      const [d, A, w] = h(...$(u, r)), m = (w + 1) / 2;
      p.push({
        x: d,
        y: A,
        z: w,
        r: K(t, m, n),
        white: 0.7 - 0.56 * m,
        a: 0.45 + 0.55 * m
      });
    }
  }
  for (let l = 0; l < c; l++) {
    const h = c === 1 ? 0.5 : l / (c - 1), u = (h + e * 0.32) % 1, d = Math.exp(-Math.pow((u - 0.5) / 0.18, 2));
    p.push({
      x: i - M + h * M * 2,
      y: i + Math.sin(h * Math.PI * 2 + e) * t * 0.018,
      z: 2 + d,
      r: K(t, 0.75, n) * (0.75 + 0.5 * d),
      white: 0.48 - 0.3 * d,
      a: 0.35 + 0.65 * d
    });
  }
  I(s, p, a, n.rMin);
};
function kt(s) {
  return s * s * (3 - 2 * s);
}
function it(s) {
  const t = s.length, e = [];
  let a = 0;
  for (let n = 0; n < t; n++) {
    const i = s[n], o = s[(n + 1) % t], r = Math.hypot(o[0] - i[0], o[1] - i[1]);
    e.push(r), a += r;
  }
  return (n) => {
    let i = n * a, o = 0;
    for (; i > e[o] && o < t - 1; )
      i -= e[o], o++;
    const r = s[o], c = s[(o + 1) % t], M = e[o] ? Math.min(1, i / e[o]) : 0;
    return [r[0] + (c[0] - r[0]) * M, r[1] + (c[1] - r[1]) * M];
  };
}
const zt = (s) => {
  const t = -Math.PI / 2 + s * 2 * Math.PI;
  return [Math.cos(t) * 0.24, Math.sin(t) * 0.24];
}, At = it([
  [0, -0.26],
  [0.24, 0.16],
  [-0.24, 0.16]
]), Vt = it([
  [0, -0.2],
  [0.2, -0.2],
  [0.2, 0.2],
  [-0.2, 0.2],
  [-0.2, -0.2]
]), U = [zt, At, Vt];
function Ct(s) {
  return Math.max(6, Math.round(34 * s));
}
const W = 1.4, ot = 0.9, G = W + ot, Pt = (s, t, e, a, n) => {
  const i = U.length, o = e % (G * i), r = Math.floor(o / G), c = o - r * G, M = c > W ? kt((c - W) / ot) : 0, f = n.spread ?? 1, p = U[r], l = U[(r + 1) % i], h = 160, u = [];
  for (let g = 0; g < h; g++) {
    const v = g / h, b = p(v), x = l(v);
    u.push([(b[0] + (x[0] - b[0]) * M) * f, (b[1] + (x[1] - b[1]) * M) * f]);
  }
  const d = [];
  let A = 0;
  for (let g = 0; g < h; g++) {
    const v = u[g], b = u[(g + 1) % h], x = Math.hypot(b[0] - v[0], b[1] - v[1]);
    d.push(x), A += x;
  }
  const w = Ct(n.iconD ?? 1), m = (n.rDot ?? 0.021) * 1.35 * f, z = 1 + 0.02 * Math.sin(c * 3.1), V = [], C = t / 2;
  let y = 0, P = 0;
  for (let g = 0; g < w; g++) {
    const v = g / w * A;
    for (; P + d[y] < v && y < h - 1; )
      P += d[y], y++;
    const b = u[y], x = u[(y + 1) % h], R = d[y] ? Math.min(1, (v - P) / d[y]) : 0, E = (b[0] + (x[0] - b[0]) * R) * z, O = (b[1] + (x[1] - b[1]) * R) * z;
    V.push({
      x: C + E * t,
      y: C + O * t,
      z: 0,
      r: Math.max(0.35, m * t),
      white: 0.1
    });
  }
  I(s, V, a, n.rMin);
}, Dt = (s, t, e, a, n) => {
  const i = t / 2, o = t / 2, r = t / 2 * 0.82, c = B(e * 0.12, 0.3, i, o, 1), M = _(t, n.rsPow ?? 0.6), f = [], p = n.orbitN ?? 12, l = n.ghostN ?? 40, h = n.particles ?? 3;
  for (let u = 0; u < p; u++) {
    const d = q(u, 1.7), A = q(u, 5.2), w = q(u, 8.9), m = r * (0.45 + 0.52 * d), z = d * 2 * Math.PI, V = Math.acos(2 * A - 1), C = Math.sin(V) * Math.cos(z), y = Math.cos(V), P = Math.sin(V) * Math.sin(z);
    let g = -y, v = C;
    const b = 0, x = Math.max(1e-6, Math.sqrt(g * g + v * v));
    g /= x, v /= x;
    const R = y * b - P * v, E = P * g - C * b, O = C * v - y * g, T = (0.25 + 0.55 * w) * (w > 0.5 ? 1 : -1);
    for (let L = 0; L < l; L++) {
      const D = L / l * 2 * Math.PI, [F, H, S] = c(
        (g * Math.cos(D) + R * Math.sin(D)) * m,
        (v * Math.cos(D) + E * Math.sin(D)) * m,
        (b * Math.cos(D) + O * Math.sin(D)) * m
      ), N = (S / m + 1) / 2;
      f.push({
        x: F,
        y: H,
        z: S,
        r: (n.ghostR ?? 0.9) * M,
        white: 0.72,
        a: (n.ghostA ?? 0.5) * (0.4 + 0.6 * N)
      });
    }
    for (let L = 0; L < h; L++) {
      const D = e * T + L / h * 2 * Math.PI + A * 6, [F, H, S] = c(
        (g * Math.cos(D) + R * Math.sin(D)) * m,
        (v * Math.cos(D) + E * Math.sin(D)) * m,
        (b * Math.cos(D) + O * Math.sin(D)) * m
      ), N = (S / m + 1) / 2;
      f.push({
        x: F,
        y: H,
        z: S,
        r: ((n.partR ?? 1.2) + (n.partRDepth ?? 1.6) * N) * M,
        white: 0.3 - 0.22 * N
      });
    }
  }
  I(s, f, a, n.rMin);
}, Rt = (s, t, e, a, n) => {
  const i = t / 2, o = Math.max(24, Math.round(n.pulseN ?? 156)), r = Math.max(2, Math.round(n.shellCount ?? 3)), c = Math.max(8, Math.floor(o / r)), M = _(t, n.rsPow ?? 0.6), f = [];
  for (let u = 0; u < r; u++) {
    const d = (e * (n.pulseSpeed ?? 0.17) + u / r) % 1, A = d * (2 - d), w = t * (0.1 + 0.36 * A), m = Math.pow(Math.sin(Math.PI * d), 0.7), z = B(
      e * 0.14 + u * 0.7,
      0.38,
      i,
      i,
      w
    );
    for (let V = 0; V < c; V++) {
      const C = $(V, c), [y, P, g] = z(...C), v = (g + 1) / 2;
      f.push({
        x: y,
        y: P,
        z: g,
        r: ((n.rBase ?? 0.7) + (n.rDepth ?? 1.6) * v) * M * (0.8 + 0.25 * d),
        white: 0.7 - 0.58 * v,
        a: m * (0.45 + 0.55 * v)
      });
    }
  }
  const p = Math.max(8, Math.round(o * 0.16)), l = t * (0.105 + 0.012 * Math.sin(e * 1.8)), h = B(e * 0.2, 0.38, i, i, l);
  for (let u = 0; u < p; u++) {
    const d = $(u, p), [A, w, m] = h(...d), z = (m + 1) / 2;
    f.push({
      x: A,
      y: w,
      z: m + 2,
      r: ((n.rBase ?? 0.7) + (n.rDepth ?? 1.6) * z) * M,
      white: 0.62 - 0.54 * z,
      a: 0.65 + 0.35 * z
    });
  }
  I(s, f, a, n.rMin);
}, Et = (s, t, e, a, n) => {
  const i = t / 2, o = t / 2, r = t / 2 * 0.78, c = n.spin ?? 1, M = B(e * 0.1 * c, 0.3, i, o, 1), f = _(t, n.rsPow ?? 0.6), p = [], l = n.ghostN ?? 150;
  for (let x = 0; x < l; x++) {
    const R = $(x, l), [E, O, T] = M(R[0] * r, R[1] * r, R[2] * r), L = (T / r + 1) / 2;
    p.push({ x: E, y: O, z: T, r: 0.8 * f, white: 0.78, a: 0.1 + 0.22 * L });
  }
  const h = e * 0.24 * c, u = 0.55 + 0.3 * Math.sin(e * 0.18) * c, d = Math.cos(h), A = 0, w = Math.sin(h), m = -w * Math.sin(u), z = Math.cos(u), V = d * Math.sin(u), C = A * V - w * z, y = w * m - d * V, P = d * z - A * m, g = n.lanes ?? 5, v = n.segs ?? 88, b = Math.max(1, Math.round(g * (n.bandMul ?? 1)));
  for (let x = 0; x < b; x++) {
    const R = (x - (b - 1) / 2) * 0.075, E = Math.abs(x - (b - 1) / 2) / Math.max(1, (b - 1) / 2);
    for (let O = 0; O < v; O++) {
      const T = O / v * 2 * Math.PI, L = (0.16 * Math.sin(T * 3 - e * 1.7 + x * 0.22) + 0.07 * Math.sin(T * 5 + e * 1.1)) * (n.wobMul ?? 1), D = R + L, F = d * Math.cos(T) + m * Math.sin(T) + C * D, H = A * Math.cos(T) + z * Math.sin(T) + y * D, S = w * Math.cos(T) + V * Math.sin(T) + P * D, N = Math.sqrt(F * F + H * H + S * S), [ut, lt, J] = M(F / N * r, H / N * r, S / N * r), j = (J / r + 1) / 2;
      p.push({
        x: ut,
        y: lt,
        z: J,
        r: ((n.rBase ?? 1.1) + (n.rDepth ?? 1.7) * j) * (1 - 0.25 * E) * f,
        white: 0.52 - 0.44 * j + 0.18 * E,
        a: 0.4 + 0.6 * j
      });
    }
  }
  I(s, p, a, n.rMin);
}, Ot = {
  idle: xt,
  orbits: Dt,
  connecting: yt,
  globe: bt,
  rubik: vt,
  wave: wt,
  ribbon: Et,
  responding: Rt,
  morph: Pt
}, Tt = [
  ["latRings", "lonDensity"],
  ["rings", "lonDensity"],
  ["lanes", "segs"]
], Lt = ["orbitN", "ghostN", "pulseN", "pointN"], St = ["iconD"], Bt = ["rBase", "rDepth", "rActive", "rDot", "ghostR", "partR", "partRDepth"];
function It(s, t) {
  const e = { ...s }, a = /* @__PURE__ */ new Set(), n = Math.sqrt(t);
  for (const [i, o] of Tt) {
    const r = e[i], c = e[o];
    r != null && c != null && !a.has(i) && !a.has(o) && (e[i] = Math.max(2, Math.round(r * n)), e[o] = Math.max(2, Math.round(c * n)), a.add(i), a.add(o));
  }
  for (const i of Lt) {
    const o = e[i];
    o != null && !a.has(i) && (e[i] = Math.max(1, Math.round(o * t)));
  }
  for (const i of St) {
    const o = e[i];
    o != null && (e[i] = Math.max(0.02, o * t));
  }
  return e;
}
function Nt(s, t) {
  const e = { ...s };
  for (const a of Bt) {
    const n = e[a];
    n != null && (e[a] = n * t);
  }
  return e.rSizeMul = (e.rSizeMul ?? 1) * t, e;
}
const Ft = {
  idle: {
    pointN: 132,
    rBase: 0.68,
    rDepth: 1.5,
    rsPow: 0.6,
    rMin: 0.3
  },
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
  connecting: {
    pointN: 108,
    lobeRadius: 0.32,
    lobeGap: 0.16,
    gapPulse: 0.01,
    rBase: 0.68,
    rDepth: 1.5,
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
  responding: {
    pulseN: 156,
    shellCount: 3,
    pulseSpeed: 0.17,
    rBase: 0.7,
    rDepth: 1.6,
    rsPow: 0.6,
    rMin: 0.3
  },
  morph: {
    rDot: 0.021,
    iconD: 1,
    rMin: 0.25
  }
}, Ht = {
  idle: "idle",
  working: "orbits",
  connecting: "connecting",
  searching: "globe",
  solving: "rubik",
  listening: "wave",
  composing: "ribbon",
  responding: "responding",
  shaping: "morph"
}, _t = {
  idle: {
    128: { speed: 0.72, count: 1.55, size: 0.95 },
    96: { speed: 0.76, count: 1.15, size: 0.98 },
    64: { speed: 0.8, count: 0.78, size: 1 },
    20: { speed: 1, count: 0.2, size: 1.95 }
  },
  orbits: {
    128: { speed: 1.7, count: 1.9, size: 0.92 },
    96: { speed: 1.8, count: 1.45, size: 0.96 },
    64: { speed: 1.885, count: 1, size: 1 },
    20: { speed: 3.9, count: 0.238, size: 2.4 }
  },
  connecting: {
    128: { speed: 2.15, count: 1.4, size: 0.94 },
    96: { speed: 2.3, count: 1.05, size: 0.97 },
    64: { speed: 2.4, count: 0.72, size: 1 },
    20: { speed: 3, count: 0.24, size: 1.85 }
  },
  globe: {
    128: { speed: 1.85, count: 0.95, size: 1.02, extra: { scanMul: 4.08, dimBase: 0.45 } },
    96: { speed: 1.95, count: 0.68, size: 1.08, extra: { scanMul: 4.08, dimBase: 0.45 } },
    64: { speed: 2.015, count: 0.42, size: 1.15, extra: { scanMul: 4.08, dimBase: 0.45 } },
    20: { speed: 2.665, count: 0.105, size: 1.75, extra: { scanMul: 4.335, dimBase: 0.45 } }
  },
  rubik: {
    128: { speed: 1.65, count: 0.82, size: 0.95 },
    96: { speed: 1.72, count: 0.58, size: 1 },
    64: { speed: 1.82, count: 0.35, size: 1.05 },
    20: { speed: 1.95, count: 0.088, size: 1.9 }
  },
  wave: {
    128: { speed: 3.8, count: 0.8, size: 0.92 },
    96: { speed: 4.05, count: 0.56, size: 0.96 },
    64: { speed: 4.388, count: 0.341, size: 1 },
    20: { speed: 3.998, count: 0.105, size: 1.6 }
  },
  ribbon: {
    128: { speed: 2.1, count: 0.65, size: 0.78, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    96: { speed: 2.2, count: 0.44, size: 0.82, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    64: { speed: 2.34, count: 0.25, size: 0.85, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    20: { speed: 3.12, count: 0.051, size: 1.073, extra: { spin: 0, bandMul: 4.94, wobMul: 1 } }
  },
  responding: {
    128: { speed: 2.2, count: 1.75, size: 0.92 },
    96: { speed: 2.35, count: 1.3, size: 0.96 },
    64: { speed: 2.5, count: 0.9, size: 1 },
    20: { speed: 3.1, count: 0.22, size: 1.8 }
  },
  morph: {
    128: { speed: 2.1, count: 1, size: 0.3, extra: { spread: 1.45 } },
    96: { speed: 2.25, count: 0.75, size: 0.34, extra: { spread: 1.45 } },
    64: { speed: 2.405, count: 0.54, size: 0.395, extra: { spread: 1.45 } },
    20: { speed: 2.08, count: 0.53, size: 1.011, extra: { spread: 1.45 } }
  }
}, X = /* @__PURE__ */ new Map();
function qt(s, t) {
  const e = `${s}-${t}`, a = X.get(e);
  if (a) return a;
  const n = Ht[s], i = _t[n][t];
  let o = { ...Ft[n] };
  i.count !== 1 && (o = It(o, i.count)), i.size !== 1 && (o = Nt(o, i.size)), i.extra && (o = { ...o, ...i.extra });
  const r = { mode: n, speed: i.speed, opts: o };
  return X.set(e, r), r;
}
function $t(s) {
  let t = s;
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
function jt() {
  return typeof matchMedia > "u" || matchMedia("(prefers-color-scheme: dark)").matches;
}
function Q(s, t) {
  return s === "dark" ? !0 : s === "light" ? !1 : $t(t) ?? jt();
}
function tt(s, t) {
  return s ? typeof s.addEventListener == "function" ? (s.addEventListener("change", t), () => s.removeEventListener("change", t)) : (s.addListener(t), () => s.removeListener(t)) : () => {
  };
}
const at = [
  "idle",
  "working",
  "connecting",
  "searching",
  "solving",
  "listening",
  "composing",
  "responding",
  "shaping"
], rt = [20, 64, 96, 128], ct = ["auto", "dark", "light"], Ut = {
  idle: "Ready",
  working: "Working…",
  connecting: "Connecting…",
  searching: "Searching…",
  solving: "Solving…",
  listening: "Listening…",
  composing: "Composing…",
  responding: "Responding…",
  shaping: "Shaping…"
};
function Y(s, t) {
  return s.includes(t);
}
function Gt(s) {
  const t = typeof s == "string" ? document.querySelector(s) : s;
  if (!t)
    throw new Error("ThinkingOrb target was not found.");
  if (t instanceof HTMLCanvasElement)
    return { canvas: t, createdCanvas: !1 };
  const e = document.createElement("canvas");
  return e.dataset.thinkingOrbCanvas = "", t.append(e), { canvas: e, createdCanvas: !0 };
}
function et(s) {
  return typeof requestAnimationFrame == "function" ? requestAnimationFrame(s) : window.setTimeout(() => s(performance.now()), 16);
}
function Yt(s) {
  if (typeof cancelAnimationFrame == "function") {
    cancelAnimationFrame(s);
    return;
  }
  window.clearTimeout(s);
}
class ht {
  constructor(t, e = {}) {
    k(this, "canvas");
    k(this, "createdCanvas");
    k(this, "context");
    k(this, "stateValue", "working");
    k(this, "sizeValue", 64);
    k(this, "themeValue", "auto");
    k(this, "speedValue", 1);
    k(this, "pausedValue", !1);
    k(this, "customAriaLabel", null);
    k(this, "darkValue", !0);
    k(this, "reducedMotionValue", !1);
    k(this, "visibleValue", !0);
    k(this, "destroyed", !1);
    k(this, "running", !1);
    k(this, "frameHandle", 0);
    k(this, "intersectionObserver", null);
    k(this, "mutationObserver", null);
    k(this, "removeDarkMediaListener", () => {
    });
    k(this, "removeMotionMediaListener", () => {
    });
    k(this, "onVisibilityChange", () => {
      this.syncAnimation();
    });
    k(this, "onThemeChange", () => {
      const t = Q(this.themeValue, this.canvas);
      t !== this.darkValue && (this.darkValue = t, this.render());
    });
    k(this, "onReducedMotionChange", (t) => {
      this.reducedMotionValue = t.matches, this.render(), this.syncAnimation();
    });
    if (typeof document > "u")
      throw new Error("ThinkingOrb requires a browser DOM.");
    const { canvas: a, createdCanvas: n } = Gt(t), i = a.getContext("2d");
    if (!i)
      throw new Error("ThinkingOrb requires CanvasRenderingContext2D support.");
    this.canvas = a, this.createdCanvas = n, this.context = i, e.className && n && (a.className = e.className), this.setupObservers(), this.update(e);
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
      if (!Y(at, t.state))
        throw new TypeError(`Unknown ThinkingOrb state: ${String(t.state)}`);
      this.stateValue = t.state;
    }
    if (t.size !== void 0) {
      if (!Y(rt, t.size))
        throw new TypeError("ThinkingOrb size must be 20, 64, 96, or 128.");
      this.sizeValue = t.size;
    }
    if (t.theme !== void 0) {
      if (!Y(ct, t.theme))
        throw new TypeError(`Unknown ThinkingOrb theme: ${String(t.theme)}`);
      this.themeValue = t.theme;
    }
    if (t.speed !== void 0) {
      if (!Number.isFinite(t.speed) || t.speed <= 0)
        throw new TypeError("ThinkingOrb speed must be a positive number.");
      this.speedValue = t.speed;
    }
    return t.paused !== void 0 && (this.pausedValue = !!t.paused), "ariaLabel" in t && (this.customAriaLabel = ((e = t.ariaLabel) == null ? void 0 : e.trim()) || null), this.darkValue = Q(this.themeValue, this.canvas), this.configureCanvas(), this.render(), this.syncAnimation(), this;
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
    const { mode: e, speed: a, opts: n } = qt(
      this.stateValue,
      this.sizeValue
    ), i = t ?? (this.reducedMotionValue ? 0.6 : performance.now() / 1e3 * a * this.speedValue), o = this.getDevicePixelRatio();
    return this.context.setTransform(o, 0, 0, o, 0, 0), this.context.clearRect(0, 0, this.sizeValue, this.sizeValue), Ot[e](
      this.context,
      this.sizeValue,
      i,
      this.darkValue,
      n
    ), this;
  }
  destroy(t = {}) {
    var e, a;
    this.destroyed || (this.stop(), (e = this.intersectionObserver) == null || e.disconnect(), (a = this.mutationObserver) == null || a.disconnect(), this.removeDarkMediaListener(), this.removeMotionMediaListener(), document.removeEventListener("visibilitychange", this.onVisibilityChange), (t.removeCanvas ?? this.createdCanvas) && this.canvas.isConnected && this.canvas.remove(), this.destroyed = !0);
  }
  setupObservers() {
    const t = typeof matchMedia == "function" ? matchMedia("(prefers-color-scheme: dark)") : null, e = typeof matchMedia == "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
    this.reducedMotionValue = (e == null ? void 0 : e.matches) ?? !1, this.removeDarkMediaListener = tt(
      t,
      this.onThemeChange
    ), this.removeMotionMediaListener = tt(
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
      this.customAriaLabel ?? Ut[this.stateValue]
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
      this.running && (this.render(), this.frameHandle = et(t));
    };
    this.frameHandle = et(t);
  }
  stop() {
    this.running = !1, Yt(this.frameHandle);
  }
  assertActive() {
    if (this.destroyed)
      throw new Error("ThinkingOrb has been destroyed.");
  }
}
function Qt(s, t = {}) {
  return new ht(s, t);
}
const Kt = typeof globalThis.HTMLElement > "u" ? class {
} : globalThis.HTMLElement;
function nt(s) {
  return at.includes(s) ? s : "working";
}
function Wt(s) {
  const t = Number(s);
  return rt.includes(t) ? t : 64;
}
function Zt(s) {
  return ct.includes(s) ? s : "auto";
}
function Jt(s) {
  const t = Number(s);
  return Number.isFinite(t) && t > 0 ? t : 1;
}
class Z extends Kt {
  constructor() {
    super(...arguments);
    k(this, "controller", null);
  }
  connectedCallback() {
    var a, n, i;
    if (this.controller || !(this instanceof HTMLElement))
      return;
    (a = this.style).display || (a.display = "inline-block"), (n = this.style).lineHeight || (n.lineHeight = "0"), (i = this.style).verticalAlign || (i.verticalAlign = "middle");
    const e = document.createElement("canvas");
    e.dataset.thinkingOrbCanvas = "", this.replaceChildren(e), this.controller = new ht(e, this.readOptions());
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
    return nt(this.getAttribute("state"));
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
      state: nt(this.getAttribute("state")),
      size: Wt(this.getAttribute("size")),
      theme: Zt(this.getAttribute("theme")),
      speed: Jt(this.getAttribute("speed")),
      paused: this.hasAttribute("paused"),
      ariaLabel: this.getAttribute("aria-label")
    };
  }
}
k(Z, "observedAttributes", [
  "state",
  "size",
  "theme",
  "speed",
  "paused",
  "aria-label"
]);
function te(s = "thinking-orb") {
  if (!s.includes("-"))
    throw new TypeError("A custom-element name must contain a hyphen.");
  return typeof customElements < "u" && !customElements.get(s) && customElements.define(s, Z), Z;
}
export {
  Ot as MODE_DRAWS,
  rt as ORB_SIZES,
  at as ORB_STATES,
  ct as ORB_THEMES,
  Ht as STATE_TO_MODE,
  ht as ThinkingOrb,
  Z as ThinkingOrbElement,
  Qt as createThinkingOrb,
  te as defineThinkingOrb,
  qt as resolvePreset
};

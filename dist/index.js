var Ht = Object.defineProperty;
var Wt = (s, t, n) => t in s ? Ht(s, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : s[t] = n;
var A = (s, t, n) => Wt(s, typeof t != "symbol" ? t + "" : t, n);
function ht(s, t) {
  const n = Math.sin(s * 12.9898 + t * 78.233) * 43758.5453;
  return n - Math.floor(n);
}
function et(s, t) {
  const n = Math.PI * (3 - Math.sqrt(5)), r = 1 - 2 * (s + 0.5) / t, e = Math.sqrt(1 - r * r), o = s * n;
  return [e * Math.cos(o), r, e * Math.sin(o)];
}
function Gt(s, t) {
  return Math.atan2(Math.sin(s - t), Math.cos(s - t));
}
function q(s, t, n, r, e) {
  const o = Math.sin(t), i = Math.cos(t), a = Math.sin(s), h = Math.cos(s);
  return (M, d, f) => {
    const u = M * h + f * a, c = -M * a + f * h, l = d * i - c * o, g = d * o + c * i;
    return [n + u * e, r - l * e, g];
  };
}
function G(s, t, n, r = 0.3) {
  t.sort((e, o) => e.z - o.z);
  for (const e of t) {
    const o = e.a ?? 1;
    if (o < 0.02) continue;
    const i = Math.min(1, Math.max(0, e.white)), a = Math.round((n ? 1 - i : i) * 255);
    s.fillStyle = `rgba(${a},${a},${a},${o})`, s.beginPath(), s.arc(e.x, e.y, Math.max(r, e.r), 0, Math.PI * 2), s.fill();
  }
}
function Z(s, t) {
  return (s / 300) ** t;
}
function Vt(s, t, n, r) {
  const e = 2 * t * n + r, o = s % e, i = new Array(t).fill(0);
  let a = -1;
  if (o < 2 * t * n) {
    const h = Math.floor(o / n), M = (o - h * n) / n, f = 1 - (1 - Math.min(1, M / 0.7)) ** 3;
    if (h < t) {
      for (let u = 0; u < h; u++) i[u] = 1;
      i[h] = f, a = h;
    } else {
      const u = 2 * t - 1 - h;
      for (let c = 0; c < u; c++) i[c] = 1;
      i[u] = 1 - f, a = u;
    }
  }
  return { amount: i, active: a };
}
function Lt(s, t, n) {
  let [r, e, o] = s, i = !1;
  for (let a = 0; a < t.length; a++) {
    if (n.amount[a] <= 0) continue;
    const h = t[a], M = h.axis === 0 ? r : h.axis === 1 ? e : o;
    if (M < h.lo || M >= h.hi) continue;
    a === n.active && (i = !0);
    const d = h.ang * n.amount[a], f = Math.cos(d), u = Math.sin(d);
    if (h.axis === 0) {
      const c = e * f - o * u;
      o = e * u + o * f, e = c;
    } else if (h.axis === 1) {
      const c = r * f + o * u;
      o = -r * u + o * f, r = c;
    } else {
      const c = r * f - e * u;
      e = r * u + e * f, r = c;
    }
  }
  return [r, e, o, i];
}
function Rt(s) {
  const t = [];
  for (let n = 0; n < s; n++) {
    const r = Math.min(2, Math.floor(ht(n, 2.3) * 3)), e = -1 + 0.5 * Math.min(3, Math.floor(ht(n, 5.9) * 4)), o = ht(n, 7.7) < 0.5 ? 1 : -1;
    t.push({ axis: r, lo: e, hi: e + 0.5, ang: o * Math.PI / 2 });
  }
  return t;
}
const Zt = (s, t, n, r, e) => {
  const i = t / 2, a = t / 2, h = t / 2 * 0.82, M = 0.4 + 0.06 * Math.sin(n * 0.35), d = q(n * 0.5, M, i, a, h), f = n * (0.5 + (1.7 - 0.5) * (e.scanMul ?? 1)), u = Z(t, e.rsPow ?? 0.6), c = e.dimBase ?? 1, l = [], g = e.latRings ?? 17, b = e.lonDensity ?? 44;
  for (let p = 0; p <= g; p++) {
    const v = -Math.PI / 2 + p / g * Math.PI, m = Math.cos(v), x = Math.sin(v), y = Math.max(1, Math.round(Math.abs(m) * b));
    for (let k = 0; k < y; k++) {
      const S = k / y * 2 * Math.PI, [P, C, w] = d(m * Math.cos(S), x, m * Math.sin(S)), V = (w + 1) / 2, I = Gt(S + n * 0.5, f), R = Math.exp(-(I * I) / 0.18) * Math.max(0, w);
      l.push({
        x: P,
        y: C,
        z: w,
        r: ((e.rBase ?? 0.6) + (e.rDepth ?? 1.7) * V + (e.rBoost ?? 1) * R) * u,
        white: (e.inkFar ?? 0.62) - (e.inkSpan ?? 0.54) * V,
        // dimBase < 1 fades un-scanned dots so the meridian reads clearly
        a: c + (1 - c) * Math.min(1, R)
      });
    }
  }
  G(s, l, r, e.rMin);
}, Jt = (s, t, n, r, e) => {
  const o = t / 2, i = t / 2, a = t / 2 * 0.82, h = q(n * 0.55, 0.35 + 0.1 * Math.sin(n * 0.9), o, i, a), M = Z(t, e.rsPow ?? 0.6), d = e.moveCount ?? 14, f = Rt(d), u = Vt(n, d, 0.42, 1.2), c = [], l = e.latRings ?? 15, g = e.lonDensity ?? 40;
  for (let b = 0; b <= l; b++) {
    const p = -Math.PI / 2 + b / l * Math.PI, v = Math.cos(p), m = Math.sin(p), x = Math.max(1, Math.round(Math.abs(v) * g));
    for (let y = 0; y < x; y++) {
      const k = y / x * 2 * Math.PI, [S, P, C, w] = Lt([v * Math.cos(k), m, v * Math.sin(k)], f, u), [V, I, R] = h(S, P, C), D = (R + 1) / 2;
      c.push({
        x: V,
        y: I,
        z: R,
        r: ((e.rBase ?? 0.6) + (e.rDepth ?? 1.7) * D + (w ? e.rActive ?? 0.3 : 0)) * M,
        white: (e.inkFar ?? 0.62) - (e.inkSpan ?? 0.54) * D - (w ? 0.14 : 0)
      });
    }
  }
  G(s, c, r, e.rMin);
}, Kt = (s, t, n, r, e) => {
  const o = t / 2, i = t / 2, a = t / 2 * 0.874, h = q(n * 0.18, 0.38, o, i, 1), M = Z(t, e.rsPow ?? 0.6), d = [], f = e.rings ?? 15, u = e.lonDensity ?? 40;
  for (let c = 0; c <= f; c++) {
    const l = -Math.PI / 2 + c / f * Math.PI, g = Math.cos(l), b = Math.sin(l), p = 0.62 * Math.sin(n * 2.1 - c * 0.52) + 0.38 * Math.sin(n * 1.27 + c * 0.83), v = a * (0.88 + 0.105 * p), m = Math.max(1, Math.round(Math.abs(g) * u));
    for (let x = 0; x < m; x++) {
      const y = x / m * 2 * Math.PI, [k, S, P] = h(g * Math.cos(y) * v, b * v, g * Math.sin(y) * v), C = (P / a + 1) / 2, w = Math.max(0, p);
      d.push({
        x: k,
        y: S,
        z: P,
        r: ((e.rBase ?? 0.6) + (e.rDepth ?? 1.7) * C) * (1 + 0.4 * w) * M,
        white: 0.66 - 0.56 * C - 0.1 * w
      });
    }
  }
  G(s, d, r, e.rMin);
};
function Qt(s) {
  return s * s * (3 - 2 * s);
}
function At(s) {
  const t = s.length, n = [];
  let r = 0;
  for (let e = 0; e < t; e++) {
    const o = s[e], i = s[(e + 1) % t], a = Math.hypot(i[0] - o[0], i[1] - o[1]);
    n.push(a), r += a;
  }
  return (e) => {
    let o = e * r, i = 0;
    for (; o > n[i] && i < t - 1; )
      o -= n[i], i++;
    const a = s[i], h = s[(i + 1) % t], M = n[i] ? Math.min(1, o / n[i]) : 0;
    return [a[0] + (h[0] - a[0]) * M, a[1] + (h[1] - a[1]) * M];
  };
}
const tn = (s) => {
  const t = -Math.PI / 2 + s * 2 * Math.PI;
  return [Math.cos(t) * 0.24, Math.sin(t) * 0.24];
}, nn = At([
  [0, -0.26],
  [0.24, 0.16],
  [-0.24, 0.16]
]), en = At([
  [0, -0.2],
  [0.2, -0.2],
  [0.2, 0.2],
  [-0.2, 0.2],
  [-0.2, -0.2]
]), ut = [tn, nn, en];
function sn(s) {
  return Math.max(6, Math.round(34 * s));
}
const pt = 1.4, It = 0.9, lt = pt + It;
function Dt(s, t) {
  const n = ut.length, r = s % (lt * n), e = Math.floor(r / lt), o = r - e * lt, i = o > pt ? Qt((o - pt) / It) : 0, a = t.spread ?? 1, h = ut[e], M = ut[(e + 1) % n], d = 160, f = [];
  for (let c = 0; c < d; c++) {
    const l = c / d, g = h(l), b = M(l);
    f.push([(g[0] + (b[0] - g[0]) * i) * a, (g[1] + (b[1] - g[1]) * i) * a]);
  }
  const u = 1 + 0.02 * Math.sin(o * 3.1);
  return { points: f, pulse: u };
}
const on = (s, t, n, r, e) => {
  const { points: o, pulse: i } = Dt(n, e), a = o.length, h = [];
  let M = 0;
  for (let b = 0; b < a; b++) {
    const p = o[b], v = o[(b + 1) % a], m = Math.hypot(v[0] - p[0], v[1] - p[1]);
    h.push(m), M += m;
  }
  const d = sn(e.iconD ?? 1), f = (e.rDot ?? 0.021) * 1.35 * (e.spread ?? 1), u = [], c = t / 2;
  let l = 0, g = 0;
  for (let b = 0; b < d; b++) {
    const p = b / d * M;
    for (; g + h[l] < p && l < a - 1; )
      g += h[l], l++;
    const v = o[l], m = o[(l + 1) % a], x = h[l] ? Math.min(1, (p - g) / h[l]) : 0, y = (v[0] + (m[0] - v[0]) * x) * i, k = (v[1] + (m[1] - v[1]) * x) * i;
    u.push({
      x: c + y * t,
      y: c + k * t,
      z: 0,
      r: Math.max(0.35, f * t),
      white: 0.1
    });
  }
  G(s, u, r, e.rMin);
}, X = Math.PI * 2;
function st(s, t) {
  return s ? `rgba(250,250,250,${t})` : `rgba(24,24,27,${t})`;
}
function Q(s, t, n, r, e, o, i = !0) {
  s.beginPath();
  for (let a = 0; a <= n; a++) {
    const [h, M] = t(a / n);
    a === 0 ? s.moveTo(h, M) : s.lineTo(h, M);
  }
  i && s.closePath(), s.strokeStyle = st(r, e), s.lineWidth = o, s.lineCap = "round", s.lineJoin = "round", s.stroke();
}
function K(s, t, n, r, e, o, i, a, h, M = 0) {
  if (Q(
    s,
    (u) => {
      const [c, l] = t(u);
      return [c, l];
    },
    n,
    r,
    e,
    i
  ), h == null) {
    s.beginPath();
    let u = !1;
    for (let c = 0; c <= n; c++) {
      const [l, g, b] = t(c / n);
      if (b < 0) {
        u = !1;
        continue;
      }
      u ? s.lineTo(l, g) : (s.moveTo(l, g), u = !0);
    }
    s.strokeStyle = st(r, o), s.lineWidth = a, s.lineCap = "round", s.lineJoin = "round", s.stroke();
    return;
  }
  const d = 16, f = Math.max(3, Math.round(n / d));
  for (let u = 0; u < d; u++) {
    const c = u / d, l = (u + 1) / d, g = (c + l) / 2, [, , b] = t(g);
    if (b < -0.08)
      continue;
    const p = Math.min(1, Math.max(0, (b + 0.08) / 1.08)), v = Math.min(
      1,
      Math.max(
        0,
        0.62 + 0.25 * Math.sin(
          h * 9.2 + M * 1.71 + u * 2.37
        ) + 0.13 * Math.sin(
          h * 14.3 - M * 0.83 + u * 4.11
        )
      )
    );
    Q(
      s,
      (m) => {
        const [x, y] = t(c + (l - c) * m);
        return [x, y];
      },
      f,
      r,
      o * p * (0.48 + 0.52 * v),
      i + (a - i) * p * (0.76 + 0.24 * v),
      !1
    );
  }
}
function ot(s) {
  return s >= 128 ? [17, 11] : s >= 96 ? [14, 9] : s >= 64 ? [12, 8] : [6, 4];
}
function at(s, t, n, r, e, o, i, a, h) {
  const M = t / 2, d = q(r, e, M, M, o), f = Math.max(0.38, t / 190), u = t >= 96 ? 80 : 48;
  for (let c = 0; c < i; c++) {
    const l = -Math.PI / 2 + c / Math.max(1, i - 1) * Math.PI;
    K(
      s,
      (g) => {
        const b = g * X - Math.PI / 2, p = Math.sin(b);
        return d(
          p * Math.cos(l),
          Math.cos(b),
          p * Math.sin(l)
        );
      },
      u,
      n,
      h * 0.5,
      h,
      f * 0.72,
      f * 1.15
    );
  }
  for (let c = 0; c < a; c++) {
    const l = -Math.PI / 2 + (c + 1) / (a + 1) * Math.PI, g = Math.cos(l);
    K(
      s,
      (b) => {
        const p = b * X;
        return d(
          Math.cos(p) * g,
          Math.sin(l),
          Math.sin(p) * g
        );
      },
      u,
      n,
      h * 0.45,
      h * 0.9,
      f * 0.72,
      f * 1.15
    );
  }
}
function an(s, t, n, r, e, o = 1) {
  s.fillStyle = st(e, o), s.beginPath(), s.arc(t, n, r, 0, X), s.fill();
}
const rn = (s, t, n, r, e) => {
  const o = 0.94 + 0.055 * Math.sin(n * 0.85), [i, a] = ot(t);
  at(
    s,
    t,
    r,
    n * 0.08,
    0.34,
    t * 0.38 * o,
    i,
    a,
    0.55
  );
}, cn = (s, t, n, r, e) => {
  const o = t / 2, i = t * ((e.lobeGap ?? 0.17) + (e.gapPulse ?? 0.012) * Math.sin(n * 1.15)), a = t * (e.lobeRadius ?? 0.2), h = t >= 64 ? Math.max(2, Math.round(e.laneCount ?? 3)) : 2, M = t >= 64 ? Math.max(2, Math.round(e.bridgeStrands ?? 3)) : 2, d = n * (e.signalSpeed ?? 0.28) % 1, [f, u] = ot(t);
  at(
    s,
    t,
    r,
    n * 0.07,
    0.34 + 0.055 * Math.sin(n * 0.3),
    t * (e.bodyRadius ?? 0.39),
    f,
    u,
    0.3
  );
  for (const c of [-1, 1]) {
    const l = q(
      n * 0.48 * c,
      0.46,
      o + i * c,
      o,
      a
    ), g = (p, v) => {
      const m = (p - (h - 1) / 2) * 0.38, x = Math.sqrt(Math.max(0, 1 - m * m)), y = v * X + p * 0.18;
      return l(
        Math.cos(y) * x,
        m,
        Math.sin(y) * x
      );
    }, b = (p, v) => {
      const m = -Math.PI / 2 + p / (h - 1) * Math.PI, x = v * X - Math.PI / 2, y = Math.sin(x);
      return l(
        y * Math.cos(m),
        Math.cos(x),
        y * Math.sin(m)
      );
    };
    for (let p = 0; p < h; p++)
      K(
        s,
        (v) => g(p, v),
        t >= 96 ? 72 : 44,
        r,
        0.34,
        0.72,
        Math.max(0.34, t / 205),
        Math.max(0.48, t / 145)
      ), K(
        s,
        (v) => b(p, v),
        t >= 96 ? 72 : 44,
        r,
        0.3,
        0.66,
        Math.max(0.32, t / 215),
        Math.max(0.46, t / 155)
      );
    for (let p = 0; p < M; p++) {
      const v = c < 0 ? 1 : -1, m = (1 + p / M * 0.68 + d * v) % 1, x = p % h, [y, k, S] = g(
        x,
        m
      ), P = (S + 1) / 2, C = Math.max(0.8, t / 54), w = Math.max(
        0.5,
        C * (0.35 + 0.65 * P)
      );
      an(
        s,
        y,
        k,
        w,
        r,
        0.42 + 0.58 * P
      );
    }
  }
}, hn = (s, t, n, r, e) => {
  const o = t / 2, i = t / 2 * 0.82, a = q(0.5, 0.42, o, o, i), h = Math.max(2, Math.round(e.latRings ?? 17)), M = t >= 96 ? 88 : 52, d = Math.max(0.4, t / 175);
  for (let c = 0; c <= h; c++) {
    const l = -Math.PI / 2 + c / h * Math.PI, g = Math.cos(l), b = Math.sin(l);
    Q(
      s,
      (p) => {
        const v = p * X, [m, x] = a(
          g * Math.cos(v),
          b,
          g * Math.sin(v)
        );
        return [m, x];
      },
      M,
      r,
      e.dimBase ?? 0.45,
      d
    );
  }
  const f = 0.34 * (e.scanMul ?? 1), u = t >= 96 ? 16 : 10;
  for (let c = 1; c < h; c++) {
    const l = -Math.PI / 2 + c / h * Math.PI, g = Math.cos(l), b = Math.sin(l), p = 0.5 + 0.5 * Math.sin(n * f * 2.2 + c * 1.73), v = 0.5 + 0.39 * Math.sin(n * f * 0.72 + c * 2.41), m = 0.035 + 0.025 * p, x = v - m, y = v + m;
    Q(
      s,
      (k) => {
        const S = (x + (y - x) * k) * X, [P, C] = a(
          g * Math.cos(S),
          b,
          g * Math.sin(S)
        );
        return [P, C];
      },
      u,
      r,
      0.2 + 0.76 * p,
      d * (1.25 + 0.75 * p),
      !1
    );
  }
}, un = (s, t, n, r, e) => {
  const o = t / 2, i = t / 2 * 0.82, a = q(
    n * 0.55,
    0.35 + 0.1 * Math.sin(n * 0.9),
    o,
    o,
    i
  ), h = Math.max(1, Math.round(e.moveCount ?? 14)), M = Rt(h), d = Vt(n, h, 0.42, 1.2), f = Math.max(2, Math.round(e.latRings ?? 15)), u = t >= 96 ? 96 : 56;
  for (let c = 0; c <= f; c++) {
    const l = -Math.PI / 2 + c / f * Math.PI, g = Math.cos(l), b = Math.sin(l);
    let p = null;
    s.beginPath();
    for (let v = 0; v <= u; v++) {
      const m = v / u * X, [x, y, k] = Lt(
        [
          g * Math.cos(m),
          b,
          g * Math.sin(m)
        ],
        M,
        d
      ), [S, P] = a(x, y, k), C = p ? Math.hypot(S - p[0], P - p[1]) : 0;
      !p || C > t * 0.2 ? s.moveTo(S, P) : s.lineTo(S, P), p = [S, P];
    }
    s.closePath(), s.strokeStyle = st(r, 0.56 + 0.24 * (c / f)), s.lineWidth = Math.max(0.42, t / 160), s.lineCap = "round", s.lineJoin = "round", s.stroke();
  }
}, ln = (s, t, n, r, e) => {
  const o = t / 2, i = t / 2 * 0.78, a = e.spin ?? 1, h = q(n * 0.1 * a, 0.3, o, o, 1), M = n * 0.24 * a, d = 0.55 + 0.3 * Math.sin(n * 0.18) * a, f = Math.cos(M), u = 0, c = Math.sin(M), l = -c * Math.sin(d), g = Math.cos(d), b = f * Math.sin(d), p = u * b - c * g, v = c * l - f * b, m = f * g - u * l, x = Math.max(1, Math.round(e.lanes ?? 5)), y = Math.max(1, Math.round(x * (e.bandMul ?? 1))), [k, S] = ot(t);
  at(
    s,
    t,
    r,
    n * 0.1,
    0.3 + 0.055 * Math.sin(n * 0.3),
    i,
    k,
    S,
    0.18
  );
  for (let P = 0; P < y; P++) {
    const C = (P - (y - 1) / 2) * 0.075, w = Math.abs(P - (y - 1) / 2) / Math.max(1, (y - 1) / 2);
    K(
      s,
      (I) => {
        const R = I * X, D = (0.16 * Math.sin(
          R * 3 - n * 1.7 + P * 0.22
        ) + 0.07 * Math.sin(R * 5 + n * 1.1)) * (e.wobMul ?? 1), T = C + D, O = f * Math.cos(R) + l * Math.sin(R) + p * T, B = u * Math.cos(R) + g * Math.sin(R) + v * T, L = c * Math.cos(R) + b * Math.sin(R) + m * T, E = Math.sqrt(O * O + B * B + L * L), [z, N, $] = h(
          O / E * i,
          B / E * i,
          L / E * i
        );
        return [z, N, $ / i];
      },
      t >= 96 ? 96 : 60,
      r,
      0.16 + 0.22 * (1 - w),
      0.48 + 0.42 * (1 - w),
      Math.max(0.32, t / 220),
      Math.max(0.5, t / 135)
    );
  }
}, dn = (s, t, n, r, e) => {
  const o = t / 2, i = Math.max(2, Math.round(e.shellCount ?? 3)), a = Math.max(
    i,
    Math.round(e.ribbonLineCount ?? 25)
  ), h = Math.floor(a / i), M = a % i, [d, f] = ot(t);
  at(
    s,
    t,
    r,
    n * 0.1,
    0.34 + 0.055 * Math.sin(n * 0.3),
    t * 0.39,
    d,
    f,
    0.28
  );
  for (let u = 0; u < i; u++) {
    const c = n * (e.pulseSpeed ?? 0.17) * X + u / i * X, l = (1 - Math.cos(c)) / 2, g = t * (0.32 + 0.07 * l), b = 0.45 + 0.55 * ((1 + Math.sin(c)) / 2), p = n * 0.1 + u * 0.82, v = 0.5 + 0.12 * Math.sin(n * 0.25 + u), m = Math.cos(p), x = 0, y = Math.sin(p), k = -y * Math.sin(v), S = Math.cos(v), P = m * Math.sin(v), C = x * P - y * S, w = y * k - m * P, V = m * S - x * k, I = q(0, 0.18, o, o, g), R = h + (u < M ? 1 : 0), D = e.bandSpread ?? 0.075;
    for (let T = 0; T < R; T++) {
      const O = (T - (R - 1) / 2) * D, B = (L) => {
        const E = (0.085 * Math.sin(
          L * 3 - n * 1.15 + T * 0.24 + u
        ) + 0.032 * Math.sin(L * 5 + n * 0.72 - u)) * (e.wobMul ?? 1), z = O + E, N = m * Math.cos(L) + k * Math.sin(L) + C * z, $ = x * Math.cos(L) + S * Math.sin(L) + w * z, j = y * Math.cos(L) + P * Math.sin(L) + V * z, Y = Math.sqrt(N * N + $ * $ + j * j), [F, U, _] = I(
          N / Y,
          $ / Y,
          j / Y
        );
        return [F, U, _];
      };
      K(
        s,
        (L) => B(L * X),
        t >= 96 ? 88 : 52,
        r,
        0.16 + 0.22 * b,
        0.42 + 0.46 * b,
        Math.max(0.32, t / 220),
        Math.max(0.5, t / 130),
        n * ((e.shimmerSpeed ?? 0.55) / 0.55),
        u * 11 + T
      );
    }
  }
}, Mn = (s, t, n, r, e) => {
  const { points: o, pulse: i } = Dt(n, e), a = t / 2;
  Q(
    s,
    (h) => {
      const M = h * o.length, d = Math.floor(M) % o.length, f = (d + 1) % o.length, u = M - Math.floor(M), c = o[d], l = o[f];
      return [
        a + (c[0] + (l[0] - c[0]) * u) * i * t,
        a + (c[1] + (l[1] - c[1]) * u) * i * t
      ];
    },
    o.length,
    r,
    0.94,
    Math.max(0.75, t / 90)
  );
}, W = Math.PI * 2;
function Et(s) {
  return s >= 96 ? 96 : s >= 64 ? 72 : 48;
}
function pn(s) {
  return s >= 128 ? [17, 11] : s >= 96 ? [14, 9] : s >= 64 ? [12, 8] : [6, 4];
}
function dt(s, t) {
  return s ? `rgba(250,250,250,${t})` : `rgba(24,24,27,${t})`;
}
function fn(s, t, n) {
  const r = Et(t);
  s.beginPath();
  for (let e = 0; e <= r; e++) {
    const [o, i] = n.path(e / r), a = t / 2 + o * t, h = t / 2 + i * t;
    e === 0 ? s.moveTo(a, h) : s.lineTo(a, h);
  }
  s.closePath(), s.stroke();
}
function mn(s, t, n) {
  if (!n.depthPath)
    return;
  const r = Et(t);
  s.beginPath();
  let e = !1;
  for (let o = 0; o <= r; o++) {
    const [i, a, h] = n.depthPath(o / r);
    if (h < 0) {
      e = !1;
      continue;
    }
    const M = t / 2 + i * t, d = t / 2 + a * t;
    e ? s.lineTo(M, d) : (s.moveTo(M, d), e = !0);
  }
  s.stroke();
}
function Mt(s, t, n) {
  return {
    path: (r) => {
      const [e, o] = s(r);
      return [e, o];
    },
    depthPath: s,
    alpha: t * 0.5,
    width: n * 0.72,
    nearAlpha: t,
    nearWidth: n * 1.15
  };
}
function Ot(s, t, n, r, e = 0.86, o) {
  const i = t / 2, a = t * 0.405;
  s.save(), s.lineCap = "round", s.lineJoin = "round", s.beginPath(), s.arc(i, i, a, 0, W), s.clip();
  for (const h of r)
    s.strokeStyle = dt(n, h.alpha), s.lineWidth = h.width ?? Math.max(0.42, t / 150), fn(s, t, h), h.depthPath && (s.strokeStyle = dt(
      n,
      h.nearAlpha ?? Math.min(1, h.alpha * 1.8)
    ), s.lineWidth = h.nearWidth ?? (h.width ?? Math.max(0.42, t / 150)) * 1.2, mn(s, t, h));
  s.restore(), !(e <= 0) && (s.strokeStyle = dt(n, e), s.lineWidth = Math.max(0.5, t / 135), s.beginPath(), s.arc(i, i, a, 0, W), s.stroke());
}
function yt(s, t, n, r, e, o, i, a) {
  const h = t % 2 === 0 ? 1 : -1, M = t / e * Math.PI, d = M + o * 0.19 * h, f = 0.5 + t * 0.18 + 0.08 * Math.sin(o * 0.32 + M), u = Math.cos(d), c = 0, l = Math.sin(d), g = -l * Math.sin(f), b = Math.cos(f), p = u * Math.sin(f), v = c * p - l * b, m = l * g - u * p, x = u * b - c * g, y = s * W, k = (n - (r - 1) / 2) * i, S = (0.105 * Math.sin(
    y * 3 - o * 1.35 * h + n * 0.2 + M
  ) + 0.04 * Math.sin(y * 5 + o * 0.78 - M)) * a, P = k + S, C = u * Math.cos(y) + g * Math.sin(y) + v * P, w = c * Math.cos(y) + b * Math.sin(y) + m * P, V = l * Math.cos(y) + p * Math.sin(y) + x * P, I = Math.sqrt(C * C + w * w + V * V), R = C / I, D = w / I, T = V / I, O = o * 0.08, B = 0.3, L = Math.cos(O), E = Math.sin(O), z = R * L + T * E, N = -R * E + T * L, $ = Math.cos(B), j = Math.sin(B);
  return [
    z * 0.405,
    (D * $ - N * j) * 0.405,
    D * j + N * $
  ];
}
function Bt(s, t, n, r) {
  const e = r * 0.08, o = 0.3 + 0.055 * Math.sin(r * 0.3), i = Math.cos(e), a = Math.sin(e), h = s * i + n * a, M = -s * a + n * i, d = Math.cos(o), f = Math.sin(o);
  return [
    h * 0.405,
    (t * d - M * f) * 0.405,
    t * f + M * d
  ];
}
function gn(s, t, n) {
  const r = s * W - Math.PI / 2, e = Math.sin(r);
  return Bt(
    e * Math.cos(t),
    Math.cos(r),
    e * Math.sin(t),
    n
  );
}
function bn(s, t, n) {
  const r = s * W, e = Math.cos(t);
  return Bt(
    Math.cos(r) * e,
    Math.sin(t),
    Math.sin(r) * e,
    n
  );
}
const vn = (s, t, n, r, e) => {
  const o = Math.max(4, Math.round(e.orbitN ?? 12)), i = Math.max(2, Math.round(e.bandCount ?? 2)), a = Math.max(2, Math.round(o / i)), h = Math.max(1, Math.round(e.particles ?? 5)), M = Z(t, e.rsPow ?? 0.6), d = [], [f, u] = pn(t);
  for (let c = 0; c < f; c++) {
    const l = c / Math.max(1, f - 1), g = -Math.PI / 2 + l * Math.PI, b = (p) => gn(
      p,
      g,
      n
    );
    d.push(Mt(
      b,
      0.2 + 0.14 * (1 - Math.abs(l * 2 - 1)),
      Math.max(0.38, t / 190)
    ));
  }
  for (let c = 0; c < u; c++) {
    const l = -Math.PI / 2 + (c + 1) / (u + 1) * Math.PI, g = (b) => bn(
      b,
      l,
      n
    );
    d.push(Mt(
      g,
      0.22,
      Math.max(0.38, t / 190)
    ));
  }
  for (let c = 0; c < i; c++)
    for (let l = 0; l < a; l++) {
      const g = Math.abs(l - (a - 1) / 2) / Math.max(1, (a - 1) / 2), b = (p) => yt(
        p,
        c,
        l,
        a,
        i,
        n,
        e.bandSpread ?? 0.064,
        e.wobMul ?? 1
      );
      d.push(Mt(
        b,
        0.48 + 0.32 * (1 - g) + c * 0.04,
        Math.max(0.45, t / 145)
      ));
    }
  Ot(s, t, r, d, 0);
  for (let c = 0; c < i; c++) {
    const l = c % 2 === 0 ? 1 : -1, g = c / i * Math.PI;
    for (let b = 0; b < h; b++) {
      const p = b % a, v = n * (0.72 + c * 0.08) * l + b / h * W + g, [m, x, y] = yt(
        v / W,
        c,
        p,
        a,
        i,
        n,
        e.bandSpread ?? 0.064,
        e.wobMul ?? 1
      ), k = (y + 1) / 2, S = Math.min(1, Math.max(0, 0.14 - 0.1 * k)), P = Math.round((r ? 1 - S : S) * 255), w = ((e.partR ?? 1.55) + (e.partRDepth ?? 2.1)) * M * (0.35 + 0.65 * k), V = 0.42 + 0.58 * k;
      s.fillStyle = `rgba(${P},${P},${P},${V})`, s.beginPath(), s.arc(
        t / 2 + m * t,
        t / 2 + x * t,
        w,
        0,
        W
      ), s.fill();
    }
  }
}, yn = (s, t, n, r, e) => {
  const o = Math.max(2, Math.round(e.rings ?? 15)), i = [];
  for (let a = 0; a <= o; a++) {
    const h = -Math.PI / 2 + a / o * Math.PI, M = Math.cos(h), d = Math.sin(h), f = 0.62 * Math.sin(n * 2.1 - a * 0.52) + 0.38 * Math.sin(n * 1.27 + a * 0.83), u = Math.pow(Math.abs(M), 0.72), c = 0.4 * (0.92 + 0.075 * f * u);
    i.push({
      path: (l) => {
        const g = l * W, b = M * Math.cos(g) * c, p = d * c, v = M * Math.sin(g) * c, m = n * 0.18, x = 0.38, y = Math.cos(m), k = Math.sin(m), S = b * y + v * k, P = -b * k + v * y, C = Math.cos(x), w = Math.sin(x);
        return [
          S,
          p * C - P * w
        ];
      },
      alpha: 0.42 + 0.38 * (a / o),
      width: Math.max(0.42, t / 155)
    });
  }
  Ot(s, t, r, i, 0);
};
function Nt(s, t) {
  return Math.max(12, Math.round(s.pointN ?? t));
}
function nt(s, t, n) {
  return ((n.rBase ?? 0.7) + (n.rDepth ?? 1.5) * t) * Z(s, n.rsPow ?? 0.6);
}
const wn = (s, t, n, r, e) => {
  const o = t / 2, i = Nt(e, 132), a = 0.94 + 0.055 * Math.sin(n * 0.85), h = q(n * 0.08, 0.34, o, o, t * 0.38 * a), M = [];
  for (let d = 0; d < i; d++) {
    const [f, u, c] = h(...et(d, i)), l = (c + 1) / 2;
    M.push({
      x: f,
      y: u,
      z: c,
      r: nt(t, l, e),
      white: 0.7 - 0.58 * l,
      a: 0.5 + 0.5 * l
    });
  }
  G(s, M, r, e.rMin);
}, xn = (s, t, n, r, e) => {
  const o = t / 2, i = Nt(e, 108), a = Math.PI * 2, h = t * ((e.lobeGap ?? 0.17) + (e.gapPulse ?? 0.012) * Math.sin(n * 1.15)), M = t * (e.lobeRadius ?? 0.2), d = t >= 64 ? Math.max(2, Math.round(e.laneCount ?? 3)) : 2, f = t >= 64 ? Math.max(8, Math.round(e.nodeMinSegments ?? 10)) : 8, u = Math.max(
    f,
    Math.round(i * 0.38 / (d * 2))
  ), c = t >= 64 ? Math.max(2, Math.round(e.bridgeStrands ?? 3)) : 2, l = [], g = Math.max(16, Math.round(i * 0.34)), b = t * (e.bodyRadius ?? 0.39), p = q(
    n * 0.07,
    0.34 + 0.055 * Math.sin(n * 0.3),
    o,
    o,
    b
  ), v = Math.max(
    4,
    Math.round(Math.sqrt(i) * 0.55)
  ), m = Math.max(
    2,
    Math.round(Math.sqrt(i) * 0.3)
  ), x = Math.max(
    8,
    Math.round(g / (v + m))
  ), y = (S, P, C) => {
    const w = (C + 1) / 2;
    l.push({
      x: S,
      y: P,
      z: C,
      r: nt(t, w, e) * 0.92,
      white: 0.58 - 0.4 * w,
      a: 0.38 + 0.42 * w
    });
  };
  for (let S = 0; S < v; S++) {
    const P = -Math.PI / 2 + S / (v - 1) * Math.PI;
    for (let C = 0; C < x; C++) {
      const w = C / x * a - Math.PI / 2, V = Math.sin(w);
      y(...p(
        V * Math.cos(P),
        Math.cos(w),
        V * Math.sin(P)
      ));
    }
  }
  for (let S = 0; S < m; S++) {
    const P = -Math.PI / 2 + (S + 1) / (m + 1) * Math.PI, C = Math.cos(P);
    for (let w = 0; w < x; w++) {
      const V = w / x * a;
      y(...p(
        Math.cos(V) * C,
        Math.sin(P),
        Math.sin(V) * C
      ));
    }
  }
  const k = n * (e.signalSpeed ?? 0.28) % 1;
  for (const S of [-1, 1]) {
    const P = q(
      n * 0.48 * S,
      0.46,
      o + h * S,
      o,
      M
    ), C = (w, V) => {
      const I = (w - (d - 1) / 2) * 0.38, R = Math.sqrt(Math.max(0, 1 - I * I)), D = V * a + w * 0.18;
      return P(
        Math.cos(D) * R,
        I,
        Math.sin(D) * R
      );
    };
    for (let w = 0; w < d; w++) {
      const V = (w - (d - 1) / 2) * 0.38, I = Math.sqrt(Math.max(0, 1 - V * V));
      for (let D = 0; D < u; D++) {
        const T = D / u * Math.PI * 2 + w * 0.18, [O, B, L] = P(
          Math.cos(T) * I,
          V,
          Math.sin(T) * I
        ), E = (L + 1) / 2;
        l.push({
          x: O,
          y: B,
          z: L,
          r: nt(t, E, e),
          white: 0.58 - 0.46 * E,
          a: 0.55 + 0.4 * E
        });
      }
      const R = -Math.PI / 2 + w / (d - 1) * Math.PI;
      for (let D = 0; D < u; D++) {
        const T = D / u * a - Math.PI / 2, O = Math.sin(T), [B, L, E] = P(
          O * Math.cos(R),
          Math.cos(T),
          O * Math.sin(R)
        ), z = (E + 1) / 2;
        l.push({
          x: B,
          y: L,
          z: E,
          r: nt(t, z, e),
          white: 0.62 - 0.48 * z,
          a: 0.5 + 0.4 * z
        });
      }
    }
    for (let w = 0; w < c; w++) {
      const V = S < 0 ? 1 : -1, I = (1 + w / c * 0.68 + k * V) % 1, R = w % d, [D, T, O] = C(R, I), B = (O + 1) / 2, L = Math.max(0.8, t / 54);
      l.push({
        x: D,
        y: T,
        z: O + 0.04,
        r: Math.max(0.5, L * (0.35 + 0.65 * B)),
        white: 0.14 - 0.1 * B,
        a: 0.42 + 0.58 * B
      });
    }
  }
  G(s, l, r, e.rMin);
}, Pn = (s, t, n, r, e) => {
  const o = t / 2, i = t / 2, a = t / 2 * 0.82, h = q(n * 0.08, 0.3, o, i, 1), M = Z(t, e.rsPow ?? 0.6), d = [], f = Math.max(4, e.orbitN ?? 12), u = Math.max(1, Math.round(e.bandCount ?? 2)), c = Math.max(2, Math.round(f / u)), l = Math.max(16, e.ghostN ?? 40), g = e.particles ?? 5, b = Math.max(12, Math.round(l * 1.2));
  for (let p = 0; p < b; p++) {
    const v = et(p, b), [m, x, y] = h(
      v[0] * a,
      v[1] * a,
      v[2] * a
    ), k = (y / a + 1) / 2;
    d.push({
      x: m,
      y: x,
      z: y,
      r: (e.ghostR ?? 0.9) * M,
      white: 0.78,
      a: (e.ghostA ?? 0.5) * (0.18 + 0.34 * k)
    });
  }
  for (let p = 0; p < u; p++) {
    const v = p % 2 === 0 ? 1 : -1, m = p / u * Math.PI, x = m + n * 0.19 * v, y = 0.5 + p * 0.18 + 0.08 * Math.sin(n * 0.32 + m), k = Math.cos(x), S = 0, P = Math.sin(x), C = -P * Math.sin(y), w = Math.cos(y), V = k * Math.sin(y), I = S * V - P * w, R = P * C - k * V, D = k * w - S * C;
    for (let T = 0; T < c; T++) {
      const O = Math.abs(T - (c - 1) / 2) / Math.max(1, (c - 1) / 2), B = (T - (c - 1) / 2) * (e.bandSpread ?? 0.064);
      for (let L = 0; L < l; L++) {
        const E = L / l * Math.PI * 2, z = (0.105 * Math.sin(
          E * 3 - n * 1.35 * v + T * 0.2 + m
        ) + 0.04 * Math.sin(E * 5 + n * 0.78 - m)) * (e.wobMul ?? 1), N = B + z, $ = k * Math.cos(E) + C * Math.sin(E) + I * N, j = S * Math.cos(E) + w * Math.sin(E) + R * N, Y = P * Math.cos(E) + V * Math.sin(E) + D * N, F = Math.sqrt($ * $ + j * j + Y * Y), [U, _, H] = h(
          $ / F * a,
          j / F * a,
          Y / F * a
        ), J = (H / a + 1) / 2;
        d.push({
          x: U,
          y: _,
          z: H,
          r: ((e.rBase ?? 1.1) + (e.rDepth ?? 1.7) * J) * (1 - 0.25 * O) * M,
          white: 0.52 - 0.44 * J + 0.18 * O,
          a: 0.4 + 0.6 * J
        });
      }
    }
    for (let T = 0; T < g; T++) {
      const O = T % c, B = (O - (c - 1) / 2) * (e.bandSpread ?? 0.064), L = n * (0.72 + p * 0.08) * v + T / g * Math.PI * 2 + m, E = (0.105 * Math.sin(
        L * 3 - n * 1.35 * v + O * 0.2 + m
      ) + 0.04 * Math.sin(L * 5 + n * 0.78 - m)) * (e.wobMul ?? 1), z = B + E, N = k * Math.cos(L) + C * Math.sin(L) + I * z, $ = S * Math.cos(L) + w * Math.sin(L) + R * z, j = P * Math.cos(L) + V * Math.sin(L) + D * z, Y = Math.sqrt(N * N + $ * $ + j * j), [F, U, _] = h(
        N / Y * a,
        $ / Y * a,
        j / Y * a
      ), H = (_ / a + 1) / 2;
      d.push({
        x: F,
        y: U,
        z: _ + 1,
        r: ((e.partR ?? 1.55) + (e.partRDepth ?? 2.1) * H) * M,
        white: 0.14 - 0.1 * H
      });
    }
  }
  G(s, d, r, e.rMin);
}, Sn = (s, t, n, r, e) => {
  const o = t / 2, i = Math.max(24, Math.round(e.pulseN ?? 156)), a = Math.max(2, Math.round(e.shellCount ?? 3)), h = Math.max(
    a,
    Math.round(e.ribbonLineCount ?? 25)
  ), M = Math.floor(h / a), d = h % a, f = t >= 64 ? 12 : 8, u = Math.max(
    f,
    Math.floor(
      i * (e.dotDensity ?? 2.8) / h
    )
  ), c = Z(t, e.rsPow ?? 0.6), l = ((e.rBase ?? 0.7) + (e.rDepth ?? 1.6) * 0.25) * (e.dotScale ?? 1.65) * c, g = [], b = Math.max(24, Math.round(i * 0.85)), p = t * 0.39, v = q(
    n * 0.1,
    0.34 + 0.055 * Math.sin(n * 0.3),
    o,
    o,
    p
  );
  for (let m = 0; m < b; m++) {
    const [x, y, k] = v(...et(m, b)), S = (k + 1) / 2;
    g.push({
      x,
      y,
      z: k,
      r: l * 0.65 * (0.42 + 0.58 * S),
      white: 0.64 - 0.4 * S,
      a: 0.18 + 0.48 * S
    });
  }
  for (let m = 0; m < a; m++) {
    const x = n * (e.pulseSpeed ?? 0.17) * Math.PI * 2 + m / a * Math.PI * 2, y = (1 - Math.cos(x)) / 2, k = t * (0.32 + 0.07 * y), S = 0.45 + 0.55 * ((1 + Math.sin(x)) / 2), P = n * 0.1 + m * 0.82, C = 0.5 + 0.12 * Math.sin(n * 0.25 + m), w = Math.cos(P), V = 0, I = Math.sin(P), R = -I * Math.sin(C), D = Math.cos(C), T = w * Math.sin(C), O = V * T - I * D, B = I * R - w * T, L = w * D - V * R, E = q(0, 0.18, o, o, k), z = M + (m < d ? 1 : 0);
    for (let N = 0; N < z; N++) {
      const $ = (N - (z - 1) / 2) * (e.bandSpread ?? 0.075);
      for (let j = 0; j < u; j++) {
        const Y = j / u * Math.PI * 2, F = (0.085 * Math.sin(
          Y * 3 - n * 1.15 + N * 0.24 + m
        ) + 0.032 * Math.sin(Y * 5 + n * 0.72 - m)) * (e.wobMul ?? 1), U = $ + F, _ = w * Math.cos(Y) + R * Math.sin(Y) + O * U, H = V * Math.cos(Y) + D * Math.sin(Y) + B * U, J = I * Math.cos(Y) + T * Math.sin(Y) + L * U, it = Math.sqrt(_ * _ + H * H + J * J), [Ft, Xt, rt] = E(_ / it, H / it, J / it), ct = (rt + 1) / 2, _t = Math.min(
          1,
          Math.max(0, (rt + 0.08) / 1.08)
        ), mt = Math.floor(j / u * 16), gt = m * 11 + N, bt = n * ((e.shimmerSpeed ?? 0.55) / 0.55), Ut = Math.min(
          1,
          Math.max(
            0,
            0.62 + 0.25 * Math.sin(
              bt * 9.2 + gt * 1.71 + mt * 2.37
            ) + 0.13 * Math.sin(
              bt * 14.3 - gt * 0.83 + mt * 4.11
            )
          )
        ), vt = _t * (0.48 + 0.52 * Ut);
        g.push({
          x: Ft,
          y: Xt,
          z: rt + Math.sin(x) * 0.04,
          r: l * (0.35 + 0.65 * ct),
          white: 0.62 - 0.38 * ct - 0.18 * vt,
          a: Math.min(
            1,
            0.14 + S * (0.34 + 0.28 * ct + 0.24 * vt)
          )
        });
      }
    }
  }
  G(s, g, r, e.rMin);
}, kn = (s, t, n, r, e) => {
  const o = t / 2, i = t / 2, a = t / 2 * 0.78, h = e.spin ?? 1, M = q(n * 0.1 * h, 0.3, o, i, 1), d = Z(t, e.rsPow ?? 0.6), f = [], u = e.ghostN ?? 150;
  for (let V = 0; V < u; V++) {
    const I = et(V, u), [R, D, T] = M(I[0] * a, I[1] * a, I[2] * a), O = (T / a + 1) / 2;
    f.push({ x: R, y: D, z: T, r: 0.8 * d, white: 0.78, a: 0.1 + 0.22 * O });
  }
  const c = n * 0.24 * h, l = 0.55 + 0.3 * Math.sin(n * 0.18) * h, g = Math.cos(c), b = 0, p = Math.sin(c), v = -p * Math.sin(l), m = Math.cos(l), x = g * Math.sin(l), y = b * x - p * m, k = p * v - g * x, S = g * m - b * v, P = e.lanes ?? 5, C = e.segs ?? 88, w = Math.max(1, Math.round(P * (e.bandMul ?? 1)));
  for (let V = 0; V < w; V++) {
    const I = (V - (w - 1) / 2) * 0.075, R = Math.abs(V - (w - 1) / 2) / Math.max(1, (w - 1) / 2);
    for (let D = 0; D < C; D++) {
      const T = D / C * 2 * Math.PI, O = (0.16 * Math.sin(T * 3 - n * 1.7 + V * 0.22) + 0.07 * Math.sin(T * 5 + n * 1.1)) * (e.wobMul ?? 1), B = I + O, L = g * Math.cos(T) + v * Math.sin(T) + y * B, E = b * Math.cos(T) + m * Math.sin(T) + k * B, z = p * Math.cos(T) + x * Math.sin(T) + S * B, N = Math.sqrt(L * L + E * E + z * z), [$, j, Y] = M(L / N * a, E / N * a, z / N * a), F = (Y / a + 1) / 2;
      f.push({
        x: $,
        y: j,
        z: Y,
        r: ((e.rBase ?? 1.1) + (e.rDepth ?? 1.7) * F) * (1 - 0.25 * R) * d,
        white: 0.52 - 0.44 * F + 0.18 * R,
        a: 0.4 + 0.6 * F
      });
    }
  }
  G(s, f, r, e.rMin);
}, wt = {
  idle: wn,
  orbits: Pn,
  connecting: xn,
  globe: Zt,
  rubik: Jt,
  wave: Kt,
  ribbon: kn,
  responding: Sn,
  morph: on
}, Cn = {
  idle: rn,
  orbits: vn,
  connecting: cn,
  globe: hn,
  rubik: un,
  wave: yn,
  ribbon: ln,
  responding: dn,
  morph: Mn
}, Tn = [
  ["latRings", "lonDensity"],
  ["rings", "lonDensity"],
  ["lanes", "segs"]
], Vn = ["orbitN", "ghostN", "pulseN", "pointN"], Ln = ["iconD"], Rn = [
  "rBase",
  "rDepth",
  "rActive",
  "rDot",
  "ghostR",
  "partR",
  "partRDepth"
];
function An(s, t) {
  const n = { ...s }, r = /* @__PURE__ */ new Set(), e = Math.sqrt(t);
  for (const [o, i] of Tn) {
    const a = n[o], h = n[i];
    a != null && h != null && !r.has(o) && !r.has(i) && (n[o] = Math.max(2, Math.round(a * e)), n[i] = Math.max(2, Math.round(h * e)), r.add(o), r.add(i));
  }
  for (const o of Vn) {
    const i = n[o];
    i != null && !r.has(o) && (n[o] = Math.max(1, Math.round(i * t)));
  }
  for (const o of Ln) {
    const i = n[o];
    i != null && (n[o] = Math.max(0.02, i * t));
  }
  return n;
}
function In(s, t) {
  const n = { ...s };
  for (const r of Rn) {
    const e = n[r];
    e != null && (n[r] = e * t);
  }
  return n.rSizeMul = (n.rSizeMul ?? 1) * t, n;
}
const Dn = {
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
    ghostN: 30,
    bandCount: 2,
    bandSpread: 0.064,
    wobMul: 1,
    ghostR: 0.9,
    ghostA: 0.5,
    rBase: 1.1,
    rDepth: 1.7,
    particles: 5,
    partR: 1.55,
    partRDepth: 2.1,
    rsPow: 0.6,
    rMin: 0.3
  },
  connecting: {
    pointN: 132,
    bodyRadius: 0.39,
    lobeRadius: 0.2,
    lobeGap: 0.17,
    gapPulse: 0.012,
    laneCount: 3,
    nodeMinSegments: 10,
    bridgeStrands: 3,
    signalSpeed: 0.28,
    rBase: 1.1,
    rDepth: 1.8,
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
    ribbonLineCount: 25,
    bandSpread: 0.075,
    wobMul: 1,
    dotDensity: 2.8,
    dotScale: 1.65,
    shimmerSpeed: 0.55,
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
}, En = {
  idle: "idle",
  working: "orbits",
  connecting: "connecting",
  searching: "globe",
  solving: "rubik",
  listening: "wave",
  composing: "ribbon",
  responding: "responding",
  shaping: "morph"
}, On = {
  idle: {
    128: { speed: 0.72, count: 1.55, size: 0.95 },
    96: { speed: 0.76, count: 1.15, size: 0.98 },
    64: { speed: 0.8, count: 0.78, size: 1 },
    32: { speed: 1, count: 0.2, size: 1.95 }
  },
  orbits: {
    128: { speed: 1.7, count: 1.9, size: 0.92 },
    96: { speed: 1.8, count: 1.45, size: 0.96 },
    64: { speed: 1.885, count: 1, size: 1 },
    32: { speed: 3.9, count: 0.238, size: 2.4 }
  },
  connecting: {
    128: { speed: 2.15, count: 1.4, size: 0.94 },
    96: { speed: 2.3, count: 1.05, size: 0.97 },
    64: { speed: 2.4, count: 0.72, size: 1 },
    32: { speed: 3, count: 0.24, size: 1.85 }
  },
  globe: {
    128: { speed: 1.85, count: 0.95, size: 1.02, extra: { scanMul: 4.08, dimBase: 0.45 } },
    96: { speed: 1.95, count: 0.68, size: 1.08, extra: { scanMul: 4.08, dimBase: 0.45 } },
    64: { speed: 2.015, count: 0.42, size: 1.15, extra: { scanMul: 4.08, dimBase: 0.45 } },
    32: { speed: 2.665, count: 0.105, size: 1.75, extra: { scanMul: 4.335, dimBase: 0.45 } }
  },
  rubik: {
    128: { speed: 1.65, count: 0.82, size: 0.95 },
    96: { speed: 1.72, count: 0.58, size: 1 },
    64: { speed: 1.82, count: 0.35, size: 1.05 },
    32: { speed: 1.95, count: 0.088, size: 1.9 }
  },
  wave: {
    128: { speed: 3.8, count: 0.8, size: 0.92 },
    96: { speed: 4.05, count: 0.56, size: 0.96 },
    64: { speed: 4.388, count: 0.341, size: 1 },
    32: { speed: 3.998, count: 0.105, size: 1.6 }
  },
  ribbon: {
    128: { speed: 2.1, count: 0.65, size: 0.78, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    96: { speed: 2.2, count: 0.44, size: 0.82, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    64: { speed: 2.34, count: 0.25, size: 0.85, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    32: { speed: 3.12, count: 0.051, size: 1.073, extra: { spin: 0, bandMul: 4.94, wobMul: 1 } }
  },
  responding: {
    128: { speed: 2.2, count: 1.75, size: 0.92 },
    96: { speed: 2.35, count: 1.3, size: 0.96 },
    64: { speed: 2.5, count: 0.9, size: 1 },
    32: { speed: 3.1, count: 0.22, size: 1.8 }
  },
  morph: {
    128: { speed: 2.1, count: 1, size: 0.3, extra: { spread: 1.45 } },
    96: { speed: 2.25, count: 0.75, size: 0.34, extra: { spread: 1.45 } },
    64: { speed: 2.405, count: 0.54, size: 0.395, extra: { spread: 1.45 } },
    32: { speed: 2.08, count: 0.53, size: 1.011, extra: { spread: 1.45 } }
  }
}, xt = /* @__PURE__ */ new Map();
function Bn(s, t) {
  const n = `${s}-${t}`, r = xt.get(n);
  if (r) return r;
  const e = En[s], o = On[e][t];
  let i = { ...Dn[e] };
  o.count !== 1 && (i = An(i, o.count)), o.size !== 1 && (i = In(i, o.size)), o.extra && (i = { ...i, ...o.extra });
  const a = { mode: e, speed: o.speed, opts: i };
  return xt.set(n, a), a;
}
function Nn(s) {
  let t = s;
  for (; t; ) {
    const n = t.getAttribute("data-theme") ?? t.getAttribute("data-coreui-theme");
    if (n === "dark")
      return !0;
    if (n === "light")
      return !1;
    if (t.classList.contains("dark"))
      return !0;
    if (t.classList.contains("light"))
      return !1;
    t = t.parentElement;
  }
  return null;
}
function zn() {
  return typeof matchMedia > "u" || matchMedia("(prefers-color-scheme: dark)").matches;
}
function Pt(s, t) {
  return s === "dark" ? !0 : s === "light" ? !1 : Nn(t) ?? zn();
}
function St(s, t) {
  return s ? typeof s.addEventListener == "function" ? (s.addEventListener("change", t), () => s.removeEventListener("change", t)) : (s.addListener(t), () => s.removeListener(t)) : () => {
  };
}
const zt = [
  "idle",
  "working",
  "connecting",
  "searching",
  "solving",
  "listening",
  "composing",
  "responding",
  "shaping"
], Yt = [32, 64, 96, 128], jt = ["auto", "dark", "light"], $t = ["classic", "contour"], Yn = {
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
function tt(s, t) {
  return s.includes(t);
}
function jn(s) {
  const t = typeof s == "string" ? document.querySelector(s) : s;
  if (!t)
    throw new Error("ThinkingOrb target was not found.");
  if (t instanceof HTMLCanvasElement)
    return { canvas: t, createdCanvas: !1 };
  const n = document.createElement("canvas");
  return n.dataset.thinkingOrbCanvas = "", t.append(n), { canvas: n, createdCanvas: !0 };
}
function kt(s) {
  return typeof requestAnimationFrame == "function" ? requestAnimationFrame(s) : window.setTimeout(() => s(performance.now()), 16);
}
function $n(s) {
  if (typeof cancelAnimationFrame == "function") {
    cancelAnimationFrame(s);
    return;
  }
  window.clearTimeout(s);
}
function qn(s, t) {
  let n = [];
  const r = (e) => {
    for (const [
      o,
      i,
      a,
      h,
      M,
      d
    ] of n) {
      if (e === "clip") {
        s.arc(
          o,
          i,
          a * 1.14,
          h,
          M,
          d ?? !1
        );
        continue;
      }
      const [f, u, c] = t(o, i);
      s.arc(
        f,
        u,
        a * (1 + 0.16 * c),
        h,
        M,
        d ?? !1
      );
    }
    n = [];
  };
  return new Proxy(s, {
    get(e, o) {
      if (o === "beginPath")
        return () => {
          n = [], e.beginPath();
        };
      if (o === "moveTo")
        return (a, h) => {
          const [M, d] = t(a, h);
          e.moveTo(M, d);
        };
      if (o === "lineTo")
        return (a, h) => {
          const [M, d] = t(a, h);
          e.lineTo(M, d);
        };
      if (o === "arc")
        return (a, h, M, d, f, u) => {
          n.push([
            a,
            h,
            M,
            d,
            f,
            u
          ]);
        };
      if (o === "fill")
        return () => {
          r("draw"), e.fill();
        };
      if (o === "stroke")
        return () => {
          r("draw"), e.stroke();
        };
      if (o === "clip")
        return () => {
          r("clip"), e.clip();
        };
      const i = Reflect.get(e, o, e);
      return typeof i == "function" ? i.bind(e) : i;
    },
    set(e, o, i) {
      return Reflect.set(e, o, i, e);
    }
  });
}
class qt {
  constructor(t, n = {}) {
    A(this, "canvas");
    A(this, "createdCanvas");
    A(this, "context");
    A(this, "distortionContext");
    A(this, "stateValue", "working");
    A(this, "sizeValue", 64);
    A(this, "themeValue", "auto");
    A(this, "variantValue", "classic");
    A(this, "speedValue", 1);
    A(this, "pausedValue", !1);
    A(this, "interactiveValue", !1);
    A(this, "customAriaLabel", null);
    A(this, "darkValue", !0);
    A(this, "reducedMotionValue", !1);
    A(this, "visibleValue", !0);
    A(this, "destroyed", !1);
    A(this, "running", !1);
    A(this, "frameHandle", 0);
    A(this, "lastRenderedTime", 0.6);
    A(this, "pointerX", 32);
    A(this, "pointerY", 32);
    A(this, "pointerStrength", 0);
    A(this, "pointerTargetX", 32);
    A(this, "pointerTargetY", 32);
    A(this, "pointerTargetStrength", 0);
    A(this, "intersectionObserver", null);
    A(this, "mutationObserver", null);
    A(this, "removeDarkMediaListener", () => {
    });
    A(this, "removeMotionMediaListener", () => {
    });
    A(this, "onVisibilityChange", () => {
      this.syncAnimation();
    });
    A(this, "onThemeChange", () => {
      const t = Pt(this.themeValue, this.canvas);
      t !== this.darkValue && (this.darkValue = t, this.render());
    });
    A(this, "onReducedMotionChange", (t) => {
      this.reducedMotionValue = t.matches, t.matches && (this.pointerStrength = 0, this.pointerTargetStrength = 0), this.render(), this.syncAnimation();
    });
    A(this, "onPointerMove", (t) => {
      if (!this.interactiveValue || this.reducedMotionValue)
        return;
      const n = this.canvas.getBoundingClientRect(), r = n.width || this.sizeValue, e = n.height || this.sizeValue;
      this.pointerTargetX = Math.min(
        this.sizeValue,
        Math.max(0, (t.clientX - n.left) / r * this.sizeValue)
      ), this.pointerTargetY = Math.min(
        this.sizeValue,
        Math.max(0, (t.clientY - n.top) / e * this.sizeValue)
      ), this.pointerTargetStrength = 1, this.stepInteraction(), this.render(this.pausedValue ? this.lastRenderedTime : void 0), this.syncAnimation();
    });
    A(this, "onPointerLeave", () => {
      this.interactiveValue && (this.pointerTargetStrength = 0, this.stepInteraction(), this.render(this.pausedValue ? this.lastRenderedTime : void 0), this.syncAnimation());
    });
    A(this, "onPointerDown", (t) => {
      var n, r;
      !this.interactiveValue || this.reducedMotionValue || (t.pointerType !== "mouse" && t.preventDefault(), (r = (n = this.canvas).setPointerCapture) == null || r.call(n, t.pointerId), this.onPointerMove(t));
    });
    A(this, "onPointerUp", (t) => {
      var n, r;
      (r = (n = this.canvas).releasePointerCapture) == null || r.call(n, t.pointerId), t.pointerType !== "mouse" && this.onPointerLeave();
    });
    if (typeof document > "u")
      throw new Error("ThinkingOrb requires a browser DOM.");
    const { canvas: r, createdCanvas: e } = jn(t), o = r.getContext("2d");
    if (!o)
      throw new Error("ThinkingOrb requires CanvasRenderingContext2D support.");
    this.canvas = r, this.createdCanvas = e, this.context = o, this.distortionContext = qn(
      o,
      (i, a) => this.distortPoint(i, a)
    ), n.className && e && (r.className = n.className), this.setupObservers(), this.update(n);
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
  get variant() {
    return this.variantValue;
  }
  get speed() {
    return this.speedValue;
  }
  get paused() {
    return this.pausedValue;
  }
  get interactive() {
    return this.interactiveValue;
  }
  get snapshot() {
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
  update(t = {}) {
    var n;
    if (this.assertActive(), t.state !== void 0) {
      if (!tt(zt, t.state))
        throw new TypeError(`Unknown ThinkingOrb state: ${String(t.state)}`);
      this.stateValue = t.state;
    }
    if (t.size !== void 0) {
      if (!tt(Yt, t.size))
        throw new TypeError("ThinkingOrb size must be 32, 64, 96, or 128.");
      this.sizeValue = t.size;
    }
    if (t.theme !== void 0) {
      if (!tt(jt, t.theme))
        throw new TypeError(`Unknown ThinkingOrb theme: ${String(t.theme)}`);
      this.themeValue = t.theme;
    }
    if (t.variant !== void 0) {
      if (!tt($t, t.variant))
        throw new TypeError(`Unknown ThinkingOrb variant: ${String(t.variant)}`);
      this.variantValue = t.variant;
    }
    if (t.speed !== void 0) {
      if (!Number.isFinite(t.speed) || t.speed <= 0)
        throw new TypeError("ThinkingOrb speed must be a positive number.");
      this.speedValue = t.speed;
    }
    return t.paused !== void 0 && (this.pausedValue = !!t.paused), t.interactive !== void 0 && (this.interactiveValue = !!t.interactive, this.interactiveValue || (this.pointerStrength = 0, this.pointerTargetStrength = 0)), "ariaLabel" in t && (this.customAriaLabel = ((n = t.ariaLabel) == null ? void 0 : n.trim()) || null), this.darkValue = Pt(this.themeValue, this.canvas), this.configureCanvas(), this.render(), this.syncAnimation(), this;
  }
  setState(t) {
    return this.update({ state: t });
  }
  setTheme(t) {
    return this.update({ theme: t });
  }
  setVariant(t) {
    return this.update({ variant: t });
  }
  setSpeed(t) {
    return this.update({ speed: t });
  }
  setInteractive(t) {
    return this.update({ interactive: t });
  }
  pause() {
    return this.update({ paused: !0 });
  }
  resume() {
    return this.update({ paused: !1 });
  }
  render(t) {
    this.assertActive(), this.resizeBackingStore();
    const { mode: n, speed: r, opts: e } = Bn(
      this.stateValue,
      this.sizeValue
    ), o = t ?? (this.reducedMotionValue ? 0.6 : performance.now() / 1e3 * r * this.speedValue), i = this.getDevicePixelRatio(), a = this.interactiveValue && !this.reducedMotionValue && this.pointerStrength > 1e-3 ? this.distortionContext : this.context;
    return this.lastRenderedTime = o, this.context.setTransform(i, 0, 0, i, 0, 0), this.context.clearRect(0, 0, this.sizeValue, this.sizeValue), (this.variantValue === "contour" ? Cn[n] ?? wt[n] : wt[n])(
      a,
      this.sizeValue,
      o,
      this.darkValue,
      e
    ), this;
  }
  destroy(t = {}) {
    var n, r;
    this.destroyed || (this.stop(), (n = this.intersectionObserver) == null || n.disconnect(), (r = this.mutationObserver) == null || r.disconnect(), this.removeDarkMediaListener(), this.removeMotionMediaListener(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.canvas.removeEventListener("pointerenter", this.onPointerMove), this.canvas.removeEventListener("pointermove", this.onPointerMove), this.canvas.removeEventListener("pointerleave", this.onPointerLeave), this.canvas.removeEventListener("pointercancel", this.onPointerLeave), this.canvas.removeEventListener("pointerdown", this.onPointerDown), this.canvas.removeEventListener("pointerup", this.onPointerUp), (t.removeCanvas ?? this.createdCanvas) && this.canvas.isConnected && this.canvas.remove(), this.destroyed = !0);
  }
  setupObservers() {
    const t = typeof matchMedia == "function" ? matchMedia("(prefers-color-scheme: dark)") : null, n = typeof matchMedia == "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
    this.reducedMotionValue = (n == null ? void 0 : n.matches) ?? !1, this.removeDarkMediaListener = St(
      t,
      this.onThemeChange
    ), this.removeMotionMediaListener = St(
      n,
      this.onReducedMotionChange
    ), typeof MutationObserver < "u" && (this.mutationObserver = new MutationObserver(this.onThemeChange), this.mutationObserver.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["class", "data-theme", "data-coreui-theme"],
      subtree: !0
    })), typeof IntersectionObserver < "u" && (this.intersectionObserver = new IntersectionObserver(([r]) => {
      this.visibleValue = (r == null ? void 0 : r.isIntersecting) ?? !0, this.syncAnimation();
    }), this.intersectionObserver.observe(this.canvas)), document.addEventListener("visibilitychange", this.onVisibilityChange), this.canvas.addEventListener("pointerenter", this.onPointerMove), this.canvas.addEventListener("pointermove", this.onPointerMove), this.canvas.addEventListener("pointerleave", this.onPointerLeave), this.canvas.addEventListener("pointercancel", this.onPointerLeave), this.canvas.addEventListener("pointerdown", this.onPointerDown), this.canvas.addEventListener("pointerup", this.onPointerUp);
  }
  configureCanvas() {
    this.canvas.dataset.thinkingOrbState = this.stateValue, this.canvas.dataset.thinkingOrbTheme = this.themeValue, this.canvas.dataset.thinkingOrbVariant = this.variantValue, this.canvas.dataset.thinkingOrbInteractive = String(this.interactiveValue), this.canvas.setAttribute("role", "img"), this.canvas.setAttribute(
      "aria-label",
      this.customAriaLabel ?? Yn[this.stateValue]
    ), this.canvas.style.width = `${this.sizeValue}px`, this.canvas.style.height = `${this.sizeValue}px`, this.canvas.style.display = "block", this.canvas.style.cursor = this.interactiveValue ? "crosshair" : "", this.canvas.style.touchAction = this.interactiveValue ? "none" : "";
  }
  resizeBackingStore() {
    const t = this.getDevicePixelRatio(), n = Math.round(this.sizeValue * t);
    this.canvas.width !== n && (this.canvas.width = n), this.canvas.height !== n && (this.canvas.height = n);
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
    const t = !this.pausedValue && !this.reducedMotionValue, n = this.interactionNeedsFrame();
    return !this.destroyed && this.visibleValue && document.visibilityState !== "hidden" && (t || n);
  }
  start() {
    if (this.running)
      return;
    this.running = !0;
    const t = () => {
      if (this.running) {
        if (this.stepInteraction(), this.render(
          this.pausedValue || this.reducedMotionValue ? this.lastRenderedTime : void 0
        ), !this.shouldAnimate()) {
          this.running = !1;
          return;
        }
        this.frameHandle = kt(t);
      }
    };
    this.frameHandle = kt(t);
  }
  stop() {
    this.running = !1, $n(this.frameHandle);
  }
  stepInteraction() {
    const n = this.pointerTargetStrength > this.pointerStrength ? 0.24 : 0.14;
    this.pointerX += (this.pointerTargetX - this.pointerX) * 0.2, this.pointerY += (this.pointerTargetY - this.pointerY) * 0.2, this.pointerStrength += (this.pointerTargetStrength - this.pointerStrength) * n, Math.abs(this.pointerStrength) < 5e-4 && (this.pointerStrength = 0);
  }
  interactionNeedsFrame() {
    return !this.interactiveValue || this.reducedMotionValue ? !1 : this.pointerTargetStrength > 1e-3 || this.pointerStrength > 1e-3 || Math.abs(this.pointerTargetX - this.pointerX) > 0.05 || Math.abs(this.pointerTargetY - this.pointerY) > 0.05;
  }
  distortPoint(t, n) {
    const r = t - this.pointerX, e = n - this.pointerY, o = Math.hypot(r, e), i = this.sizeValue * 0.55;
    if (this.pointerStrength <= 1e-3 || o >= i || o <= 1e-4)
      return [t, n, 0];
    const a = 1 - o / i, h = a * a * (3 - 2 * a) * this.pointerStrength, M = r / o, d = e / o, f = this.sizeValue * 0.105 * h, u = this.sizeValue * 0.018 * h;
    return [
      t + M * f - d * u,
      n + d * f + M * u,
      h
    ];
  }
  assertActive() {
    if (this.destroyed)
      throw new Error("ThinkingOrb has been destroyed.");
  }
}
function Wn(s, t = {}) {
  return new qt(s, t);
}
const Fn = typeof globalThis.HTMLElement > "u" ? class {
} : globalThis.HTMLElement;
function Ct(s) {
  return zt.includes(s) ? s : "working";
}
function Xn(s) {
  const t = Number(s);
  return Yt.includes(t) ? t : 64;
}
function _n(s) {
  return jt.includes(s) ? s : "auto";
}
function Tt(s) {
  return $t.includes(s) ? s : "classic";
}
function Un(s) {
  const t = Number(s);
  return Number.isFinite(t) && t > 0 ? t : 1;
}
class ft extends Fn {
  constructor() {
    super(...arguments);
    A(this, "controller", null);
  }
  connectedCallback() {
    var r, e, o;
    if (this.controller || !(this instanceof HTMLElement))
      return;
    (r = this.style).display || (r.display = "inline-block"), (e = this.style).lineHeight || (e.lineHeight = "0"), (o = this.style).verticalAlign || (o.verticalAlign = "middle");
    const n = document.createElement("canvas");
    n.dataset.thinkingOrbCanvas = "", this.replaceChildren(n), this.controller = new qt(n, this.readOptions());
  }
  disconnectedCallback() {
    var n;
    (n = this.controller) == null || n.destroy({ removeCanvas: !1 }), this.controller = null;
  }
  attributeChangedCallback() {
    var n;
    (n = this.controller) == null || n.update(this.readOptions());
  }
  get orb() {
    return this.controller;
  }
  get state() {
    return Ct(this.getAttribute("state"));
  }
  set state(n) {
    this.setAttribute("state", n);
  }
  get variant() {
    return Tt(this.getAttribute("variant"));
  }
  set variant(n) {
    this.setAttribute("variant", n);
  }
  get paused() {
    return this.hasAttribute("paused");
  }
  set paused(n) {
    this.toggleAttribute("paused", n);
  }
  get interactive() {
    return this.hasAttribute("interactive");
  }
  set interactive(n) {
    this.toggleAttribute("interactive", n);
  }
  readOptions() {
    return {
      state: Ct(this.getAttribute("state")),
      size: Xn(this.getAttribute("size")),
      theme: _n(this.getAttribute("theme")),
      variant: Tt(this.getAttribute("variant")),
      speed: Un(this.getAttribute("speed")),
      paused: this.hasAttribute("paused"),
      interactive: this.hasAttribute("interactive"),
      ariaLabel: this.getAttribute("aria-label")
    };
  }
}
A(ft, "observedAttributes", [
  "state",
  "size",
  "theme",
  "variant",
  "speed",
  "paused",
  "interactive",
  "aria-label"
]);
function Gn(s = "thinking-orb") {
  if (!s.includes("-"))
    throw new TypeError("A custom-element name must contain a hyphen.");
  return typeof customElements < "u" && !customElements.get(s) && customElements.define(s, ft), ft;
}
export {
  Cn as CONTOUR_MODE_DRAWS,
  wt as MODE_DRAWS,
  Yt as ORB_SIZES,
  zt as ORB_STATES,
  jt as ORB_THEMES,
  $t as ORB_VARIANTS,
  En as STATE_TO_MODE,
  qt as ThinkingOrb,
  ft as ThinkingOrbElement,
  Wn as createThinkingOrb,
  Gn as defineThinkingOrb,
  Bn as resolvePreset
};

var Zt = Object.defineProperty;
var Jt = (e, t, n) => t in e ? Zt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var V = (e, t, n) => Jt(e, typeof t != "symbol" ? t + "" : t, n);
function tt(e, t = 0.72) {
  return Math.min(t, Math.max(0, e));
}
function ct(e, t) {
  const n = Math.sin(e * 12.9898 + t * 78.233) * 43758.5453;
  return n - Math.floor(n);
}
function st(e, t) {
  const n = Math.PI * (3 - Math.sqrt(5)), i = 1 - 2 * (e + 0.5) / t, s = Math.sqrt(1 - i * i), o = e * n;
  return [s * Math.cos(o), i, s * Math.sin(o)];
}
function Kt(e, t) {
  return Math.atan2(Math.sin(e - t), Math.cos(e - t));
}
function X(e, t, n, i, s) {
  const o = Math.sin(t), r = Math.cos(t), a = Math.sin(e), c = Math.cos(e);
  return (d, u, M) => {
    const l = d * c + M * a, h = -d * a + M * c, p = u * r - h * o, g = u * o + h * r;
    return [n + l * s, i - p * s, g];
  };
}
function U(e, t, n, i = 0.3) {
  t.sort((s, o) => s.z - o.z);
  for (const s of t) {
    const o = tt(
      s.a ?? 1,
      s.shimmer ? 0.92 : 0.72
    );
    if (o < 0.02) continue;
    const r = Math.min(1, Math.max(0, s.white)), a = Math.round((n ? 1 - r : r) * 255);
    e.fillStyle = `rgba(${a},${a},${a},${o})`, e.beginPath(), e.arc(s.x, s.y, Math.max(i, s.r), 0, Math.PI * 2), e.fill();
  }
}
function Z(e, t) {
  return (e / 300) ** t;
}
function Lt(e, t, n, i) {
  const s = 2 * t * n + i, o = e % s, r = new Array(t).fill(0);
  let a = -1;
  if (o < 2 * t * n) {
    const c = Math.floor(o / n), d = (o - c * n) / n, M = 1 - (1 - Math.min(1, d / 0.7)) ** 3;
    if (c < t) {
      for (let l = 0; l < c; l++) r[l] = 1;
      r[c] = M, a = c;
    } else {
      const l = 2 * t - 1 - c;
      for (let h = 0; h < l; h++) r[h] = 1;
      r[l] = 1 - M, a = l;
    }
  }
  return { amount: r, active: a };
}
function Tt(e, t, n) {
  let [i, s, o] = e, r = !1;
  for (let a = 0; a < t.length; a++) {
    if (n.amount[a] <= 0) continue;
    const c = t[a], d = c.axis === 0 ? i : c.axis === 1 ? s : o;
    if (d < c.lo || d >= c.hi) continue;
    a === n.active && (r = !0);
    const u = c.ang * n.amount[a], M = Math.cos(u), l = Math.sin(u);
    if (c.axis === 0) {
      const h = s * M - o * l;
      o = s * l + o * M, s = h;
    } else if (c.axis === 1) {
      const h = i * M + o * l;
      o = -i * l + o * M, i = h;
    } else {
      const h = i * M - s * l;
      s = i * l + s * M, i = h;
    }
  }
  return [i, s, o, r];
}
function Vt(e) {
  const t = [];
  for (let n = 0; n < e; n++) {
    const i = Math.min(2, Math.floor(ct(n, 2.3) * 3)), s = -1 + 0.5 * Math.min(3, Math.floor(ct(n, 5.9) * 4)), o = ct(n, 7.7) < 0.5 ? 1 : -1;
    t.push({ axis: i, lo: s, hi: s + 0.5, ang: o * Math.PI / 2 });
  }
  return t;
}
const Qt = (e, t, n, i, s) => {
  const r = t / 2, a = t / 2, c = t / 2 * 0.82, d = 0.4 + 0.06 * Math.sin(n * 0.35), u = X(n * 0.5, d, r, a, c), M = n * (0.5 + (1.7 - 0.5) * (s.scanMul ?? 1)), l = Z(t, s.rsPow ?? 0.6), h = s.dimBase ?? 1, p = [], g = s.latRings ?? 17, b = s.lonDensity ?? 44;
  for (let f = 0; f <= g; f++) {
    const v = -Math.PI / 2 + f / g * Math.PI, m = Math.cos(v), w = Math.sin(v), P = Math.max(1, Math.round(Math.abs(m) * b));
    for (let R = 0; R < P; R++) {
      const x = R / P * 2 * Math.PI, [A, k, y] = u(m * Math.cos(x), w, m * Math.sin(x)), S = (y + 1) / 2, C = Kt(x + n * 0.5, M), O = Math.exp(-(C * C) / 0.18) * Math.max(0, y);
      p.push({
        x: A,
        y: k,
        z: y,
        r: ((s.rBase ?? 0.6) + (s.rDepth ?? 1.7) * S + (s.rBoost ?? 1) * O) * l,
        white: (s.inkFar ?? 0.62) - (s.inkSpan ?? 0.54) * S,
        // dimBase < 1 fades un-scanned dots so the meridian reads clearly
        a: h + (1 - h) * Math.min(1, O)
      });
    }
  }
  U(e, p, i, s.rMin);
}, tn = (e, t, n, i, s) => {
  const o = t / 2, r = t / 2, a = t / 2 * 0.82, c = X(n * 0.55, 0.35 + 0.1 * Math.sin(n * 0.9), o, r, a), d = Z(t, s.rsPow ?? 0.6), u = s.moveCount ?? 14, M = Vt(u), l = Lt(n, u, 0.42, 1.2), h = [], p = s.latRings ?? 15, g = s.lonDensity ?? 40;
  for (let b = 0; b <= p; b++) {
    const f = -Math.PI / 2 + b / p * Math.PI, v = Math.cos(f), m = Math.sin(f), w = Math.max(1, Math.round(Math.abs(v) * g));
    for (let P = 0; P < w; P++) {
      const R = P / w * 2 * Math.PI, [x, A, k, y] = Tt([v * Math.cos(R), m, v * Math.sin(R)], M, l), [S, C, O] = c(x, A, k), T = (O + 1) / 2;
      h.push({
        x: S,
        y: C,
        z: O,
        r: ((s.rBase ?? 0.6) + (s.rDepth ?? 1.7) * T + (y ? s.rActive ?? 0.3 : 0)) * d,
        white: (s.inkFar ?? 0.62) - (s.inkSpan ?? 0.54) * T - (y ? 0.14 : 0)
      });
    }
  }
  U(e, h, i, s.rMin);
}, nn = (e, t, n, i, s) => {
  const o = t / 2, r = t / 2, a = t / 2 * 0.874, c = X(n * 0.18, 0.38, o, r, 1), d = Z(t, s.rsPow ?? 0.6), u = [], M = s.rings ?? 15, l = s.lonDensity ?? 40;
  for (let h = 0; h <= M; h++) {
    const p = -Math.PI / 2 + h / M * Math.PI, g = Math.cos(p), b = Math.sin(p), f = 0.62 * Math.sin(n * 2.1 - h * 0.52) + 0.38 * Math.sin(n * 1.27 + h * 0.83), v = a * (0.88 + 0.105 * f), m = Math.max(1, Math.round(Math.abs(g) * l));
    for (let w = 0; w < m; w++) {
      const P = w / m * 2 * Math.PI, [R, x, A] = c(g * Math.cos(P) * v, b * v, g * Math.sin(P) * v), k = (A / a + 1) / 2, y = Math.max(0, f);
      u.push({
        x: R,
        y: x,
        z: A,
        r: ((s.rBase ?? 0.6) + (s.rDepth ?? 1.7) * k) * (1 + 0.4 * y) * d,
        white: 0.66 - 0.56 * k - 0.1 * y
      });
    }
  }
  U(e, u, i, s.rMin);
};
function en(e) {
  return e * e * (3 - 2 * e);
}
function It(e) {
  const t = e.length, n = [];
  let i = 0;
  for (let s = 0; s < t; s++) {
    const o = e[s], r = e[(s + 1) % t], a = Math.hypot(r[0] - o[0], r[1] - o[1]);
    n.push(a), i += a;
  }
  return (s) => {
    let o = s * i, r = 0;
    for (; o > n[r] && r < t - 1; )
      o -= n[r], r++;
    const a = e[r], c = e[(r + 1) % t], d = n[r] ? Math.min(1, o / n[r]) : 0;
    return [a[0] + (c[0] - a[0]) * d, a[1] + (c[1] - a[1]) * d];
  };
}
const sn = (e) => {
  const t = -Math.PI / 2 + e * 2 * Math.PI;
  return [Math.cos(t) * 0.24, Math.sin(t) * 0.24];
}, on = It([
  [0, -0.26],
  [0.24, 0.16],
  [-0.24, 0.16]
]), an = It([
  [0, -0.2],
  [0.2, -0.2],
  [0.2, 0.2],
  [-0.2, 0.2],
  [-0.2, -0.2]
]), ht = [sn, on, an];
function rn(e) {
  return Math.max(6, Math.round(34 * e));
}
const dt = 1.4, Et = 0.9, ut = dt + Et;
function Ot(e, t) {
  const n = ht.length, i = e % (ut * n), s = Math.floor(i / ut), o = i - s * ut, r = o > dt ? en((o - dt) / Et) : 0, a = t.spread ?? 1, c = ht[s], d = ht[(s + 1) % n], u = 160, M = [];
  for (let h = 0; h < u; h++) {
    const p = h / u, g = c(p), b = d(p);
    M.push([(g[0] + (b[0] - g[0]) * r) * a, (g[1] + (b[1] - g[1]) * r) * a]);
  }
  const l = 1 + 0.02 * Math.sin(o * 3.1);
  return { points: M, pulse: l };
}
const cn = (e, t, n, i, s) => {
  const { points: o, pulse: r } = Ot(n, s), a = o.length, c = [];
  let d = 0;
  for (let b = 0; b < a; b++) {
    const f = o[b], v = o[(b + 1) % a], m = Math.hypot(v[0] - f[0], v[1] - f[1]);
    c.push(m), d += m;
  }
  const u = rn(s.iconD ?? 1), M = (s.rDot ?? 0.021) * 1.35 * (s.spread ?? 1), l = [], h = t / 2;
  let p = 0, g = 0;
  for (let b = 0; b < u; b++) {
    const f = b / u * d;
    for (; g + c[p] < f && p < a - 1; )
      g += c[p], p++;
    const v = o[p], m = o[(p + 1) % a], w = c[p] ? Math.min(1, (f - g) / c[p]) : 0, P = (v[0] + (m[0] - v[0]) * w) * r, R = (v[1] + (m[1] - v[1]) * w) * r;
    l.push({
      x: h + P * t,
      y: h + R * t,
      z: 0,
      r: Math.max(0.35, M * t),
      white: 0.1
    });
  }
  U(e, l, i, s.rMin);
}, F = Math.PI * 2, Dt = 0.14, Bt = 0.44;
function pt(e, t) {
  const n = tt(t);
  return e ? `rgba(250,250,250,${n})` : `rgba(24,24,27,${n})`;
}
function ft(e, t, n, i, s, o, r = !0, a = 0.72) {
  e.beginPath();
  for (let d = 0; d <= n; d++) {
    const [u, M] = t(d / n);
    d === 0 ? e.moveTo(u, M) : e.lineTo(u, M);
  }
  r && e.closePath();
  const c = tt(s, a);
  e.strokeStyle = i ? `rgba(250,250,250,${c})` : `rgba(24,24,27,${c})`, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.stroke();
}
function K(e, t, n, i, s, o, r, a, c, d = 0) {
  ft(
    e,
    (u) => {
      const [M, l] = t(u);
      return [M, l];
    },
    n,
    i,
    s,
    r
  );
  {
    e.beginPath();
    let u = !1;
    for (let M = 0; M <= n; M++) {
      const [l, h, p] = t(M / n);
      if (p < 0) {
        u = !1;
        continue;
      }
      u ? e.lineTo(l, h) : (e.moveTo(l, h), u = !0);
    }
    e.strokeStyle = pt(i, o), e.lineWidth = a, e.lineCap = "round", e.lineJoin = "round", e.stroke();
    return;
  }
}
function ot(e) {
  return e >= 128 ? [29, 19] : e >= 96 ? [24, 16] : e >= 64 ? [20, 14] : [11, 8];
}
function at(e, t, n, i, s, o, r, a, c) {
  const d = t / 2, u = X(i, s, d, d, o), M = Math.max(0.34, t / 215), l = t >= 96 ? 80 : 48;
  for (let h = 0; h < r; h++) {
    const p = -Math.PI / 2 + h / Math.max(1, r - 1) * Math.PI;
    K(
      e,
      (g) => {
        const b = g * F - Math.PI / 2, f = Math.sin(b);
        return u(
          f * Math.cos(p),
          Math.cos(b),
          f * Math.sin(p)
        );
      },
      l,
      n,
      c * 0.09,
      c * 0.82,
      M * 0.52,
      M * 0.98
    );
  }
  for (let h = 0; h < a; h++) {
    const p = -Math.PI / 2 + (h + 1) / (a + 1) * Math.PI, g = Math.cos(p);
    K(
      e,
      (b) => {
        const f = b * F;
        return u(
          Math.cos(f) * g,
          Math.sin(p),
          Math.sin(f) * g
        );
      },
      l,
      n,
      c * 0.08,
      c * 0.76,
      M * 0.52,
      M * 0.98
    );
  }
}
function hn(e, t, n, i, s, o = 1) {
  e.fillStyle = pt(s, o), e.beginPath(), e.arc(t, n, i, 0, F), e.fill();
}
const un = (e, t, n, i, s) => {
  const o = 0.94 + 0.055 * Math.sin(n * 0.85), [r, a] = ot(t);
  at(
    e,
    t,
    i,
    n * 0.08,
    0.34,
    t * 0.38 * o,
    r,
    a,
    0.55
  );
}, ln = (e, t, n, i, s) => {
  const o = t / 2, r = t * ((s.lobeGap ?? 0.17) + (s.gapPulse ?? 0.012) * Math.sin(n * 1.15)), a = t * (s.lobeRadius ?? 0.2), c = t >= 64 ? Math.max(2, Math.round(s.laneCount ?? 3)) : 2, d = t >= 64 ? Math.max(2, Math.round(s.bridgeStrands ?? 3)) : 2, u = n * (s.signalSpeed ?? 0.28) % 1, [M, l] = ot(t);
  at(
    e,
    t,
    i,
    n * 0.07,
    0.34 + 0.055 * Math.sin(n * 0.3),
    t * (s.bodyRadius ?? 0.39),
    M,
    l,
    0.3
  );
  for (const h of [-1, 1]) {
    const p = X(
      n * 0.48 * h,
      0.46,
      o + r * h,
      o,
      a
    ), g = (f, v) => {
      const m = (f - (c - 1) / 2) * 0.38, w = Math.sqrt(Math.max(0, 1 - m * m)), P = v * F + f * 0.18;
      return p(
        Math.cos(P) * w,
        m,
        Math.sin(P) * w
      );
    }, b = (f, v) => {
      const m = -Math.PI / 2 + f / (c - 1) * Math.PI, w = v * F - Math.PI / 2, P = Math.sin(w);
      return p(
        P * Math.cos(m),
        Math.cos(w),
        P * Math.sin(m)
      );
    };
    for (let f = 0; f < c; f++)
      K(
        e,
        (v) => g(f, v),
        t >= 96 ? 72 : 44,
        i,
        0.34,
        0.72,
        Math.max(0.34, t / 205),
        Math.max(0.48, t / 145)
      ), K(
        e,
        (v) => b(f, v),
        t >= 96 ? 72 : 44,
        i,
        0.3,
        0.66,
        Math.max(0.32, t / 215),
        Math.max(0.46, t / 155)
      );
    for (let f = 0; f < d; f++) {
      const v = h < 0 ? 1 : -1, m = (1 + f / d * 0.68 + u * v) % 1, w = f % c, [P, R, x] = g(
        w,
        m
      ), A = (x + 1) / 2, k = Math.max(0.8, t / 54), y = Math.max(
        0.5,
        k * (0.35 + 0.65 * A)
      );
      hn(
        e,
        P,
        R,
        y,
        i,
        0.42 + 0.58 * A
      );
    }
  }
}, dn = (e, t, n, i, s) => {
  const o = t / 2, r = t >= 128 ? 12 : t >= 96 ? 9 : t >= 64 ? 5 : 2, a = Math.round((r + 1) * 1.55), c = t >= 96 ? 88 : 52, d = Math.max(0.34, t / 215), u = t * 0.4, M = [], l = 0.5, h = 0.38, p = Math.cos(l), g = Math.sin(l), b = Math.cos(h), f = Math.sin(h);
  e.save(), e.beginPath(), e.arc(o, o, u, 0, F), e.clip();
  for (let w = 0; w < a; w++) {
    const P = w / Math.max(1, a - 1), R = -Math.PI / 2 + P * Math.PI, x = Math.cos(R), A = Math.sin(R), k = 0.62 * Math.sin(-w * 0.52) + 0.38 * Math.sin(w * 0.83), y = Math.pow(Math.abs(x), 0.72), S = t * 0.4 * (1 + 0.055 * k * y), C = 0.56 + 0.24 * P, O = (T) => {
      const L = T * F, B = x * Math.cos(L) * S, I = A * S, E = x * Math.sin(L) * S, D = B * p + E * g, N = -B * g + E * p;
      return [
        o + D,
        o + (I * b - N * f),
        (I * f + N * b) / (t * 0.4)
      ];
    };
    M.push(O), K(
      e,
      O,
      c,
      i,
      C * 0.22,
      C * 0.9,
      d * 0.52,
      d
    );
  }
  const v = 0.34 * (s.scanMul ?? 1), m = t >= 96 ? 16 : 10;
  for (let w = 1; w < a - 1; w++) {
    const P = 0.5 + 0.5 * Math.sin(n * v * 2.2 + w * 1.73), R = 0.5 + 0.39 * Math.sin(n * v * 0.72 + w * 2.41), x = 0.035 + 0.025 * P, A = R - x, k = R + x;
    ft(
      e,
      (y) => {
        const [S, C] = M[w](A + (k - A) * y);
        return [S, C];
      },
      m,
      i,
      0.18 + 0.62 * P,
      d * (0.96 + 0.34 * P),
      !1,
      0.92
    );
  }
  e.restore();
}, Mn = (e, t, n, i, s) => {
  const o = t / 2, r = t / 2 * 0.82, a = X(
    n * 0.55,
    0.35 + 0.1 * Math.sin(n * 0.9),
    o,
    o,
    r
  ), c = Math.max(1, Math.round(s.moveCount ?? 14)), d = Vt(c), u = Lt(n, c, 0.42, 1.2), M = Math.max(2, Math.round(s.latRings ?? 15)), l = t >= 96 ? 96 : 56;
  for (let h = 0; h <= M; h++) {
    const p = -Math.PI / 2 + h / M * Math.PI, g = Math.cos(p), b = Math.sin(p);
    let f = null;
    e.beginPath();
    for (let v = 0; v <= l; v++) {
      const m = v / l * F, [w, P, R] = Tt(
        [
          g * Math.cos(m),
          b,
          g * Math.sin(m)
        ],
        d,
        u
      ), [x, A] = a(w, P, R), k = f ? Math.hypot(x - f[0], A - f[1]) : 0;
      !f || k > t * 0.2 ? e.moveTo(x, A) : e.lineTo(x, A), f = [x, A];
    }
    e.closePath(), e.strokeStyle = pt(i, 0.56 + 0.24 * (h / M)), e.lineWidth = Math.max(0.42, t / 160), e.lineCap = "round", e.lineJoin = "round", e.stroke();
  }
}, pn = (e, t, n, i, s) => {
  const o = t / 2, r = t / 2 * 0.78, a = s.spin ?? 1, c = X(n * 0.1 * a, 0.3, o, o, 1), d = n * 0.24 * a, u = 0.55 + 0.3 * Math.sin(n * 0.18) * a, M = Math.cos(d), l = 0, h = Math.sin(d), p = -h * Math.sin(u), g = Math.cos(u), b = M * Math.sin(u), f = l * b - h * g, v = h * p - M * b, m = M * g - l * p, w = Math.max(1, Math.round(s.lanes ?? 5)), P = Math.max(1, Math.round(w * (s.bandMul ?? 1))), [R, x] = ot(t);
  at(
    e,
    t,
    i,
    n * 0.1,
    0.3 + 0.055 * Math.sin(n * 0.3),
    r,
    R,
    x,
    0.18
  );
  for (let A = 0; A < P; A++) {
    const k = (A - (P - 1) / 2) * 0.075;
    K(
      e,
      (S) => {
        const C = S * F, O = (0.16 * Math.sin(
          C * 3 - n * 1.7 + A * 0.22
        ) + 0.07 * Math.sin(C * 5 + n * 1.1)) * (s.wobMul ?? 1), T = k + O, L = M * Math.cos(C) + p * Math.sin(C) + f * T, B = l * Math.cos(C) + g * Math.sin(C) + v * T, I = h * Math.cos(C) + b * Math.sin(C) + m * T, E = Math.sqrt(L * L + B * B + I * I), [D, N, _] = c(
          L / E * r,
          B / E * r,
          I / E * r
        );
        return [D, N, _ / r];
      },
      t >= 96 ? 96 : 60,
      i,
      Dt,
      Bt,
      Math.max(0.32, t / 220),
      Math.max(0.5, t / 135)
    );
  }
}, fn = (e, t, n, i, s) => {
  const o = t / 2, r = Math.max(2, Math.round(s.shellCount ?? 3)), a = Math.max(
    r,
    Math.round(s.ribbonLineCount ?? 25)
  ), c = Math.floor(a / r), d = a % r, [u, M] = ot(t);
  at(
    e,
    t,
    i,
    n * 0.1,
    0.34 + 0.055 * Math.sin(n * 0.3),
    t * 0.39,
    u,
    M,
    0.28
  );
  for (let l = 0; l < r; l++) {
    const h = n * (s.pulseSpeed ?? 0.17) * F + l / r * F, p = (1 - Math.cos(h)) / 2, g = t * (0.32 + 0.07 * p), b = n * 0.1 + l * 0.82, f = 0.5 + 0.12 * Math.sin(n * 0.25 + l), v = Math.cos(b), m = 0, w = Math.sin(b), P = -w * Math.sin(f), R = Math.cos(f), x = v * Math.sin(f), A = m * x - w * R, k = w * P - v * x, y = v * R - m * P, S = X(0, 0.18, o, o, g), C = c + (l < d ? 1 : 0), O = s.bandSpread ?? 0.075;
    for (let T = 0; T < C; T++) {
      const L = (T - (C - 1) / 2) * O, B = (I) => {
        const E = (0.085 * Math.sin(
          I * 3 - n * 1.15 + T * 0.24 + l
        ) + 0.032 * Math.sin(I * 5 + n * 0.72 - l)) * (s.wobMul ?? 1), D = L + E, N = v * Math.cos(I) + P * Math.sin(I) + A * D, _ = m * Math.cos(I) + R * Math.sin(I) + k * D, z = w * Math.cos(I) + x * Math.sin(I) + y * D, Y = Math.sqrt(N * N + _ * _ + z * z), [H, $, j] = S(
          N / Y,
          _ / Y,
          z / Y
        );
        return [H, $, j];
      };
      K(
        e,
        (I) => B(I * F),
        t >= 96 ? 88 : 52,
        i,
        Dt,
        Bt,
        Math.max(0.32, t / 220),
        Math.max(0.5, t / 135)
      );
    }
  }
}, mn = (e, t, n, i, s) => {
  const { points: o, pulse: r } = Ot(n, s), a = t / 2;
  ft(
    e,
    (c) => {
      const d = c * o.length, u = Math.floor(d) % o.length, M = (u + 1) % o.length, l = d - Math.floor(d), h = o[u], p = o[M];
      return [
        a + (h[0] + (p[0] - h[0]) * l) * r * t,
        a + (h[1] + (p[1] - h[1]) * l) * r * t
      ];
    },
    o.length,
    i,
    0.94,
    Math.max(0.75, t / 90)
  );
}, W = Math.PI * 2;
function Nt(e) {
  return e >= 96 ? 96 : e >= 64 ? 72 : 48;
}
function gn(e) {
  return e >= 128 ? [29, 19] : e >= 96 ? [24, 16] : e >= 64 ? [20, 14] : [11, 8];
}
function lt(e, t) {
  const n = tt(t);
  return e ? `rgba(250,250,250,${n})` : `rgba(24,24,27,${n})`;
}
function bn(e, t, n) {
  const i = Nt(t);
  e.beginPath();
  for (let s = 0; s <= i; s++) {
    const [o, r] = n.path(s / i), a = t / 2 + o * t, c = t / 2 + r * t;
    s === 0 ? e.moveTo(a, c) : e.lineTo(a, c);
  }
  e.closePath(), e.stroke();
}
function vn(e, t, n) {
  if (!n.depthPath)
    return;
  const i = Nt(t);
  e.beginPath();
  let s = !1;
  for (let o = 0; o <= i; o++) {
    const [r, a, c] = n.depthPath(o / i);
    if (c < 0) {
      s = !1;
      continue;
    }
    const d = t / 2 + r * t, u = t / 2 + a * t;
    s ? e.lineTo(d, u) : (e.moveTo(d, u), s = !0);
  }
  e.stroke();
}
function wn(e, t) {
  return {
    path: (n) => {
      const [i, s] = e(n);
      return [i, s];
    },
    depthPath: e,
    alpha: 0.14,
    width: Math.max(0.32, t / 220),
    nearAlpha: 0.44,
    nearWidth: Math.max(0.5, t / 135)
  };
}
function wt(e, t, n) {
  return {
    path: (i) => {
      const [s, o] = e(i);
      return [s, o];
    },
    depthPath: e,
    alpha: t * 0.08,
    width: n * 0.52,
    nearAlpha: t * 0.95,
    nearWidth: n
  };
}
function _t(e, t, n, i, s = 0.86, o) {
  const r = t / 2, a = t * 0.405;
  e.save(), e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.arc(r, r, a, 0, W), e.clip();
  for (const c of i)
    e.strokeStyle = lt(n, c.alpha), e.lineWidth = c.width ?? Math.max(0.42, t / 150), bn(e, t, c), c.depthPath && (e.strokeStyle = lt(
      n,
      c.nearAlpha ?? Math.min(1, c.alpha * 1.8)
    ), e.lineWidth = c.nearWidth ?? (c.width ?? Math.max(0.42, t / 150)) * 1.2, vn(e, t, c));
  e.restore(), !(s <= 0) && (e.strokeStyle = lt(n, s), e.lineWidth = Math.max(0.5, t / 135), e.beginPath(), e.arc(r, r, a, 0, W), e.stroke());
}
function yt(e, t, n, i, s, o, r, a) {
  const c = t % 2 === 0 ? 1 : -1, d = t / s * Math.PI, u = d + o * 0.19 * c, M = 0.5 + t * 0.18 + 0.08 * Math.sin(o * 0.32 + d), l = Math.cos(u), h = 0, p = Math.sin(u), g = -p * Math.sin(M), b = Math.cos(M), f = l * Math.sin(M), v = h * f - p * b, m = p * g - l * f, w = l * b - h * g, P = e * W, R = (n - (i - 1) / 2) * r, x = (0.105 * Math.sin(
    P * 3 - o * 1.35 * c + n * 0.2 + d
  ) + 0.04 * Math.sin(P * 5 + o * 0.78 - d)) * a, A = R + x, k = l * Math.cos(P) + g * Math.sin(P) + v * A, y = h * Math.cos(P) + b * Math.sin(P) + m * A, S = p * Math.cos(P) + f * Math.sin(P) + w * A, C = Math.sqrt(k * k + y * y + S * S), O = k / C, T = y / C, L = S / C, B = o * 0.08, I = 0.3, E = Math.cos(B), D = Math.sin(B), N = O * E + L * D, _ = -O * D + L * E, z = Math.cos(I), Y = Math.sin(I);
  return [
    N * 0.405,
    (T * z - _ * Y) * 0.405,
    T * Y + _ * z
  ];
}
function Yt(e, t, n, i) {
  const s = i * 0.08, o = 0.3 + 0.055 * Math.sin(i * 0.3), r = Math.cos(s), a = Math.sin(s), c = e * r + n * a, d = -e * a + n * r, u = Math.cos(o), M = Math.sin(o);
  return [
    c * 0.405,
    (t * u - d * M) * 0.405,
    t * M + d * u
  ];
}
function yn(e, t, n) {
  const i = e * W - Math.PI / 2, s = Math.sin(i);
  return Yt(
    s * Math.cos(t),
    Math.cos(i),
    s * Math.sin(t),
    n
  );
}
function Pn(e, t, n) {
  const i = e * W, s = Math.cos(t);
  return Yt(
    Math.cos(i) * s,
    Math.sin(t),
    Math.sin(i) * s,
    n
  );
}
const xn = (e, t, n, i, s) => {
  const o = Math.max(4, Math.round(s.orbitN ?? 12)), r = Math.max(2, Math.round(s.bandCount ?? 2)), a = Math.max(2, Math.round(o / r)), c = Math.max(1, Math.round(s.particles ?? 5)), d = Z(t, s.rsPow ?? 0.6), u = [], [M, l] = gn(t);
  for (let h = 0; h < M; h++) {
    const p = h / Math.max(1, M - 1), g = -Math.PI / 2 + p * Math.PI, b = (f) => yn(
      f,
      g,
      n
    );
    u.push(wt(
      b,
      0.09 + 0.07 * (1 - Math.abs(p * 2 - 1)),
      Math.max(0.38, t / 190)
    ));
  }
  for (let h = 0; h < l; h++) {
    const p = -Math.PI / 2 + (h + 1) / (l + 1) * Math.PI, g = (b) => Pn(
      b,
      p,
      n
    );
    u.push(wt(
      g,
      0.1,
      Math.max(0.38, t / 190)
    ));
  }
  for (let h = 0; h < r; h++)
    for (let p = 0; p < a; p++) {
      const g = (b) => yt(
        b,
        h,
        p,
        a,
        r,
        n,
        s.bandSpread ?? 0.064,
        s.wobMul ?? 1
      );
      u.push(wn(
        g,
        t
      ));
    }
  _t(e, t, i, u, 0);
  for (let h = 0; h < r; h++) {
    const p = h % 2 === 0 ? 1 : -1, g = h / r * Math.PI;
    for (let b = 0; b < c; b++) {
      const f = b % a, v = n * (0.72 + h * 0.08) * p + b / c * W + g, [m, w, P] = yt(
        v / W,
        h,
        f,
        a,
        r,
        n,
        s.bandSpread ?? 0.064,
        s.wobMul ?? 1
      ), R = (P + 1) / 2, x = Math.min(1, Math.max(0, 0.14 - 0.1 * R)), A = Math.round((i ? 1 - x : x) * 255), y = ((s.partR ?? 1.55) + (s.partRDepth ?? 2.1)) * d * (0.35 + 0.65 * R), S = tt(0.42 + 0.58 * R);
      e.fillStyle = `rgba(${A},${A},${A},${S})`, e.beginPath(), e.arc(
        t / 2 + m * t,
        t / 2 + w * t,
        y,
        0,
        W
      ), e.fill();
    }
  }
}, An = (e, t, n, i, s) => {
  const o = Math.max(2, Math.round(s.rings ?? 15)), r = [];
  for (let a = 0; a <= o; a++) {
    const c = -Math.PI / 2 + a / o * Math.PI, d = Math.cos(c), u = Math.sin(c), M = 0.62 * Math.sin(n * 2.1 - a * 0.52) + 0.38 * Math.sin(n * 1.27 + a * 0.83), l = Math.pow(Math.abs(d), 0.72), h = 0.4 * (0.92 + 0.075 * M * l);
    r.push({
      path: (p) => {
        const g = p * W, b = d * Math.cos(g) * h, f = u * h, v = d * Math.sin(g) * h, m = n * 0.18, w = 0.38, P = Math.cos(m), R = Math.sin(m), x = b * P + v * R, A = -b * R + v * P, k = Math.cos(w), y = Math.sin(w);
        return [
          x,
          f * k - A * y
        ];
      },
      alpha: 0.42 + 0.38 * (a / o),
      width: Math.max(0.42, t / 155)
    });
  }
  _t(e, t, i, r, 0);
};
function Ht(e, t) {
  return Math.max(12, Math.round(e.pointN ?? t));
}
function et(e, t, n) {
  return ((n.rBase ?? 0.7) + (n.rDepth ?? 1.5) * t) * Z(e, n.rsPow ?? 0.6);
}
const Sn = (e, t, n, i, s) => {
  const o = t / 2, r = Ht(s, 132), a = 0.94 + 0.055 * Math.sin(n * 0.85), c = X(n * 0.08, 0.34, o, o, t * 0.38 * a), d = [];
  for (let u = 0; u < r; u++) {
    const [M, l, h] = c(...st(u, r)), p = (h + 1) / 2;
    d.push({
      x: M,
      y: l,
      z: h,
      r: et(t, p, s),
      white: 0.7 - 0.58 * p,
      a: 0.5 + 0.5 * p
    });
  }
  U(e, d, i, s.rMin);
}, Rn = (e, t, n, i, s) => {
  const o = t / 2, r = Ht(s, 108), a = Math.PI * 2, c = t * ((s.lobeGap ?? 0.17) + (s.gapPulse ?? 0.012) * Math.sin(n * 1.15)), d = t * (s.lobeRadius ?? 0.2), u = t >= 64 ? Math.max(2, Math.round(s.laneCount ?? 3)) : 2, M = t >= 64 ? Math.max(8, Math.round(s.nodeMinSegments ?? 10)) : 8, l = Math.max(
    M,
    Math.round(r * 0.38 / (u * 2))
  ), h = t >= 64 ? Math.max(2, Math.round(s.bridgeStrands ?? 3)) : 2, p = [], g = Math.max(16, Math.round(r * 0.34)), b = t * (s.bodyRadius ?? 0.39), f = X(
    n * 0.07,
    0.34 + 0.055 * Math.sin(n * 0.3),
    o,
    o,
    b
  ), v = Math.max(
    4,
    Math.round(Math.sqrt(r) * 0.55)
  ), m = Math.max(
    2,
    Math.round(Math.sqrt(r) * 0.3)
  ), w = Math.max(
    8,
    Math.round(g / (v + m))
  ), P = (x, A, k) => {
    const y = (k + 1) / 2;
    p.push({
      x,
      y: A,
      z: k,
      r: et(t, y, s) * 0.92,
      white: 0.58 - 0.4 * y,
      a: 0.38 + 0.42 * y
    });
  };
  for (let x = 0; x < v; x++) {
    const A = -Math.PI / 2 + x / (v - 1) * Math.PI;
    for (let k = 0; k < w; k++) {
      const y = k / w * a - Math.PI / 2, S = Math.sin(y);
      P(...f(
        S * Math.cos(A),
        Math.cos(y),
        S * Math.sin(A)
      ));
    }
  }
  for (let x = 0; x < m; x++) {
    const A = -Math.PI / 2 + (x + 1) / (m + 1) * Math.PI, k = Math.cos(A);
    for (let y = 0; y < w; y++) {
      const S = y / w * a;
      P(...f(
        Math.cos(S) * k,
        Math.sin(A),
        Math.sin(S) * k
      ));
    }
  }
  const R = n * (s.signalSpeed ?? 0.28) % 1;
  for (const x of [-1, 1]) {
    const A = X(
      n * 0.48 * x,
      0.46,
      o + c * x,
      o,
      d
    ), k = (y, S) => {
      const C = (y - (u - 1) / 2) * 0.38, O = Math.sqrt(Math.max(0, 1 - C * C)), T = S * a + y * 0.18;
      return A(
        Math.cos(T) * O,
        C,
        Math.sin(T) * O
      );
    };
    for (let y = 0; y < u; y++) {
      const S = (y - (u - 1) / 2) * 0.38, C = Math.sqrt(Math.max(0, 1 - S * S));
      for (let T = 0; T < l; T++) {
        const L = T / l * Math.PI * 2 + y * 0.18, [B, I, E] = A(
          Math.cos(L) * C,
          S,
          Math.sin(L) * C
        ), D = (E + 1) / 2;
        p.push({
          x: B,
          y: I,
          z: E,
          r: et(t, D, s),
          white: 0.58 - 0.46 * D,
          a: 0.55 + 0.4 * D
        });
      }
      const O = -Math.PI / 2 + y / (u - 1) * Math.PI;
      for (let T = 0; T < l; T++) {
        const L = T / l * a - Math.PI / 2, B = Math.sin(L), [I, E, D] = A(
          B * Math.cos(O),
          Math.cos(L),
          B * Math.sin(O)
        ), N = (D + 1) / 2;
        p.push({
          x: I,
          y: E,
          z: D,
          r: et(t, N, s),
          white: 0.62 - 0.48 * N,
          a: 0.5 + 0.4 * N
        });
      }
    }
    for (let y = 0; y < h; y++) {
      const S = x < 0 ? 1 : -1, C = (1 + y / h * 0.68 + R * S) % 1, O = y % u, [T, L, B] = k(O, C), I = (B + 1) / 2, E = Math.max(0.8, t / 54);
      p.push({
        x: T,
        y: L,
        z: B + 0.04,
        r: Math.max(0.5, E * (0.35 + 0.65 * I)),
        white: 0.14 - 0.1 * I,
        a: 0.42 + 0.58 * I
      });
    }
  }
  U(e, p, i, s.rMin);
}, kn = (e, t, n, i, s) => {
  const o = t / 2, r = t / 2, a = t / 2 * 0.82, c = X(n * 0.08, 0.3, o, r, 1), d = Z(t, s.rsPow ?? 0.6), u = [], M = Math.max(4, s.orbitN ?? 12), l = Math.max(1, Math.round(s.bandCount ?? 2)), h = Math.max(2, Math.round(M / l)), p = Math.max(16, s.ghostN ?? 40), g = s.particles ?? 5, b = Math.max(12, Math.round(p * 1.2));
  for (let f = 0; f < b; f++) {
    const v = st(f, b), [m, w, P] = c(
      v[0] * a,
      v[1] * a,
      v[2] * a
    ), R = (P / a + 1) / 2;
    u.push({
      x: m,
      y: w,
      z: P,
      r: (s.ghostR ?? 0.9) * d,
      white: 0.78,
      a: (s.ghostA ?? 0.5) * (0.18 + 0.34 * R)
    });
  }
  for (let f = 0; f < l; f++) {
    const v = f % 2 === 0 ? 1 : -1, m = f / l * Math.PI, w = m + n * 0.19 * v, P = 0.5 + f * 0.18 + 0.08 * Math.sin(n * 0.32 + m), R = Math.cos(w), x = 0, A = Math.sin(w), k = -A * Math.sin(P), y = Math.cos(P), S = R * Math.sin(P), C = x * S - A * y, O = A * k - R * S, T = R * y - x * k;
    for (let L = 0; L < h; L++) {
      const B = Math.abs(L - (h - 1) / 2) / Math.max(1, (h - 1) / 2), I = (L - (h - 1) / 2) * (s.bandSpread ?? 0.064);
      for (let E = 0; E < p; E++) {
        const D = E / p * Math.PI * 2, N = (0.105 * Math.sin(
          D * 3 - n * 1.35 * v + L * 0.2 + m
        ) + 0.04 * Math.sin(D * 5 + n * 0.78 - m)) * (s.wobMul ?? 1), _ = I + N, z = R * Math.cos(D) + k * Math.sin(D) + C * _, Y = x * Math.cos(D) + y * Math.sin(D) + O * _, H = A * Math.cos(D) + S * Math.sin(D) + T * _, $ = Math.sqrt(z * z + Y * Y + H * H), [j, G, q] = c(
          z / $ * a,
          Y / $ * a,
          H / $ * a
        ), J = (q / a + 1) / 2;
        u.push({
          x: j,
          y: G,
          z: q,
          r: ((s.rBase ?? 1.1) + (s.rDepth ?? 1.7) * J) * (1 - 0.25 * B) * d,
          white: 0.52 - 0.44 * J + 0.18 * B,
          a: 0.4 + 0.6 * J
        });
      }
    }
    for (let L = 0; L < g; L++) {
      const B = L % h, I = (B - (h - 1) / 2) * (s.bandSpread ?? 0.064), E = n * (0.72 + f * 0.08) * v + L / g * Math.PI * 2 + m, D = (0.105 * Math.sin(
        E * 3 - n * 1.35 * v + B * 0.2 + m
      ) + 0.04 * Math.sin(E * 5 + n * 0.78 - m)) * (s.wobMul ?? 1), N = I + D, _ = R * Math.cos(E) + k * Math.sin(E) + C * N, z = x * Math.cos(E) + y * Math.sin(E) + O * N, Y = A * Math.cos(E) + S * Math.sin(E) + T * N, H = Math.sqrt(_ * _ + z * z + Y * Y), [$, j, G] = c(
        _ / H * a,
        z / H * a,
        Y / H * a
      ), q = (G / a + 1) / 2;
      u.push({
        x: $,
        y: j,
        z: G + 1,
        r: ((s.partR ?? 1.55) + (s.partRDepth ?? 2.1) * q) * d,
        white: 0.14 - 0.1 * q
      });
    }
  }
  U(e, u, i, s.rMin);
}, Cn = (e, t, n, i, s) => {
  const o = t / 2, r = Math.max(24, Math.round(s.pulseN ?? 156)), a = Math.max(2, Math.round(s.shellCount ?? 3)), c = Math.max(
    a,
    Math.round(s.ribbonLineCount ?? 25)
  ), d = Math.floor(c / a), u = c % a, M = t >= 64 ? 12 : 8, l = Math.max(
    M,
    Math.floor(
      r * (s.dotDensity ?? 2.8) / c
    )
  ), h = Z(t, s.rsPow ?? 0.6), p = ((s.rBase ?? 0.7) + (s.rDepth ?? 1.6) * 0.25) * (s.dotScale ?? 1.65) * h, g = [], b = Math.max(24, Math.round(r * 0.85)), f = t * 0.39, v = X(
    n * 0.1,
    0.34 + 0.055 * Math.sin(n * 0.3),
    o,
    o,
    f
  );
  for (let m = 0; m < b; m++) {
    const [w, P, R] = v(...st(m, b)), x = (R + 1) / 2;
    g.push({
      x: w,
      y: P,
      z: R,
      r: p * 0.65 * (0.42 + 0.58 * x + 0.16 * x * x),
      white: 0.64 - 0.4 * x,
      a: 0.18 + 0.48 * x
    });
  }
  for (let m = 0; m < a; m++) {
    const w = n * (s.pulseSpeed ?? 0.17) * Math.PI * 2 + m / a * Math.PI * 2, P = (1 - Math.cos(w)) / 2, R = t * (0.32 + 0.07 * P), x = 0.45 + 0.55 * ((1 + Math.sin(w)) / 2), A = n * 0.1 + m * 0.82, k = 0.5 + 0.12 * Math.sin(n * 0.25 + m), y = Math.cos(A), S = 0, C = Math.sin(A), O = -C * Math.sin(k), T = Math.cos(k), L = y * Math.sin(k), B = S * L - C * T, I = C * O - y * L, E = y * T - S * O, D = X(0, 0.18, o, o, R), N = d + (m < u ? 1 : 0);
    for (let _ = 0; _ < N; _++) {
      const z = (_ - (N - 1) / 2) * (s.bandSpread ?? 0.075);
      for (let Y = 0; Y < l; Y++) {
        const H = Y / l * Math.PI * 2, $ = (0.085 * Math.sin(
          H * 3 - n * 1.15 + _ * 0.24 + m
        ) + 0.032 * Math.sin(H * 5 + n * 0.72 - m)) * (s.wobMul ?? 1), j = z + $, G = y * Math.cos(H) + O * Math.sin(H) + B * j, q = S * Math.cos(H) + T * Math.sin(H) + I * j, J = C * Math.cos(H) + L * Math.sin(H) + E * j, it = Math.sqrt(G * G + q * q + J * J), [qt, Wt, rt] = D(G / it, q / it, J / it), Q = (rt + 1) / 2, Ut = Math.min(
          1,
          Math.max(0, (rt + 0.08) / 1.08)
        ), mt = Math.floor(Y / l * 16), gt = m * 11 + _, bt = n * ((s.shimmerSpeed ?? 0.55) / 0.55), Gt = Math.min(
          1,
          Math.max(
            0,
            0.62 + 0.25 * Math.sin(
              bt * 9.2 + gt * 1.71 + mt * 2.37
            ) + 0.13 * Math.sin(
              bt * 14.3 - gt * 0.83 + mt * 4.11
            )
          )
        ), vt = Ut * (0.48 + 0.52 * Gt);
        g.push({
          x: qt,
          y: Wt,
          z: rt + Math.sin(w) * 0.04,
          r: p * (0.35 + 0.65 * Q + 0.2 * Q * Q),
          white: 0.62 - 0.38 * Q - 0.18 * vt,
          a: Math.min(
            1,
            0.14 + x * (0.34 + 0.28 * Q + 0.24 * vt)
          ),
          shimmer: !0
        });
      }
    }
  }
  U(e, g, i, s.rMin);
}, Ln = (e, t, n, i, s) => {
  const o = t / 2, r = t / 2, a = t / 2 * 0.78, c = s.spin ?? 1, d = X(n * 0.1 * c, 0.3, o, r, 1), u = Z(t, s.rsPow ?? 0.6), M = [], l = s.ghostN ?? 150;
  for (let S = 0; S < l; S++) {
    const C = st(S, l), [O, T, L] = d(C[0] * a, C[1] * a, C[2] * a), B = (L / a + 1) / 2;
    M.push({ x: O, y: T, z: L, r: 0.8 * u, white: 0.78, a: 0.1 + 0.22 * B });
  }
  const h = n * 0.24 * c, p = 0.55 + 0.3 * Math.sin(n * 0.18) * c, g = Math.cos(h), b = 0, f = Math.sin(h), v = -f * Math.sin(p), m = Math.cos(p), w = g * Math.sin(p), P = b * w - f * m, R = f * v - g * w, x = g * m - b * v, A = s.lanes ?? 5, k = s.segs ?? 88, y = Math.max(1, Math.round(A * (s.bandMul ?? 1)));
  for (let S = 0; S < y; S++) {
    const C = (S - (y - 1) / 2) * 0.075, O = Math.abs(S - (y - 1) / 2) / Math.max(1, (y - 1) / 2);
    for (let T = 0; T < k; T++) {
      const L = T / k * 2 * Math.PI, B = (0.16 * Math.sin(L * 3 - n * 1.7 + S * 0.22) + 0.07 * Math.sin(L * 5 + n * 1.1)) * (s.wobMul ?? 1), I = C + B, E = g * Math.cos(L) + v * Math.sin(L) + P * I, D = b * Math.cos(L) + m * Math.sin(L) + R * I, N = f * Math.cos(L) + w * Math.sin(L) + x * I, _ = Math.sqrt(E * E + D * D + N * N), [z, Y, H] = d(E / _ * a, D / _ * a, N / _ * a), $ = (H / a + 1) / 2;
      M.push({
        x: z,
        y: Y,
        z: H,
        r: ((s.rBase ?? 1.1) + (s.rDepth ?? 1.7) * $) * (1 - 0.25 * O) * u,
        white: 0.52 - 0.44 * $ + 0.18 * O,
        a: 0.4 + 0.6 * $
      });
    }
  }
  U(e, M, i, s.rMin);
}, Pt = {
  idle: Sn,
  orbits: kn,
  connecting: Rn,
  globe: Qt,
  rubik: tn,
  wave: nn,
  ribbon: Ln,
  responding: Cn,
  morph: cn
}, Tn = {
  idle: un,
  orbits: xn,
  connecting: ln,
  globe: dn,
  rubik: Mn,
  wave: An,
  ribbon: pn,
  responding: fn,
  morph: mn
}, Vn = [
  ["latRings", "lonDensity"],
  ["rings", "lonDensity"],
  ["lanes", "segs"]
], In = ["orbitN", "ghostN", "pulseN", "pointN"], En = ["iconD"], On = [
  "rBase",
  "rDepth",
  "rActive",
  "rDot",
  "ghostR",
  "partR",
  "partRDepth"
];
function Dn(e, t) {
  const n = { ...e }, i = /* @__PURE__ */ new Set(), s = Math.sqrt(t);
  for (const [o, r] of Vn) {
    const a = n[o], c = n[r];
    a != null && c != null && !i.has(o) && !i.has(r) && (n[o] = Math.max(2, Math.round(a * s)), n[r] = Math.max(2, Math.round(c * s)), i.add(o), i.add(r));
  }
  for (const o of In) {
    const r = n[o];
    r != null && !i.has(o) && (n[o] = Math.max(1, Math.round(r * t)));
  }
  for (const o of En) {
    const r = n[o];
    r != null && (n[o] = Math.max(0.02, r * t));
  }
  return n;
}
function Bn(e, t) {
  const n = { ...e };
  for (const i of On) {
    const s = n[i];
    s != null && (n[i] = s * t);
  }
  return n.rSizeMul = (n.rSizeMul ?? 1) * t, n;
}
const Nn = {
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
    dotScale: 1.75,
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
}, _n = {
  idle: "idle",
  working: "orbits",
  connecting: "connecting",
  searching: "globe",
  solving: "rubik",
  listening: "wave",
  composing: "ribbon",
  responding: "responding",
  shaping: "morph"
}, Yn = {
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
function Hn(e, t) {
  const n = `${e}-${t}`, i = xt.get(n);
  if (i) return i;
  const s = _n[e], o = Yn[s][t];
  let r = { ...Nn[s] };
  o.count !== 1 && (r = Dn(r, o.count)), o.size !== 1 && (r = Bn(r, o.size)), o.extra && (r = { ...r, ...o.extra });
  const a = { mode: s, speed: o.speed, opts: r };
  return xt.set(n, a), a;
}
function zn(e) {
  let t = e;
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
function Xn() {
  return typeof matchMedia > "u" || matchMedia("(prefers-color-scheme: dark)").matches;
}
function At(e, t) {
  return e === "dark" ? !0 : e === "light" ? !1 : zn(t) ?? Xn();
}
function St(e, t) {
  return e ? typeof e.addEventListener == "function" ? (e.addEventListener("change", t), () => e.removeEventListener("change", t)) : (e.addListener(t), () => e.removeListener(t)) : () => {
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
], Xt = [32, 64, 96, 128], $t = ["auto", "dark", "light"], Ft = ["classic", "contour"], $n = {
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
function nt(e, t) {
  return e.includes(t);
}
function Fn(e) {
  const t = typeof e == "string" ? document.querySelector(e) : e;
  if (!t)
    throw new Error("ThinkingOrb target was not found.");
  if (t instanceof HTMLCanvasElement)
    return { canvas: t, createdCanvas: !1 };
  const n = document.createElement("canvas");
  return n.dataset.thinkingOrbCanvas = "", t.append(n), { canvas: n, createdCanvas: !0 };
}
function Rt(e) {
  return typeof requestAnimationFrame == "function" ? requestAnimationFrame(e) : window.setTimeout(() => e(performance.now()), 16);
}
function jn(e) {
  if (typeof cancelAnimationFrame == "function") {
    cancelAnimationFrame(e);
    return;
  }
  window.clearTimeout(e);
}
function qn(e, t) {
  let n = [];
  const i = (s) => {
    for (const [
      o,
      r,
      a,
      c,
      d,
      u
    ] of n) {
      if (s === "clip") {
        e.arc(
          o,
          r,
          a * 1.14,
          c,
          d,
          u ?? !1
        );
        continue;
      }
      const [M, l, h] = t(o, r);
      e.arc(
        M,
        l,
        a * (1 + 0.16 * h),
        c,
        d,
        u ?? !1
      );
    }
    n = [];
  };
  return new Proxy(e, {
    get(s, o) {
      if (o === "beginPath")
        return () => {
          n = [], s.beginPath();
        };
      if (o === "moveTo")
        return (a, c) => {
          const [d, u] = t(a, c);
          s.moveTo(d, u);
        };
      if (o === "lineTo")
        return (a, c) => {
          const [d, u] = t(a, c);
          s.lineTo(d, u);
        };
      if (o === "arc")
        return (a, c, d, u, M, l) => {
          n.push([
            a,
            c,
            d,
            u,
            M,
            l
          ]);
        };
      if (o === "fill")
        return () => {
          i("draw"), s.fill();
        };
      if (o === "stroke")
        return () => {
          i("draw"), s.stroke();
        };
      if (o === "clip")
        return () => {
          i("clip"), s.clip();
        };
      const r = Reflect.get(s, o, s);
      return typeof r == "function" ? r.bind(s) : r;
    },
    set(s, o, r) {
      return Reflect.set(s, o, r, s);
    }
  });
}
class jt {
  constructor(t, n = {}) {
    V(this, "canvas");
    V(this, "createdCanvas");
    V(this, "context");
    V(this, "distortionContext");
    V(this, "stateValue", "working");
    V(this, "sizeValue", 64);
    V(this, "themeValue", "auto");
    V(this, "variantValue", "classic");
    V(this, "speedValue", 1);
    V(this, "pausedValue", !1);
    V(this, "interactiveValue", !1);
    V(this, "customAriaLabel", null);
    V(this, "darkValue", !0);
    V(this, "reducedMotionValue", !1);
    V(this, "visibleValue", !0);
    V(this, "destroyed", !1);
    V(this, "running", !1);
    V(this, "frameHandle", 0);
    V(this, "lastRenderedTime", 0.6);
    V(this, "pointerX", 32);
    V(this, "pointerY", 32);
    V(this, "pointerStrength", 0);
    V(this, "pointerTargetX", 32);
    V(this, "pointerTargetY", 32);
    V(this, "pointerTargetStrength", 0);
    V(this, "intersectionObserver", null);
    V(this, "mutationObserver", null);
    V(this, "removeDarkMediaListener", () => {
    });
    V(this, "removeMotionMediaListener", () => {
    });
    V(this, "onVisibilityChange", () => {
      this.syncAnimation();
    });
    V(this, "onThemeChange", () => {
      const t = At(this.themeValue, this.canvas);
      t !== this.darkValue && (this.darkValue = t, this.render());
    });
    V(this, "onReducedMotionChange", (t) => {
      this.reducedMotionValue = t.matches, t.matches && (this.pointerStrength = 0, this.pointerTargetStrength = 0), this.render(), this.syncAnimation();
    });
    V(this, "onPointerMove", (t) => {
      if (!this.interactiveValue || this.reducedMotionValue)
        return;
      const n = this.canvas.getBoundingClientRect(), i = n.width || this.sizeValue, s = n.height || this.sizeValue;
      this.pointerTargetX = Math.min(
        this.sizeValue,
        Math.max(0, (t.clientX - n.left) / i * this.sizeValue)
      ), this.pointerTargetY = Math.min(
        this.sizeValue,
        Math.max(0, (t.clientY - n.top) / s * this.sizeValue)
      ), this.pointerTargetStrength = 1, this.stepInteraction(), this.render(this.pausedValue ? this.lastRenderedTime : void 0), this.syncAnimation();
    });
    V(this, "onPointerLeave", () => {
      this.interactiveValue && (this.pointerTargetStrength = 0, this.stepInteraction(), this.render(this.pausedValue ? this.lastRenderedTime : void 0), this.syncAnimation());
    });
    V(this, "onPointerDown", (t) => {
      var n, i;
      !this.interactiveValue || this.reducedMotionValue || (t.pointerType !== "mouse" && t.preventDefault(), (i = (n = this.canvas).setPointerCapture) == null || i.call(n, t.pointerId), this.onPointerMove(t));
    });
    V(this, "onPointerUp", (t) => {
      var n, i;
      (i = (n = this.canvas).releasePointerCapture) == null || i.call(n, t.pointerId), t.pointerType !== "mouse" && this.onPointerLeave();
    });
    if (typeof document > "u")
      throw new Error("ThinkingOrb requires a browser DOM.");
    const { canvas: i, createdCanvas: s } = Fn(t), o = i.getContext("2d");
    if (!o)
      throw new Error("ThinkingOrb requires CanvasRenderingContext2D support.");
    this.canvas = i, this.createdCanvas = s, this.context = o, this.distortionContext = qn(
      o,
      (r, a) => this.distortPoint(r, a)
    ), n.className && s && (i.className = n.className), this.setupObservers(), this.update(n);
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
      if (!nt(zt, t.state))
        throw new TypeError(`Unknown ThinkingOrb state: ${String(t.state)}`);
      this.stateValue = t.state;
    }
    if (t.size !== void 0) {
      if (!nt(Xt, t.size))
        throw new TypeError("ThinkingOrb size must be 32, 64, 96, or 128.");
      this.sizeValue = t.size;
    }
    if (t.theme !== void 0) {
      if (!nt($t, t.theme))
        throw new TypeError(`Unknown ThinkingOrb theme: ${String(t.theme)}`);
      this.themeValue = t.theme;
    }
    if (t.variant !== void 0) {
      if (!nt(Ft, t.variant))
        throw new TypeError(`Unknown ThinkingOrb variant: ${String(t.variant)}`);
      this.variantValue = t.variant;
    }
    if (t.speed !== void 0) {
      if (!Number.isFinite(t.speed) || t.speed <= 0)
        throw new TypeError("ThinkingOrb speed must be a positive number.");
      this.speedValue = t.speed;
    }
    return t.paused !== void 0 && (this.pausedValue = !!t.paused), t.interactive !== void 0 && (this.interactiveValue = !!t.interactive, this.interactiveValue || (this.pointerStrength = 0, this.pointerTargetStrength = 0)), "ariaLabel" in t && (this.customAriaLabel = ((n = t.ariaLabel) == null ? void 0 : n.trim()) || null), this.darkValue = At(this.themeValue, this.canvas), this.configureCanvas(), this.render(), this.syncAnimation(), this;
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
    const { mode: n, speed: i, opts: s } = Hn(
      this.stateValue,
      this.sizeValue
    ), o = t ?? (this.reducedMotionValue ? 0.6 : performance.now() / 1e3 * i * this.speedValue), r = this.getDevicePixelRatio(), a = this.interactiveValue && !this.reducedMotionValue && this.pointerStrength > 1e-3 ? this.distortionContext : this.context;
    return this.lastRenderedTime = o, this.context.setTransform(r, 0, 0, r, 0, 0), this.context.clearRect(0, 0, this.sizeValue, this.sizeValue), (this.variantValue === "contour" ? Tn[n] ?? Pt[n] : Pt[n])(
      a,
      this.sizeValue,
      o,
      this.darkValue,
      s
    ), this;
  }
  destroy(t = {}) {
    var n, i;
    this.destroyed || (this.stop(), (n = this.intersectionObserver) == null || n.disconnect(), (i = this.mutationObserver) == null || i.disconnect(), this.removeDarkMediaListener(), this.removeMotionMediaListener(), document.removeEventListener("visibilitychange", this.onVisibilityChange), this.canvas.removeEventListener("pointerenter", this.onPointerMove), this.canvas.removeEventListener("pointermove", this.onPointerMove), this.canvas.removeEventListener("pointerleave", this.onPointerLeave), this.canvas.removeEventListener("pointercancel", this.onPointerLeave), this.canvas.removeEventListener("pointerdown", this.onPointerDown), this.canvas.removeEventListener("pointerup", this.onPointerUp), (t.removeCanvas ?? this.createdCanvas) && this.canvas.isConnected && this.canvas.remove(), this.destroyed = !0);
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
    })), typeof IntersectionObserver < "u" && (this.intersectionObserver = new IntersectionObserver(([i]) => {
      this.visibleValue = (i == null ? void 0 : i.isIntersecting) ?? !0, this.syncAnimation();
    }), this.intersectionObserver.observe(this.canvas)), document.addEventListener("visibilitychange", this.onVisibilityChange), this.canvas.addEventListener("pointerenter", this.onPointerMove), this.canvas.addEventListener("pointermove", this.onPointerMove), this.canvas.addEventListener("pointerleave", this.onPointerLeave), this.canvas.addEventListener("pointercancel", this.onPointerLeave), this.canvas.addEventListener("pointerdown", this.onPointerDown), this.canvas.addEventListener("pointerup", this.onPointerUp);
  }
  configureCanvas() {
    this.canvas.dataset.thinkingOrbState = this.stateValue, this.canvas.dataset.thinkingOrbTheme = this.themeValue, this.canvas.dataset.thinkingOrbVariant = this.variantValue, this.canvas.dataset.thinkingOrbInteractive = String(this.interactiveValue), this.canvas.setAttribute("role", "img"), this.canvas.setAttribute(
      "aria-label",
      this.customAriaLabel ?? $n[this.stateValue]
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
        this.frameHandle = Rt(t);
      }
    };
    this.frameHandle = Rt(t);
  }
  stop() {
    this.running = !1, jn(this.frameHandle);
  }
  stepInteraction() {
    const n = this.pointerTargetStrength > this.pointerStrength ? 0.24 : 0.14;
    this.pointerX += (this.pointerTargetX - this.pointerX) * 0.2, this.pointerY += (this.pointerTargetY - this.pointerY) * 0.2, this.pointerStrength += (this.pointerTargetStrength - this.pointerStrength) * n, Math.abs(this.pointerStrength) < 5e-4 && (this.pointerStrength = 0);
  }
  interactionNeedsFrame() {
    return !this.interactiveValue || this.reducedMotionValue ? !1 : this.pointerTargetStrength > 1e-3 || this.pointerStrength > 1e-3 || Math.abs(this.pointerTargetX - this.pointerX) > 0.05 || Math.abs(this.pointerTargetY - this.pointerY) > 0.05;
  }
  distortPoint(t, n) {
    const i = t - this.pointerX, s = n - this.pointerY, o = Math.hypot(i, s), r = this.sizeValue * 0.55;
    if (this.pointerStrength <= 1e-3 || o >= r || o <= 1e-4)
      return [t, n, 0];
    const a = 1 - o / r, c = a * a * (3 - 2 * a) * this.pointerStrength, d = i / o, u = s / o, M = this.sizeValue * 0.105 * c, l = this.sizeValue * 0.018 * c;
    return [
      t + d * M - u * l,
      n + u * M + d * l,
      c
    ];
  }
  assertActive() {
    if (this.destroyed)
      throw new Error("ThinkingOrb has been destroyed.");
  }
}
function Kn(e, t = {}) {
  return new jt(e, t);
}
const Wn = typeof globalThis.HTMLElement > "u" ? class {
} : globalThis.HTMLElement;
function kt(e) {
  return zt.includes(e) ? e : "working";
}
function Un(e) {
  const t = Number(e);
  return Xt.includes(t) ? t : 64;
}
function Gn(e) {
  return $t.includes(e) ? e : "auto";
}
function Ct(e) {
  return Ft.includes(e) ? e : "classic";
}
function Zn(e) {
  const t = Number(e);
  return Number.isFinite(t) && t > 0 ? t : 1;
}
class Mt extends Wn {
  constructor() {
    super(...arguments);
    V(this, "controller", null);
  }
  connectedCallback() {
    var i, s, o;
    if (this.controller || !(this instanceof HTMLElement))
      return;
    (i = this.style).display || (i.display = "inline-block"), (s = this.style).lineHeight || (s.lineHeight = "0"), (o = this.style).verticalAlign || (o.verticalAlign = "middle");
    const n = document.createElement("canvas");
    n.dataset.thinkingOrbCanvas = "", this.replaceChildren(n), this.controller = new jt(n, this.readOptions());
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
    return kt(this.getAttribute("state"));
  }
  set state(n) {
    this.setAttribute("state", n);
  }
  get variant() {
    return Ct(this.getAttribute("variant"));
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
      state: kt(this.getAttribute("state")),
      size: Un(this.getAttribute("size")),
      theme: Gn(this.getAttribute("theme")),
      variant: Ct(this.getAttribute("variant")),
      speed: Zn(this.getAttribute("speed")),
      paused: this.hasAttribute("paused"),
      interactive: this.hasAttribute("interactive"),
      ariaLabel: this.getAttribute("aria-label")
    };
  }
}
V(Mt, "observedAttributes", [
  "state",
  "size",
  "theme",
  "variant",
  "speed",
  "paused",
  "interactive",
  "aria-label"
]);
function Qn(e = "thinking-orb") {
  if (!e.includes("-"))
    throw new TypeError("A custom-element name must contain a hyphen.");
  return typeof customElements < "u" && !customElements.get(e) && customElements.define(e, Mt), Mt;
}
export {
  Tn as CONTOUR_MODE_DRAWS,
  Pt as MODE_DRAWS,
  Xt as ORB_SIZES,
  zt as ORB_STATES,
  $t as ORB_THEMES,
  Ft as ORB_VARIANTS,
  _n as STATE_TO_MODE,
  jt as ThinkingOrb,
  Mt as ThinkingOrbElement,
  Kn as createThinkingOrb,
  Qn as defineThinkingOrb,
  Hn as resolvePreset
};

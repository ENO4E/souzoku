/**
 * パーティクルが変形していく「形」を生成する。
 * すべて同じ点数 count の Float32Array（xyz）を返し、シェーダー側で補間する。
 *
 *   0: Core      … 揺らぐ球体。ご家族の財産そのもの
 *   1: Silos     … 分断された島々。整理されていない財産・手続き・期限
 *   2: Grid      … 整列した格子。明快な料金表と評価の基準
 *   3: Helix     … 二重螺旋。段階的に進む申告までの流れ
 *   4: Network   … トーラスノット。提携先とつながり、一気通貫で完了する体制
 */

export const SHAPE_COUNT = 5

// 決定的な乱数（毎回同じ形になるように）
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gaussian(rand) {
  const u = Math.max(rand(), 1e-6)
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function createCore(count, rand = mulberry32(1)) {
  const out = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    // 7割は球面（フィボナッチ配置）、3割は内部の霧
    const onSurface = rand() < 0.72
    let x, y, z
    if (onSurface) {
      const yy = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - yy * yy)
      const th = golden * i
      x = Math.cos(th) * r
      y = yy
      z = Math.sin(th) * r
      const rad = 2.35 + gaussian(rand) * 0.03
      x *= rad
      y *= rad
      z *= rad
    } else {
      const th = rand() * Math.PI * 2
      const ph = Math.acos(2 * rand() - 1)
      const rad = 1.75 + rand() * 0.5
      x = Math.sin(ph) * Math.cos(th) * rad
      y = Math.cos(ph) * rad
      z = Math.sin(ph) * Math.sin(th) * rad
    }
    out.set([x, y, z], i * 3)
  }
  return out
}

export function createSilos(count, rand = mulberry32(2)) {
  const out = new Float32Array(count * 3)
  const islands = [
    { c: [-2.6, 1.1, -0.4], r: 0.75 },
    { c: [-0.7, -1.5, 0.8], r: 0.55 },
    { c: [1.2, 1.35, -1.0], r: 0.85 },
    { c: [2.9, -0.6, 0.3], r: 0.6 },
    { c: [0.4, 0.05, 1.6], r: 0.42 },
    { c: [-2.1, -1.0, -1.6], r: 0.5 },
    { c: [1.9, -2.0, -1.3], r: 0.38 },
  ]
  const weights = islands.map((d) => d.r ** 2)
  const total = weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < count; i++) {
    if (rand() < 0.05) {
      out.set([(rand() - 0.5) * 9, (rand() - 0.5) * 5.5, (rand() - 0.5) * 4], i * 3)
      continue
    }
    let pick = rand() * total
    let k = 0
    while (pick > weights[k] && k < islands.length - 1) pick -= weights[k++]
    const { c, r } = islands[k]
    const th = rand() * Math.PI * 2
    const ph = Math.acos(2 * rand() - 1)
    const rad = r * Math.cbrt(rand())
    out.set(
      [c[0] + Math.sin(ph) * Math.cos(th) * rad, c[1] + Math.cos(ph) * rad, c[2] + Math.sin(ph) * Math.sin(th) * rad],
      i * 3,
    )
  }
  return out
}

export function createGrid(count, rand = mulberry32(3)) {
  const out = new Float32Array(count * 3)
  const side = Math.ceil(Math.sqrt(count))
  const size = 9.5
  for (let i = 0; i < count; i++) {
    const gx = i % side
    const gz = Math.floor(i / side)
    const x = (gx / (side - 1) - 0.5) * size
    const z = (gz / (side - 1) - 0.5) * size
    out.set([x, (rand() - 0.5) * 0.02, z], i * 3)
  }
  return out
}

export function createHelix(count, rand = mulberry32(4)) {
  const out = new Float32Array(count * 3)
  const length = 10
  const turns = 3.2
  const radius = 1.15
  for (let i = 0; i < count; i++) {
    const t = rand()
    const a = t * Math.PI * 2 * turns
    const x = (t - 0.5) * length
    const kind = rand()
    if (kind < 0.8) {
      const phase = kind < 0.4 ? 0 : Math.PI
      const jitter = 0.06
      out.set(
        [x + gaussian(rand) * jitter, Math.cos(a + phase) * radius + gaussian(rand) * jitter, Math.sin(a + phase) * radius + gaussian(rand) * jitter],
        i * 3,
      )
    } else {
      const steps = 26
      const st = Math.round(t * steps) / steps
      const sa = st * Math.PI * 2 * turns
      const s = rand() * 2 - 1
      out.set([(st - 0.5) * length, Math.cos(sa) * radius * s, Math.sin(sa) * radius * s], i * 3)
    }
  }
  return out
}

export function createNetwork(count, rand = mulberry32(5)) {
  const out = new Float32Array(count * 3)
  const p = 2
  const q = 3
  const R = 1.75
  const tube = 0.28
  for (let i = 0; i < count; i++) {
    const t = rand() * Math.PI * 2
    const r = R + 0.75 * Math.cos(q * t)
    const cx = r * Math.cos(p * t)
    const cy = r * Math.sin(p * t)
    const cz = 0.75 * Math.sin(q * t) * 1.4
    const ang = rand() * Math.PI * 2
    const rad = tube * Math.sqrt(rand())
    out.set([cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, cz + gaussian(rand) * rad * 0.6], i * 3)
  }
  return out
}

export function createAllShapes(count) {
  return [createCore(count), createSilos(count), createGrid(count), createHelix(count), createNetwork(count)]
}

export function createRandoms(count, seed = 9) {
  const rand = mulberry32(seed)
  const out = new Float32Array(count * 4)
  for (let i = 0; i < count * 4; i++) out[i] = rand()
  return out
}

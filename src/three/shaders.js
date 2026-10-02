// Ashima Arts / Stefan Gustavson の 3D simplex noise（MIT）
const noise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
  return vec3(
    snoise(x),
    snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)),
    snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4))
  );
}
`;

export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uPixelRatio;
uniform float uSize;
uniform float uMotion;
uniform vec3 uMouse;
uniform float uMouseStrength;
uniform float uIntro;
uniform float uVelocity;
uniform float uBrightness;
uniform vec3 uColorsA[5];
uniform vec3 uColorsB[5];

attribute vec3 aShape0;
attribute vec3 aShape1;
attribute vec3 aShape2;
attribute vec3 aShape3;
attribute vec3 aShape4;
attribute vec4 aRandom;

varying vec3 vColor;
varying float vAlpha;

${noise}

vec3 shapeAt(int i) {
  if (i <= 0) return aShape0;
  if (i == 1) return aShape1;
  if (i == 2) return aShape2;
  if (i == 3) return aShape3;
  return aShape4;
}

vec3 colorAt(int i) {
  vec3 a = uColorsA[0]; vec3 b = uColorsB[0];
  if (i == 1) { a = uColorsA[1]; b = uColorsB[1]; }
  else if (i == 2) { a = uColorsA[2]; b = uColorsB[2]; }
  else if (i == 3) { a = uColorsA[3]; b = uColorsB[3]; }
  else if (i >= 4) { a = uColorsA[4]; b = uColorsB[4]; }
  return mix(a, b, aRandom.y);
}

void main() {
  float m = clamp(uMorph, 0.0, 4.0);
  int from = int(floor(m));
  int to = min(from + 1, 4);
  float f = m - float(from);

  // 粒子ごとに出発のタイミングをずらし、波のように形が入れ替わる
  float delay = aRandom.x * 0.4;
  float t = clamp((f - delay) / 0.6, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  vec3 pos = mix(shapeAt(from), shapeAt(to), t);

  // 遷移中は流体のように渦を巻いてから再集合する
  float burst = sin(t * 3.14159265);
  vec3 flow = snoiseVec3(pos * 0.35 + vec3(uTime * 0.12));
  pos += flow * burst * (0.9 + aRandom.z * 1.2) * uMotion;

  // スクロールの勢いで粒子がざわめく
  pos += flow * uVelocity * (0.35 + aRandom.z * 0.5) * uMotion;

  // 常時のゆらぎ
  // 球体（シーン 0）のときは揺らぎを半分にして、輪郭を球に近づける
  float coreShape = 1.0 - clamp(uMorph, 0.0, 1.0);
  float idle = (0.06 + 0.06 * aRandom.w) * mix(1.0, 0.5, coreShape);
  pos += snoiseVec3(pos * 0.55 + uTime * 0.07) * idle * uMotion;

  // 格子（2）のときは面が波打つ
  float gridW = 1.0 - clamp(abs(m - 2.0), 0.0, 1.0);
  pos.y += (sin(pos.x * 0.9 + uTime * 0.8) * 0.28 + cos(pos.z * 0.7 + uTime * 0.6) * 0.22) * gridW * uMotion;

  // 球体（0）は呼吸する
  float coreW = 1.0 - clamp(m, 0.0, 1.0);
  float breathe = snoise(normalize(pos + 0.0001) * 1.4 + uTime * 0.18);
  pos += normalize(pos + 0.0001) * breathe * 0.11 * coreW * uMotion;

  // 起動時：遠くに散らばった粒子が中心へ吸い寄せられて形になる
  float introT = clamp((uIntro - aRandom.y * 0.45) / 0.55, 0.0, 1.0);
  introT = 1.0 - pow(1.0 - introT, 3.0);
  vec3 scatter = normalize(aRandom.xyz - 0.5 + 0.0001) * (9.0 + aRandom.w * 12.0);
  scatter += snoiseVec3(scatter * 0.1 + uTime * 0.05) * 2.0;
  pos = mix(scatter, pos, introT);

  vec4 world = modelMatrix * vec4(pos, 1.0);

  // マウスの周囲だけ粒子が押しのけられる
  vec2 toMouse = world.xy - uMouse.xy;
  float dist = length(toMouse);
  float push = smoothstep(1.8, 0.0, dist) * uMouseStrength;
  world.xy += normalize(toMouse + 0.0001) * push * 0.75;
  world.z += push * 0.6;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float sparkle = step(0.965, aRandom.w);
  float size = uSize * (0.55 + aRandom.z * 0.9) * (1.0 + sparkle * 1.4);
  gl_PointSize = size * uPixelRatio * (8.0 / -mv.z);

  vec3 cFrom = colorAt(from);
  vec3 cTo = colorAt(to);
  vec3 col = mix(cFrom, cTo, t);
  col += push * vec3(0.35, 0.55, 0.6);
  float twinkle = 0.75 + 0.25 * sin(uTime * (1.5 + aRandom.x * 3.0) + aRandom.y * 40.0);
  vColor = col * mix(1.15, 2.0, sparkle) * twinkle * uBrightness;

  // 奥にある粒子ほど暗く
  vAlpha = clamp(1.25 - (-mv.z - 6.0) * 0.12, 0.15, 1.0) * (0.6 + 0.4 * aRandom.x) * (0.25 + 0.75 * introT);
}
`;

export const particleFragment = /* glsl */ `
uniform float uCore;
uniform float uHalo;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  // くっきりした芯＋控えめな光のにじみ（全体がガウスぼかしのように見えないように）
  // uCore … 芯の半径（点の大きさに対する割合）、uHalo … にじみの強さ（スマホは 0 にしてにじませない）
  float core = 1.0 - smoothstep(uCore - 0.06, uCore + 0.02, d);
  float halo = pow(1.0 - d * 2.0, 3.0) * uHalo;
  float glow = core + halo;
  gl_FragColor = vec4(vColor * glow, glow * vAlpha);
  #include <colorspace_fragment>
}
`;

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSeed;
varying float vAlpha;

void main() {
  vec3 p = position;
  p.y += mod(uTime * (0.04 + aSeed * 0.05) + aSeed * 20.0, 20.0) - 10.0;
  p.x += sin(uTime * 0.1 + aSeed * 30.0) * 0.3;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.0 + aSeed * 2.0) * uPixelRatio * (6.0 / -mv.z);
  vAlpha = 0.25 + 0.35 * aSeed;
}
`;

export const dustFragment = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vec3(0.55, 0.7, 0.9), smoothstep(0.5, 0.0, d) * vAlpha);
  #include <colorspace_fragment>
}
`;

export const ringVertex = /* glsl */ `
attribute float aProgress;
varying float vProgress;
void main() {
  vProgress = aProgress;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const ringFragment = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor;
uniform float uSpeed;
varying float vProgress;
void main() {
  // 光の筋がリング上を周回する
  float head = fract(uTime * uSpeed);
  float d = fract(vProgress - head);
  float trail = pow(1.0 - d, 18.0);
  float base = 0.12;
  gl_FragColor = vec4(uColor, (base + trail * 0.9) * uOpacity);
  #include <colorspace_fragment>
}
`;

/**
 * 最終合成パス。スクロールの勢いに応じて画面がレンズのように歪み、RGB がずれる。
 * 周辺減光とフィルムグレインもここで加える。
 */
export const finalPass = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVelocity: { value: 0 },
    uAspect: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVelocity;
    uniform float uAspect;
    varying vec2 vUv;

    void main() {
      vec2 c = vUv - 0.5;
      c.x *= uAspect;
      float r2 = dot(c, c);
      float v = clamp(abs(uVelocity), 0.0, 1.0);

      // 速度に比例したバレル歪み
      vec2 uv = vUv + (vUv - 0.5) * r2 * v * 0.35;
      // 縦方向のスクロールに沿った色収差（スクロール中だけ。止まっているときは一切ずらさない）
      vec2 shift = vec2(0.0, 0.0035 + r2 * 0.01) * v * sign(uVelocity + 0.0001);

      vec3 col;
      col.r = texture2D(tDiffuse, uv + shift).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - shift).b;

      float vig = smoothstep(1.1, 0.25, r2 * 1.6);
      col *= mix(0.55, 1.0, vig);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

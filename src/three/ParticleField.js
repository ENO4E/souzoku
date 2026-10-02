import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { createAllShapes, createRandoms, SHAPE_COUNT } from './shapes.js'
import { dustFragment, dustVertex, finalPass, particleFragment, particleVertex, ringFragment, ringVertex } from './shaders.js'

/**
 * 背景の粒子シーン（TaxPlan-org/HP-DX の ParticleField を移植。ロゴの月は使わない）。
 * options.lowPower     … 低スペック端末（モバイル等）向けに粒子数とエフェクトを抑える
 * options.reducedMotion … prefers-reduced-motion。アニメーションを止め、スクロール時のみ描画する
 */

/** シーン（形）ごとの配置。デスクトップではテキストと重ならない位置に寄せる */
const DESKTOP_LAYOUT = [
  { x: 2.55, y: 0.05, scale: 1.0, tiltX: 0.0 },
  { x: 0.4, y: 0.0, scale: 0.95, tiltX: 0.0 },
  { x: 0.0, y: -0.9, scale: 1.0, tiltX: 0.42 },
  { x: 0.0, y: 0.0, scale: 0.92, tiltX: 0.0 },
  { x: 2.3, y: 0.0, scale: 1.0, tiltX: 0.25 },
]
const MOBILE_LAYOUT = [
  { x: 0.55, y: 2.7, scale: 0.88, tiltX: 0.0 },
  { x: 0.0, y: 0.2, scale: 0.8, tiltX: 0.0 },
  { x: 0.0, y: -1.2, scale: 0.85, tiltX: 0.35 },
  { x: 0.0, y: 0.0, scale: 0.72, tiltX: 0.0 },
  { x: 0.0, y: 0.4, scale: 0.9, tiltX: 0.25 },
]

// [主色, 副色] をシーンごとに。金×青を基調に、お悩みのパートだけ紫系にして空気を変える
const PALETTE = [
  ['#e6c47a', '#8fb3ff'],
  ['#b18cff', '#7a5cff'],
  ['#8fb3ff', '#e6c47a'],
  ['#f0d9a3', '#8fb3ff'],
  ['#e6c47a', '#a78bfa'],
]

const BG = new THREE.Color('#070a12')

const lerp = (a, b, t) => a + (b - a) * t
const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt))

export class ParticleField {
  constructor(canvas, options) {
    this.canvas = canvas
    this.options = options
    this.scene = new THREE.Scene()
    this.composer = null
    this.final = null
    this.group = new THREE.Group()
    this.rings = []
    this.lastFrame = 0
    this.raf = 0
    this.running = false
    this.disposed = false
    this.morph = 0
    this.targetMorph = 0
    this.pointer = new THREE.Vector2(0, 0)
    this.pointerTarget = new THREE.Vector2(0, 0)
    this.pointerActive = 0
    this.pointerActiveTarget = 0
    this.time = 0
    this.intro = 0
    this.introPlaying = false
    this.scrollY = 0
    this.lastScrollY = 0
    this.velocity = 0
    this.width = 1
    this.height = 1
    this.isMobileLayout = false

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setClearColor(BG, 1)
    this.scene.background = BG
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    this.camera.position.set(0, 0, 11)

    this.scene.add(this.group)

    const count = options.lowPower ? 4200 : 22000
    this.points = this.createParticles(count)
    this.group.add(this.points)

    this.dust = this.createDust(options.lowPower ? 250 : 600)
    this.scene.add(this.dust)

    this.createRings()
    this.createWires()
    this.createStreaks(options.lowPower ? 0 : 6)

    if (!options.lowPower && !options.reducedMotion) {
      const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 })
      this.composer = new EffectComposer(this.renderer, target)
      this.composer.addPass(new RenderPass(this.scene, this.camera))
      // 明るい粒子だけがにじむ控えめなブルーム（しきい値を高くして全体がもやがからないようにする）
      this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.65, 0.78)
      this.composer.addPass(this.bloom)
      this.composer.addPass(new OutputPass())
      this.final = new ShaderPass(finalPass)
      this.composer.addPass(this.final)
    }

    this.scrollY = this.lastScrollY = window.scrollY
    if (options.reducedMotion) this.intro = 1

    this.resize()
  }

  createParticles(count) {
    const geometry = new THREE.BufferGeometry()
    const shapes = createAllShapes(count)
    geometry.setAttribute('position', new THREE.BufferAttribute(shapes[0], 3))
    shapes.forEach((s, i) => geometry.setAttribute(`aShape${i}`, new THREE.BufferAttribute(s, 3)))
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(createRandoms(count), 4))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12)

    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uPixelRatio: { value: 1 },
        uSize: { value: 4.8 },
        uCore: { value: 0.22 },
        uHalo: { value: 0.28 },
        uMotion: { value: this.options.reducedMotion ? 0.0 : 1.0 },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
        uMouseStrength: { value: 0 },
        uIntro: { value: this.options.reducedMotion ? 1 : 0 },
        uBrightness: { value: 1 },
        uVelocity: { value: 0 },
        uColorsA: { value: PALETTE.map(([a]) => new THREE.Color(a)) },
        uColorsB: { value: PALETTE.map(([, b]) => new THREE.Color(b)) },
      },
    })
    return new THREE.Points(geometry, material)
  }

  createDust(count) {
    const geometry = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = -4 - Math.random() * 14
      seed[i] = Math.random()
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const material = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    })
    const points = new THREE.Points(geometry, material)
    points.frustumCulled = false
    return points
  }

  createRings() {
    const specs = [
      { r: 3.25, tilt: [1.2, 0.2], speed: 0.07, color: '#e6c47a' },
      { r: 3.7, tilt: [1.45, -0.5], speed: -0.045, color: '#8fb3ff' },
      { r: 4.3, tilt: [1.05, 0.9], speed: 0.03, color: '#a78bfa' },
    ]
    for (const s of specs) {
      const segments = 256
      const pos = new Float32Array((segments + 1) * 3)
      const prog = new Float32Array(segments + 1)
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2
        pos.set([Math.cos(a) * s.r, Math.sin(a) * s.r, 0], i * 3)
        prog[i] = s.speed > 0 ? i / segments : 1 - i / segments
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geometry.setAttribute('aProgress', new THREE.BufferAttribute(prog, 1))
      const material = new THREE.ShaderMaterial({
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 1 },
          uColor: { value: new THREE.Color(s.color) },
          uSpeed: { value: Math.abs(s.speed) * 3 },
        },
      })
      const line = new THREE.Line(geometry, material)
      line.rotation.set(s.tilt[0], s.tilt[1], 0)
      this.rings.push(line)
      this.group.add(line)
    }
  }

  /** 形の骨組み：球体（シーン0）は測地線ドーム、ネットワーク（シーン4）はトーラスノットの線画を粒子に重ねる */
  createWires() {
    const make = (geometry, color, opacity) => {
      const edges = new THREE.EdgesGeometry(geometry, 1)
      const material = new THREE.LineBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })
      const lines = new THREE.LineSegments(edges, material)
      lines.userData.baseOpacity = opacity
      geometry.dispose()
      this.group.add(lines)
      return lines
    }
    this.wireCore = make(new THREE.IcosahedronGeometry(2.42, 1), '#e6c47a', 0.28)
    this.wireCoreInner = make(new THREE.IcosahedronGeometry(1.55, 0), '#8fb3ff', 0.22)
    this.wireNetwork = make(new THREE.TorusKnotGeometry(1.75, 0.3, 72, 8, 2, 3), '#8fb3ff', 0.16)
  }

  /** 流れ星：画面の奥を斜めに横切る光の筋 */
  createStreaks(count) {
    this.streaks = []
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
      const material = new THREE.LineBasicMaterial({ color: new THREE.Color(i % 2 ? '#8fb3ff' : '#f0d9a3'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
      const line = new THREE.Line(geometry, material)
      line.frustumCulled = false
      this.scene.add(line)
      this.streaks.push({ line, life: Math.random(), pos: new THREE.Vector3(), dir: new THREE.Vector3(), speed: 1, len: 1 })
      this.resetStreak(this.streaks[i], true)
    }
  }

  resetStreak(s, initial = false) {
    s.pos.set((Math.random() - 0.5) * 22, 4 + Math.random() * 6, -6 - Math.random() * 8)
    s.dir.set(-0.7 - Math.random() * 0.4, -0.5 - Math.random() * 0.3, 0).normalize()
    s.speed = 7 + Math.random() * 6
    s.len = 1.4 + Math.random() * 1.8
    s.life = initial ? Math.random() * 1.5 : -Math.random() * 6 // 負の値のあいだは待機
  }

  updateStreaks(dt) {
    if (!this.streaks) return
    const motion = this.options.reducedMotion ? 0 : 1
    for (const s of this.streaks) {
      s.life += dt * 0.7 * motion
      if (s.life < 0) { s.line.material.opacity = 0; continue }
      if (s.life > 1) { this.resetStreak(s); continue }
      s.pos.addScaledVector(s.dir, s.speed * dt * motion)
      const a = s.line.geometry.attributes.position.array
      a[0] = s.pos.x; a[1] = s.pos.y; a[2] = s.pos.z
      a[3] = s.pos.x - s.dir.x * s.len; a[4] = s.pos.y - s.dir.y * s.len; a[5] = s.pos.z - s.dir.z * s.len
      s.line.geometry.attributes.position.needsUpdate = true
      s.line.material.opacity = Math.sin(s.life * Math.PI) * 0.7 * this.intro
    }
  }

  /** 0〜(SHAPE_COUNT-1) の連続値。スクロール位置から算出して渡す */
  setMorph(value) {
    this.targetMorph = THREE.MathUtils.clamp(value, 0, SHAPE_COUNT - 1)
    if (this.options.reducedMotion) {
      this.morph = Math.round(this.targetMorph)
      this.renderOnce()
    }
  }

  /** 起動演出（散らばった粒子が集まる）を開始する */
  playIntro() {
    this.introPlaying = true
  }

  setScrollY(y) {
    this.scrollY = y
  }

  /** 画面座標を -1〜1 に正規化した値 */
  setPointer(x, y) {
    this.pointerTarget.set(x, y)
    this.pointerActiveTarget = 1
  }

  clearPointer() {
    this.pointerActiveTarget = 0
  }

  resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.width = w
    this.height = h
    this.isMobileLayout = w < 900
    const dpr = Math.min(window.devicePixelRatio || 1, this.options.lowPower ? 3 : 2)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.fov = w / h < 0.8 ? 58 : 40
    this.camera.updateProjectionMatrix()
    this.points.material.uniforms.uPixelRatio.value = dpr
    this.dust.material.uniforms.uPixelRatio.value = dpr
    if (this.composer) {
      this.composer.setPixelRatio(dpr)
      this.composer.setSize(w, h)
    }
    if (this.final) this.final.uniforms.uAspect.value = w / h
    if (!this.running) this.renderOnce()
  }

  start() {
    if (this.running || this.disposed) return
    if (this.options.reducedMotion) {
      this.renderOnce()
      return
    }
    this.running = true
    this.lastFrame = performance.now()
    const loop = (now) => {
      if (!this.running) return
      this.raf = requestAnimationFrame(loop)
      this.tick(now)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  tick(now) {
    const dt = Math.min(Math.max((now - this.lastFrame) / 1000, 0), 1 / 20)
    this.lastFrame = now
    this.time += dt
    this.update(dt)
    this.draw()
  }

  update(dt) {
    const u = this.points.material.uniforms

    this.morph = this.options.reducedMotion ? this.morph : damp(this.morph, this.targetMorph, 3.2, dt)
    u.uMorph.value = this.morph
    u.uTime.value = this.time

    if (this.introPlaying && this.intro < 1) this.intro = Math.min(this.intro + dt / 2.6, 1)
    u.uIntro.value = this.intro

    if (dt > 0) {
      const raw = (this.scrollY - this.lastScrollY) / dt / Math.max(this.height, 1)
      this.lastScrollY = this.scrollY
      this.velocity = damp(this.velocity, THREE.MathUtils.clamp(raw * 0.45, -1.2, 1.2), 6, dt)
    }
    const speed = Math.abs(this.velocity)
    u.uVelocity.value = this.options.reducedMotion ? 0 : speed
    if (this.final) {
      this.final.uniforms.uTime.value = this.time
      this.final.uniforms.uVelocity.value = this.velocity
    }
    this.dust.material.uniforms.uTime.value = this.time

    const layouts = this.isMobileLayout ? MOBILE_LAYOUT : DESKTOP_LAYOUT
    const i = Math.floor(this.morph)
    const j = Math.min(i + 1, SHAPE_COUNT - 1)
    const f = this.morph - i
    const e = f * f * (3 - 2 * f)
    const a = layouts[i]
    const b = layouts[j]
    this.group.position.x = lerp(a.x, b.x, e)
    this.group.position.y = lerp(a.y, b.y, e)
    this.group.scale.setScalar(lerp(a.scale, b.scale, e))

    this.pointer.x = damp(this.pointer.x, this.pointerTarget.x, 4, dt)
    this.pointer.y = damp(this.pointer.y, this.pointerTarget.y, 4, dt)
    this.pointerActive = damp(this.pointerActive, this.pointerActiveTarget, 3, dt)

    const motion = this.options.reducedMotion ? 0 : 1
    const introSpin = (1 - this.intro) ** 3 * 2.4
    this.group.rotation.y = this.time * 0.06 * motion + this.pointer.x * 0.18 + this.morph * 0.6 + introSpin
    this.group.rotation.x = lerp(a.tiltX, b.tiltX, e) - this.pointer.y * 0.12
    this.camera.position.x = this.pointer.x * 0.35
    this.camera.position.y = this.pointer.y * 0.25
    this.camera.position.z = 11 + (1 - this.intro) ** 2 * 6
    this.camera.lookAt(0, 0, 0)

    const ndc = new THREE.Vector3(this.pointer.x, this.pointer.y, 0.5).unproject(this.camera)
    const dir = ndc.sub(this.camera.position).normalize()
    const dist = -this.camera.position.z / dir.z
    const world = this.camera.position.clone().add(dir.multiplyScalar(dist))
    u.uMouse.value.copy(world)
    u.uMouseStrength.value = this.pointerActive * (this.isMobileLayout ? 0 : 1)
    u.uBrightness.value = this.isMobileLayout ? 0.65 : 1
    u.uSize.value = this.isMobileLayout ? 2.7 : 5.2
    u.uCore.value = this.isMobileLayout ? 0.44 : 0.22
    u.uHalo.value = this.isMobileLayout ? 0 : 0.28

    const ringVisibility = Math.max(1 - Math.min(Math.abs(this.morph - 0), 1), 1 - Math.min(Math.abs(this.morph - 4), 1))
    for (const ring of this.rings) {
      ring.material.uniforms.uTime.value = this.time
      ring.material.uniforms.uOpacity.value = ringVisibility * this.intro
      ring.visible = ringVisibility > 0.01
    }

    // 骨組みの線画：対応するシーンでだけ浮かび上がり、粒子とは別の速さで回る
    const coreVis = 1 - Math.min(Math.abs(this.morph - 0), 1)
    const netVis = 1 - Math.min(Math.abs(this.morph - 4), 1)
    const introEase = this.intro * this.intro
    for (const [wire, vis, spinY, spinX] of [
      [this.wireCore, coreVis, -0.09, 0.03],
      [this.wireCoreInner, coreVis, 0.16, -0.07],
      [this.wireNetwork, netVis, 0.05, 0.02],
    ]) {
      wire.material.opacity = wire.userData.baseOpacity * vis * introEase * (this.isMobileLayout ? 0.7 : 1)
      wire.visible = vis > 0.01
      wire.rotation.y = this.time * spinY * motion
      wire.rotation.x = this.time * spinX * motion
      // 起動時は少し大きい状態から収まる
      const sc = 1 + (1 - this.intro) * 0.6
      wire.scale.setScalar(sc)
    }

    this.updateStreaks(dt)
  }

  draw() {
    if (this.composer) this.composer.render()
    else this.renderer.render(this.scene, this.camera)
  }

  renderOnce() {
    if (this.disposed) return
    this.update(0)
    this.draw()
  }

  dispose() {
    this.disposed = true
    this.stop()
    this.points.geometry.dispose()
    this.points.material.dispose()
    this.dust.geometry.dispose()
    this.dust.material.dispose()
    for (const r of this.rings) {
      r.geometry.dispose()
      r.material.dispose()
    }
    for (const w of [this.wireCore, this.wireCoreInner, this.wireNetwork]) {
      w.geometry.dispose()
      w.material.dispose()
    }
    for (const s of this.streaks || []) {
      s.line.geometry.dispose()
      s.line.material.dispose()
    }
    this.composer?.dispose()
    this.renderer.dispose()
  }
}

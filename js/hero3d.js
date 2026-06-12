/* ============================================================
   Jack M. Kite Co. — hero thermal particle field
   Warm convection (ember, rising) ↔ cool stream (ice, sinking),
   shader-animated so the CPU does nothing per-frame, bends
   around the cursor, pauses off-screen, and quietly steps aside
   (leaving the CSS gradient fallback) when WebGL is unavailable
   or the visitor prefers reduced motion.
   ============================================================ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const mount = document.getElementById('hero-canvas');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (mount && !reduced) {
  try { init(); } catch (e) { /* fallback gradient stays */ }
}

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 10;

  // world-space half-extents of the visible plane at z=0
  const area = new THREE.Vector2(1, 1);
  function sizeToViewport() {
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    area.y = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    area.x = area.y * camera.aspect;
  }
  sizeToViewport();

  const COUNT = Math.min(9000, Math.floor((window.innerWidth * window.innerHeight) / 180));
  const seeds = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i++) seeds[i] = Math.random();

  const geo = new THREE.BufferGeometry();
  // three needs a position attribute to compute draw range; real position comes from aSeed
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);

  const uniforms = {
    uTime: { value: 0 },
    uArea: { value: area },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uEmber: { value: new THREE.Color('#ff6a3a') },
    uIce: { value: new THREE.Color('#5bc4ff') },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aSeed;
      uniform float uTime;
      uniform vec2 uArea;
      uniform vec2 uMouse;
      uniform float uPixelRatio;
      varying float vHeat;
      varying float vAlpha;

      void main() {
        // base column position; nx in [-1,1], hot on the left
        float nx = aSeed.x * 2.0 - 1.0;
        float heat = 1.0 - smoothstep(-0.45, 0.45, nx);
        heat = clamp(heat + (aSeed.z - 0.5) * 0.35, 0.0, 1.0);

        // vertical drift: hot rises, cold sinks — wrapped to loop forever
        float speed = mix(-0.022, 0.05, heat) * (0.6 + aSeed.z * 0.8);
        float wrapY = fract(aSeed.y + uTime * speed);
        float ny = wrapY * 2.0 - 1.0;

        // sinuous horizontal wander, stronger for warm convection
        float wander = sin(uTime * 0.45 + aSeed.y * 23.0 + aSeed.x * 11.0)
                     + 0.5 * sin(uTime * 0.9 + aSeed.z * 31.0);
        float px = nx * uArea.x + wander * (0.12 + heat * 0.22);
        float py = ny * uArea.y;

        // bend away from the cursor
        vec2 d = vec2(px, py) - uMouse;
        float dist2 = dot(d, d);
        float push = exp(-dist2 * 0.55);
        vec2 pos2 = vec2(px, py) + normalize(d + 0.0001) * push * 1.1;

        vec4 mv = modelViewMatrix * vec4(pos2, 0.0, 1.0);
        gl_Position = projectionMatrix * mv;

        float size = (1.6 + aSeed.z * 3.6) * uPixelRatio;
        gl_PointSize = size * (10.0 / -mv.z);

        vHeat = heat;
        // fade near the vertical wrap edges + per-particle twinkle
        vAlpha = smoothstep(1.0, 0.82, abs(ny))
               * (0.35 + 0.65 * fract(aSeed.z * 7.0))
               * (0.75 + 0.25 * sin(uTime * 1.4 + aSeed.x * 40.0));
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uEmber;
      uniform vec3 uIce;
      varying float vHeat;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        float disc = smoothstep(0.5, 0.12, d);
        if (disc < 0.01) discard;
        vec3 col = mix(uIce, uEmber, vHeat);
        gl_FragColor = vec4(col, disc * vAlpha * 0.85);
      }
    `,
  });

  scene.add(new THREE.Points(geo, mat));

  // --- mouse: lerped, in world coords on the z=0 plane ---
  const mouseTarget = new THREE.Vector2(99, 99);
  window.addEventListener('pointermove', (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) { mouseTarget.set(99, 99); return; }
    mouseTarget.set(
      ((e.clientX - r.left) / r.width * 2 - 1) * area.x,
      -((e.clientY - r.top) / r.height * 2 - 1) * area.y
    );
  }, { passive: true });
  window.addEventListener('pointerleave', () => mouseTarget.set(99, 99));

  // --- render loop: pause when hero is off-screen or tab hidden ---
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(mount);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.lerp(mouseTarget, 0.06);
    renderer.render(scene, camera);
  });

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(sizeToViewport, 150);
  });
}

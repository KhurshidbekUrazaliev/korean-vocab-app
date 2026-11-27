import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { reducedMotion } from '../lib/motion.js';

const COUNT = 3400;
const FONT = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

const vertex = /* glsl */ `
  attribute float aScale;
  attribute float aAlpha;
  uniform float uSize;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * aScale;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.32, d);
    vec3 color = vAlpha < 0.5 ? uAccent : uColor;
    gl_FragColor = vec4(color, edge * max(vAlpha, 0.55));
  }
`;

/** Rasterises a word and returns up to `count` points (pixel coords, centred) inside its glyphs. */
function sampleWord(word, width, height, count) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const size = Math.min(height * 0.62, (width * 0.86) / Math.max(word.length, 1.6));
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(word, width / 2, height * 0.46);
  const { data } = ctx.getImageData(0, 0, width, height);

  let filled = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) filled++;
  const gap = Math.max(1.5, Math.sqrt(filled / count));
  const points = [];
  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      const jx = x + (Math.random() - 0.5) * gap;
      const jy = y + (Math.random() - 0.5) * gap;
      const idx = (Math.floor(jy) * width + Math.floor(jx)) * 4 + 3;
      if (data[idx] > 128) points.push(jx - width / 2, height / 2 - jy);
    }
  }
  // Shuffle pairs so particles travel to random new places on each morph.
  for (let i = points.length / 2 - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [points[i * 2], points[j * 2]] = [points[j * 2], points[i * 2]];
    [points[i * 2 + 1], points[j * 2 + 1]] = [points[j * 2 + 1], points[i * 2 + 1]];
  }
  return points;
}

const cssColor = (name) => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#141511');

export function HangulField({ words, onWordChange, interval = 3800, className }) {
  const ref = useRef(null);
  const onChange = useRef(onWordChange);
  onChange.current = onWordChange;

  useEffect(() => {
    const host = ref.current;
    const still = reducedMotion();
    let width = host.clientWidth;
    let height = host.clientHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -10, 10);

    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 2);
    const target = new Float32Array(COUNT * 2);
    const scale = new Float32Array(COUNT);
    const alpha = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * width;
      pos[i * 3 + 1] = (Math.random() - 0.5) * height;
      scale[i] = 0.7 + Math.random() * 0.7;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSize: { value: 3.4 * dpr },
        uColor: { value: cssColor('--ink') },
        uAccent: { value: cssColor('--ink-2') },
      },
    });
    scene.add(new THREE.Points(geometry, material));

    let index = 0;
    const setTargets = (scatter) => {
      const pts = sampleWord(words[index], Math.round(width), Math.round(height), COUNT);
      const inText = pts.length / 2;
      for (let i = 0; i < COUNT; i++) {
        if (i < inText) {
          target[i * 2] = pts[i * 2];
          target[i * 2 + 1] = pts[i * 2 + 1];
          alpha[i] = 1;
        } else {
          // Leftover particles drift as a faint ring of dust around the word.
          const a = Math.random() * Math.PI * 2;
          const r = Math.min(width, height) * (0.38 + Math.random() * 0.25);
          target[i * 2] = Math.cos(a) * r * 1.3;
          target[i * 2 + 1] = Math.sin(a) * r * 0.8;
          alpha[i] = 0.2;
        }
        if (scatter) {
          vel[i * 2] += (Math.random() - 0.5) * 26;
          vel[i * 2 + 1] += (Math.random() - 0.5) * 26;
        }
      }
      geometry.attributes.aAlpha.needsUpdate = true;
      onChange.current?.(index);
    };

    const mouse = { x: 9999, y: 9999 };
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left - width / 2;
      mouse.y = height / 2 - (e.clientY - r.top);
    };
    const onLeave = () => {
      mouse.x = mouse.y = 9999;
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);

    let t = 0;
    const step = () => {
      t += 0.016;
      const radius = 80;
      for (let i = 0; i < COUNT; i++) {
        const px = pos[i * 3];
        const py = pos[i * 3 + 1];
        let vx = vel[i * 2] + (target[i * 2] - px) * 0.014;
        let vy = vel[i * 2 + 1] + (target[i * 2 + 1] - py) * 0.014;
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < radius * radius) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / radius) * 2.6;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
        }
        // A slow breathing wobble keeps the word alive when idle.
        vx += Math.sin(t * 1.3 + i) * 0.03;
        vy += Math.cos(t * 1.1 + i * 0.7) * 0.03;
        vx *= 0.86;
        vy *= 0.86;
        vel[i * 2] = vx;
        vel[i * 2 + 1] = vy;
        pos[i * 3] = px + vx;
        pos[i * 3 + 1] = py + vy;
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    let raf = 0;
    let visible = true;
    let timer = 0;
    const loop = () => {
      step();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (still || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(loop);
      timer = window.setInterval(() => {
        index = (index + 1) % words.length;
        setTargets(true);
      }, interval);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
      raf = 0;
    };

    const snap = () => {
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3] = target[i * 2];
        pos[i * 3 + 1] = target[i * 2 + 1];
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    let cancelled = false;
    (document.fonts?.load(`700 100px ${FONT}`, words.join('')) ?? Promise.resolve()).catch(() => {}).then(() => {
      if (cancelled) return;
      setTargets(false);
      if (still) snap();
      else start();
    });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(host);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h || (w === width && h === height)) return;
      width = w;
      height = h;
      renderer.setSize(w, h);
      Object.assign(camera, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
      camera.updateProjectionMatrix();
      setTargets(false);
      if (still) snap();
    });
    ro.observe(host);

    const mo = new MutationObserver(() => {
      material.uniforms.uColor.value = cssColor('--ink');
      material.uniforms.uAccent.value = cssColor('--ink-2');
      if (still) renderer.render(scene, camera);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      cancelled = true;
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [words, interval]);

  return <div ref={ref} className={className} />;
}

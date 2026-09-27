import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { findProject } from '../data/projects';
import { prefersReducedMotion } from '../lib/motion';
import { asset } from '../lib/base';
import styles from './Backdrop.module.css';

const SRC_LARGE = asset('media/fondo/obsidiana.webp');
const SRC_SMALL = asset('media/fondo/obsidiana-sm.webp');

const VERT = `attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; v.y = 1.0 - v.y; gl_Position = vec4(p, 0.0, 1.0); }`;

// Imagen generada (cintas de obsidiana) convertida en algo vivo:
//  - flujo líquido lento que deforma las cintas
//  - "respiración" de escala
//  - relieve falso: las zonas brillantes se desplazan más con el ratón que las oscuras
//  - en las páginas de proyecto, el brillo toma el color del proyecto
const FRAG = `
precision mediump float;
varying vec2 v;
uniform sampler2D tex;
uniform vec2 res, texRes, mouse;
uniform float time, scroll, tintAmt;
uniform vec3 tint;

vec2 cover(vec2 uv) {
  float rs = res.x / res.y, ri = texRes.x / texRes.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  float t = time;
  float zoom = 1.1 + 0.025 * sin(t * 0.09);
  vec2 uv = (v - 0.5) / zoom + 0.5;
  uv += mouse * 0.012 + vec2(0.0, scroll * 0.04);
  uv += 0.006 * vec2(sin(uv.y * 5.0 + t * 0.32), cos(uv.x * 4.0 - t * 0.27));
  uv = cover(uv);

  float depth = dot(texture2D(tex, uv).rgb, vec3(0.3, 0.5, 0.2));
  uv += mouse * depth * 0.035;
  vec3 c = texture2D(tex, uv).rgb;

  float lum = dot(c, vec3(0.3, 0.5, 0.2));
  c = mix(c, tint * lum * 1.8, tintAmt);

  float vig = smoothstep(1.15, 0.25, length((v - 0.5) * vec2(1.2, 1.0)));
  gl_FragColor = vec4(c * vig, 1.0);
}`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];

/** Fondo animado muy tenue detrás de todo el contenido. */
export function Backdrop() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tintRef = useRef<{ color: [number, number, number]; amt: number }>({ color: [1, 0.35, 0.14], amt: 0 });
  const { pathname } = useLocation();

  // Color del proyecto abierto (en la portada se queda el naranja original)
  const slug = pathname.match(/^\/proyectos\/([^/]+)/)?.[1];
  const project = slug ? findProject(slug) : undefined;
  useEffect(() => {
    tintRef.current = project ? { color: hex(project.accent), amt: 0.85 } : { color: [1, 0.35, 0.14], amt: 0 };
  }, [project]);

  useEffect(() => {
    const el = canvas.current;
    if (!el || prefersReducedMotion()) return;
    const gl = el.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = { res: u('res'), texRes: u('texRes'), mouse: u('mouse'), time: u('time'), scroll: u('scroll'), tint: u('tint'), tintAmt: u('tintAmt') };

    let frame = 0;
    let alive = true;
    let ready = false;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const tint = { r: 1, g: 0.35, b: 0.14, amt: 0 };

    const resize = () => {
      // Se pinta a poca resolución: es un fondo tenue y así apenas gasta
      const scale = Math.min(window.devicePixelRatio, 1.5) * 0.6;
      el.width = Math.round(window.innerWidth * scale);
      el.height = Math.round(window.innerHeight * scale);
      gl.viewport(0, 0, el.width, el.height);
    };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const img = new Image();
    img.src = window.innerWidth > 900 ? SRC_LARGE : SRC_SMALL;
    img.onload = () => {
      if (!alive) return;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform2f(U.texRes, img.width, img.height);
      ready = true;
      el.classList.add(styles.on);
    };

    const start = performance.now();
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!ready || document.hidden) return;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const target = tintRef.current;
      tint.r += (target.color[0] - tint.r) * 0.05;
      tint.g += (target.color[1] - tint.g) * 0.05;
      tint.b += (target.color[2] - tint.b) * 0.05;
      tint.amt += (target.amt - tint.amt) * 0.05;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      gl.uniform2f(U.res, el.width, el.height);
      gl.uniform2f(U.mouse, mouse.x, mouse.y);
      gl.uniform1f(U.time, (performance.now() - start) / 1000);
      gl.uniform1f(U.scroll, window.scrollY / maxScroll);
      gl.uniform3f(U.tint, tint.r, tint.g, tint.b);
      gl.uniform1f(U.tintAmt, tint.amt);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <canvas ref={canvas} className={styles.canvas} />
    </div>
  );
}

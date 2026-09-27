/**
 * Después de `vite build`:
 *  - Una página HTML por proyecto en /proyectos/<slug>/ con su título, su
 *    descripción y su imagen para que LinkedIn y WhatsApp muestren una buena
 *    vista previa del enlace (y GitHub Pages responda 200, no 404).
 *  - 404.html para que cualquier otra ruta la resuelva la propia aplicación.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { projects } from '../src/data/projects.ts';

const SITE = 'https://abelg02.github.io/portfolio';
const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const base = readFileSync(join(dist, 'index.html'), 'utf8');

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const setMeta = (html, { title, description, url, image }) =>
  html
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escape(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${image}`);

for (const p of projects) {
  const dir = join(dist, 'proyectos', p.slug);
  mkdirSync(dir, { recursive: true });
  const og = existsSync(join(dist, 'og', `${p.slug}.jpg`)) ? `${SITE}/og/${p.slug}.jpg` : `${SITE}/og.jpg`;
  const html = setMeta(base, {
    title: `${p.title} · Abel González`,
    description: p.tagline,
    url: `${SITE}/proyectos/${p.slug}`,
    image: og,
  });
  writeFileSync(join(dir, 'index.html'), html);
}

writeFileSync(join(dist, '404.html'), base);
console.log(`postbuild: ${projects.length} páginas de proyecto y 404.html`);

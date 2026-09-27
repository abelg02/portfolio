import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_LABEL, type Category, type Project } from '../data/projects';
import { finePointer, prefersReducedMotion } from '../lib/motion';
import { ArrowUpRight } from './Icons';
import styles from './WorkIndex.module.css';

const preview = (p: Project) => (p.cover.type === 'video' ? p.cover.poster : p.cover.src) ?? '';

/** Índice de todos los proyectos, filtrable por tipo, con vista previa que sigue al ratón. */
export function WorkIndex({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [active, setActive] = useState<Project | null>(null);
  const floating = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => (Object.keys(CATEGORY_LABEL) as Category[]).filter((c) => projects.some((p) => p.categories.includes(c))), [projects]);
  const shown = filter === 'all' ? projects : projects.filter((p) => p.categories.includes(filter));

  // La vista previa persigue al cursor con un poco de inercia
  useEffect(() => {
    const el = floating.current;
    if (!el || !finePointer()) return;
    const smooth = !prefersReducedMotion();
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * (smooth ? 0.14 : 1);
      y += (ty - y) * (smooth ? 0.14 : 1);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove);
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.index}>
      <div className={styles.filters} role="group" aria-label="Filtrar proyectos">
        {(['all', ...categories] as const).map((c) => (
          <button key={c} type="button" className={`${styles.filter} ${filter === c ? styles.on : ''}`} aria-pressed={filter === c} onClick={() => setFilter(c)}>
            {c === 'all' ? 'Todos' : CATEGORY_LABEL[c]}
            <sup className="mono">{c === 'all' ? projects.length : projects.filter((p) => p.categories.includes(c)).length}</sup>
          </button>
        ))}
      </div>

      <ul className={styles.list} onPointerLeave={() => setActive(null)}>
        {shown.map((p) => (
          <li key={p.slug}>
            <Link
              to={`/proyectos/${p.slug}`}
              className={styles.row}
              style={{ '--accent': p.accent } as React.CSSProperties}
              onPointerEnter={() => setActive(p)}
            >
              <span className={`mono ${styles.num}`}>{String(projects.indexOf(p) + 1).padStart(2, '0')}</span>
              <span className={styles.name}>{p.title}</span>
              <span className={styles.kind}>{p.categories.map((c) => CATEGORY_LABEL[c]).join(' · ')}</span>
              <span className={`mono ${styles.year}`}>{p.year}</span>
              <ArrowUpRight size={22} className={styles.arrow} />
            </Link>
          </li>
        ))}
      </ul>

      <div ref={floating} className={`${styles.preview} ${active ? styles.visible : ''}`} aria-hidden="true">
        {projects.map((p) => (
          <img key={p.slug} src={preview(p)} alt="" loading="lazy" className={active?.slug === p.slug ? styles.current : undefined} />
        ))}
      </div>
    </div>
  );
}

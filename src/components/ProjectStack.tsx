import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { CATEGORY_LABEL, type Project } from '../data/projects';
import { ChannelIcons } from './Channels';
import { ArrowUpRight } from './Icons';
import { MediaView } from './MediaView';
import styles from './ProjectStack.module.css';

/**
 * Efecto estrella del portfolio: las tarjetas de los proyectos se apilan al
 * hacer scroll y la anterior se aleja un poco. Solo en escritorio y si el
 * usuario no ha pedido reducir el movimiento; en el resto es una lista normal.
 */
export function ProjectStack({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      const items = gsap.utils.toArray<HTMLElement>(`.${styles.item}`, el);
      items.slice(0, -1).forEach((item, i) => {
        const card = item.querySelector(`.${styles.card}`);
        const shade = item.querySelector(`.${styles.shade}`);
        const next = items[i + 1];
        const tl = gsap.timeline({
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 12%', scrub: true },
        });
        tl.to(card, { scale: 0.92, ease: 'none' }, 0).to(shade, { opacity: 0.65, ease: 'none' }, 0);
      });
    });
    return () => mm.revert();
  }, [projects]);

  return (
    <ol ref={root} className={styles.stack}>
      {projects.map((p, i) => (
        <li key={p.slug} className={styles.item} style={{ '--accent': p.accent, zIndex: i + 1 } as React.CSSProperties}>
          <Link to={`/proyectos/${p.slug}`} className={styles.card}>
            <div className={styles.info}>
              <div className={styles.top}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.status}>
                  <i aria-hidden="true" />
                  {p.status}
                </span>
              </div>
              <div>
                <h3 className={styles.title}>{p.title}</h3>
                <p className={styles.tagline}>{p.tagline}</p>
              </div>
              <div className={styles.bottom}>
                <ul className={styles.cats}>
                  {p.categories.map((c) => (
                    <li key={c} className="chip">
                      {CATEGORY_LABEL[c]}
                    </li>
                  ))}
                </ul>
                <div className={styles.row}>
                  <ChannelIcons channels={p.channels} />
                  <span className={styles.go}>
                    Ver proyecto <ArrowUpRight size={18} />
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.media}>
              <MediaView media={p.cover} className={styles.frame} label={`${p.slug}`} />
            </div>
            <span className={styles.shade} aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ol>
  );
}

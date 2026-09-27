import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import styles from './Marquee.module.css';

/** Cinta de texto infinita que cambia de sentido y acelera con el scroll. */
export function Marquee({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let dir = -1;
    let boost = 0;
    let lastY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (delta !== 0) dir = delta > 0 ? -1 : 1;
      boost = Math.min(8, Math.abs(delta) * 0.35);
      lastY = y;
    };
    const loop = () => {
      const half = el.scrollWidth / 2;
      x += dir * (0.6 + boost);
      boost *= 0.92;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px, 0, 0)`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const row = items.map((item, i) => (
    <span key={i} className={styles.item}>
      {item}
      <i aria-hidden="true">✦</i>
    </span>
  ));

  return (
    <div className={styles.marquee} aria-label={items.join(', ')}>
      <div ref={track} className={styles.track} aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  );
}

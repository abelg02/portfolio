import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../lib/motion';
import styles from './Loader.module.css';

const KEY = 'ag-loader';

/** Pantalla de carga con el monograma: solo la primera visita de la sesión y en menos de 1,5 s. */
export function Loader() {
  const [state, setState] = useState<'on' | 'leaving' | 'off'>(() => {
    try {
      return sessionStorage.getItem(KEY) || prefersReducedMotion() ? 'off' : 'on';
    } catch {
      return 'off';
    }
  });

  const shown = state !== 'off';

  // Una sola vez al montar: si depende de `state`, el paso a "leaving" cancelaría el temporizador final
  useEffect(() => {
    if (!shown) return;
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    // Las animaciones de entrada esperan a que se retire el telón
    html.classList.add('is-loading');
    const leave = setTimeout(() => {
      html.classList.remove('is-loading');
      html.style.overflow = '';
      setState('leaving');
    }, 1050);
    const done = setTimeout(() => {
      setState('off');
      try {
        sessionStorage.setItem(KEY, '1');
      } catch {
        /* sin almacenamiento: se verá en cada visita */
      }
    }, 1700);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
      html.classList.remove('is-loading');
      html.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'off') return null;
  return (
    <div className={`${styles.loader} ${state === 'leaving' ? styles.leaving : ''}`} aria-hidden="true">
      <div className={styles.mark}>
        <span className={styles.letter}>A</span>
        <span className={styles.letter}>G</span>
      </div>
      <div className={styles.bar}>
        <i />
      </div>
      <p className={styles.caption}>Abel González · Portfolio</p>
    </div>
  );
}

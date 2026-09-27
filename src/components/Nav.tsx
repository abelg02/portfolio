import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { site } from '../data/site';
import { scrollToTarget } from '../lib/motion';
import { ArrowUpRight } from './Icons';
import styles from './Nav.module.css';

const LINKS = [
  { id: 'trabajo', label: 'Trabajo' },
  { id: 'indice', label: 'Índice' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'contacto', label: 'Contacto' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const button = useRef<HTMLButtonElement>(null);
  const lastY = useRef(0);

  // La barra se esconde al bajar y reaparece al subir
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 160 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    if (pathname === '/') scrollToTarget(`#${id}`);
    else navigate(`/#${id}`);
  };

  return (
    <>
      <header className={`${styles.nav} ${hidden && !open ? styles.hidden : ''}`}>
        <Link to="/" className={styles.brand} aria-label={`${site.name}, inicio`}>
          <span className={styles.monogram}>
            A<em>G</em>
          </span>
          <span className={styles.name}>{site.name}</span>
        </Link>
        <nav className={styles.links} aria-label="Principal">
          {LINKS.map((l) => (
            <button key={l.id} type="button" onClick={() => go(l.id)}>
              {l.label}
            </button>
          ))}
        </nav>
        <a className={styles.github} href={site.links.github} target="_blank" rel="noreferrer">
          GitHub <ArrowUpRight size={15} />
        </a>
        <button
          ref={button}
          type="button"
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          <i />
          <i />
        </button>
      </header>

      <div id="menu" className={`${styles.menu} ${open ? styles.menuOpen : ''}`} aria-hidden={!open}>
        <nav aria-label="Menú">
          {LINKS.map((l, i) => (
            <button key={l.id} type="button" tabIndex={open ? 0 : -1} onClick={() => go(l.id)} style={{ '--i': i } as React.CSSProperties}>
              <span className="mono">0{i + 1}</span>
              {l.label}
            </button>
          ))}
        </nav>
        <a className={styles.menuFoot} href={site.links.github} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>
          github.com/abelg02 <ArrowUpRight size={16} />
        </a>
      </div>
    </>
  );
}

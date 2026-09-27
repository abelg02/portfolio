import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from '../components/Icons';
import { projects } from '../data/projects';
import { site } from '../data/site';
import styles from './NotFound.module.css';

export function NotFound() {
  useEffect(() => {
    document.title = `Página no encontrada · ${site.name}`;
  }, []);

  return (
    <main id="main" className={`wrap ${styles.page}`}>
      <p className="eyebrow">Error 404</p>
      <h1 className={styles.title}>
        Esta página <em>no existe</em>. Todavía.
      </h1>
      <p className={styles.text}>Puede que el enlace esté mal escrito o que el proyecto haya cambiado de sitio. Estos sí existen:</p>
      <ul className={styles.list}>
        {projects.map((p) => (
          <li key={p.slug}>
            <Link to={`/proyectos/${p.slug}`} style={{ '--accent': p.accent } as React.CSSProperties}>
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={18} /> Volver al inicio
      </Link>
    </main>
  );
}

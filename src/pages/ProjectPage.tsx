import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChannelButtons } from '../components/Channels';
import { Footer } from '../components/Footer';
import { ArrowLeft, ArrowRight } from '../components/Icons';
import { MediaView } from '../components/MediaView';
import { CATEGORY_LABEL, findProject, projects } from '../data/projects';
import { site } from '../data/site';
import { NotFound } from './NotFound';
import styles from './ProjectPage.module.css';

export function ProjectPage() {
  const { slug = '' } = useParams();
  const project = findProject(slug);

  useEffect(() => {
    if (project) document.title = `${project.title} · ${site.name}`;
  }, [project]);

  if (!project) return <NotFound />;

  const p = project;
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  const meta = [
    { label: 'Año', value: p.year },
    { label: 'Estado', value: p.status },
    { label: 'Rol', value: p.role },
    ...(p.context ? [{ label: 'Contexto', value: p.context }] : []),
  ];

  return (
    <div className={styles.page} style={{ '--accent': p.accent } as React.CSSProperties}>
      <main id="main">
        <header className={`wrap ${styles.header}`}>
          <Link to="/#trabajo" className={styles.back}>
            <ArrowLeft size={18} /> Todos los proyectos
          </Link>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>{p.title}</h1>
            <ul className={styles.cats}>
              {p.categories.map((c) => (
                <li key={c} className="chip">
                  {CATEGORY_LABEL[c]}
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.tagline}>{p.tagline}</p>

          <dl className={styles.meta}>
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="mono">{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section className={`wrap ${styles.channels}`} aria-labelledby="canales-t">
          <h2 id="canales-t" className="eyebrow">
            Dónde verlo
          </h2>
          <ChannelButtons channels={p.channels} />
        </section>

        <section className={`wrap ${styles.showcase} ${p.mobile ? styles.withMobile : ''}`} aria-label="Vista previa">
          <MediaView media={p.cover} eager className={styles.desktop} label={p.channels.find((c) => c.status === 'live' && c.href?.startsWith('http'))?.href?.replace(/^https?:\/\//, '') ?? p.slug} />
          {p.mobile && <MediaView media={p.mobile} className={styles.mobile} />}
        </section>

        <section className={`wrap ${styles.story}`} aria-labelledby="sobre-t">
          <h2 id="sobre-t" className="eyebrow">
            El proyecto
          </h2>
          <div className={styles.summary}>
            {p.summary.map((s, i) => (
              <p key={i} className="reveal" style={{ '--d': i } as React.CSSProperties}>
                {s}
              </p>
            ))}
          </div>
        </section>

        <section className={`wrap ${styles.story}`} aria-labelledby="claves-t">
          <h2 id="claves-t" className="eyebrow">
            Lo que tiene dentro
          </h2>
          <div>
            <ol className={styles.highlights}>
              {p.highlights.map((h, i) => (
                <li key={i} className="reveal" style={{ '--d': i } as React.CSSProperties}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  <p>{h}</p>
                </li>
              ))}
            </ol>
            <ul className={styles.stack} aria-label="Tecnologías">
              {p.stack.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {p.gallery.length > 0 && (
          <section className={`wrap ${styles.gallerySection}`} aria-labelledby="galeria-t">
            <h2 id="galeria-t" className="eyebrow">
              Capturas
            </h2>
            <ul className={styles.gallery} data-count={p.gallery.length}>
              {p.gallery.map((g) => (
                <li key={g.src} className="reveal">
                  <MediaView media={{ ...g, frame: 'none' }} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {p.strip && (
          <section className={styles.strip} aria-labelledby="tira-t">
            <div className="wrap">
              <h2 id="tira-t" className="eyebrow">
                {p.strip.title}
              </h2>
              <p className={styles.stripCaption}>{p.strip.caption}</p>
            </div>
            <ul className={styles.stripList} tabIndex={0} aria-label={`${p.strip.title}, desplázate en horizontal`}>
              {p.strip.images.map((img) => (
                <li key={img.src}>
                  <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className={`wrap ${styles.next}`} aria-label="Siguiente proyecto">
          <Link to={`/proyectos/${next.slug}`} className={styles.nextLink} style={{ '--next': next.accent } as React.CSSProperties}>
            <span className="eyebrow">Siguiente proyecto</span>
            <span className={styles.nextTitle}>
              {next.title} <ArrowRight size={48} />
            </span>
            <span className={styles.nextTag}>{next.tagline}</span>
          </Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}

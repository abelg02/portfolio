import { useEffect } from 'react';
import { About } from '../components/About';
import { Footer } from '../components/Footer';
import { ArrowDown, GitHub } from '../components/Icons';
import { Marquee } from '../components/Marquee';
import { ProjectStack } from '../components/ProjectStack';
import { WorkIndex } from '../components/WorkIndex';
import { liveCount, projects, technologies } from '../data/projects';
import { site } from '../data/site';
import { asset } from '../lib/base';
import { scrollToTarget } from '../lib/motion';
import styles from './Home.module.css';

export function Home() {
  useEffect(() => {
    document.title = `${site.name} · ${site.role}`;
  }, []);

  return (
    <>
      <main id="main">
        <section className={styles.hero}>
          <div className="wrap">
            <p className={`eyebrow ${styles.kicker}`}>
              <span className={styles.dot} aria-hidden="true" />
              {site.fullName} · {site.role}
            </p>

            <h1 className={styles.title}>
              <span className={styles.line}>
                <span>Diseño y programo</span>
                <span className={styles.pill} aria-hidden="true">
                  <video src={asset('media/calipro/recorrido.mp4')} poster={asset('media/calipro/recorrido-poster.jpg')} muted loop autoPlay playsInline disablePictureInPicture disableRemotePlayback preload="metadata" />
                </span>
              </span>
              <span className={styles.line}>
                <em>webs, apps</em>
                <span className={`${styles.pill} ${styles.pillWide}`} aria-hidden="true">
                  <img src={asset('media/climax/portada.webp')} alt="" />
                </span>
              </span>
              <span className={styles.line}>y software de empresa.</span>
            </h1>

            <div className={styles.foot}>
              <p className={styles.intro}>{site.intro}</p>
              <div className={styles.actions}>
                <a href="#trabajo" className="btn btn-primary" onClick={(e) => (e.preventDefault(), scrollToTarget('#trabajo'))}>
                  Ver proyectos <ArrowDown size={18} />
                </a>
                <a href={site.links.github} className="btn" target="_blank" rel="noreferrer">
                  <GitHub size={18} /> GitHub
                </a>
              </div>
            </div>

            <dl className={styles.meta}>
              <div>
                <dt className="mono">Proyectos</dt>
                <dd>{projects.length}</dd>
              </div>
              <div>
                <dt className="mono">Demos en vivo</dt>
                <dd>{liveCount}</dd>
              </div>
              <div>
                <dt className="mono">Del front a SAP</dt>
                <dd>React · Spring · FastAPI · ABAP</dd>
              </div>
            </dl>
          </div>
        </section>

        <Marquee items={technologies.slice(0, 14)} />

        <section id="trabajo" className={styles.section} aria-labelledby="trabajo-t">
          <div className="wrap">
            <header className={styles.head}>
              <h2 id="trabajo-t" className={`${styles.h2} reveal`}>
                Trabajo <em>seleccionado</em>
              </h2>
              <p className={`${styles.lede} reveal`} style={{ '--d': 1 } as React.CSSProperties}>
                Cada proyecto tiene su página con todo lo que se puede ver de él: la web, la demo, el código, la app o sus redes.
              </p>
            </header>
            <ProjectStack projects={projects} />
          </div>
        </section>

        <section id="indice" className={styles.section} aria-labelledby="indice-t">
          <div className="wrap">
            <header className={styles.head}>
              <h2 id="indice-t" className={`${styles.h2} reveal`}>
                Índice
              </h2>
              <p className={`${styles.lede} reveal`} style={{ '--d': 1 } as React.CSSProperties}>
                Todo de un vistazo. Filtra por tipo de proyecto.
              </p>
            </header>
            <WorkIndex projects={projects} />
          </div>
        </section>

        <section id="sobre-mi" className={styles.section} aria-labelledby="sobre-t">
          <div className="wrap">
            <h2 id="sobre-t" className="visually-hidden">
              Sobre mí
            </h2>
            <About />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

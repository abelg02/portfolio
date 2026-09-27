import { liveCount, projects, technologies } from '../data/projects';
import { site } from '../data/site';
import { CountUp } from './CountUp';
import styles from './About.module.css';

const STATS = [
  { value: projects.length, label: 'proyectos publicados aquí' },
  { value: liveCount, label: 'se pueden probar en vivo' },
  { value: technologies.length, label: 'tecnologías en estos proyectos' },
  { value: 46, label: 'laboratorios de ABAP Cloud' },
];

export function About() {
  return (
    <div className={styles.about}>
      <p className={`${styles.statement} reveal`}>
        Del <em>botón</em> que pulsas a la <em>tabla</em> donde se guarda. Y si la empresa trabaja con SAP, también ahí.
      </p>

      <div className={styles.grid}>
        <p className={`${styles.intro} reveal`}>{site.intro}</p>

        <dl className={styles.facts}>
          {[...site.experience.map((e) => ({ ...e, kind: 'Experiencia' })), ...site.education.map((e) => ({ ...e, kind: 'Formación' }))].map((f, i) => (
            <div key={f.title} className="reveal" style={{ '--d': i } as React.CSSProperties}>
              <dt>
                <span className="eyebrow">{f.kind}</span>
                {f.title}
              </dt>
              <dd>{f.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ul className={styles.stats}>
        {STATS.map((s, i) => (
          <li key={s.label} className="reveal" style={{ '--d': i } as React.CSSProperties}>
            <b>
              <CountUp to={s.value} />
            </b>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.tech}>
        <p className="eyebrow">Con qué trabajo</p>
        <ul>
          {technologies.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { site } from '../data/site';
import { scrollToTarget } from '../lib/motion';
import { ArrowUpRight, LinkedIn, Mail } from './Icons';
import styles from './Footer.module.css';

export function Footer() {
  const { linkedin, email } = site.links;
  const contact = [
    email && { href: `mailto:${email}`, label: email, icon: Mail },
    linkedin && { href: linkedin, label: 'LinkedIn', icon: LinkedIn },
  ].filter((c) => !!c);

  return (
    <footer id="contacto" className={styles.footer}>
      <div className="wrap">
        <div className={styles.cta}>
          <p className="eyebrow">Contacto</p>
          <h2 className={`${styles.title} reveal`}>
            ¿Tienes algo en mente? <em>Hablemos.</em>
          </h2>
          <ul className={styles.links}>
            {contact.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" className={styles.link}>
                  <Icon size={22} />
                  <span>{label}</span>
                  <ArrowUpRight size={20} className={styles.arrow} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.bar}>
          <span className="mono">
            © {new Date().getFullYear()} {site.fullName}
          </span>
          <span className="mono">Diseñado y programado a mano · React + GSAP</span>
          <button type="button" className="mono" onClick={() => scrollToTarget(0)}>
            Volver arriba ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

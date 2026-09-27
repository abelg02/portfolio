import { Link } from 'react-router-dom';
import type { Channel } from '../data/projects';
import { ArrowUpRight, CHANNEL_ICON, Clock, Lock } from './Icons';
import styles from './Channels.module.css';

const STATUS_TEXT = { soon: 'Próximamente', private: 'Privado', live: '' };

const host = (href: string) => (href.startsWith('/') ? `abelg02.github.io${href}` : href.replace(/^https?:\/\//, '').replace(/\/$/, ''));

/** Iconos pequeños de los canales disponibles (tarjetas e índice). */
export function ChannelIcons({ channels }: { channels: Channel[] }) {
  return (
    <ul className={styles.icons} aria-label="Dónde verlo">
      {channels.map((c, i) => {
        const Icon = CHANNEL_ICON[c.kind];
        return (
          <li key={i} className={c.status !== 'live' ? styles.dim : undefined} title={`${c.label}${c.status !== 'live' ? ` · ${STATUS_TEXT[c.status]}` : ''}`}>
            <Icon size={16} />
            <span className="visually-hidden">
              {c.label}
              {c.status !== 'live' && ` (${STATUS_TEXT[c.status]})`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Botones grandes de los canales (página de proyecto). */
export function ChannelButtons({ channels }: { channels: Channel[] }) {
  return (
    <ul className={styles.buttons}>
      {channels.map((c, i) => {
        const Icon = CHANNEL_ICON[c.kind];
        const StatusIcon = c.status === 'soon' ? Clock : Lock;
        const inner = (
          <>
            <span className={styles.icon}>
              <Icon size={22} />
            </span>
            <span className={styles.text}>
              <b>{c.label}</b>
              {c.status === 'live' ? (
                <small className="mono">{c.note ?? (c.href ? host(c.href) : '')}</small>
              ) : (
                <small className={styles.pending}>
                  <em className="mono">
                    <StatusIcon size={12} /> {STATUS_TEXT[c.status]}
                  </em>
                  {c.note}
                </small>
              )}
            </span>
            {c.status === 'live' && <ArrowUpRight size={20} className={styles.arrow} />}
          </>
        );
        return (
          <li key={i}>
            {c.status === 'live' && c.href ? (
              c.href.startsWith('/proyectos/') ? (
                <Link to={c.href} className={styles.button}>
                  {inner}
                </Link>
              ) : (
                <a href={c.href} target={c.href.startsWith('/') ? undefined : '_blank'} rel="noreferrer" className={styles.button}>
                  {inner}
                </a>
              )
            ) : (
              <div className={`${styles.button} ${styles.off}`} aria-disabled="true">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

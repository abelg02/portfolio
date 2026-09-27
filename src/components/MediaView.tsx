import { useEffect, useRef } from 'react';
import type { Media } from '../data/projects';
import styles from './MediaView.module.css';

type Props = { media: Media; className?: string; eager?: boolean; label?: string };

/**
 * Imagen o vídeo de un proyecto dentro de su marco (navegador o móvil).
 * Los vídeos solo se reproducen mientras están en pantalla, sin sonido y en bucle.
 */
export function MediaView({ media, className = '', eager = false, label }: Props) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [media.src]);

  const frame = media.frame ?? 'none';
  const content =
    media.type === 'video' ? (
      <video ref={video} src={media.src} poster={media.poster} muted loop playsInline disablePictureInPicture disableRemotePlayback preload={eager ? 'auto' : 'metadata'} aria-label={media.alt} />
    ) : (
      <img src={media.src} alt={media.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    );

  if (frame === 'desktop') {
    return (
      <figure className={`${styles.desktop} ${className}`}>
        <div className={styles.bar} aria-hidden="true">
          <i />
          <i />
          <i />
          {label && <span className="mono">{label}</span>}
        </div>
        <div className={styles.screen}>{content}</div>
      </figure>
    );
  }
  if (frame === 'mobile') {
    return (
      <figure className={`${styles.mobile} ${className}`}>
        <div className={styles.screen}>{content}</div>
      </figure>
    );
  }
  return <figure className={`${styles.plain} ${className}`}>{content}</figure>;
}

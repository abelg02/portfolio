/* eslint-disable react-refresh/only-export-components -- utilidades de movimiento junto a sus componentes */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => window.matchMedia('(pointer: fine)').matches;

export function scrollToTarget(target: string | number) {
  if (lenis) lenis.scrollTo(target, { offset: typeof target === 'string' ? -24 : 0, duration: 1.4 });
  else if (typeof target === 'number') window.scrollTo({ top: target });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}

/** Scroll suave con inercia (Lenis) sincronizado con GSAP ScrollTrigger. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return null;
}

/** Al cambiar de página: arriba del todo y se vuelven a observar los revelados. */
export function RouteEffects() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => scrollToTarget(hash));
    } else {
      lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    }

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            observer.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    const frame = requestAnimationFrame(() => {
      document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => observer.observe(el));
      ScrollTrigger.refresh();
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname, hash]);

  return null;
}

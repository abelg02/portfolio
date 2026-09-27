/** Carpeta en la que se publica la web (p. ej. "/portfolio/"), definida en vite.config.ts. */
export const BASE = import.meta.env.BASE_URL;

/** Ruta a un archivo de public/ que funciona se publique donde se publique. */
export const asset = (path: string) => BASE + path.replace(/^\//, '');

/**
 * Catálogo de proyectos. Para añadir uno nuevo basta con añadir una ficha a
 * `projects`: la portada, el índice y su página se generan solos.
 *
 * Canales: todo lo que se puede visitar de un proyecto (web, app, código,
 * redes, vídeos, documentos). Solo se muestran los que existen; los que
 * están en camino se marcan como `soon`.
 */

export type ChannelKind =
  | 'web'
  | 'demo'
  | 'app'
  | 'code'
  | 'api'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'video'
  | 'document';

export interface Channel {
  kind: ChannelKind;
  label: string;
  href?: string;
  /** live: se puede visitar · soon: en camino · private: existe pero no es público */
  status: 'live' | 'soon' | 'private';
  note?: string;
}

export type Category = 'web' | 'app' | 'sap' | 'template' | 'ia' | 'doc';

export const CATEGORY_LABEL: Record<Category, string> = {
  web: 'Webs',
  app: 'Aplicaciones',
  sap: 'SAP ABAP',
  template: 'Plantillas',
  ia: 'Vídeo e IA',
  doc: 'Documentos',
};

export interface Media {
  type: 'video' | 'image';
  src: string;
  poster?: string;
  alt: string;
  /** Formato del marco: pantalla de escritorio, móvil o imagen suelta */
  frame?: 'desktop' | 'mobile' | 'none';
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  year: string;
  status: string;
  role: string;
  context?: string;
  categories: Category[];
  /** Color de acento de la página del proyecto */
  accent: string;
  cover: Media;
  mobile?: Media;
  summary: string[];
  highlights: string[];
  stack: string[];
  channels: Channel[];
  gallery: Media[];
  strip?: { title: string; caption: string; images: Media[] };
}

// También lo importa scripts/postbuild.mjs desde Node, donde no existe import.meta.env
const BASE: string = import.meta.env?.BASE_URL ?? '/';
const m = (slug: string, file: string) => `${BASE}media/${slug}/${file}`;

export const projects: Project[] = [
  {
    slug: 'calipro',
    title: 'CaliPro',
    tagline: 'La web de una marca de calistenia: progresiones, tienda en 3D y test de nivel.',
    year: '2026',
    status: 'En desarrollo',
    role: 'Diseño, desarrollo y contenido',
    context: 'Marca de calistenia profesional',
    categories: ['web', 'app', 'ia'],
    accent: '#c8a04a',
    cover: { type: 'video', src: m('calipro', 'recorrido.mp4'), poster: m('calipro', 'recorrido-poster.jpg'), alt: 'Recorrido por el parque de barras de la portada de CaliPro', frame: 'desktop' },
    mobile: { type: 'video', src: m('calipro', 'movil.mp4'), poster: m('calipro', 'movil-poster.jpg'), alt: 'CaliPro en el móvil', frame: 'mobile' },
    summary: [
      'CaliPro convierte diez años de calistenia en progresiones claras: qué entrenar, en qué orden y cuándo dar el siguiente paso. La web es el escaparate de la marca y la puerta de entrada a su futura aplicación.',
      'La portada es un recorrido por un parque de barras al atardecer que avanza con el scroll. A partir de ahí, cada skill tiene su ficha, la tienda enseña los productos en 3D y un test de seis preguntas te dice por dónde empezar.',
    ],
    highlights: [
      'Recorrido de portada controlado por el scroll, a partir de un vídeo optimizado para cargar rápido.',
      'Web bilingüe (español e inglés) con rutas propias por idioma para posicionar en Google.',
      'Tienda con visor 3D y realidad aumentada en el móvil, y pedidos por WhatsApp.',
      'Test de nivel que recomienda una skill y prepara el mensaje de contacto.',
      'Carrusel de Instagram de diez láminas generado con código a partir de la misma identidad.',
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Motion', 'Three.js', 'model-viewer'],
    channels: [
      { kind: 'web', label: 'Web', status: 'soon', note: 'Se publica al terminarla' },
      { kind: 'app', label: 'App móvil', status: 'soon', note: 'Rutinas y planes de entrenamiento' },
      { kind: 'instagram', label: 'Instagram', status: 'soon', note: 'Carrusel de lanzamiento listo' },
      { kind: 'code', label: 'Código', status: 'private', note: 'Proyecto de cliente' },
    ],
    gallery: [
      { type: 'image', src: m('calipro', 'skills.webp'), alt: 'Página de skills de CaliPro' },
      { type: 'image', src: m('calipro', 'producto.webp'), alt: 'Ficha de producto con visor 3D' },
      { type: 'image', src: m('calipro', 'tienda.webp'), alt: 'Tienda de CaliPro' },
      { type: 'image', src: m('calipro', 'test.webp'), alt: 'Test de nivel' },
    ],
    strip: {
      title: 'Contenido para Instagram',
      caption: 'Carrusel de lanzamiento maquetado en HTML y exportado a imagen con Playwright. Desliza para verlo.',
      images: ['01', '02', '03', '04', '05', '06', '07', '08', '09'].map((n) => ({
        type: 'image' as const,
        src: m('calipro', `carrusel-${n}.webp`),
        alt: `Lámina ${Number(n)} del carrusel de CaliPro`,
      })),
    },
  },
  {
    slug: 'vcc-control',
    title: 'VCC Control',
    tagline: 'Telecontrol en tiempo real de convertidores de potencia, con telemetría, alarmas y osciloscopio.',
    year: '2025 · 2026',
    status: 'Demo pública',
    role: 'Desarrollo full-stack',
    context: 'PowerUS · AICIA, Universidad de Sevilla',
    categories: ['web', 'app'],
    accent: '#ffb020',
    cover: { type: 'video', src: m('vcc', 'demo.mp4'), poster: m('vcc', 'demo-poster.jpg'), alt: 'Demostración de VCC Control: flota, toma de control y API', frame: 'desktop' },
    mobile: { type: 'video', src: m('vcc', 'movil.mp4'), poster: m('vcc', 'movil-poster.jpg'), alt: 'VCC Control en el móvil', frame: 'mobile' },
    summary: [
      'Plataforma para supervisar y operar a distancia convertidores de potencia. Nació en un equipo de PowerUS (AICIA, Universidad de Sevilla) y la reescribí entera: una API nueva, un panel nuevo y un simulador que genera datos físicamente coherentes.',
      'Un operador toma el control exclusivo de un equipo, lo arranca, cambia sus consignas o su calibración y ve la respuesta en directo: el esquema unifilar se anima, las tendencias se actualizan y, si una medida supera su límite, salta la alarma.',
    ],
    highlights: [
      'API en FastAPI con telemetría en directo por WebSocket y documentación interactiva.',
      'Control exclusivo con caducidad, órdenes de marcha, consignas del regulador PI y calibración ADC/DAC.',
      'Gráficas, osciloscopio de cuatro canales y esquema unifilar propios, sin librerías de gráficos.',
      'Demo sin servidor: el mismo modelo y las mismas reglas funcionan dentro del navegador.',
      'Tests con SQLite y PostgreSQL en integración continua, y Docker para desplegarlo.',
    ],
    stack: ['FastAPI', 'Python', 'SQLAlchemy', 'WebSocket', 'React 19', 'TypeScript', 'PostgreSQL', 'Docker'],
    channels: [
      { kind: 'demo', label: 'Demo en vivo', href: 'https://abelg02.github.io/VCC-Control/', status: 'live', note: 'Usuario admin · admin123' },
      { kind: 'api', label: 'Documentación de la API', href: 'https://abelg02.github.io/VCC-Control/api-docs.html', status: 'live' },
      { kind: 'code', label: 'Código', href: 'https://github.com/abelg02/VCC-Control', status: 'live' },
    ],
    gallery: [
      { type: 'image', src: m('vcc', 'monitor.webp'), alt: 'Centro de control con esquema unifilar y osciloscopio' },
      { type: 'image', src: m('vcc', 'flota.webp'), alt: 'Flota de convertidores' },
      { type: 'image', src: m('vcc', 'control.webp'), alt: 'Órdenes, consignas y límites' },
      { type: 'image', src: m('vcc', 'api.webp'), alt: 'Documentación de la API' },
    ],
  },
  {
    slug: 'climax',
    title: 'ClimaX',
    tagline: 'Aplicación meteorológica con previsión por horas, calidad del aire y radar de lluvia.',
    year: '2025 · 2026',
    status: 'Demo pública',
    role: 'Proyecto de fin de grado · full-stack',
    categories: ['web', 'app'],
    accent: '#ffc857',
    cover: { type: 'video', src: m('climax', 'demo.mp4'), poster: m('climax', 'demo-poster.jpg'), alt: 'Demostración de ClimaX: búsqueda, previsión y mapa', frame: 'desktop' },
    mobile: { type: 'video', src: m('climax', 'movil.mp4'), poster: m('climax', 'movil-poster.jpg'), alt: 'ClimaX en el móvil', frame: 'mobile' },
    summary: [
      'Mi proyecto de fin de grado, rediseñado de arriba abajo. La versión original necesitaba una base de datos y una API de pago; la actual funciona con datos abiertos y se puede probar al momento.',
      'El fondo reproduce el cielo real de cada ciudad (lluvia, nieve, estrellas o sol), y un mapa oscuro muestra la temperatura de más de cincuenta ciudades con el radar de lluvia animado.',
    ],
    highlights: [
      'Backend en Spring Boot con caché, validación y errores estándar, sin claves en el código.',
      'Cielo animado en canvas que cambia según el tiempo real de cada lugar.',
      'Mapa con Leaflet, radar de RainViewer y consulta de cualquier punto con un clic.',
      'Modo demostración automático cuando no hay servidor, para publicarla en GitHub Pages.',
    ],
    stack: ['React 19', 'TypeScript', 'Spring Boot 3', 'Java 17', 'Leaflet', 'Firebase', 'Open-Meteo'],
    channels: [
      { kind: 'demo', label: 'Demo en vivo', href: 'https://abelg02.github.io/ClimaX-TFG/', status: 'live' },
      { kind: 'code', label: 'Código', href: 'https://github.com/abelg02/ClimaX-TFG', status: 'live' },
    ],
    gallery: [
      { type: 'image', src: m('climax', 'prevision-completa.webp'), alt: 'Previsión completa de una ciudad' },
      { type: 'image', src: m('climax', 'mapa.webp'), alt: 'Mapa con temperaturas y radar de lluvia' },
    ],
  },
  {
    slug: 'transporta',
    title: 'Transporta',
    tagline: 'Guía de campo gratuita para programadores Java que llegan a SAP ABAP.',
    year: '2026',
    status: 'Publicada',
    role: 'Contenido, diseño y desarrollo',
    categories: ['web', 'sap', 'doc'],
    accent: '#3ee6a6',
    cover: { type: 'video', src: m('transporta', 'recorrido.mp4'), poster: m('transporta', 'recorrido-poster.jpg'), alt: 'Recorrido por la guía Transporta', frame: 'desktop' },
    mobile: { type: 'video', src: m('transporta', 'movil.mp4'), poster: m('transporta', 'movil-poster.jpg'), alt: 'Transporta en el móvil', frame: 'mobile' },
    summary: [
      'La guía que me habría ahorrado semanas al pasar de Java a ABAP: equivalencias entre los dos lenguajes, errores típicos con su solución, snippets listos para copiar, las transacciones del día a día y una ruta de aprendizaje.',
      'Está hecha sin frameworks, con HTML, CSS y JavaScript, y la portada dibuja la palabra Java con partículas que se reordenan.',
    ],
    highlights: [
      '12 equivalencias, 8 errores resueltos, 8 snippets y 20 transacciones.',
      'Test de nivel al final para saber por dónde seguir.',
      'Portada con partículas en canvas y efectos sin librerías externas.',
    ],
    stack: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
    channels: [
      { kind: 'web', label: 'Leer la guía', href: '/transporta/', status: 'live' },
    ],
    gallery: [{ type: 'image', src: m('transporta', 'inicio.webp'), alt: 'Portada de Transporta' }],
  },
  {
    slug: 'sap-abap-cloud',
    title: 'SAP ABAP Cloud',
    tagline: 'Máster de cero a experto: POO, ABAP SQL, diccionario y una app Fiori con RAP.',
    year: '2025 · 2026',
    status: 'Código publicado',
    role: 'Formación y proyectos finales',
    categories: ['sap'],
    accent: '#4fc3ff',
    cover: { type: 'image', src: m('abap', 'avanzado-a-experto.webp'), alt: 'Portada del repositorio ABAP Cloud de avanzado a experto', frame: 'none' },
    summary: [
      'Todo el código del máster de SAP ABAP Cloud, en dos repositorios: de cero a avanzado y de avanzado a experto. Clases, laboratorios y dos proyectos finales desarrollados en SAP BTP y sincronizados con abapGit.',
      'El proyecto final es una aplicación Fiori Elements de gestión de incidencias con RAP: borradores, acción para cambiar de estado con sus reglas de negocio, validaciones, historial de cambios y servicio OData V4.',
    ],
    highlights: [
      'App de incidencias con RAP managed, borradores, acciones, determinaciones y validaciones.',
      'Gestión de órdenes de trabajo con CRUD, validaciones, historial y objeto de autorización propio.',
      'Programación orientada a objetos: herencia, interfaces, polimorfismo y eventos, con 46 laboratorios.',
      'Análisis estático con abaplint contra la API de SAP BTP: 0 errores en 388 archivos.',
    ],
    stack: ['ABAP Cloud', 'RAP', 'CDS', 'OData V4', 'Fiori Elements', 'SAP BTP', 'abapGit', 'abaplint'],
    channels: [
      { kind: 'code', label: 'De avanzado a experto', href: 'https://github.com/abelg02/ABAP_Cloud_AE', status: 'live', note: 'POO y app de incidencias con RAP' },
      { kind: 'code', label: 'De cero a avanzado', href: 'https://github.com/abelg02/ABAP_Cloud_CA', status: 'live', note: 'Fundamentos, SQL y órdenes de trabajo' },
      { kind: 'web', label: 'Guía Java → ABAP', href: '/proyectos/transporta', status: 'live' },
    ],
    gallery: [
      { type: 'image', src: m('abap', 'avanzado-a-experto.webp'), alt: 'ABAP Cloud de avanzado a experto', frame: 'none' },
      { type: 'image', src: m('abap', 'cero-a-avanzado.webp'), alt: 'ABAP Cloud de cero a avanzado', frame: 'none' },
    ],
  },
  {
    slug: 'crm',
    title: 'CRM Plantilla',
    tagline: 'Plantilla de CRM para agencias: contactos, pipeline, deals y actividades en tiempo real.',
    year: '2026',
    status: 'Plantilla',
    role: 'Diseño y desarrollo',
    categories: ['app', 'template'],
    accent: '#f5c518',
    cover: { type: 'video', src: m('crm', 'panel.mp4'), poster: m('crm', 'panel-poster.jpg'), alt: 'Panel del CRM', frame: 'desktop' },
    summary: [
      'Una base de CRM reutilizable para montar el de cada cliente en poco tiempo. Arranca sin datos: todas las métricas salen de la base de datos y empiezan en cero.',
      'Incluye panel, contactos, empresas, pipeline por etapas, deals, actividades, informes y bandeja de entrada, con autenticación y actualizaciones en tiempo real.',
    ],
    highlights: [
      'Sistema de diseño propio (tokens, componentes y kit de interfaz) aplicado a todas las pantallas.',
      'Supabase para autenticación, base de datos, tiempo real y archivos.',
      'Modo de vista previa sin base de datos para enseñar el diseño.',
    ],
    stack: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL'],
    channels: [{ kind: 'code', label: 'Código', status: 'private', note: 'Plantilla para clientes' }],
    gallery: [
      { type: 'image', src: m('crm', 'pipeline.webp'), alt: 'Pipeline por etapas' },
      { type: 'image', src: m('crm', 'contactos.webp'), alt: 'Contactos' },
    ],
  },
];

export const findProject = (slug: string) => projects.find((p) => p.slug === slug);

export const liveCount = projects.filter((p) => p.channels.some((c) => c.status === 'live' && (c.kind === 'demo' || c.kind === 'web') && !c.href?.startsWith('/proyectos/'))).length;

export const technologies = Array.from(new Set(projects.flatMap((p) => p.stack)));

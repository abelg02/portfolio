// Datos personales del portfolio. Lo que valga null no se muestra en la web.

export const site = {
  name: 'Abel González',
  fullName: 'Abel González Guerra',
  role: 'Desarrollador full-stack y SAP ABAP Cloud',
  url: 'https://abelg02.github.io/portfolio',
  intro:
    'Construyo productos completos: la interfaz que usa la gente, el servidor que la sostiene y, cuando hace falta, el código dentro de SAP. Me gusta que cada proyecto se pueda probar, no solo mirar.',
  links: {
    github: 'https://github.com/abelg02',
    linkedin: null as string | null, // PENDIENTE: URL del perfil de LinkedIn
    email: 'abelgg2002@gmail.com' as string | null,
  },
  education: [
    { title: 'Máster SAP ABAP Cloud', detail: 'De cero a experto: POO, SQL, diccionario, RAP y Fiori Elements' },
    { title: 'Técnico Superior', detail: 'Proyecto final: ClimaX, aplicación meteorológica full-stack' },
  ],
  experience: [
    { title: 'Zelenza · Técnico de Soporte en Redes', detail: 'Actualmente · Junta de Andalucía' },
    { title: 'PowerUS · AICIA', detail: 'Universidad de Sevilla. Plataforma de telecontrol de convertidores de potencia' },
  ],
}

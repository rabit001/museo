import { MuseumCategory, MuseumThemeConfig } from '../types/museum';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: MuseumThemeConfig;
}

export const DEFAULT_MUSEUM_THEME: MuseumThemeConfig = {
  presetId: 'archipielago',
  skyColor: '#6ec9da',
  oceanColor: '#2caac0',
  accentColor: '#f4d47d',
  surfaceColor: '#072634',
  roomThemeId: 'classic',
  islandStyle: 'cliffs',
  frameStyle: 'archival',
};

export const MUSEUM_THEME_PRESETS: ThemePreset[] = [
  {
    id: 'archipielago',
    name: 'Archipiélago Clásico',
    description: 'Turquesa luminoso, madera tibia y dorado antiguo.',
    config: DEFAULT_MUSEUM_THEME,
  },
  {
    id: 'vinilo',
    name: 'Vinilo Nocturno (Música)',
    description: 'Cielo índigo nocturno, mar profundo y acentos ámbar neón.',
    config: {
      presetId: 'vinilo',
      skyColor: '#27294b',
      oceanColor: '#1a4c6e',
      accentColor: '#ff9f5a',
      surfaceColor: '#13162b',
      roomThemeId: 'night',
    },
  },
  {
    id: 'bistro',
    name: 'Bistró Terracota (Menú)',
    description: 'Atardecer cálido, agua esmeralda y tono especiado.',
    config: {
      presetId: 'bistro',
      skyColor: '#e6b17e',
      oceanColor: '#2d8287',
      accentColor: '#ffd470',
      surfaceColor: '#2e1b16',
      roomThemeId: 'classic',
    },
  },
  {
    id: 'crepusculo',
    name: 'Crepúsculo Cósmico',
    description: 'Horizonte violeta estelar con reflejos cobrizos.',
    config: {
      presetId: 'crepusculo',
      skyColor: '#5c4476',
      oceanColor: '#364d7a',
      accentColor: '#fca048',
      surfaceColor: '#1e142b',
      roomThemeId: 'twilight',
    },
  },
  {
    id: 'consola89',
    name: 'Consola 1989',
    description: 'Atmósfera monocroma oliva inspirada en portátiles clásicas.',
    config: {
      presetId: 'consola89',
      skyColor: '#9bbc0f',
      oceanColor: '#306230',
      accentColor: '#e2f598',
      surfaceColor: '#0f380f',
      roomThemeId: 'gameboy',
    },
  },
];

export const CATEGORY_META: Record<
  MuseumCategory,
  { label: string; badge: string; hint: string }
> = {
  arte: {
    label: 'Arte y Visuales',
    badge: 'ARTE',
    hint: 'Pinturas, fotografía, ilustración o escultura.',
  },
  musica: {
    label: 'Música y Vinilos',
    badge: 'MÚSICA',
    hint: 'Recomendaciones de discos, playlists, canciones y conciertos.',
  },
  gastronomia: {
    label: 'Restaurante y Menú',
    badge: 'MENÚ',
    hint: 'Cartas interactivas, platillos, bebidas, café o recetas.',
  },
  literatura: {
    label: 'Poesía y Relatos',
    badge: 'TEXTOS',
    hint: 'Poemas, ensayos, diarios, cuadernos y fanzines.',
  },
  experimentos: {
    label: 'Juegos y Laboratorios',
    badge: 'LAB',
    hint: 'Prototipos, enlaces web, código y artefactos curiosos.',
  },
  personal: {
    label: 'Museo Personal',
    badge: 'LIBRE',
    hint: 'Un archipiélago mixto con tus ideas favoritas.',
  },
};

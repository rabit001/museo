import {
  CharacterId,
  Island,
  MuseumCategory,
  MuseumThemeConfig,
  Room,
} from '../types/museum';
import { DEFAULT_MUSEUM_THEME, MUSEUM_THEME_PRESETS } from './themes';

export interface TemplatePieceSeed {
  islandId: string;
  roomId: string;
  title: string;
  subtitle: string;
  body: string;
  kind: 'text' | 'link';
  type: 'text' | 'link';
  url?: string;
}

export interface MuseumTemplate {
  id: string;
  name: string;
  description: string;
  category: MuseumCategory;
  theme: MuseumThemeConfig;
  defaultCharacterId: CharacterId;
  defaultSubtitle: string;
  islands: Island[];
  rooms: Room[];
  pieces: TemplatePieceSeed[];
}

export const MUSEUM_TEMPLATES: MuseumTemplate[] = [
  {
    id: 'musica',
    name: 'Club de Recomendaciones Musicales',
    description: 'Islas listas para compartir discos favoritos, playlists y reseñas.',
    category: 'musica',
    theme: MUSEUM_THEME_PRESETS[1].config,
    defaultCharacterId: 'melomano',
    defaultSubtitle: 'Discos, canciones y frecuencias recomendadas',
    islands: [
      {
        id: 'patio',
        isOriginal: false,
        biome: 'patio',
        x: 50,
        y: 52,
        mapLabel: 'CABINA\nCENTRAL',
        title: 'Cabina Central',
        eyebrow: 'PUNTO DE ESCUCHA',
        description: 'Bienvenida sonora. Desde aquí cruzas a mis listas y álbumes recomendados.',
        footer: 'Selecciona una sala para escuchar y leer notas',
      },
      {
        id: 'vinilos',
        isOriginal: false,
        biome: 'observatory',
        x: 24,
        y: 34,
        mapLabel: 'DISCOS\nNOCTURNOS',
        title: 'Isla Discos Nocturnos',
        eyebrow: 'ÁLBUMES RECOMENDADOS',
        description: 'Discos completos para escuchar de principio a fin con luces bajas.',
        footer: 'Edita o añade tus álbumes favoritos',
      },
      {
        id: 'enlaces',
        isOriginal: false,
        biome: 'workshop',
        x: 76,
        y: 36,
        mapLabel: 'SESIONES Y\nPLAYLISTS',
        title: 'Isla Sesiones y Playlists',
        eyebrow: 'ENLACES MUSICALES',
        description: 'Conciertos en vivo, sesiones y listas externas.',
        footer: 'Conecta tus enlaces de audio o vídeo',
      },
    ],
    rooms: [
      {
        id: 'bienvenida',
        islandId: 'patio',
        name: 'Recepción Sonora',
        description: 'Cómo nació este museo de recomendaciones musicales.',
      },
      {
        id: 'rotacion',
        islandId: 'vinilos',
        name: 'Rotación del Mes',
        description: 'Los álbumes que más suenan últimamente.',
      },
      {
        id: 'playlists',
        islandId: 'enlaces',
        name: 'Listas Abiertas',
        description: 'Playlists para trabajar, caminar o cocinar.',
      },
    ],
    pieces: [
      {
        islandId: 'patio',
        roomId: 'bienvenida',
        title: 'Manifiesto de escucha',
        subtitle: 'Nota del curador',
        body: 'Este archipiélago reúne discos y canciones que vale la pena compartir sin prisa. Si encuentras una obra que te guste en otro museo, puedes traerla a estas salas.',
        kind: 'text',
        type: 'text',
      },
      {
        islandId: 'vinilos',
        roomId: 'rotacion',
        title: 'Recomendación #01 · Disco de medianoche',
        subtitle: 'Jazz / Electrónica',
        body: 'Ideal para caminar de noche bajo lluvia ligera. Destaca la línea de bajo del minuto 2:15 en la tercera pista.',
        kind: 'text',
        type: 'text',
      },
    ],
  },
  {
    id: 'gastronomia',
    name: 'Restaurante / Menú Interactivo',
    description: 'Convierte tu carta de platillos, bebidas y postres en islas explorables.',
    category: 'gastronomia',
    theme: MUSEUM_THEME_PRESETS[2].config,
    defaultCharacterId: 'chef',
    defaultSubtitle: 'Carta viva de platillos, bebidas e historia de cocina',
    islands: [
      {
        id: 'patio',
        isOriginal: false,
        biome: 'patio',
        x: 50,
        y: 52,
        mapLabel: 'MESA DE\nBIENVENIDA',
        title: 'Mesa de Bienvenida',
        eyebrow: 'ANFITRIÓN DE LA CASA',
        description: 'Horarios, ubicación e historia de nuestra cocina.',
        footer: 'Cruza los puentes para explorar el menú completo',
      },
      {
        id: 'platos',
        isOriginal: false,
        biome: 'desert',
        x: 24,
        y: 36,
        mapLabel: 'PLATOS DE\nTEMPORADA',
        title: 'Platos de Temporada',
        eyebrow: 'MENÚ PRINCIPAL',
        description: 'Entradas, platos fuertes y especialidades al comal.',
        footer: 'Precios, ingredientes y maridajes',
      },
      {
        id: 'bebidas',
        isOriginal: false,
        biome: 'forest',
        x: 76,
        y: 38,
        mapLabel: 'BARRA Y\nPOSTRES',
        title: 'Barra y Postres',
        eyebrow: 'CAFÉ · COCTELERÍA · DULCES',
        description: 'Bebidas artesanales, infusiones y repostería del día.',
        footer: 'Actualiza los platillos del día en el Editor',
      },
    ],
    rooms: [
      {
        id: 'casa',
        islandId: 'patio',
        name: 'Nuestra Cocina',
        description: 'Filosofía de ingredientes y reservas.',
      },
      {
        id: 'carta',
        islandId: 'platos',
        name: 'Menú del Día',
        description: 'Selección actual de platos fuertes.',
      },
      {
        id: 'barra',
        islandId: 'bebidas',
        name: 'Café y Postres',
        description: 'Para cerrar la sobremesa.',
      },
    ],
    pieces: [
      {
        islandId: 'patio',
        roomId: 'casa',
        title: 'Bienvenidos a la mesa',
        subtitle: 'Horario · Mar a Dom 13:00–22:30',
        body: 'Cocinamos con producto local y recetas de temporada. Explora cada isla para conocer los ingredientes y notas de cada plato.',
        kind: 'text',
        type: 'text',
      },
      {
        islandId: 'platos',
        roomId: 'carta',
        title: 'Tostada de hongos rostizados — $185',
        subtitle: 'Entrada vegetariana · Maíz azul',
        body: 'Hongos de lluvia al sartén con epazote, crema de nuez de la india y chile pasilla crujiente sobre maíz criollo.',
        kind: 'text',
        type: 'text',
      },
      {
        islandId: 'bebidas',
        roomId: 'barra',
        title: 'Cold Brew de Cardamomo — $85',
        subtitle: 'Barra fría de especialidad',
        body: 'Extracción en frío de 18 horas con grano lavado de altura, toque de vaina de cardamomo y cáscara de naranja.',
        kind: 'text',
        type: 'text',
      },
    ],
  },
  {
    id: 'arte',
    name: 'Galería de Arte y Bocetos',
    description: 'Espacio luminoso para mostrar pinturas, fotos, poemas y proceso creativo.',
    category: 'arte',
    theme: DEFAULT_MUSEUM_THEME,
    defaultCharacterId: 'explorador',
    defaultSubtitle: 'Colección de obra visual, bitácoras y hallazgos',
    islands: [
      {
        id: 'patio',
        isOriginal: false,
        biome: 'patio',
        x: 50,
        y: 52,
        mapLabel: 'VESTÍBULO\nCENTRAL',
        title: 'Vestíbulo Central',
        eyebrow: 'BIENVENIDA AL ARCHIPIÉLAGO',
        description: 'Punto de encuentro de la galería.',
        footer: 'Camina hacia las salas vecinas',
      },
      {
        id: 'galeria',
        isOriginal: false,
        biome: 'ice',
        x: 75,
        y: 34,
        mapLabel: 'GALERÍA\nDE OBRA',
        title: 'Galería de Obra',
        eyebrow: 'SALA VISUAL',
        description: 'Imágenes, series gráficas y estudios de color.',
        footer: 'Sube tus propias imágenes desde Editar museo',
      },
      {
        id: 'cuaderno',
        isOriginal: false,
        biome: 'forest',
        x: 24,
        y: 38,
        mapLabel: 'CUADERNO\nDE CAMPO',
        title: 'Cuaderno de Campo',
        eyebrow: 'NOTAS Y PROCESO',
        description: 'Textos breves, poemas e ideas detrás de cada pieza.',
        footer: 'Archivo vivo del autor',
      },
    ],
    rooms: [
      { id: 'umbral', islandId: 'patio', name: 'Umbral', description: 'Presentación del autor.' },
      { id: 'serie1', islandId: 'galeria', name: 'Serie Principal', description: 'Obras destacadas.' },
      { id: 'notas', islandId: 'cuaderno', name: 'Anotaciones', description: 'Apuntes de taller.' },
    ],
    pieces: [
      {
        islandId: 'patio',
        roomId: 'umbral',
        title: 'Sobre esta colección',
        subtitle: 'Nota introductoria',
        body: 'Este espacio reúne obras propias y piezas compartidas por otros creadores del archipiélago.',
        kind: 'text',
        type: 'text',
      },
    ],
  },
  {
    id: 'blank',
    name: 'Archipiélago en Blanco',
    description: 'Empieza con un patio central y una isla libre para construir todo a tu gusto.',
    category: 'personal',
    theme: MUSEUM_THEME_PRESETS[3].config,
    defaultCharacterId: 'astronomo',
    defaultSubtitle: 'Un mundo propio por construir',
    islands: [
      {
        id: 'patio',
        isOriginal: false,
        biome: 'patio',
        x: 50,
        y: 52,
        mapLabel: 'PATIO\nINICIAL',
        title: 'Patio Inicial',
        eyebrow: 'ORIGEN',
        description: 'El centro de tu nuevo museo.',
        footer: 'Añade más islas desde Editar museo',
      },
      {
        id: 'sala1',
        isOriginal: false,
        biome: 'forest',
        x: 73,
        y: 36,
        mapLabel: 'PRIMERA\nISLA',
        title: 'Primera Isla',
        eyebrow: 'TERRITORIO LIBRE',
        description: 'Aquí puedes empezar a colocar textos, imágenes o enlaces.',
        footer: 'Colección en construcción',
      },
    ],
    rooms: [
      { id: 'entrada', islandId: 'patio', name: 'Plaza de Entrada', description: 'Inicio del recorrido.' },
      { id: 'exposicion', islandId: 'sala1', name: 'Sala 01', description: 'Primera sala expositiva.' },
    ],
    pieces: [
      {
        islandId: 'patio',
        roomId: 'entrada',
        title: 'Primer piedra del museo',
        subtitle: 'Bitácora 00',
        body: 'Abre «Editar museo» para cambiar nombres, personalizar colores, crear nuevas islas o subir tus primeras piezas.',
        kind: 'text',
        type: 'text',
      },
    ],
  },
];

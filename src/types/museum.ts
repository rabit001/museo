export type IslandBiome =
  | 'forest'
  | 'observatory'
  | 'ice'
  | 'patio'
  | 'desert'
  | 'workshop';

export type PieceType = 'text' | 'image' | 'audio' | 'video' | 'link';
export type PieceKind = 'text' | 'painting' | 'app' | 'link' | 'image' | 'audio' | 'video';

export type InteractiveAppType = 'word_generator' | 'oracle' | 'telegraph';

export type MuseumCategory =
  | 'arte'
  | 'musica'
  | 'gastronomia'
  | 'literatura'
  | 'experimentos'
  | 'personal';

export type CharacterId =
  | 'explorador'
  | 'melomano'
  | 'chef'
  | 'astronomo'
  | 'robot404';

export type ThemeId = 'classic' | 'night' | 'twilight' | 'gameboy';
export type LightMode = 'auto' | 'on' | 'off';

/** Estilo expresivo opcional de siluetas de isla y marcos */
export type IslandShapeStyle = 'cliffs' | 'terraced' | 'floating';
export type FrameStyle = 'archival' | 'ornate' | 'minimal';

/** Estado comercial de una pieza */
export type SaleStatus = 'not_for_sale' | 'for_sale' | 'reserved' | 'sold';

/** Estado de seguimiento de una solicitud de compra */
export type InquiryStatus = 'pending' | 'contacted' | 'closed';

/** Configuración de donación de un museo */
export interface DonationConfig {
  enabled: boolean;
  /** Debe comenzar con http:// o https:// */
  url: string;
  /** Etiqueta visible: "PayPal" | "Ko-fi" | "Mercado Pago" | "Otro" */
  platformLabel: string;
  /** Texto corto de agradecimiento / invitación */
  note: string;
}

/** Entrada del Libro de Visitas */
export interface GuestbookEntry {
  id: string;
  museumId: string;
  islandId: string;
  roomId: string;
  scopeLabel: string;
  nickname: string;
  message: string;
  authorUid: string | null;
  isVisible: boolean;
  createdAt: string;
}

/** Solicitud de compra / reserva (PII aislada) */
export interface PurchaseInquiry {
  id: string;
  museumId: string;
  museumOwnerId: string;
  pieceId: string;
  pieceTitle: string;
  priceLabel: string;
  buyerName: string;
  buyerContact: string;
  shippingLocation: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MuseumThemeConfig {
  presetId: string;
  skyColor: string;
  oceanColor: string;
  accentColor: string;
  surfaceColor: string;
  roomThemeId: ThemeId;
  islandStyle?: IslandShapeStyle;
  frameStyle?: FrameStyle;
}

export interface CuratedFromMeta {
  sourceMuseumId: string;
  sourceMuseumTitle: string;
  sourceAuthorName: string;
  sourcePieceId: string;
  sourcePieceTitle: string;
}

export interface Island {
  id: string;
  isOriginal: boolean;
  biome: IslandBiome;
  /** Porcentaje horizontal en el archipiélago (10..90) */
  x: number;
  /** Porcentaje vertical en el archipiélago (18..86) */
  y: number;
  mapLabel: string;
  title: string;
  eyebrow: string;
  description: string;
  footer: string;
}

export interface Room {
  id: string;
  islandId: string;
  name: string;
  description: string;
}

export interface PaintingData {
  id: number;
  title: string;
  year: string;
  palette: string[];
  desc: string;
}

export interface InteractiveAppData {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  interactiveType: InteractiveAppType;
}

export interface MuseumPiece {
  id: string;
  islandId: string;
  roomId: string;
  title: string;
  subtitle: string;
  body?: string;
  lines?: string[];
  kind: PieceKind;
  type?: PieceType;
  url?: string;
  mediaKey?: string | null;
  mediaDataUrl?: string | null;
  custom?: boolean;
  painting?: PaintingData;
  app?: InteractiveAppData;
  curatedFrom?: CuratedFromMeta;

  // Campos comerciales opcionales
  saleStatus?: SaleStatus;
  priceLabel?: string;
  mediumOrSize?: string;
  paymentUrl?: string;
}

export interface PieceOverride {
  title?: string;
  subtitle?: string;
  body?: string;
  type?: PieceType;
  mediaKey?: string | null;
  saleStatus?: SaleStatus;
  priceLabel?: string;
  mediumOrSize?: string;
  paymentUrl?: string;
}

export interface MuseumState {
  version: 2;
  /** Islas añadidas por el usuario (o copias personalizadas) */
  customIslands: Island[];
  /** Metadatos editados para islas (originales o personalizadas) */
  islandMeta: Record<string, Partial<Island>>;
  /** Islas originales ocultadas por el usuario (si decide quitarlas del mapa) */
  hiddenIslands: string[];
  /** Salas por islandId */
  rooms: Record<string, Room[]>;
  /** Piezas creadas por el usuario */
  customItems: MuseumPiece[];
  /** Sobrescrituras sobre piezas originales */
  overrides: Record<string, PieceOverride>;
  /** IDs de piezas originales ocultas */
  hidden: string[];
  /** IDs de piezas descubiertas en la exploración */
  discoveredIds: string[];
}

export interface CloudMuseum {
  id: string;
  ownerId: string;
  authorName: string;
  title: string;
  subtitle: string;
  category: MuseumCategory;
  templateId: string;
  theme: MuseumThemeConfig;
  defaultCharacterId: CharacterId;
  isPublic: boolean;
  islands: Island[];
  rooms: Room[];
  islandCount: number;
  pieceCount: number;
  donationConfig?: DonationConfig;
}

export interface PieceCommerceOverride {
  saleStatus: SaleStatus;
  priceLabel: string;
  mediumOrSize: string;
  paymentUrl: string;
}

/** Configuración local/remota del museo insignia (flagship) */
export interface FlagshipConfig {
  theme: MuseumThemeConfig;
  donationConfig?: DonationConfig;
  pieceCommerce?: Record<string, PieceCommerceOverride>;
}

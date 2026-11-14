import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  Box,
  Compass,
  HelpCircle,
  LogIn,
  LogOut,
  Map as MapIcon,
  Pencil,
  Plus,
  User as UserIcon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Archipelago3D } from './components/Archipelago3D';
import { ArchipelagoMap } from './components/ArchipelagoMap';
import { CharacterSelectorModal } from './components/CharacterSelectorModal';
import { ContentModal, ModalPayload } from './components/ContentModal';
import { CreateMuseumModal } from './components/CreateMuseumModal';
import { IslandDrawer } from './components/IslandDrawer';
import { MuseumDirectoryModal } from './components/MuseumDirectoryModal';
import { EditorSource, MuseumEditor } from './components/MuseumEditor';
import { RoomExplorer2D } from './components/RoomExplorer2D';
import { SharePieceModal } from './components/SharePieceModal';
import { getCharacterProfile } from './data/characters';
import { FOUNTAIN_QUOTES } from './data/initialContent';
import { CATEGORY_META, DEFAULT_MUSEUM_THEME } from './data/themes';
import { auth } from './firebase/client';
import {
  fetchMuseumById,
  fetchMuseumPieces,
  fetchMyMuseums,
  fetchPublicMuseums,
  loadUserCharacterPreference,
  signInWithGoogle,
  signOutCreator,
  syncUserPrivateProfile,
} from './firebase/museumNetwork';
import { retroAudio } from './game/audio';
import {
  getPiecesCountForIsland,
  getPiecesForRoom,
  getResolvedIslands,
  getRoomsForIsland,
  loadMuseumState,
  saveMuseumState,
} from './storage/museumStore';
import {
  CharacterId,
  CloudMuseum,
  Island,
  MuseumPiece,
  MuseumState,
  MuseumThemeConfig,
  Room,
} from './types/museum';

type ActiveMuseum =
  | { kind: 'flagship' }
  | { kind: 'cloud'; museum: CloudMuseum; pieces: MuseumPiece[] };

const CHAR_STORAGE_KEY = 'museo404_character_id';
const CHAR_PICKED_KEY = 'museo404_character_picked';
const FLAGSHIP_THEME_KEY = 'museo404_flagship_theme_v1';

function loadInitialCharacter(): CharacterId {
  try {
    const saved = localStorage.getItem(CHAR_STORAGE_KEY);
    if (
      saved &&
      ['explorador', 'melomano', 'chef', 'astronomo', 'robot404'].includes(saved)
    ) {
      return saved as CharacterId;
    }
  } catch {
    // ignorar
  }
  return 'explorador';
}

function loadInitialFlagshipTheme(): MuseumThemeConfig {
  try {
    const raw = localStorage.getItem(FLAGSHIP_THEME_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.skyColor === 'string') {
        return { ...DEFAULT_MUSEUM_THEME, ...parsed };
      }
    }
  } catch {
    // ignorar
  }
  return DEFAULT_MUSEUM_THEME;
}

export default function App() {
  const [museumState, setMuseumState] = useState<MuseumState>(() => loadMuseumState());
  const [flagshipTheme, setFlagshipTheme] = useState<MuseumThemeConfig>(() =>
    loadInitialFlagshipTheme()
  );

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [publicMuseums, setPublicMuseums] = useState<CloudMuseum[]>([]);
  const [myMuseums, setMyMuseums] = useState<CloudMuseum[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState<string | null>(null);

  const [activeMuseum, setActiveMuseum] = useState<ActiveMuseum>({ kind: 'flagship' });
  const [cloudDiscoveredIds, setCloudDiscoveredIds] = useState<string[]>([]);
  const [characterId, setCharacterId] = useState<CharacterId>(() => loadInitialCharacter());

  const [worldView, setWorldView] = useState<'3d' | 'map'>('3d');
  const [selectedIslandId, setSelectedIslandId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [mode2D, setMode2D] = useState<{ islandId: string; roomId: string } | null>(null);

  const [editorSource, setEditorSource] = useState<EditorSource | null>(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [createMuseumOpen, setCreateMuseumOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [shareTargetPiece, setShareTargetPiece] = useState<MuseumPiece | null>(null);
  const [modalPayload, setModalPayload] = useState<ModalPayload | null>(null);

  const [bgmActive, setBgmActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3800);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  const updateState = useCallback((next: MuseumState) => {
    setMuseumState(next);
    saveMuseumState(next);
  }, []);

  const updateFlagshipTheme = useCallback((next: MuseumThemeConfig) => {
    setFlagshipTheme(next);
    try {
      localStorage.setItem(FLAGSHIP_THEME_KEY, JSON.stringify(next));
    } catch {
      // ignorar
    }
  }, []);

  const refreshDirectory = useCallback(async (userOverride?: User | null) => {
    setDirectoryLoading(true);
    setDirectoryError(null);
    try {
      const pub = await fetchPublicMuseums();
      setPublicMuseums(pub);
      const currentUser = userOverride !== undefined ? userOverride : auth.currentUser;
      if (currentUser) {
        const mine = await fetchMyMuseums(currentUser.uid);
        setMyMuseums(mine);
      } else {
        setMyMuseums([]);
      }
    } catch (err) {
      setDirectoryError(
        err instanceof Error ? err.message : 'No se pudo cargar la red de museos.'
      );
    } finally {
      setDirectoryLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDirectory(null);
  }, [refreshDirectory]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const [mine, savedChar] = await Promise.all([
            fetchMyMuseums(user.uid),
            loadUserCharacterPreference(user.uid),
          ]);
          setMyMuseums(mine);
          if (savedChar) {
            setCharacterId(savedChar);
            try {
              localStorage.setItem(CHAR_STORAGE_KEY, savedChar);
              localStorage.setItem(CHAR_PICKED_KEY, '1');
            } catch {
              // ignorar
            }
          } else {
            await syncUserPrivateProfile(user, characterId);
          }
        } catch {
          // Errores capturados internamente o ignorables en arranque
        }
      } else {
        setMyMuseums([]);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      const user = await signInWithGoogle();
      showToast(`Bienvenido, ${user.displayName || 'Creador'}.`);
      refreshDirectory(user);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    }
  }, [refreshDirectory, showToast]);

  const handleSelectCharacter = useCallback(
    async (id: CharacterId) => {
      setCharacterId(id);
      try {
        localStorage.setItem(CHAR_STORAGE_KEY, id);
        localStorage.setItem(CHAR_PICKED_KEY, '1');
      } catch {
        // ignorar
      }
      if (authUser) {
        try {
          await syncUserPrivateProfile(authUser, id);
        } catch {
          // silenciar si falló sync puntual
        }
      }
    },
    [authUser]
  );

  const openFlagshipMuseum = useCallback(() => {
    setActiveMuseum({ kind: 'flagship' });
    setSelectedIslandId(null);
    setSelectedRoomId(null);
    setMode2D(null);
    setDirectoryOpen(false);
  }, []);

  const openCloudMuseum = useCallback(
    async (museum: CloudMuseum) => {
      try {
        const pieces = await fetchMuseumPieces(museum.id, museum.ownerId);
        setActiveMuseum({ kind: 'cloud', museum, pieces });
        setCloudDiscoveredIds([]);
        setSelectedIslandId(null);
        setSelectedRoomId(null);
        setMode2D(null);
        setDirectoryOpen(false);
        const userAlreadyPicked = localStorage.getItem(CHAR_PICKED_KEY) === '1';
        if (!userAlreadyPicked && museum.defaultCharacterId) {
          setCharacterId(museum.defaultCharacterId);
        }
        showToast(`Entraste a «${museum.title}»`);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'No se pudo abrir este museo.');
      }
    },
    [showToast]
  );

  const openMuseumById = useCallback(
    async (museumId: string) => {
      if (museumId === 'museo404' || museumId === 'flagship') {
        openFlagshipMuseum();
        return;
      }
      try {
        const found = await fetchMuseumById(museumId);
        if (!found) {
          showToast('Ese museo ya no está disponible.');
          return;
        }
        await openCloudMuseum(found);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'No se pudo abrir el museo.');
      }
    },
    [openCloudMuseum, openFlagshipMuseum, showToast]
  );

  const activeTheme: MuseumThemeConfig =
    activeMuseum.kind === 'cloud' ? activeMuseum.museum.theme : flagshipTheme;

  const islands: Island[] = useMemo(() => {
    if (activeMuseum.kind === 'cloud') {
      return activeMuseum.museum.islands;
    }
    return getResolvedIslands(museumState, false);
  }, [activeMuseum, museumState]);

  const getActiveRoomsForIsland = useCallback(
    (islandId: string): Room[] => {
      if (activeMuseum.kind === 'cloud') {
        return activeMuseum.museum.rooms.filter((r) => r.islandId === islandId);
      }
      return getRoomsForIsland(museumState, islandId);
    },
    [activeMuseum, museumState]
  );

  const getActivePiecesForRoom = useCallback(
    (islandId: string, roomId: string): MuseumPiece[] => {
      if (activeMuseum.kind === 'cloud') {
        return activeMuseum.pieces.filter(
          (p) => p.islandId === islandId && p.roomId === roomId
        );
      }
      return getPiecesForRoom(museumState, islandId, roomId);
    },
    [activeMuseum, museumState]
  );

  const roomCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const isl of islands) {
      map[isl.id] = getActiveRoomsForIsland(isl.id).length;
    }
    return map;
  }, [islands, getActiveRoomsForIsland]);

  const pieceCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const isl of islands) {
      if (activeMuseum.kind === 'cloud') {
        map[isl.id] = activeMuseum.pieces.filter((p) => p.islandId === isl.id).length;
      } else {
        map[isl.id] = getPiecesCountForIsland(museumState, isl.id);
      }
    }
    return map;
  }, [islands, activeMuseum, museumState]);

  const totalMuseumPieces = useMemo(
    () => Object.values(pieceCounts).reduce((a, b) => a + b, 0),
    [pieceCounts]
  );

  const piecesByIsland = useMemo(() => {
    const out: Record<string, MuseumPiece[]> = {};
    for (const isl of islands) {
      if (activeMuseum.kind === 'cloud') {
        out[isl.id] = activeMuseum.pieces.filter((p) => p.islandId === isl.id);
      } else {
        const rooms = getRoomsForIsland(museumState, isl.id);
        const list: MuseumPiece[] = [];
        for (const r of rooms) {
          list.push(...getPiecesForRoom(museumState, isl.id, r.id));
        }
        out[isl.id] = list;
      }
    }
    return out;
  }, [islands, activeMuseum, museumState]);

  useEffect(() => {
    if (selectedIslandId && !islands.some((i) => i.id === selectedIslandId)) {
      setSelectedIslandId(null);
      setSelectedRoomId(null);
    }
    if (mode2D && !islands.some((i) => i.id === mode2D.islandId)) {
      setMode2D(null);
    }
  }, [islands, selectedIslandId, mode2D]);

  const markDiscovered = useCallback(
    (pieceId: string) => {
      if (activeMuseum.kind === 'cloud') {
        setCloudDiscoveredIds((prev) => {
          if (prev.includes(pieceId)) return prev;
          retroAudio.playDiscovery();
          return [...prev, pieceId];
        });
        return;
      }

      setMuseumState((prev) => {
        if (prev.discoveredIds.includes(pieceId)) return prev;
        retroAudio.playDiscovery();
        const next = { ...prev, discoveredIds: [...prev.discoveredIds, pieceId] };
        saveMuseumState(next);
        return next;
      });
    },
    [activeMuseum.kind]
  );

  const handleOpenPiece = useCallback(
    (piece: MuseumPiece) => {
      markDiscovered(piece.id);

      if (piece.id === 'base-patio-fountain') {
        const quote = FOUNTAIN_QUOTES[Math.floor(Math.random() * FOUNTAIN_QUOTES.length)];
        retroAudio.playFountain();
        setModalPayload({
          kind: 'dialogue',
          title: piece.title,
          subtitle: 'Patio 404',
          lines: [quote],
        });
        return;
      }

      if (
        piece.mediaDataUrl ||
        piece.mediaKey ||
        piece.type === 'audio' ||
        piece.type === 'video' ||
        piece.kind === 'image' ||
        piece.type === 'image'
      ) {
        if (piece.painting && !piece.mediaKey && !piece.mediaDataUrl) {
          setModalPayload({ kind: 'painting', piece, painting: piece.painting });
        } else {
          setModalPayload({ kind: 'media', piece });
        }
        return;
      }

      if (piece.app) {
        setModalPayload({ kind: 'app', app: piece.app, piece });
        return;
      }

      if (piece.painting) {
        setModalPayload({ kind: 'painting', piece, painting: piece.painting });
        return;
      }

      if (piece.kind === 'link' || piece.type === 'link') {
        setModalPayload({
          kind: 'link',
          title: piece.title,
          description: piece.subtitle || piece.body || '',
          url: piece.url || '#',
          piece,
        });
        return;
      }

      setModalPayload({
        kind: 'dialogue',
        title: piece.title,
        subtitle: piece.subtitle,
        lines: piece.lines && piece.lines.length > 0 ? piece.lines : [piece.body || ''],
        piece,
      });
    },
    [markDiscovered]
  );

  const handleSelectIsland = useCallback((islandId: string) => {
    setSelectedIslandId(islandId);
    setSelectedRoomId(null);
    if (!retroAudio.muted) retroAudio.playInteract();
  }, []);

  const anyOverlayOpen = Boolean(
    editorSource ||
      modalPayload ||
      mode2D ||
      directoryOpen ||
      createMuseumOpen ||
      characterModalOpen ||
      shareTargetPiece
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !anyOverlayOpen) {
        setSelectedIslandId(null);
        setSelectedRoomId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [anyOverlayOpen]);

  const selectedIsland = islands.find((i) => i.id === selectedIslandId) || null;
  const selectedIslandRooms = selectedIsland ? getActiveRoomsForIsland(selectedIsland.id) : [];
  const selectedPiecesByRoom = useMemo(() => {
    if (!selectedIsland) return {};
    const out: Record<string, MuseumPiece[]> = {};
    for (const r of selectedIslandRooms) {
      out[r.id] = getActivePiecesForRoom(selectedIsland.id, r.id);
    }
    return out;
  }, [selectedIsland, selectedIslandRooms, getActivePiecesForRoom]);

  const active2DIsland = mode2D ? islands.find((i) => i.id === mode2D.islandId) || null : null;
  const active2DRooms = active2DIsland ? getActiveRoomsForIsland(active2DIsland.id) : [];
  const active2DPiecesByRoom = useMemo(() => {
    if (!active2DIsland) return {};
    const out: Record<string, MuseumPiece[]> = {};
    for (const r of active2DRooms) {
      out[r.id] = getActivePiecesForRoom(active2DIsland.id, r.id);
    }
    return out;
  }, [active2DIsland, active2DRooms, getActivePiecesForRoom]);

  const isOwnerOfActiveCloud =
    activeMuseum.kind === 'cloud' && authUser?.uid === activeMuseum.museum.ownerId;
  const canEditActiveMuseum = activeMuseum.kind === 'flagship' || isOwnerOfActiveCloud;

  const activeMuseumId = activeMuseum.kind === 'cloud' ? activeMuseum.museum.id : 'museo404';
  const activeMuseumTitle =
    activeMuseum.kind === 'cloud' ? activeMuseum.museum.title : 'MUSEO 404 · siNOMBRE';
  const activeMuseumAuthor =
    activeMuseum.kind === 'cloud' ? activeMuseum.museum.authorName : 'Colección Original';

  const currentCharProfile = getCharacterProfile(characterId);

  const openEditorForCurrentMuseum = () => {
    setSelectedIslandId(null);
    if (activeMuseum.kind === 'flagship') {
      setEditorSource({
        kind: 'local',
        state: museumState,
        onUpdateState: updateState,
        theme: flagshipTheme,
        onUpdateTheme: updateFlagshipTheme,
      });
    } else if (isOwnerOfActiveCloud) {
      setEditorSource({
        kind: 'cloud',
        museum: activeMuseum.museum,
        pieces: activeMuseum.pieces,
        onSyncMuseum: (nextMuseum, nextPieces) => {
          setActiveMuseum({ kind: 'cloud', museum: nextMuseum, pieces: nextPieces });
          setEditorSource((prev) =>
            prev && prev.kind === 'cloud'
              ? { ...prev, museum: nextMuseum, pieces: nextPieces }
              : prev
          );
          setMyMuseums((prev) => prev.map((m) => (m.id === nextMuseum.id ? nextMuseum : m)));
          refreshDirectory();
        },
        onDeletedMuseum: (deletedId) => {
          setEditorSource(null);
          setMyMuseums((prev) => prev.filter((m) => m.id !== deletedId));
          openFlagshipMuseum();
          refreshDirectory();
          showToast('Museo eliminado.');
        },
      });
    }
  };

  return (
    <main
      aria-label="Museo 404 siNOMBRE, archipiélago interactivo"
      style={{ backgroundColor: activeTheme.surfaceColor }}
      className="relative h-screen w-screen overflow-hidden text-[#f8f4dd]"
    >
      {/* Barra superior del Archipiélago */}
      <header className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex flex-wrap items-start justify-between gap-3 sm:left-8 sm:right-8 sm:top-6">
        <div className="pointer-events-auto [text-shadow:0_3px_0_rgba(4,35,49,0.4)]">
          <p
            className="font-pixel text-[9px] tracking-wider sm:text-[10px]"
            style={{ color: activeTheme.accentColor }}
          >
            {activeMuseum.kind === 'cloud'
              ? `${CATEGORY_META[activeMuseum.museum.category]?.badge || 'MUSEO'} · POR ${activeMuseum.museum.authorName.toUpperCase()}`
              : 'MUSEO 404 · siNOMBRE'}
          </p>
          <h1 className="mt-1.5 text-xl font-bold leading-tight text-[#fff9e6] sm:text-3xl">
            {activeMuseum.kind === 'cloud' ? activeMuseum.museum.title : 'Un archipiélago de ideas'}
          </h1>
          <p className="mt-1 hidden text-sm text-[#e1f4e9] sm:block">
            {activeMuseum.kind === 'cloud'
              ? activeMuseum.museum.subtitle
              : 'Cada isla conserva una forma distinta de perderse.'}
          </p>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              refreshDirectory();
              setDirectoryOpen(true);
            }}
            style={{ borderColor: activeTheme.accentColor }}
            className="font-pixel inline-flex items-center gap-1.5 border-2 bg-[#0b4757]/90 px-3 py-2.5 text-[9px] text-[#fff9e6] shadow-[0_4px_0_rgba(3,35,48,0.36)] transition-transform hover:-translate-y-0.5 hover:bg-[#136578] whitespace-nowrap"
          >
            <Compass className="h-3.5 w-3.5" style={{ color: activeTheme.accentColor }} />
            <span>MUSEOS</span>
          </button>

          <button
            type="button"
            onClick={() => setCharacterModalOpen(true)}
            className="font-pixel inline-flex items-center gap-1.5 border-2 border-white/65 bg-[#053143]/85 px-3 py-2.5 text-[9px] text-[#fff9e6] shadow-[0_4px_0_rgba(3,35,48,0.36)] transition-transform hover:-translate-y-0.5 hover:bg-[#084d5b] whitespace-nowrap"
            title={`Personaje actual: ${currentCharProfile.name}`}
          >
            <UserIcon className="h-3.5 w-3.5" style={{ color: activeTheme.accentColor }} />
            <span className="hidden sm:inline">{currentCharProfile.name.split(' ')[0].toUpperCase()}</span>
            <span className="sm:hidden">AVATAR</span>
          </button>

          <button
            type="button"
            onClick={() => setWorldView((prev) => (prev === '3d' ? 'map' : '3d'))}
            className="font-pixel inline-flex items-center gap-1.5 border-2 border-[#7fd6cc] bg-[#0c4a59]/90 px-3 py-2.5 text-[9px] text-[#fff9e6] shadow-[0_4px_0_rgba(3,35,48,0.36)] transition-transform hover:-translate-y-0.5 hover:bg-[#136578] whitespace-nowrap"
          >
            {worldView === '3d' ? (
              <>
                <MapIcon className="h-3.5 w-3.5 text-[#f4d47d]" />
                <span>MAPA 2D</span>
              </>
            ) : (
              <>
                <Box className="h-3.5 w-3.5 text-[#f4d47d]" />
                <span>CAMINAR 3D</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setBgmActive(retroAudio.toggleBgm())}
            className="font-pixel inline-flex items-center gap-1.5 border-2 border-white/65 bg-[#053143]/80 px-3 py-2.5 text-[9px] text-[#fff9e6] shadow-[0_4px_0_rgba(3,35,48,0.36)] transition-transform hover:-translate-y-0.5 hover:bg-[#084d5b] whitespace-nowrap"
          >
            {bgmActive ? <Volume2 className="h-3.5 w-3.5 text-[#f4d47d]" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden md:inline">{bgmActive ? 'SONIDO: ON' : 'SONIDO'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setModalPayload({
                kind: 'dialogue',
                title: 'MUSEO 404 siNOMBRE · Red de Creadores',
                subtitle: 'Archipiélago de ideas',
                lines: [
                  'Cada museo es un archipiélago interactivo: puede ser una galería de arte, un club de recomendaciones musicales, la carta viva de un restaurante o un archivo personal.',
                  'En «Museos» puedes visitar las islas creadas por otras personas o lanzar tu propio museo con tus colores y personaje favorito.',
                  'Cuando encuentres una obra, disco o platillo que te encante en cualquier museo, haz clic en «Compartir en mi museo» para exhibirlo en una de tus salas citando al autor original.',
                ],
              })
            }
            className="font-pixel inline-flex items-center gap-1.5 border-2 border-white/65 bg-[#053143]/80 px-3 py-2.5 text-[9px] text-[#fff9e6] shadow-[0_4px_0_rgba(3,35,48,0.36)] transition-transform hover:-translate-y-0.5 hover:bg-[#084d5b] whitespace-nowrap"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">AYUDA</span>
          </button>

          {canEditActiveMuseum ? (
            <button
              type="button"
              onClick={openEditorForCurrentMuseum}
              className="font-pixel inline-flex items-center gap-1.5 border-2 border-[#f2d17b] bg-[#724527]/95 px-3 py-2.5 text-[9px] text-[#fff9e6] shadow-[0_4px_0_rgba(3,35,48,0.36)] transition-transform hover:-translate-y-0.5 hover:bg-[#8d5531] whitespace-nowrap"
            >
              <Pencil className="h-3.5 w-3.5 text-[#f4d47d]" />
              <span>EDITAR MUSEO</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCreateMuseumOpen(true)}
              className="font-pixel inline-flex items-center gap-1.5 border-2 border-[#f2d17b] bg-[#724527]/95 px-3 py-2.5 text-[9px] text-[#fff9e6] shadow-[0_4px_0_rgba(3,35,48,0.36)] transition-transform hover:-translate-y-0.5 hover:bg-[#8d5531] whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 text-[#f4d47d]" />
              <span>CREAR MI MUSEO</span>
            </button>
          )}

          {authUser ? (
            <button
              type="button"
              onClick={async () => {
                await signOutCreator();
                showToast('Sesión cerrada.');
              }}
              title={`Conectado como ${authUser.displayName || 'Creador'}. Clic para cerrar sesión.`}
              className="font-pixel inline-flex items-center gap-1.5 border-2 border-white/55 bg-[#053143]/85 px-2.5 py-2.5 text-[9px] text-[#d0e6da] shadow-[0_4px_0_rgba(3,35,48,0.36)] transition-transform hover:-translate-y-0.5 hover:bg-[#603d3d] hover:text-white whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">SALIR</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="font-pixel inline-flex items-center gap-1.5 border-2 border-[#7fd6cc] bg-[#145869]/90 px-3 py-2.5 text-[9px] text-[#fff9e6] shadow-[0_4px_0_rgba(3,35,48,0.36)] transition-transform hover:-translate-y-0.5 hover:bg-[#1c7388] whitespace-nowrap"
            >
              <LogIn className="h-3.5 w-3.5 text-[#f4d47d]" />
              <span>ENTRAR</span>
            </button>
          )}
        </div>
      </header>

      {/* Vista 3D de cerca estilo Mario 64 o Mapa Isométrico 2D */}
      {worldView === '3d' ? (
        <Archipelago3D
          islands={islands}
          piecesByIsland={piecesByIsland}
          characterId={characterId}
          theme={activeTheme}
          controlsPaused={anyOverlayOpen}
          onSelectIsland={handleSelectIsland}
          onOpenPiece={handleOpenPiece}
          onEnter2DMode={(islandId) => {
            const islandRooms = getActiveRoomsForIsland(islandId);
            if (islandRooms.length > 0) {
              setSelectedIslandId(null);
              setMode2D({ islandId, roomId: islandRooms[0].id });
            } else {
              handleSelectIsland(islandId);
            }
          }}
        />
      ) : (
        <ArchipelagoMap
          islands={islands}
          roomCounts={roomCounts}
          pieceCounts={pieceCounts}
          selectedIslandId={selectedIslandId}
          characterId={characterId}
          theme={activeTheme}
          controlsPaused={anyOverlayOpen}
          onSelectIsland={handleSelectIsland}
        />
      )}

      {/* Panel lateral de colección de la isla */}
      {!mode2D && (
        <IslandDrawer
          island={selectedIsland}
          rooms={selectedIslandRooms}
          selectedRoomId={selectedRoomId}
          piecesByRoom={selectedPiecesByRoom}
          theme={activeTheme}
          onSelectRoom={setSelectedRoomId}
          onOpenPiece={handleOpenPiece}
          onEnter2DMode={(islandId, roomId) => {
            setSelectedIslandId(null);
            setMode2D({ islandId, roomId });
          }}
          onClose={() => {
            setSelectedIslandId(null);
            setSelectedRoomId(null);
          }}
        />
      )}

      {/* Modo de Exploración Interior 2D */}
      {mode2D && active2DIsland && (
        <RoomExplorer2D
          island={active2DIsland}
          rooms={active2DRooms}
          initialRoomId={mode2D.roomId}
          piecesByRoom={active2DPiecesByRoom}
          characterId={characterId}
          theme={activeTheme}
          discoveredCount={
            activeMuseum.kind === 'cloud'
              ? cloudDiscoveredIds.length
              : museumState.discoveredIds.length
          }
          totalMuseumPieces={totalMuseumPieces}
          isModalOpen={Boolean(
            modalPayload || editorSource || shareTargetPiece || characterModalOpen
          )}
          onOpenPiece={handleOpenPiece}
          onOpenSign={(title, content) =>
            setModalPayload({ kind: 'dialogue', title, lines: [content] })
          }
          onExitToArchipelago={() => setMode2D(null)}
        />
      )}

      {/* Directorio de Museos */}
      <MuseumDirectoryModal
        isOpen={directoryOpen}
        authUser={authUser}
        publicMuseums={publicMuseums}
        myMuseums={myMuseums}
        activeMuseumId={activeMuseum.kind === 'cloud' ? activeMuseum.museum.id : 'flagship'}
        loading={directoryLoading}
        error={directoryError}
        onRefresh={() => refreshDirectory()}
        onOpenFlagship={openFlagshipMuseum}
        onOpenCloudMuseum={openCloudMuseum}
        onOpenEditorForMuseum={async (museum) => {
          try {
            const pieces = await fetchMuseumPieces(museum.id, museum.ownerId);
            setDirectoryOpen(false);
            setActiveMuseum({ kind: 'cloud', museum, pieces });
            setEditorSource({
              kind: 'cloud',
              museum,
              pieces,
              onSyncMuseum: (nextMuseum, nextPieces) => {
                setActiveMuseum({ kind: 'cloud', museum: nextMuseum, pieces: nextPieces });
                setEditorSource((prev) =>
                  prev && prev.kind === 'cloud'
                    ? { ...prev, museum: nextMuseum, pieces: nextPieces }
                    : prev
                );
                setMyMuseums((prev) =>
                  prev.map((m) => (m.id === nextMuseum.id ? nextMuseum : m))
                );
                refreshDirectory();
              },
              onDeletedMuseum: (deletedId) => {
                setEditorSource(null);
                setMyMuseums((prev) => prev.filter((m) => m.id !== deletedId));
                openFlagshipMuseum();
                refreshDirectory();
                showToast('Museo eliminado.');
              },
            });
          } catch (err) {
            showToast(err instanceof Error ? err.message : 'No se pudo abrir el editor.');
          }
        }}
        onOpenCreateMuseum={() => {
          setDirectoryOpen(false);
          setCreateMuseumOpen(true);
        }}
        onSignIn={handleSignIn}
        onClose={() => setDirectoryOpen(false)}
      />

      {/* Crear Nuevo Museo */}
      <CreateMuseumModal
        isOpen={createMuseumOpen}
        authUser={authUser}
        onSignIn={handleSignIn}
        onCreated={({ museum, pieces }) => {
          setCreateMuseumOpen(false);
          setMyMuseums((prev) => [museum, ...prev]);
          setActiveMuseum({ kind: 'cloud', museum, pieces });
          setCloudDiscoveredIds([]);
          setSelectedIslandId(null);
          setSelectedRoomId(null);
          setMode2D(null);
          refreshDirectory();
          showToast(`¡Museo «${museum.title}» creado!`);
        }}
        onClose={() => setCreateMuseumOpen(false)}
      />

      {/* Selector de Personaje */}
      <CharacterSelectorModal
        isOpen={characterModalOpen}
        selectedCharacterId={characterId}
        onSelectCharacter={handleSelectCharacter}
        onClose={() => setCharacterModalOpen(false)}
      />

      {/* Compartir obra en mi museo */}
      <SharePieceModal
        piece={shareTargetPiece}
        sourceMuseumId={activeMuseumId}
        sourceMuseumTitle={activeMuseumTitle}
        sourceAuthorName={activeMuseumAuthor}
        authUser={authUser}
        myMuseums={myMuseums}
        onSignIn={handleSignIn}
        onOpenCreateMuseum={() => setCreateMuseumOpen(true)}
        onCurated={(targetMuseumId, createdPiece) => {
          setMyMuseums((prev) =>
            prev.map((m) =>
              m.id === targetMuseumId ? { ...m, pieceCount: m.pieceCount + 1 } : m
            )
          );
          if (activeMuseum.kind === 'cloud' && activeMuseum.museum.id === targetMuseumId) {
            setActiveMuseum({
              kind: 'cloud',
              museum: {
                ...activeMuseum.museum,
                pieceCount: activeMuseum.museum.pieceCount + 1,
              },
              pieces: [...activeMuseum.pieces, createdPiece],
            });
          }
          refreshDirectory();
          showToast(`Obra compartida en tu museo correctamente.`);
        }}
        onClose={() => setShareTargetPiece(null)}
      />

      {/* Editor del Museo (Local o en la Nube) */}
      {editorSource && (
        <MuseumEditor source={editorSource} onClose={() => setEditorSource(null)} />
      )}

      {/* Visor unificado de diálogos, pinturas, multimedia y mini-apps */}
      <ContentModal
        payload={modalPayload}
        onSharePiece={(piece) => setShareTargetPiece(piece)}
        onVisitSourceMuseum={(sourceId) => openMuseumById(sourceId)}
        onClose={() => setModalPayload(null)}
      />

      {/* Aviso breve no intrusivo */}
      {toastMessage && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 border-2 border-[#e1c875] bg-[#072634] px-4 py-2 text-xs font-semibold text-[#fff9e6] shadow-xl"
        >
          {toastMessage}
        </div>
      )}
    </main>
  );
}

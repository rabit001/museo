import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Share2, Compass } from 'lucide-react';
import { retroAudio } from '../game/audio';
import { renderProceduralPainting } from '../game/spriteRenderer';
import { getMedia } from '../storage/mediaDb';
import { InteractiveAppData, MuseumPiece, PaintingData } from '../types/museum';

export type ModalPayload =
  | { kind: 'dialogue'; title: string; lines: string[]; subtitle?: string; piece?: MuseumPiece }
  | { kind: 'painting'; piece: MuseumPiece; painting: PaintingData }
  | { kind: 'app'; app: InteractiveAppData; piece?: MuseumPiece }
  | { kind: 'media'; piece: MuseumPiece }
  | { kind: 'link'; title: string; description: string; url: string; piece?: MuseumPiece };

interface ContentModalProps {
  payload: ModalPayload | null;
  onSharePiece?: (piece: MuseumPiece) => void;
  onVisitSourceMuseum?: (sourceMuseumId: string) => void;
  onClose: () => void;
}

const PREFIXES = ['Auto', 'Crono', 'Neuro', 'Paleo', 'Linguo', 'Umbro', 'Aero', 'Somno', 'Astro', 'Gloso'];
const ROOTS = ['morfia', 'cronia', 'lalia', 'scopia', 'gnosis', 'feria', 'fagia', 'taxis', 'stasia', 'nomia'];
const DEFS = [
  'El acto de recordar una palabra olvidada justo antes de pronunciar otra equivocada.',
  'Fenómeno donde las letras impresas parecen pesar más en las páginas pares.',
  'Sensación de entrar a un cuarto vacío que fue diseñado exclusivamente para ti.',
  'Geometría secreta de las conversaciones que ocurren a medianoche en voz baja.',
  'Canto inaudible que producen los libros cuando se cierran bruscamente.',
];

const PROPHECIES = [
  '«La puerta que buscas no tiene cerradura: sólo espera que dejes de empujarla.»',
  '«En el minuto 404, todas las respuestas se vuelven preguntas más hermosas.»',
  '«Lo que no cabe en una palabra, desborda siempre en una mirada.»',
  '«No apresures el paso: el cuarto al que te diriges está terminando de nacer.»',
  '«El silencio del umbral contiene más tinta que diez enciclopedias.»',
];

export const ContentModal: React.FC<ContentModalProps> = ({
  payload,
  onSharePiece,
  onVisitSourceMuseum,
  onClose,
}) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Estado de mini-apps
  const [genWord, setGenWord] = useState('LUMENCRONIA');
  const [genDef, setGenDef] = useState(
    'f. Medida del tiempo calculada exclusivamente por la sombra que proyecta una duda.'
  );
  const [oracleText, setOracleText] = useState(
    '«Todo lo que buscas ya está en el mapa, pero el mapa sólo se dibuja caminando.»'
  );
  const [morseStream, setMorseStream] = useState('');

  // Multimedia desde IndexedDB o DataURL en la nube
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const paintingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePiece: MuseumPiece | undefined = payload?.piece;

  useEffect(() => {
    if (!payload || payload.kind !== 'dialogue') return;
    setLineIndex(0);
  }, [payload]);

  useEffect(() => {
    if (!payload || payload.kind !== 'dialogue') return;
    const current = payload.lines[lineIndex] ?? '';
    if (current.length > 280) {
      setTypedText(current);
      setIsTyping(false);
      return;
    }

    setTypedText('');
    setIsTyping(true);
    let idx = 0;
    const timer = window.setInterval(() => {
      idx += 1;
      setTypedText(current.slice(0, idx));
      if (idx % 2 === 0) retroAudio.playTextBlip();
      if (idx >= current.length) {
        window.clearInterval(timer);
        setIsTyping(false);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [payload, lineIndex]);

  useEffect(() => {
    let activeUrl: string | null = null;
    setMediaUrl(null);
    setMediaError(null);

    if (!payload) return;
    const piece =
      payload.kind === 'media' || payload.kind === 'painting' ? payload.piece : undefined;
    if (!piece) return;

    if (piece.mediaDataUrl) {
      setMediaUrl(piece.mediaDataUrl);
      return;
    }

    const mediaKey = piece.mediaKey;
    if (!mediaKey) return;

    let cancelled = false;
    getMedia(mediaKey).then((blob) => {
      if (cancelled) return;
      if (!blob) {
        setMediaError('No se encontró el archivo guardado en este navegador.');
        return;
      }
      activeUrl = URL.createObjectURL(blob);
      setMediaUrl(activeUrl);
    });

    return () => {
      cancelled = true;
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [payload]);

  useEffect(() => {
    if (!payload || payload.kind !== 'painting' || mediaUrl) return;
    if (paintingCanvasRef.current) {
      renderProceduralPainting(paintingCanvasRef.current, payload.painting);
    }
  }, [payload, mediaUrl]);

  const handleAdvanceDialogue = () => {
    if (!payload || payload.kind !== 'dialogue') return;
    const current = payload.lines[lineIndex] ?? '';
    if (isTyping) {
      setTypedText(current);
      setIsTyping(false);
      return;
    }
    if (lineIndex + 1 < payload.lines.length) {
      setLineIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const pulseTelegraph = (type: 'DOT' | 'DASH') => {
    setMorseStream((prev) => prev + (type === 'DOT' ? ' • ' : ' ▬ '));
    retroAudio.playTone(type === 'DOT' ? 880 : 440, 'square', type === 'DOT' ? 0.06 : 0.18, 0.22);
  };

  useEffect(() => {
    if (!payload) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (payload.kind === 'dialogue' && (e.code === 'KeyZ' || e.code === 'Enter' || e.code === 'Space')) {
        if (e.code === 'Space' && (payload.lines[lineIndex]?.length || 0) > 280) return;
        e.preventDefault();
        handleAdvanceDialogue();
      } else if (payload.kind === 'app' && payload.app.interactiveType === 'telegraph') {
        if (e.code === 'KeyZ') {
          e.preventDefault();
          pulseTelegraph('DOT');
        } else if (e.code === 'KeyX') {
          e.preventDefault();
          pulseTelegraph('DASH');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!payload) return null;

  const curatedFrom = activePiece?.curatedFrom;

  const renderCuratedBanner = () => {
    if (!curatedFrom) return null;
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-2 border-[#1d6873]/40 bg-[#e4e9d3] px-3.5 py-2.5 text-xs text-[#193d46]">
        <span>
          Compartido desde <strong>«{curatedFrom.sourceMuseumTitle}»</strong> · por{' '}
          <strong>{curatedFrom.sourceAuthorName}</strong>
        </span>
        {onVisitSourceMuseum && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onVisitSourceMuseum(curatedFrom.sourceMuseumId);
            }}
            className="inline-flex items-center gap-1 border border-[#183c49] bg-[#1d6873] px-2.5 py-1 text-[11px] font-bold text-[#fff9e5] hover:bg-[#b25f37]"
          >
            <Compass className="h-3 w-3" />
            Visitar museo de origen
          </button>
        )}
      </div>
    );
  };

  const renderShareButton = () => {
    if (!activePiece || !onSharePiece) return null;
    return (
      <button
        type="button"
        onClick={() => onSharePiece(activePiece)}
        className="font-pixel inline-flex items-center gap-1.5 border-2 border-[#183c49] bg-[#bd7544] px-3.5 py-2.5 text-[9px] text-[#fff9e5] transition-colors hover:bg-[#a24d2e]"
      >
        <Share2 className="h-3.5 w-3.5" />
        COMPARTIR EN MI MUSEO
      </button>
    );
  };

  const effectiveMediaUrl = mediaUrl || (payload.kind === 'media' && payload.piece.url ? payload.piece.url : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#02141f]/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="museum-scroll relative max-h-[88vh] w-full max-w-[740px] overflow-y-auto border-4 border-[#163d4a] bg-[#f1efd9] p-6 text-[#1c343a] shadow-[0_0_0_3px_#e2c56c,0_20px_65px_rgba(0,0,0,0.58)] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="float-right ml-4 flex h-9 w-9 items-center justify-center border-2 border-[#183c49] bg-[#1d6873] text-[#fff9e5] transition-colors hover:bg-[#b25f37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163d4a]"
        >
          <X className="h-4 w-4" />
        </button>

        {renderCuratedBanner()}

        {payload.kind === 'dialogue' && (
          <div>
            {payload.subtitle && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#507a78]">
                {payload.subtitle}
              </p>
            )}
            <h2 className="mb-4 text-balance text-2xl font-bold leading-tight text-[#a24d2e]">
              {payload.title}
            </h2>
            <div className="max-w-[65ch] whitespace-pre-wrap text-[17px] leading-[1.7] text-[#203b40]">
              {typedText}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#183c49]/15 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                {renderShareButton()}
                {payload.lines.length > 1 && (
                  <span className="text-xs text-[#507a78] tabular-nums">
                    Fragmento {lineIndex + 1} de {payload.lines.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleAdvanceDialogue}
                className="font-pixel ml-auto border-2 border-[#183c49] bg-[#1d6873] px-4 py-2.5 text-[10px] text-[#fff9e5] transition-colors hover:bg-[#b25f37]"
              >
                {isTyping
                  ? 'COMPLETAR'
                  : lineIndex + 1 < payload.lines.length
                    ? 'SIGUIENTE [Z]'
                    : 'CERRAR [ENTER]'}
              </button>
            </div>
          </div>
        )}

        {payload.kind === 'painting' && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#507a78]">
              {payload.painting.year || 'Galería Visual'}
            </p>
            <h2 className="mb-4 text-balance text-2xl font-bold leading-tight text-[#a24d2e]">
              {payload.piece.title}
            </h2>
            <div className="flex flex-col items-center border-2 border-[#163d4a] bg-[#09202a] p-4">
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt={payload.piece.title}
                  className="max-h-[55vh] w-auto max-w-full border-4 border-[#bb9a51] object-contain"
                />
              ) : (
                <canvas
                  ref={paintingCanvasRef}
                  width={160}
                  height={120}
                  className="pixelated h-auto w-full max-w-[420px] border-4 border-[#bb9a51] bg-black"
                />
              )}
            </div>
            {payload.painting.palette?.length > 0 && !mediaUrl && (
              <div className="mt-4 flex items-center gap-2 text-xs text-[#507a78]">
                <span>Paleta cromática:</span>
                {payload.painting.palette.map((color, i) => (
                  <span
                    key={i}
                    className="inline-block h-3.5 w-3.5 border border-[#163d4a]"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
            {(payload.piece.body || payload.painting.desc) && (
              <p className="mt-4 max-w-[65ch] whitespace-pre-wrap text-[16px] leading-relaxed text-[#203b40]">
                {payload.piece.body || payload.painting.desc}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#183c49]/15 pt-4">
              {renderShareButton()}
              <button
                type="button"
                onClick={onClose}
                className="font-pixel ml-auto border-2 border-[#183c49] bg-[#1d6873] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
              >
                CERRAR [ESC]
              </button>
            </div>
          </div>
        )}

        {payload.kind === 'app' && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#507a78]">
              {payload.app.subtitle}
            </p>
            <h2 className="mb-3 text-balance text-2xl font-bold leading-tight text-[#a24d2e]">
              {payload.app.title}
            </h2>
            <p className="mb-4 text-[16px] text-[#203b40]">{payload.app.desc}</p>

            {payload.app.interactiveType === 'word_generator' && (
              <div>
                <div className="border-2 border-[#bd9d50] bg-[#153c43] p-5 text-[#eff0d9]">
                  <h3 className="font-pixel mb-3 text-sm text-[#f8b800]">«{genWord}»</h3>
                  <p className="text-[16px] leading-relaxed">{genDef}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const word =
                        PREFIXES[Math.floor(Math.random() * PREFIXES.length)] +
                        ROOTS[Math.floor(Math.random() * ROOTS.length)];
                      const def = DEFS[Math.floor(Math.random() * DEFS.length)];
                      setGenWord(word.toUpperCase());
                      setGenDef(`f. ${def}`);
                      retroAudio.playDiscovery();
                    }}
                    className="font-pixel border-2 border-[#183c49] bg-[#1d6873] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
                  >
                    GENERAR PALABRA
                  </button>
                  {renderShareButton()}
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-pixel border-2 border-[#183c49] bg-[#2a4a53] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
                  >
                    SALIR
                  </button>
                </div>
              </div>
            )}

            {payload.app.interactiveType === 'oracle' && (
              <div>
                <div className="border-2 border-[#bd9d50] bg-[#153c43] p-5 text-[#eff0d9]">
                  <p className="text-lg leading-relaxed text-[#f8d879]">{oracleText}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOracleText(PROPHECIES[Math.floor(Math.random() * PROPHECIES.length)]);
                      retroAudio.playFountain();
                    }}
                    className="font-pixel border-2 border-[#183c49] bg-[#1d6873] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
                  >
                    CONSULTAR ORÁCULO
                  </button>
                  {renderShareButton()}
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-pixel border-2 border-[#183c49] bg-[#2a4a53] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
                  >
                    SALIR
                  </button>
                </div>
              </div>
            )}

            {payload.app.interactiveType === 'telegraph' && (
              <div>
                <div className="min-h-[76px] border-2 border-[#bd9d50] bg-[#153c43] p-4 font-mono text-base text-[#75e4dc]">
                  {morseStream || '[LISTO PARA TRANSMITIR...]'}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => pulseTelegraph('DOT')}
                    className="font-pixel border-2 border-[#183c49] bg-[#1d6873] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
                  >
                    ● PUNTO [Z]
                  </button>
                  <button
                    type="button"
                    onClick={() => pulseTelegraph('DASH')}
                    className="font-pixel border-2 border-[#183c49] bg-[#1d6873] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
                  >
                    ▬ RAYA [X]
                  </button>
                  <button
                    type="button"
                    onClick={() => setMorseStream('')}
                    className="font-pixel border-2 border-[#183c49] bg-[#45556a] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
                  >
                    LIMPIAR
                  </button>
                  {renderShareButton()}
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-pixel border-2 border-[#183c49] bg-[#2a4a53] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
                  >
                    SALIR
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {payload.kind === 'media' && (
          <div>
            {payload.piece.subtitle && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#507a78]">
                {payload.piece.subtitle}
              </p>
            )}
            <h2 className="mb-4 text-balance text-2xl font-bold leading-tight text-[#a24d2e]">
              {payload.piece.title}
            </h2>
            {payload.piece.body && (
              <p className="mb-4 max-w-[65ch] whitespace-pre-wrap text-[17px] leading-[1.7] text-[#203b40]">
                {payload.piece.body}
              </p>
            )}
            {mediaError && <p className="text-sm text-[#9a3412]">{mediaError}</p>}
            {effectiveMediaUrl && (payload.piece.type === 'image' || payload.piece.kind === 'image') && (
              <img
                src={effectiveMediaUrl}
                alt={payload.piece.title}
                className="mx-auto my-4 max-h-[60vh] max-w-full border-4 border-[#bb9a51] object-contain"
              />
            )}
            {effectiveMediaUrl && (payload.piece.type === 'audio' || payload.piece.kind === 'audio') && (
              <audio controls src={effectiveMediaUrl} className="my-4 w-full" />
            )}
            {effectiveMediaUrl && (payload.piece.type === 'video' || payload.piece.kind === 'video') && (
              <video
                controls
                src={effectiveMediaUrl}
                className="mx-auto my-4 max-h-[60vh] max-w-full border-4 border-[#bb9a51]"
              />
            )}
            {payload.piece.url && (
              <a
                href={payload.piece.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 border-2 border-[#183c49] bg-[#1d6873] px-4 py-2.5 text-sm font-bold text-[#fff9e5] hover:bg-[#b25f37]"
              >
                Abrir enlace externo <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#183c49]/15 pt-4">
              {renderShareButton()}
              <button
                type="button"
                onClick={onClose}
                className="font-pixel ml-auto border-2 border-[#183c49] bg-[#2a4a53] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
              >
                CERRAR [ESC]
              </button>
            </div>
          </div>
        )}

        {payload.kind === 'link' && (
          <div>
            <h2 className="mb-3 text-balance text-2xl font-bold leading-tight text-[#a24d2e]">
              {payload.title}
            </h2>
            <p className="mb-4 text-[16px] leading-relaxed text-[#203b40]">
              {payload.description}
            </p>
            <p className="mb-6 break-all text-sm text-[#507a78]">
              Destino: <strong className="text-[#163d4a]">{payload.url}</strong>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={payload.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel inline-flex items-center gap-2 border-2 border-[#183c49] bg-[#1d6873] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
              >
                ABRIR ENLACE <ExternalLink className="h-3.5 w-3.5" />
              </a>
              {renderShareButton()}
              <button
                type="button"
                onClick={onClose}
                className="font-pixel ml-auto border-2 border-[#183c49] bg-[#2a4a53] px-4 py-2.5 text-[10px] text-[#fff9e5] hover:bg-[#b25f37]"
              >
                VOLVER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

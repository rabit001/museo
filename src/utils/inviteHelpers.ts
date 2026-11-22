/**
 * Isla Prestada invites helper utilities:
 * - Human-readable dates and elapsed time.
 * - Suggested expiration window calculations (e.g. 14 days).
 * - Capacity warnings (active loans per island / museum).
 */

export const DEFAULT_LOAN_SUGGESTED_DURATION_DAYS = 14;

export function formatReadableDate(isoString: string): string {
  if (!isoString) return 'Fecha no disponible';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return 'Fecha no disponible';
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatElapsedTime(isoString: string, now: Date = new Date()): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';

  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return 'hace un momento';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'hace unos segundos';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;

  const diffYears = Math.floor(diffDays / 365);
  return `hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
}

export function getSuggestedExpiration(
  createdAtIso: string,
  durationDays: number = DEFAULT_LOAN_SUGGESTED_DURATION_DAYS
): {
  expirationDateStr: string;
  isExpired: boolean;
  daysRemaining: number;
} {
  const d = new Date(createdAtIso);
  if (Number.isNaN(d.getTime())) {
    return { expirationDateStr: '', isExpired: false, daysRemaining: 0 };
  }

  const expDate = new Date(d.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = expDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    expirationDateStr: expDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    isExpired: diffMs <= 0,
    daysRemaining: Math.max(0, daysRemaining),
  };
}

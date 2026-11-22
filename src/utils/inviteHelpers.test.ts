import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseDateSafe,
  formatReadableDate,
  formatElapsedTime,
  getSuggestedReviewWindow,
  evaluateInviteExpiration,
  DEFAULT_LOAN_SUGGESTED_DURATION_DAYS,
} from './inviteHelpers.ts';

test('parseDateSafe handles various date types and invalid values', () => {
  assert.equal(parseDateSafe(null), null);
  assert.equal(parseDateSafe(undefined), null);
  assert.equal(parseDateSafe(''), null);
  assert.equal(parseDateSafe('invalid-date-string'), null);

  const dateObj = new Date('2026-11-20T10:00:00Z');
  assert.equal(parseDateSafe(dateObj)?.getTime(), dateObj.getTime());

  const isoStr = '2026-11-20T10:00:00Z';
  assert.equal(parseDateSafe(isoStr)?.getTime(), dateObj.getTime());

  // Firestore Timestamp duck-typing
  const firestoreTimestamp = {
    toDate: () => new Date('2026-11-20T10:00:00Z'),
  };
  assert.equal(parseDateSafe(firestoreTimestamp)?.getTime(), dateObj.getTime());
});

test('formatReadableDate returns formatted date or fallback', () => {
  assert.equal(formatReadableDate(''), 'Fecha no disponible');
  assert.equal(formatReadableDate('invalid-date'), 'Fecha no disponible');
  assert.equal(formatReadableDate(null), 'Fecha no disponible');

  const d = new Date('2026-11-20T12:00:00Z');
  const formatted = formatReadableDate(d.toISOString());
  assert.ok(formatted.length > 0);
  assert.ok(formatted.includes('2026'));
});

test('formatElapsedTime calculates elapsed time accurately in Spanish', () => {
  const baseTime = new Date('2026-11-22T12:00:00Z');

  assert.equal(formatElapsedTime('', baseTime), '');
  assert.equal(formatElapsedTime('invalid', baseTime), '');
  assert.equal(formatElapsedTime(null, baseTime), '');

  const secondsAgo = new Date(baseTime.getTime() - 15 * 1000).toISOString();
  assert.equal(formatElapsedTime(secondsAgo, baseTime), 'hace unos segundos');

  const minutesAgo = new Date(baseTime.getTime() - 5 * 60 * 1000).toISOString();
  assert.equal(formatElapsedTime(minutesAgo, baseTime), 'hace 5 minutos');

  const hoursAgo = new Date(baseTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
  assert.equal(formatElapsedTime(hoursAgo, baseTime), 'hace 2 horas');

  const daysAgo = new Date(baseTime.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatElapsedTime(daysAgo, baseTime), 'hace 3 días');
});

test('pending invitation older than 14 days is NOT marked expired', () => {
  const baseTime = new Date('2026-11-22T12:00:00Z');
  const twentyDaysAgo = new Date(baseTime.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();

  const evalResult = evaluateInviteExpiration(
    { createdAt: twentyDaysAgo, status: 'pending' },
    baseTime
  );

  // Critical requirement: pending invitation older than 14 days must NOT be marked expired
  assert.equal(evalResult.isEnforcedExpired, false);
  assert.equal(evalResult.enforcedExpirationStr, undefined);
  // It only flags that the suggested review window has elapsed
  assert.equal(evalResult.suggestedReview.isPastSuggestedWindow, true);
  assert.equal(evalResult.suggestedReview.daysRemaining, 0);
});

test('boundary dates around the 14-day suggested window', () => {
  const baseTime = new Date('2026-11-22T12:00:00Z');

  // Exactly 13 days ago (1 day remaining in suggested review window)
  const thirteenDaysAgo = new Date(baseTime.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString();
  const res13 = getSuggestedReviewWindow(thirteenDaysAgo, DEFAULT_LOAN_SUGGESTED_DURATION_DAYS, baseTime);
  assert.equal(res13.isPastSuggestedWindow, false);
  assert.equal(res13.daysRemaining, 1);

  // Exactly 14 days ago (0 days remaining, at boundary)
  const fourteenDaysAgo = new Date(baseTime.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const res14 = getSuggestedReviewWindow(fourteenDaysAgo, DEFAULT_LOAN_SUGGESTED_DURATION_DAYS, baseTime);
  assert.equal(res14.isPastSuggestedWindow, true);
  assert.equal(res14.daysRemaining, 0);

  // 1 day ago (13 days remaining)
  const oneDayAgo = new Date(baseTime.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
  const res1 = getSuggestedReviewWindow(oneDayAgo, DEFAULT_LOAN_SUGGESTED_DURATION_DAYS, baseTime);
  assert.equal(res1.isPastSuggestedWindow, false);
  assert.equal(res1.daysRemaining, 13);
});

test('actual expired invitation when backend supports expiresAt', () => {
  const baseTime = new Date('2026-11-22T12:00:00Z');
  const pastExpiresAt = new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

  const evalResult = evaluateInviteExpiration(
    {
      createdAt: new Date(baseTime.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: pastExpiresAt,
      status: 'pending',
    },
    baseTime
  );

  assert.equal(evalResult.isEnforcedExpired, true);
  assert.ok(evalResult.enforcedExpirationStr !== undefined);
});

test('future enforced expiration date is not expired', () => {
  const baseTime = new Date('2026-11-22T12:00:00Z');
  const futureExpiresAt = new Date(baseTime.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();

  const evalResult = evaluateInviteExpiration(
    {
      createdAt: new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: futureExpiresAt,
      status: 'pending',
    },
    baseTime
  );

  assert.equal(evalResult.isEnforcedExpired, false);
  assert.ok(evalResult.enforcedExpirationStr !== undefined);
});

test('accepted and revoked invitations with evaluation helper', () => {
  const baseTime = new Date('2026-11-22T12:00:00Z');
  const createdAt = new Date(baseTime.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();

  const acceptedEval = evaluateInviteExpiration({ createdAt, status: 'accepted' }, baseTime);
  assert.equal(acceptedEval.isEnforcedExpired, false);
  assert.equal(acceptedEval.suggestedReview.isPastSuggestedWindow, false);

  const revokedEval = evaluateInviteExpiration({ createdAt, status: 'revoked' }, baseTime);
  assert.equal(revokedEval.isEnforcedExpired, false);
  assert.equal(revokedEval.suggestedReview.isPastSuggestedWindow, false);
});

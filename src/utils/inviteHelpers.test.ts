import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatReadableDate,
  formatElapsedTime,
  getSuggestedExpiration,
  DEFAULT_LOAN_SUGGESTED_DURATION_DAYS,
} from './inviteHelpers.ts';

test('formatReadableDate returns formatted date or fallback', () => {
  assert.equal(formatReadableDate(''), 'Fecha no disponible');
  assert.equal(formatReadableDate('invalid-date'), 'Fecha no disponible');
  const d = new Date('2026-11-20T12:00:00Z');
  const formatted = formatReadableDate(d.toISOString());
  assert.ok(formatted.length > 0);
  assert.ok(formatted.includes('2026'));
});

test('formatElapsedTime calculates elapsed time accurately', () => {
  const baseTime = new Date('2026-11-22T12:00:00Z');
  
  assert.equal(formatElapsedTime('', baseTime), '');
  assert.equal(formatElapsedTime('invalid', baseTime), '');

  const secondsAgo = new Date(baseTime.getTime() - 15 * 1000).toISOString();
  assert.equal(formatElapsedTime(secondsAgo, baseTime), 'hace unos segundos');

  const minutesAgo = new Date(baseTime.getTime() - 5 * 60 * 1000).toISOString();
  assert.equal(formatElapsedTime(minutesAgo, baseTime), 'hace 5 minutos');

  const hoursAgo = new Date(baseTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
  assert.equal(formatElapsedTime(hoursAgo, baseTime), 'hace 2 horas');

  const daysAgo = new Date(baseTime.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(formatElapsedTime(daysAgo, baseTime), 'hace 3 días');
});

test('getSuggestedExpiration evaluates remaining days and expiration', () => {
  const recent = new Date().toISOString();
  const res = getSuggestedExpiration(recent, DEFAULT_LOAN_SUGGESTED_DURATION_DAYS);
  assert.equal(res.isExpired, false);
  assert.ok(res.daysRemaining >= 13 && res.daysRemaining <= 14);
  assert.ok(res.expirationDateStr.length > 0);

  const past = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
  const resPast = getSuggestedExpiration(past, 14);
  assert.equal(resPast.isExpired, true);
  assert.equal(resPast.daysRemaining, 0);
});

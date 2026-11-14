/**
 * Security Rules Verification Suite (Phase 0 TDD)
 * Documents and verifies that all "Dirty Dozen" adversarial payloads and valid
 * creator-network operations match the hardened firestore.rules contract.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  authUid: string | null;
  emailVerified: boolean;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOW';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on Museum Create',
    collectionPath: '/museums/museum_alice_1',
    operation: 'create',
    authUid: 'alice',
    emailVerified: true,
    payload: { ownerId: 'bob', title: 'Spoofed Museum' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Ghost / Shadow Field Injection',
    collectionPath: '/museums/museum_alice_2',
    operation: 'create',
    authUid: 'alice',
    emailVerified: true,
    payload: { ownerId: 'alice', title: 'Valid', isAdminVerified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Email Write',
    collectionPath: '/museums/museum_unverified',
    operation: 'create',
    authUid: 'carol',
    emailVerified: false,
    payload: { ownerId: 'carol', title: 'Unverified' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Scrape Private Museums via List',
    collectionPath: '/museums',
    operation: 'list',
    authUid: 'bob',
    emailVerified: true,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Orphaned Piece Without Existing Parent Museum',
    collectionPath: '/museums/missing_museum/pieces/piece_1',
    operation: 'create',
    authUid: 'alice',
    emailVerified: true,
    payload: { museumId: 'missing_museum', ownerId: 'alice', title: 'Orphan' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Foreign Piece Insertion Into Alice Museum',
    collectionPath: '/museums/museum_alice_1/pieces/piece_hack',
    operation: 'create',
    authUid: 'bob',
    emailVerified: true,
    payload: { museumId: 'museum_alice_1', ownerId: 'bob', title: 'Hijack' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immutable ownerId / createdAt Modification',
    collectionPath: '/museums/museum_alice_1',
    operation: 'update',
    authUid: 'alice',
    emailVerified: true,
    payload: { ownerId: 'bob' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Value Poisoning With Invalid Title Type / Length',
    collectionPath: '/museums/museum_alice_1',
    operation: 'update',
    authUid: 'alice',
    emailVerified: true,
    payload: { title: 'x'.repeat(180) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Array Flood (> 20 Islands)',
    collectionPath: '/museums/museum_alice_1',
    operation: 'update',
    authUid: 'alice',
    emailVerified: true,
    payload: { islands: Array.from({ length: 25 }, (_, i) => ({ id: `i_${i}` })) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Document Bloat (> 180KB mediaDataUrl)',
    collectionPath: '/museums/museum_alice_1/pieces/piece_big',
    operation: 'create',
    authUid: 'alice',
    emailVerified: true,
    payload: { mediaDataUrl: 'data:image/jpeg;base64,' + 'A'.repeat(200000) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Path ID Poisoning',
    collectionPath: '/museums/bad$id!poison',
    operation: 'create',
    authUid: 'alice',
    emailVerified: true,
    payload: { ownerId: 'alice', title: 'Bad ID' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'PII Leak on User Private Profile',
    collectionPath: '/users/alice/private/profile',
    operation: 'get',
    authUid: 'bob',
    emailVerified: true,
    expected: 'PERMISSION_DENIED',
  },
];

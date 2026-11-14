# Security Specification — Museo 404 Creator Network

## 1. Data Invariants
1. **Museum Ownership & Identity Integrity**: A `Museum` document at `/museums/{museumId}` must have `ownerId == request.auth.uid`, an email-verified creator (`request.auth.token.email_verified == true`), and an immutable `ownerId` and `createdAt` after creation.
2. **Public Directory vs Private Draft Isolation**: Unauthenticated or non-owner users can `get` or `list` `/museums/{museumId}` and `/museums/{museumId}/pieces/{pieceId}` ONLY when `resource.data.isPublic == true`. Non-owners can never read private (`isPublic == false`) museums or pieces.
3. **Master Gate Relational Sync for Pieces**: A `MuseumPiece` at `/museums/{museumId}/pieces/{pieceId}` cannot exist or be mutated unless the parent `/museums/{museumId}` exists, its `ownerId == request.auth.uid`, and `incoming().museumId == museumId` and `incoming().ownerId == request.auth.uid`.
4. **PII Isolation**: User email addresses are stored exclusively in `/users/{userId}/private/profile`, where only the verified owner (`request.auth.uid == userId`) can read or write, and `list` is explicitly denied.
5. **Bounded Sizes & Strict Keys (Anti-Poisoning / Anti-DoW)**: All document IDs match `^[a-zA-Z0-9_\-]+$` (<= 128 chars). All strings, arrays (`islands <= 20`, `rooms <= 60`), and optional `mediaDataUrl` (`<= 180000` bytes) are strictly type- and size-checked. Every `create` checks `hasAll` + `hasOnly`, and every `update` uses action-based `affectedKeys().hasOnly(...)` combined with `isValid[Entity](incoming())`.
6. **Temporal Integrity**: `createdAt == request.time` on creation and immutable on updates; `updatedAt == request.time` on both creation and updates.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Identity Spoofing on Museum Create**: Authenticated user `alice` creates `/museums/m1` with `ownerId: "bob"`. -> `PERMISSION_DENIED`.
2. **Ghost / Shadow Field Injection on Museum Create**: Authenticated user `alice` includes extra field `isAdminVerified: true` on `/museums/m1`. -> `PERMISSION_DENIED`.
3. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to create a museum or piece. -> `PERMISSION_DENIED`.
4. **Blanket List Scraping Private Museums**: User `bob` runs `list` on `/museums` without filtering `where('isPublic', '==', true)` or queries private museums of `alice`. -> `PERMISSION_DENIED`.
5. **Orphaned Piece Create (Missing Parent Museum)**: User `alice` creates `/museums/nonexistent/pieces/p1` with `ownerId: "alice"`. -> `PERMISSION_DENIED`.
6. **Hijacking Another Creator's Museum with a Piece**: User `bob` tries to create `/museums/aliceMuseum/pieces/p1` even with `ownerId: "bob"`. -> `PERMISSION_DENIED` (Master Gate checks parent `ownerId`).
7. **Owner Transfer Attack on Update**: User `alice` updates `/museums/m1` attempting to mutate `ownerId` or `createdAt`. -> `PERMISSION_DENIED`.
8. **Type / Value Poisoning on Update**: User `alice` updates `/museums/m1` setting `title: 12345` or `title` > 100 chars. -> `PERMISSION_DENIED`.
9. **Array Flood (Denial of Wallet)**: User `alice` tries to write 25 islands (`islands.size() > 20`) or 70 rooms (`rooms.size() > 60`) in `/museums/m1`. -> `PERMISSION_DENIED`.
10. **Payload Bloat (1MB Document Exhaustion)**: User `alice` writes `mediaDataUrl` > 180,000 chars or `body` > 12,000 chars in `/museums/m1/pieces/p1`. -> `PERMISSION_DENIED`.
11. **Path ID Poisoning**: User `alice` attempts to write to `/museums/bad$id!with*chars` or a 200-char doc ID. -> `PERMISSION_DENIED`.
12. **PII Leak Attempt on Private Profile**: Authenticated user `bob` attempts `get` on `/users/alice/private/profile` or `list` on `/users`. -> `PERMISSION_DENIED`.

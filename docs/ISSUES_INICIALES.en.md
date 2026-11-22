# Suggested initial issues for the public launch

🇪🇸 [Versión en español](ISSUES_INICIALES.md)

This catalog contains **8 clear, actionable issues** ready to be created when the repository goes public on GitHub, so that any contributor knows exactly where to start.

> **Recommended labels on GitHub**:
> `good first issue` · `help wanted` · `isla-prestada` · `frontend` · `backend` · `design` · `accessibility` · `performance`

---

## 1. `[Lent Island] Notifications and gentle expiration of magic invitations`
- **Labels**: `isla-prestada`, `backend`, `frontend`, `help wanted`
- **Context**: Hosts currently generate invitations (`pending` / `accepted` / `revoked`) in `/islandInvites/{inviteId}`. The host's panel still lacks the creation/suggested expiration date, a capacity alert, and a visual notice for the guest when the loan was revoked.
- **Acceptance criteria**:
  - Show a readable date and the time elapsed for each invitation in `MuseumEditor.tsx`.
  - Let the host copy, with one click, both the full link (`?museum=...&invite=...`) and the short code.
  - Show a clear and respectful message in `LoanInviteModal.tsx` when an invitation was revoked or already claimed by another account.
- **Key files**: `src/firebase/interactions.ts`, `src/components/LoanInviteModal.tsx`, `src/components/MuseumEditor.tsx`.

---

## 2. `[Editor] Undo history for cloud changes and piece reordering`
- **Labels**: `frontend`, `help wanted`
- **Context**: The Internal Workshop already lets you undo local museum changes and preview media, but in cloud museums pieces keep their creation order, and there is no quick way yet to reorder lecterns within a room.
- **Acceptance criteria**:
  - Allow moving pieces up or down the visual order within a room (`sortOrder` or index in the room).
  - Reflect that order both in `IslandDrawer.tsx` and in the 2D route (`RoomExplorer2D.tsx`).
- **Key files**: `src/components/MuseumEditor.tsx`, `src/components/RoomExplorer2D.tsx`, `src/types/museum.ts`.

---

## 3. `[Mobile and Accessibility] 2D room touch controls and full keyboard navigation (WCAG AA)`
- **Labels**: `accessibility`, `frontend`, `good first issue`
- **Context**: Exploring and editing the museum from small screens or with screen readers requires better visible focus, minimum touch targets (44×44 px) and quick-access keys that don't trap the user inside modals.
- **Acceptance criteria**:
  - Contrast audit of secondary buttons and pixel labels (`Press Start 2P`).
  - A crisp `:focus-visible` indicator across the top bar, side drawers and modals.
  - Smooth navigation with the touch d-pad of `RoomExplorer2D.tsx`, and comfortable piece editing on screens `< 420px`.
- **Key files**: `src/index.css`, `src/components/RoomExplorer2D.tsx`, `src/components/MuseumEditor.tsx`.

---

## 4. `[Performance] Lazy loading and thumbnail cache for museums with 40+ pieces`
- **Labels**: `performance`, `frontend`, `help wanted`
- **Context**: When a museum grows to dozens of islands and multimedia pieces, Three.js and the content modals load sprites and data that aren't needed up front.
- **Acceptance criteria**:
  - Free unused Three.js geometries/textures when switching between museums in the directory (`dispose`).
  - Cache in memory the object URLs loaded from `mediaDb.ts` (IndexedDB), avoiding repeated reads when opening and closing the same piece.
- **Key files**: `src/components/Archipelago3D.tsx`, `src/three/worldBuilder.ts`, `src/storage/mediaDb.ts`.

---

## 5. `[Museum Network] Curatorial tags and featured Lent Islands in the Directory`
- **Labels**: `isla-prestada`, `design`, `frontend`, `good first issue`
- **Context**: The directory already shows network metrics, a random-museum button and quick jump by link/ID. The next step is to highlight active museums that are lending islands or collaborating across the network.
- **Acceptance criteria**:
  - A discreet visual badge on directory cards for museums with at least one active lent island.
  - A quick filter in `MuseumDirectoryModal.tsx` to browse museums by category or by rooms on loan.
- **Key files**: `src/components/MuseumDirectoryModal.tsx`, `src/firebase/museumNetwork.ts`.

---

## 6. `[Guestbook] Per-session anti-spam limit and moderation filters for owners`
- **Labels**: `backend`, `frontend`, `good first issue`
- **Context**: Any visitor can sign the Guestbook with a free nickname. It would help to add a gentle client-side cooldown and a filter by status (visible vs. hidden) in the owner's view.
- **Acceptance criteria**:
  - A friendly timer between consecutive submissions in `GuestbookModal.tsx` (e.g. 15 seconds), with a clear message.
  - A quick button to toggle hidden messages when `canModerate` is active.
- **Key files**: `src/components/GuestbookModal.tsx`, `src/firebase/interactions.ts`.

---

## 7. `[Design] 3 new pixel-art biomes and 2 community templates (Zine and Photo Archive)`
- **Labels**: `design`, `good first issue`, `help wanted`
- **Context**: The current templates cover Music, Restaurant, Art Gallery and Blank. Adding templates for *Fanzine / Writing* and *Photo Archive* together with new biomes broadens the diversity of the archipelago.
- **Acceptance criteria**:
  - Add at least 2 complete new templates in `src/data/museumTemplates.ts`.
  - Document in `CONTRIBUTING.md` how to design a new biome compatible with the 2D map and the 3D view.
- **Key files**: `src/data/museumTemplates.ts`, `src/data/initialContent.ts`, `src/components/ArchipelagoMap.tsx`.

---

## 8. `[Testing] CI script with the Firestore emulator to validate firestore.rules.test.ts`
- **Labels**: `backend`, `help wanted`
- **Context**: We already have `firestore.rules.test.ts` and ESLint validation of the rules. Automating this in GitHub Actions ensures that no Pull Request breaks personal data isolation or the `esInvitado` permissions.
- **Acceptance criteria**:
  - A `.github/workflows/ci.yml` workflow that runs `npm run lint`, `npm run build`, `npx eslint firestore.rules` and the rules tests against the emulator.
- **Key files**: `firestore.rules`, `firestore.rules.test.ts`, `package.json`.

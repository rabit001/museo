# Contributing to MUSEO 404 · siNOMBRE

🇪🇸 [Versión en español](CONTRIBUTING.md)

Thank you for wanting to contribute.

This project is open infrastructure: a digital archipelago where anyone can build, publish and connect museums.
You don't need to create a museum to take part. You don't need to know how to program either.

We are looking for contributions from **programmers, designers, artists, writers, curators and curious people**.

---

## Ways to contribute

### 1. Code
- Fix bugs
- Improve performance (especially Three.js, piece loading and Firestore rules)
- Extend the Editor (new visual customization options, curation tools)
- Improve accessibility and the mobile experience
- Add tests (especially security rules)
- Document the existing code

### 2. Design and experience
- Propose interface improvements that keep the archival + pixel-art aesthetic
- Design new island biomes or variations of lecterns and rooms
- Improve the visual hierarchy of the reception, drawers and modals
- Create icons or pixel-art assets consistent with the project's tone
- Review contrast, readability and the flow of forms (guestbook, purchase requests, etc.)

### 3. Content and curation
- Propose base texts, poems, descriptions or pieces for the flagship museum
- Suggest new theme presets (palettes)
- Help write or translate interface texts
- Create good-quality example public museums to serve as references

### 4. Community and documentation
- Improve this file or the README
- Write guides for new creators
- Report usability problems clearly
- Help moderate or propose good practices for community conduct across the museum network

---

## Principles we ask you to respect

1. **The visitor is a first-class citizen**
   No one should need an account to walk through museums, sign the guestbook or explore.

2. **Aesthetics are not decoration**
   Any visual change must keep the mix of museum archive (parchment paper, clean typography, rectangular plaques) and nocturnal pixel art.

3. **Isolation of personal data**
   Email addresses, WhatsApp numbers or other contact details of buyers or visitors must never be exposed in public documents.

4. **Simplicity over features**
   We prefer a few things done well over many options that clutter the space.

5. **The flagship museum (`museo404`) is special**
   It has its own administration rules. Any change that affects it must be discussed first.

---

## How to start

### Reporting a problem
Open an **Issue** using the `[Bug]` template in `.github/ISSUE_TEMPLATE/` and describe:
- What you expected to happen
- What actually happened
- Steps to reproduce it
- A screenshot or short video, if possible

### Proposing an improvement or a Lent Island
Open an **Issue** using the `[Mejora]` (improvement) or `[Isla Prestada]` (lent island) template and explain:
- The problem or need it solves
- How it would feel within the museum route
- Whether it affects visitors, creators or both

### Submitting code (Pull Request)

1. Read [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) and [`README.md`](./README.md)
2. Fork the repository and create a descriptive branch:
   ```bash
   git checkout -b fix/libro-visitas-spam
   git checkout -b feat/nuevo-bioma-volcan
   git checkout -b docs/mejorar-readme
   ```
3. Make clear commits written in the present tense:
   ```text
   Añade validación de longitud al apodo del libro de visitas
   Corrige posición de islas en vista mapa
   ```
4. Make sure the project builds and passes the checks:
   ```bash
   npm install
   npm run lint
   npm run build
   npx eslint firestore.rules
   ```
   If you change `firestore.rules`, also run the emulator tests (`firestore.rules.test.ts`).
5. Open the Pull Request against `main` and describe:
   - What changes
   - Why
   - How to test it

---

## Useful project structure

```text
src/
├── components/          # UI (Archipelago3D, RoomExplorer2D, MuseumEditor, LoanInviteModal...)
├── data/                # Themes, templates, characters and base content
├── firebase/            # Museum network, guestbook, requests and lent islands
├── game/                # Audio, sprites, room building
├── storage/             # Local state, JSON copies and mediaDb (IndexedDB)
├── three/               # Three.js logic
└── types/               # TypeScript types (museum.ts is the core)
```

Especially important files:
- `src/types/museum.ts` → data model (museums, pieces, lent island invitations)
- `firestore.rules` and `firestore.rules.test.ts` → security and network invariants
- `src/components/MuseumEditor.tsx` → Internal Workshop and guest mode
- `src/components/LoanInviteModal.tsx` → Lent Island acceptance flow
- `src/data/themes.ts` and `src/data/museumTemplates.ts` → color presets and templates

---

## Quick style guide

### Code
- Strict TypeScript
- Functional components + hooks
- Names in Spanish when they describe the museum's domain (`Island`, `Room`, `GuestbookEntry`, `islasPrestadas`…), English when they are generic technical terms
- Avoid new dependencies without a clear justification

### Design
- Keep the base palette and typography (`Pixelify Sans` / `Press Start 2P` + system fonts)
- Prefer thin dividers and rectangular plaques over rounded pills
- Prices and commercial states should feel museum-like, not e-commerce

### Commits and PRs
- One PR = one clear intention
- If the change is large, open it as a draft (`Draft`) and keep commenting as you go

---

## Not sure where to start?

Check [`docs/ISSUES_INICIALES.md`](./docs/ISSUES_INICIALES.md), where we list the **8 first issues** ready to take, or you can:
- Look at the Issues labeled `good first issue`, `help wanted` or `isla-prestada`
- Improve interface texts and onboarding guides
- Propose a new theme preset or community template
- Create an example public museum and tell us what felt strange while building it
- Simply walk through the flagship museum and report friction

All of that counts.

---

## Community channel and tone

This is a project made with care and aesthetic obsession.
We treat contributions with respect and ask the same in return (see [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)).

- **Questions before coding**: open a question Issue or a thread in **GitHub Discussions**.
- **Governance and network proposals**: any change that affects visibility rules, community conduct or the flagship museum (`museo404`) is discussed in the open before it is settled.
- **Real-time chat**: when the community server (Discord / Matrix) is enabled, the official link will be published on the front page of `README.md`.

---

**Thank you for helping the archipelago grow.**

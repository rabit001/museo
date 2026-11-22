# MUSEO 404 · siNOMBRE

🇪🇸 [Versión en español](README.md)

> **Your museum. Your rules. Our community.**
>
> *A free digital archipelago where each person can build their own museum, explore others', and lend islands to help each other exist.*

**MUSEO 404 · siNOMBRE** is a network of independent museums that can be explored as 3D archipelagos and pixel-art 2D rooms. It is not another storefront competing for attention: it is a simple, modifiable and open infrastructure for exhibiting painting, music, writing, menus, collections, processes or ideas that don't have a name yet.

**Us first.**

---

## What you can do today in MUSEO 404

### For visitors (no account needed)
- **Explore in 3D or 2D Map**: move between floating islands or interactive cliffs with your pixel-art avatar (`Explorer`, `Melomaniac`, `Chef`, `Astronomer`, `Robot 404`).
- **Enter 2D interior rooms**: explore furniture, lecterns, paintings, texts, links, audio and video.
- **Sign the Guestbook**: leave notes with any nickname at the reception or inside any room.
- **Buy works or support creators**: check the commercial status (`For sale`, `Reserved`, `Sold`), send private purchase requests, or use direct donation links (PayPal, Ko-fi, Mercado Pago).

### For creators and curators
- **Create your museum in under 3 minutes**: choose a template (*Music Recommendations Club*, *Restaurant / Interactive Menu*, *Art Gallery and Sketches* or *Blank Archipelago*), then customize the sky, ocean, accents and exhibition frames.
- **Internal Workshop**: manage islands, rooms and multimedia pieces, make full JSON backups (with local files and `islasPrestadas`), and undo local changes.
- **Lent Island (the heart of the project)**: generate a **magic link** (`?museum=...&invite=...`) to invite another creator to set up their own exhibition inside one of your islands. Their island glows with liminal fog, keeps a permanent link to their home museum, and gives them limited editing (`Guest Mode`) only over their own pieces.
- **Cross-curation**: share a public piece from another museum in your own rooms, keeping verified credit (`curatedFrom`).

---

## Tech stack

- **Frontend**: React 19 + TypeScript + Vite
- **3D world and graphics**: Three.js + our own pixel-art Canvas 2D engines
- **Styles**: Tailwind CSS v4 + archival and pixel fonts (`Pixelify Sans`, `Press Start 2P`)
- **Backend and persistence**: Firebase Authentication (Google), Cloud Firestore (with validated security rules and emulator tests) + IndexedDB (`Museo404Media`) for large local files

---

## Running it locally

### 1. Prerequisites
- **Node.js** `20+` (to run the test suite with `--experimental-strip-types`, Node `22.6+` is recommended)
- **npm** `10+`
- Optional, to run the Firestore rules tests: Firebase CLI / Firestore emulator

### 2. Installation
```bash
npm install --legacy-peer-deps
```

> `npm install` without flags may fail because of an `esbuild` version conflict between Vite 8 and `tsx`. The conflict is in development dependencies and does not affect the application code. If you use Bun, `bun install` also works with the included `bun.lock`.

### 3. Environment variables
If you connect your own Firebase project or extra integrations, check `.env.example` (never upload private credentials to the repository). The public Firebase web configuration lives in `firebase-applet-config.json`.

### 4. Development server
```bash
npm run dev
```
The app runs by default at `http://localhost:3000`.

### 5. Verification, lint and build
```bash
# Strict TypeScript check
npm run lint

# Production build
npm run build

# Static lint of Firestore security rules
npx eslint firestore.rules

# Firestore rules tests (requires a running emulator)
node --experimental-strip-types --test firestore.rules.test.ts
```

---

## Quick architecture

```text
├── firestore.rules           # Declarative Firestore security rules
├── firestore.rules.test.ts   # Test suite with the Firestore emulator
├── firebase-blueprint.json   # Conceptual schema of the collections
├── CONTRIBUTING.md           # How to take part in code, design or curation
├── CODE_OF_CONDUCT.md        # Community agreements
├── docs/ISSUES_INICIALES.md  # First public issues ready to take
└── src/
    ├── App.tsx                       # Main orchestration, deep links and views
    ├── types/museum.ts               # Core model (Islands, Rooms, Pieces, Invites)
    ├── data/                         # Starter templates, biomes, themes and avatars
    ├── firebase/                     # Museum network, guestbook, requests and lent islands
    ├── storage/                      # Local persistence, JSON copies and mediaDb (IndexedDB)
    ├── game/                         # Retro audio, pixel-art sprites and world builders
    └── components/                   # 3D/2D views, Internal Workshop, Directory and modals
```

---

## Lent Island permissions model

1. **Host (`ownerId`)**: creates an invitation (`pending`) for a specific island from **Edit museum → Lend this island**.
2. **Invited creator (`guestUid`)**: opens the magic link (`?museum=...&invite=...`) or pastes the code under **I have an invitation**, links their home museum or collection, and accepts the invitation (`accepted`).
3. **Limited editing (`esInvitado`)**:
   - Can create, edit and delete **their own pieces** inside that island (`loanInviteId == inviteId`).
   - Cannot change the overall architecture of the museum, other museums, or pieces belonging to the host or other guests.
   - The host keeps the ability to revoke a loan when necessary.

---

## How to contribute and first issues

You don't need to be a programmer to contribute. We are looking for help with:
- **Code and Three.js** (optimization, keyboard and mobile accessibility, tests)
- **Design and pixel art** (biomes, frames, furniture and readability)
- **Curation and content** (templates, example public museums, texts)

See:
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for workflows and principles.
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) for community agreements.
- [`docs/ISSUES_INICIALES.md`](./docs/ISSUES_INICIALES.md) for the **8 initial labeled issues** (`good first issue`, `help wanted`, `isla-prestada`). English version: [`docs/ISSUES_INICIALES.en.md`](./docs/ISSUES_INICIALES.en.md).

---

## Community channel and open decisions

We want the community to have a voice in the direction of the project, and no single person to make unilateral decisions about who exists in the archipelago:
- **Technical proposals, bugs and ideas**: open an Issue using the templates in `.github/ISSUE_TEMPLATE/`.
- **Design, curation and governance debates**: use **GitHub Discussions** (recommended categories: *Island Ideas*, *Curation*, *Design and Pixel Art*, *Help*).
- **Conversation and proposals**: use [GitHub Discussions](https://github.com/sarvideleonardo-blip/museo/discussions) for ideas, curation, design and help. For real-time chat, join the Matrix room: [#museo404:matrix.org](https://matrix.to/#/#museo404:matrix.org).

---

*Made to be explored slowly, to lend spaces to one another, and to hold each other up as a network.*

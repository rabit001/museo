# MUSEO 404 · siNOMBRE

> **Tu museo. Tus reglas. Nuestra comunidad.**
>
> *Un archipiélago digital libre donde cada persona puede construir su propio museo, explorar el de otros y prestarse islas para ayudarse a existir.*

**MUSEO 404 · siNOMBRE** es una red de museos independientes explorables como archipiélagos 3D y salas 2D estilo pixel art. No es otro escaparate para competir por atención: es una infraestructura sencilla, modificable y abierta para exhibir pintura, música, escritura, menús, colecciones, procesos o ideas que todavía no tienen nombre.

**Primero nosotros.**

---

## Qué puedes hacer hoy en MUSEO 404

### Para visitantes (sin necesidad de crear cuenta)
- **Recorrer en 3D o Mapa 2D**: navega entre islas flotantes o acantilados interactivos con tu avatar pixel art (`Explorador`, `Melómano`, `Chef`, `Astrónomo`, `Robot 404`).
- **Entrar a salas interiores en 2D**: explora mobiliario, atriles, cuadros, textos, enlaces, audio y vídeo.
- **Firmar el Libro de Visitas**: deja notas con apodo libre en la recepción o dentro de cualquier sala.
- **Comprar obras o apoyar creadores**: consulta estado comercial (`En venta`, `Reservada`, `Vendida`), envía solicitudes de compra privadas o usa enlaces directos de donación (PayPal, Ko-fi, Mercado Pago).

### Para creadores y curadores
- **Crea tu museo en menos de 3 minutos**: elige una plantilla (*Club de Recomendaciones Musicales*, *Restaurante / Menú Interactivo*, *Galería de Arte y Bocetos* o *Archipiélago en Blanco*), personaliza cielo, océano, acentos y marcos expositivos.
- **Taller Interno**: gestiona islas, salas, piezas multimedia, respaldos JSON completos (con archivos locales e `islasPrestadas`) y deshacer cambios locales.
- **Isla Prestada (corazón del proyecto)**: genera un **enlace mágico** (`?museum=...&invite=...`) para invitar a otro creador a montar su propia exposición dentro de una de tus islas. Su isla brilla con niebla liminal, mantiene un enlace permanente a su museo de origen y le otorga edición acotada (`Modo Invitado`) exclusivamente sobre sus piezas.
- **Curaduría cruzada**: comparte una pieza pública de otro museo en tus propias salas conservando la atribución verificada (`curatedFrom`).

---

## Stack tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **Mundo 3D y gráficos**: Three.js + motores Canvas 2D pixel art propios
- **Estilos**: Tailwind CSS v4 + fuentes archivísticas y pixel (`Pixelify Sans`, `Press Start 2P`)
- **Backend y persistencia**: Firebase Authentication (Google), Cloud Firestore (con reglas de seguridad validadas y pruebas en emulador) + IndexedDB (`Museo404Media`) para archivos locales de gran tamaño

---

## Puesta en marcha local

### 1. Requisitos previos
- **Node.js** `20+` (para ejecutar el suite de tests con `--experimental-strip-types` se recomienda Node `22.6+`)
- **npm** `10+`
- Opcional para correr tests de reglas de Firestore: Firebase CLI / emulador de Firestore

### 2. Instalación
```bash
npm install --legacy-peer-deps
```

> `npm install` sin flags puede fallar por un conflicto de versiones de `esbuild` entre Vite 8 y `tsx`. El conflicto es de dependencias de desarrollo y no afecta al código de la aplicación. Si usas Bun, `bun install` también funciona con el `bun.lock` incluido.

### 3. Variables de entorno
Si conectas un proyecto Firebase propio o integraciones adicionales, revisa `.env.example` (nunca subas credenciales privadas al repositorio). La configuración pública web de Firebase vive en `firebase-applet-config.json`.

### 4. Servidor de desarrollo
```bash
npm run dev
```
La aplicación corre por defecto en `http://localhost:3000`.

### 5. Verificación, lint y compilación
```bash
# Verificación estricta de TypeScript
npm run lint

# Compilación de producción
npm run build

# Lint estático de reglas de seguridad de Firestore
npx eslint firestore.rules

# Tests de reglas de Firestore (requiere emulador en ejecución)
node --experimental-strip-types --test firestore.rules.test.ts
```

---

## Arquitectura rápida del proyecto

```text
├── firestore.rules           # Reglas de seguridad declarativas de Firestore
├── firestore.rules.test.ts   # Suite de pruebas con emulador de Firestore
├── firebase-blueprint.json   # Esquema conceptual de colecciones
├── CONTRIBUTING.md           # Cómo participar en código, diseño o curaduría
├── CODE_OF_CONDUCT.md        # Acuerdos de convivencia de la comunidad
├── docs/ISSUES_INICIALES.md  # Primeros issues públicos listos para tomar
└── src/
    ├── App.tsx                       # Orquestación principal, deep links y vistas
    ├── types/museum.ts               # Modelo central (Islands, Rooms, Pieces, Invites)
    ├── data/                         # Plantillas iniciales, biomas, temas y avatares
    ├── firebase/                     # Red de museos, guestbook, solicitudes e islas prestadas
    ├── storage/                      # Persistencia local, copias JSON y mediaDb (IndexedDB)
    ├── game/                         # Audio retro, sprites pixel art y constructores de mundo
    └── components/                   # Vistas 3D/2D, Taller Interno, Directorio y Modales
```

---

## Modelo de permisos de Isla Prestada

1. **Anfitrión (`ownerId`)**: genera una invitación (`pending`) para una isla específica desde **Editar museo → Prestar esta isla**.
2. **Creador invitado (`guestUid`)**: abre el enlace mágico (`?museum=...&invite=...`) o pega el código en **Tengo invitación**, vincula su museo o colección de origen y acepta la invitación (`accepted`).
3. **Edición acotada (`esInvitado`)**:
   - Puede crear, editar y eliminar **sus propias piezas** dentro de esa isla (`loanInviteId == inviteId`).
   - No puede modificar la arquitectura general del museo, otros museos ni piezas del anfitrión o de otros invitados.
   - El anfitrión conserva control para revocar un préstamo cuando sea necesario.

---

## Cómo contribuir y primeros issues

No hace falta ser programador para aportar. Buscamos ayuda en:
- **Código y Three.js** (optimización, accesibilidad teclado/móvil, tests)
- **Diseño y pixel art** (biomas, marcos, mobiliario y legibilidad)
- **Curaduría y contenido** (plantillas, museos públicos de ejemplo, textos)

Consulta:
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) para flujos de trabajo y principios.
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) para acuerdos de convivencia.
- [`docs/ISSUES_INICIALES.md`](./docs/ISSUES_INICIALES.md) para ver los **8 issues iniciales** etiquetados (`good first issue`, `help wanted`, `isla-prestada`).

---

## Canal de comunidad y decisiones abiertas

Queremos que la comunidad tenga voz en el rumbo del proyecto y que nadie concentre decisiones unilaterales sobre quién existe en el archipiélago:
- **Propuestas técnicas, bugs e ideas**: abre un Issue usando las plantillas de `.github/ISSUE_TEMPLATE/`.
- **Debates de diseño, curaduría y gobernanza**: usa **GitHub Discussions** (categorías recomendadas: *Ideas de Islas*, *Curaduría*, *Diseño y Pixel Art*, *Ayuda*).
- **Conversación y propuestas**: usa [GitHub Discussions](https://github.com/sarvideleonardo-blip/museo/discussions) para ideas, curaduría, diseño y ayuda. Para charlar en tiempo real, entra al chat de Matrix: [#museo404:matrix.org](https://matrix.to/#/#museo404:matrix.org).

---

*Hecho para explorar sin prisa, prestarnos espacios y sostenernos en red.*

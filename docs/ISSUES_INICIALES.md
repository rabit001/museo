# Issues iniciales sugeridos para el lanzamiento público

Este catálogo contiene **8 issues claros y accionables** listos para crearse al abrir el repositorio público en GitHub, de modo que cualquier colaborador sepa exactamente por dónde empezar.

> **Etiquetas recomendadas en GitHub**:
> `good first issue` · `help wanted` · `isla-prestada` · `frontend` · `backend` · `design` · `accessibility` · `performance`

---

## 1. `[Isla Prestada] Notificaciones y expiración amable de invitaciones mágicas`
- **Etiquetas**: `isla-prestada`, `backend`, `frontend`, `help wanted`
- **Contexto**: Actualmente los anfitriones generan invitaciones (`pending` / `accepted` / `revoked`) en `/islandInvites/{inviteId}`. Falta mostrar en el panel del anfitrión fecha de creación/expiración sugerida, alerta de cupo y aviso visual al invitado si el préstamo fue revocado.
- **Criterios de aceptación**:
  - Mostrar fecha legible y tiempo transcurrido de cada invitación en `MuseumEditor.tsx`.
  - Permitir que el anfitrión copie con un clic tanto el enlace completo (`?museum=...&invite=...`) como el código corto.
  - Mostrar un mensaje claro y respetuoso en `LoanInviteModal.tsx` cuando una invitación fue revocada o ya fue reclamada por otra cuenta.
- **Archivos clave**: `src/firebase/interactions.ts`, `src/components/LoanInviteModal.tsx`, `src/components/MuseumEditor.tsx`.

---

## 2. `[Editor] Historial de deshacer para cambios en la nube y reordenamiento de piezas`
- **Etiquetas**: `frontend`, `help wanted`
- **Contexto**: El Taller Interno ya permite deshacer cambios locales de museo y previsualizar medios, pero en museos en la nube las piezas mantienen el orden de creación y aún no hay un flujo rápido para reordenar atriles dentro de una sala.
- **Criterios de aceptación**:
  - Permitir subir/bajar el orden visual de piezas dentro de una sala (`sortOrder` o índice en sala).
  - Reflejar ese orden tanto en el `IslandDrawer.tsx` como en el recorrido 2D (`RoomExplorer2D.tsx`).
- **Archivos clave**: `src/components/MuseumEditor.tsx`, `src/components/RoomExplorer2D.tsx`, `src/types/museum.ts`.

---

## 3. `[Móvil y Accesibilidad] Controles táctiles de sala 2D y navegación completa por teclado (WCAG AA)`
- **Etiquetas**: `accessibility`, `frontend`, `good first issue`
- **Contexto**: Recorrer y editar el museo desde pantallas pequeñas o con lectores de pantalla requiere mejorar el foco visible, tamaños táctiles mínimos (44×44 px) y el uso de teclas de acceso rápido sin quedar atrapado en modales.
- **Criterios de aceptación**:
  - Auditoría de contraste en botones secundarios y etiquetas pixel (`Press Start 2P`).
  - Indicador `:focus-visible` nítido en toda la barra superior, cajones laterales y modales.
  - Navegación fluida en el cruceta táctil del `RoomExplorer2D.tsx` y edición cómoda de piezas en pantallas `< 420px`.
- **Archivos clave**: `src/index.css`, `src/components/RoomExplorer2D.tsx`, `src/components/MuseumEditor.tsx`.

---

## 4. `[Rendimiento] Carga diferida (lazy loading) y caché de miniaturas para museos con +40 piezas`
- **Etiquetas**: `performance`, `frontend`, `help wanted`
- **Contexto**: Cuando un museo crece con decenas de islas y piezas multimedia, Three.js y los modales de contenido cargan sprites y datos innecesarios por adelantado.
- **Criterios de aceptación**:
  - Liberar geometrías/texturas Three.js no usadas al cambiar entre museos del directorio (`dispose`).
  - Cachear en memoria las URLs de objetos cargadas desde `mediaDb.ts` (IndexedDB) evitando relecturas repetidas al abrir y cerrar la misma pieza.
- **Archivos clave**: `src/components/Archipelago3D.tsx`, `src/three/worldBuilder.ts`, `src/storage/mediaDb.ts`.

---

## 5. `[Red de Museos] Etiquetas curatoriales y colección destacada de Islas Prestadas en el Directorio`
- **Etiquetas**: `isla-prestada`, `design`, `frontend`, `good first issue`
- **Contexto**: El directorio ya muestra métricas de red, botón de museo al azar y salto rápido por enlace/ID. El siguiente paso es destacar museos activos que estén prestando islas o colaborando en red.
- **Criterios de aceptación**:
  - Badge visual discreto en tarjetas del directorio para museos que tienen al menos una isla prestada activa.
  - Filtro rápido en `MuseumDirectoryModal.tsx` para ver museos por categoría o con salas en préstamo.
- **Archivos clave**: `src/components/MuseumDirectoryModal.tsx`, `src/firebase/museumNetwork.ts`.

---

## 6. `[Libro de Visitas] Límite anti-spam por sesión y filtros de moderación para dueños`
- **Etiquetas**: `backend`, `frontend`, `good first issue`
- **Contexto**: Cualquier visitante puede firmar el Guestbook con apodo libre. Conviene sumar un enfriamiento suave en cliente (`cooldown`) y filtro por estado (visibles vs. ocultos) en la vista del dueño.
- **Criterios de aceptación**:
  - Temporizador amable entre envíos consecutivos en `GuestbookModal.tsx` (ej. 15 segundos) con mensaje claro.
  - Botón rápido para alternar mensajes ocultos cuando `canModerate` está activo.
- **Archivos clave**: `src/components/GuestbookModal.tsx`, `src/firebase/interactions.ts`.

---

## 7. `[Diseño] 3 nuevos biomas pixel art y 2 plantillas comunitarias (Zine y Archivo Fotográfico)`
- **Etiquetas**: `design`, `good first issue`, `help wanted`
- **Contexto**: Las plantillas actuales cubren Música, Restaurante, Galería de Arte y En Blanco. Sumar plantillas para *Fanzine / Escritura* y *Archivo Fotográfico* junto con nuevos biomas amplía la diversidad del archipiélago.
- **Criterios de aceptación**:
  - Añadir al menos 2 nuevas plantillas completas en `src/data/museumTemplates.ts`.
  - Documentar en `CONTRIBUTING.md` cómo diseñar un nuevo bioma compatible con el mapa 2D y la vista 3D.
- **Archivos clave**: `src/data/museumTemplates.ts`, `src/data/initialContent.ts`, `src/components/ArchipelagoMap.tsx`.

---

## 8. `[Testing] Script CI con emulador de Firestore para validar firestore.rules.test.ts`
- **Etiquetas**: `backend`, `help wanted`
- **Contexto**: Ya contamos con `firestore.rules.test.ts` y validación ESLint de reglas. Automatizar esto en GitHub Actions garantiza que ningún Pull Request rompa el aislamiento de datos personales ni los permisos de `esInvitado`.
- **Criterios de aceptación**:
  - Workflow `.github/workflows/ci.yml` que ejecute `npm run lint`, `npm run build`, `npx eslint firestore.rules` y los tests de reglas contra el emulador.
- **Archivos clave**: `firestore.rules`, `firestore.rules.test.ts`, `package.json`.

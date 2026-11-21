# Contribuir a MUSEO 404 · siNOMBRE

Gracias por querer aportar.

Este proyecto es una infraestructura abierta: un archipiélago digital donde cualquiera puede construir, publicar y conectar museos.
No hace falta crear un museo para participar. Tampoco hace falta saber programar.

Buscamos aportes de **programadores, diseñadores, artistas, escritores, curadores y personas curiosas**.

---

## Formas de contribuir

### 1. Código
- Corregir bugs
- Mejorar rendimiento (especialmente Three.js, carga de piezas y reglas de Firestore)
- Ampliar el Editor (nuevas opciones de personalización visual, herramientas de curaduría)
- Mejorar accesibilidad y experiencia móvil
- Añadir tests (especialmente reglas de seguridad)
- Documentar el código existente

### 2. Diseño y experiencia
- Proponer mejoras de interfaz manteniendo la estética archivística + pixel art
- Diseñar nuevos biomas de isla o variaciones de atriles/salas
- Mejorar la jerarquía visual de recepción, cajones y modales
- Crear iconografía o assets pixel art coherentes con el tono del proyecto
- Revisar contraste, legibilidad y flujo de los formularios (libro de visitas, solicitudes de compra, etc.)

### 3. Contenido y curaduría
- Proponer textos base, poemas, descripciones o piezas para el museo insignia
- Sugerir nuevos presets de tema (paletas)
- Ayudar a redactar o traducir textos de interfaz
- Crear ejemplos de museos públicos de buena calidad que sirvan de referencia

### 4. Comunidad y documentación
- Mejorar este archivo o el README
- Escribir guías para nuevos creadores
- Reportar problemas de usabilidad con claridad
- Ayudar a moderar o proponer mejores prácticas de convivencia en la red de museos

---

## Principios que pedimos respetar

1. **El visitante es ciudadano de primera clase**
   Nadie debe necesitar cuenta para recorrer museos, firmar el libro de visitas o explorar.

2. **La estética no es decoración**
   Cualquier cambio visual debe mantener la mezcla de archivo museográfico (papel pergamino, tipografía limpia, placas rectangulares) y pixel art nocturno.

3. **Aislamiento de datos personales**
   Nunca se deben exponer correos, WhatsApp u otros datos de contacto de compradores o visitantes en documentos públicos.

4. **Simplicidad sobre features**
   Preferimos pocas cosas bien resueltas antes que muchas opciones que saturen el espacio.

5. **El museo insignia (`museo404`) es especial**
   Tiene reglas propias de administración. Cualquier cambio que lo afecte debe ser discutido.

---

## Cómo empezar

### Reportar un problema
Abre un **Issue** usando la plantilla `[Bug]` en `.github/ISSUE_TEMPLATE/` y describe:
- Qué esperabas que pasara
- Qué pasó realmente
- Pasos para reproducirlo
- Si es posible, captura o vídeo corto

### Proponer una mejora o Isla Prestada
Abre un **Issue** usando la plantilla `[Mejora]` o `[Isla Prestada]` y explica:
- El problema o necesidad que resuelve
- Cómo se sentiría dentro del recorrido del museo
- Si afecta a visitantes, creadores o ambos

### Enviar código (Pull Request)

1. Lee [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) y [`README.md`](./README.md)
2. Haz fork del repositorio y crea una rama descriptiva:
   ```bash
   git checkout -b fix/libro-visitas-spam
   git checkout -b feat/nuevo-bioma-volcan
   git checkout -b docs/mejorar-readme
   ```
3. Haz commits claros y en presente:
   ```text
   Añade validación de longitud al apodo del libro de visitas
   Corrige posición de islas en vista mapa
   ```
4. Asegúrate de que el proyecto compile y pase verificaciones:
   ```bash
   npm install
   npm run lint
   npm run build
   npx eslint firestore.rules
   ```
   Si modificas `firestore.rules`, corre también los tests de emulador (`firestore.rules.test.ts`).
5. Abre el Pull Request hacia `main` y describe:
   - Qué cambia
   - Por qué
   - Cómo probarlo

---

## Estructura útil del proyecto

```text
src/
├── components/          # UI (Archipelago3D, RoomExplorer2D, MuseumEditor, LoanInviteModal...)
├── data/                # Temas, plantillas, personajes y contenido base
├── firebase/            # Red de museos, guestbook, solicitudes e islas prestadas
├── game/                # Audio, sprites, construcción de salas
├── storage/             # Estado local, copias JSON y mediaDb (IndexedDB)
├── three/               # Lógica Three.js
└── types/               # Tipos TypeScript (museum.ts es el corazón)
```

Archivos especialmente importantes:
- `src/types/museum.ts` → modelo de datos (museos, piezas, invitaciones de isla prestada)
- `firestore.rules` y `firestore.rules.test.ts` → seguridad e invariantes de red
- `src/components/MuseumEditor.tsx` → Taller Interno y modo invitado
- `src/components/LoanInviteModal.tsx` → flujo de aceptación de Isla Prestada
- `src/data/themes.ts` y `src/data/museumTemplates.ts` → presets de color y plantillas

---

## Guías de estilo rápidas

### Código
- TypeScript estricto
- Componentes funcionales + hooks
- Nombres en español cuando describen dominio del museo (`Island`, `Room`, `GuestbookEntry`, `islasPrestadas`…), inglés cuando son técnicos genéricos
- Evitar dependencias nuevas sin justificación clara

### Diseño
- Mantener la paleta base y la tipografía (`Pixelify Sans` / `Press Start 2P` + sistema)
- Preferir separadores finos y placas rectangulares antes que píldoras redondeadas
- Los precios y estados comerciales deben sentirse museográficos, no de e-commerce

### Commits y PRs
- Un PR = una intención clara
- Si el cambio es grande, ábrelo como borrador (`Draft`) y ve comentando

---

## ¿No sabes por dónde empezar?

Revisa [`docs/ISSUES_INICIALES.md`](./docs/ISSUES_INICIALES.md), donde listamos los **8 primeros issues** listos para tomar, o directamente puedes:
- Revisar los Issues etiquetados como `good first issue`, `help wanted` o `isla-prestada`
- Mejorar textos de la interfaz y guías de onboarding
- Proponer un nuevo preset de tema o plantilla comunitaria
- Crear un museo público de ejemplo y contarnos qué se sintió raro al construirlo
- Simplemente recorrer el museo insignia y reportar fricciones

Todo eso cuenta.

---

## Canal de comunidad y tono

Este es un proyecto hecho con cuidado y obsesión estética.
Tratamos las contribuciones con respeto y pedimos lo mismo a cambio (consulta [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)).

- **Dudas antes de programar**: abre un Issue de pregunta o un hilo en **GitHub Discussions**.
- **Propuestas de gobernanza y red**: cualquier cambio que afecte reglas de visibilidad, convivencia o el museo insignia (`museo404`) se conversa en abierto antes de cerrarse.
- **Chat en tiempo real**: cuando se habilite el servidor comunitario (Discord / Matrix), el enlace oficial se publicará en la portada de `README.md`.

---

**Gracias por ayudar a que el archipiélago crezca.**

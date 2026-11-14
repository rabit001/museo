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
Abre un **Issue** y describe:
- Qué esperabas que pasara
- Qué pasó realmente
- Pasos para reproducirlo
- Si es posible, captura o vídeo corto

### Proponer una mejora
Abre un Issue con la etiqueta `propuesta` o `diseño` y explica:
- El problema o necesidad que resuelve
- Cómo se sentiría dentro del recorrido del museo
- Si afecta a visitantes, creadores o ambos

### Enviar código (Pull Request)

1. Haz fork del repositorio
2. Crea una rama descriptiva:
   ```bash
   git checkout -b fix/libro-visitas-spam
   git checkout -b feat/nuevo-bioma-volcan
   git checkout -b docs/mejorar-readme
   ```
3. Haz commits claros y en presente:
   ```
   Añade validación de longitud al apodo del libro de visitas
   Corrige posición de islas en vista mapa
   ```
4. Asegúrate de que el proyecto compile:
   ```bash
   npm install
   npm run lint
   npm run build
   ```
5. Abre el Pull Request hacia `main` y describe:
   - Qué cambia
   - Por qué
   - Cómo probarlo

---

## Estructura útil del proyecto

```
src/
├── components/          # UI (Archipelago3D, RoomExplorer2D, MuseumEditor, etc.)
├── data/                # Temas, personajes, contenido base
├── firebase/            # Cliente y funciones de red de museos
├── game/                # Audio, sprites, construcción de salas
├── storage/             # Estado local y medios
├── three/               # Lógica Three.js
└── types/               # Tipos TypeScript (museum.ts es el corazón)
```

Archivos especialmente importantes:
- `src/types/museum.ts` → modelo de datos
- `firestore.rules` → seguridad
- `src/components/MuseumEditor.tsx` → experiencia de creación
- `src/data/themes.ts` → presets de color

---

## Guías de estilo rápidas

### Código
- TypeScript estricto
- Componentes funcionales + hooks
- Nombres en español cuando describen dominio del museo (`Island`, `Room`, `GuestbookEntry`…), inglés cuando son técnicos genéricos
- Evitar dependencias nuevas sin justificación clara

### Diseño
- Mantener la paleta base y la tipografía (Pixelify Sans / Press Start 2P + sistema)
- Preferir separadores finos y placas rectangulares antes que píldoras redondeadas
- Los precios y estados comerciales deben sentirse museográficos, no de e-commerce

### Commits y PRs
- Un PR = una intención clara
- Si el cambio es grande, ábrelo como borrador (`Draft`) y ve comentando

---

## ¿No sabes por dónde empezar?

Puedes:
- Revisar los Issues etiquetados como `good first issue` o `ayuda querida`
- Mejorar textos de la interfaz
- Proponer un nuevo preset de tema
- Crear un museo público de ejemplo y contarnos qué se sintió raro al construirlo
- Simplemente recorrer el museo insignia y reportar fricciones

Todo eso cuenta.

---

## Contacto y tono

Este es un proyecto hecho con cuidado y obsesión estética.
Tratamos las contribuciones con respeto y pedimos lo mismo a cambio.

Si tienes dudas antes de abrir un PR, puedes abrir un Issue de pregunta.
Es mejor preguntar que asumir.

---

**Gracias por ayudar a que el archipiélago crezca.**

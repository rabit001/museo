import * as THREE from 'three';

export interface ProceduralTextures {
  grass: THREE.CanvasTexture;
  cobblePath: THREE.CanvasTexture;
  sand: THREE.CanvasTexture;
  desertPath: THREE.CanvasTexture;
  ice: THREE.CanvasTexture;
  icePath: THREE.CanvasTexture;
  brick: THREE.CanvasTexture;
  woodPlank: THREE.CanvasTexture;
  cliffRock: THREE.CanvasTexture;
  water: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

function makePixelCanvas(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  options: { repeat?: [number, number]; srgb?: boolean; nearest?: boolean } = {}
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    draw(ctx, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  if (options.repeat) {
    tex.repeat.set(options.repeat[0], options.repeat[1]);
  }
  tex.colorSpace = options.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  if (options.nearest !== false) {
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
  }
  tex.needsUpdate = true;
  return tex;
}

function seededNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

export function createProceduralTextures(): ProceduralTextures {
  const grass = makePixelCanvas(
    64,
    (ctx, s) => {
      const cell = 4;
      const palette = ['#5fa36d', '#6bb377', '#529362', '#78be7e', '#4c885b'];
      for (let y = 0; y < s; y += cell) {
        for (let x = 0; x < s; x += cell) {
          const r = seededNoise(x, y, 1);
          const idx = Math.min(palette.length - 1, Math.floor(r * palette.length));
          ctx.fillStyle = palette[idx];
          ctx.fillRect(x, y, cell, cell);
          if (r > 0.88) {
            ctx.fillStyle = '#97d48b';
            ctx.fillRect(x + 1, y + 1, 2, 2);
          } else if (r < 0.06) {
            ctx.fillStyle = '#d9c86a';
            ctx.fillRect(x + 1, y + 1, 2, 2);
          }
        }
      }
    },
    { repeat: [4, 4] }
  );

  const cobblePath = makePixelCanvas(
    64,
    (ctx, s) => {
      ctx.fillStyle = '#7c6244';
      ctx.fillRect(0, 0, s, s);
      const stones = [
        { x: 2, y: 2, w: 26, h: 18, c: '#d8c593' },
        { x: 32, y: 2, w: 30, h: 16, c: '#cab481' },
        { x: 4, y: 24, w: 18, h: 18, c: '#c4ad79' },
        { x: 26, y: 22, w: 34, h: 20, c: '#e0cf9f' },
        { x: 2, y: 45, w: 28, h: 17, c: '#d4bf8a' },
        { x: 34, y: 46, w: 28, h: 16, c: '#c5ae7c' },
      ];
      for (const st of stones) {
        ctx.fillStyle = st.c;
        ctx.fillRect(st.x, st.y, st.w, st.h);
        ctx.fillStyle = '#ede0b6';
        ctx.fillRect(st.x + 2, st.y + 2, st.w - 6, 3);
        ctx.fillStyle = '#9e895c';
        ctx.fillRect(st.x + 2, st.y + st.h - 3, st.w - 3, 3);
      }
    },
    { repeat: [2, 2] }
  );

  const sand = makePixelCanvas(
    64,
    (ctx, s) => {
      const cell = 4;
      const palette = ['#d8b46a', '#e2c078', '#cca55b', '#d3ae64'];
      for (let y = 0; y < s; y += cell) {
        for (let x = 0; x < s; x += cell) {
          const r = seededNoise(x, y, 7);
          const wave = Math.sin((x + y * 0.5) * 0.22) * 0.25 + 0.5;
          const idx = Math.min(palette.length - 1, Math.floor(((r + wave) * 0.5) * palette.length));
          ctx.fillStyle = palette[idx];
          ctx.fillRect(x, y, cell, cell);
        }
      }
    },
    { repeat: [4, 4] }
  );

  const desertPath = makePixelCanvas(
    64,
    (ctx, s) => {
      ctx.fillStyle = '#9d7441';
      ctx.fillRect(0, 0, s, s);
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
          const offset = (row % 2) * 16;
          const px = (col * 32 + offset) % s;
          const py = row * 16 + 2;
          ctx.fillStyle = row % 2 === 0 ? '#e6c88a' : '#d8b775';
          ctx.fillRect(px + 2, py, 26, 12);
          ctx.fillStyle = '#f2da9e';
          ctx.fillRect(px + 3, py + 1, 22, 3);
        }
      }
    },
    { repeat: [2, 2] }
  );

  const ice = makePixelCanvas(
    64,
    (ctx, s) => {
      const cell = 4;
      const palette = ['#b7e5ee', '#cbeff5', '#9dd6e3', '#def6fa'];
      for (let y = 0; y < s; y += cell) {
        for (let x = 0; x < s; x += cell) {
          const r = seededNoise(x, y, 19);
          const idx = Math.min(palette.length - 1, Math.floor(r * palette.length));
          ctx.fillStyle = palette[idx];
          ctx.fillRect(x, y, cell, cell);
        }
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 12, 16, 2);
      ctx.fillRect(36, 40, 18, 2);
    },
    { repeat: [4, 4] }
  );

  const icePath = makePixelCanvas(
    64,
    (ctx, s) => {
      ctx.fillStyle = '#5f9eb4';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 16) {
        for (let x = 0; x < s; x += 16) {
          ctx.fillStyle = (x + y) % 32 === 0 ? '#e5f8fc' : '#c9eef7';
          ctx.fillRect(x + 2, y + 2, 12, 12);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 3, y + 3, 10, 2);
        }
      }
    },
    { repeat: [2, 2] }
  );

  const brick = makePixelCanvas(
    64,
    (ctx, s) => {
      ctx.fillStyle = '#4c3832';
      ctx.fillRect(0, 0, s, s);
      for (let row = 0; row < 4; row++) {
        const y = row * 16;
        const shift = (row % 2) * 16;
        for (let col = -1; col < 3; col++) {
          const x = col * 32 + shift;
          ctx.fillStyle = (row + col) % 2 === 0 ? '#8c5a44' : '#7b4d3b';
          ctx.fillRect(x + 2, y + 2, 28, 12);
          ctx.fillStyle = '#a46c54';
          ctx.fillRect(x + 3, y + 3, 24, 3);
        }
      }
    },
    { repeat: [2, 2] }
  );

  const woodPlank = makePixelCanvas(
    64,
    (ctx, s) => {
      ctx.fillStyle = '#53321e';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 4; i++) {
        const y = i * 16 + 1;
        ctx.fillStyle = i % 2 === 0 ? '#a96e3f' : '#9b6236';
        ctx.fillRect(0, y, s, 14);
        ctx.fillStyle = '#c18550';
        ctx.fillRect(0, y + 1, s, 3);
        ctx.fillStyle = '#3a2214';
        ctx.fillRect(6, y + 5, 3, 3);
        ctx.fillRect(54, y + 5, 3, 3);
      }
    },
    { repeat: [1, 3] }
  );

  const cliffRock = makePixelCanvas(
    64,
    (ctx, s) => {
      ctx.fillStyle = '#6c513c';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 8) {
        for (let x = 0; x < s; x += 8) {
          const r = seededNoise(x, y, 42);
          ctx.fillStyle = r > 0.65 ? '#87674d' : r < 0.3 ? '#563e2e' : '#755842';
          ctx.fillRect(x, y, 8, 8);
        }
      }
      ctx.fillStyle = '#4c885b';
      ctx.fillRect(0, 0, s, 6);
    },
    { repeat: [3, 1] }
  );

  const water = makePixelCanvas(
    128,
    (ctx, s) => {
      ctx.fillStyle = '#18889e';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 8) {
        for (let x = 0; x < s; x += 8) {
          const r = seededNoise(x, y, 99);
          if (r > 0.72) {
            ctx.fillStyle = '#2ba7bc';
            ctx.fillRect(x, y, 10, 4);
          } else if (r < 0.22) {
            ctx.fillStyle = '#137288';
            ctx.fillRect(x, y, 12, 4);
          }
          if (r > 0.93) {
            ctx.fillStyle = '#8ce5ec';
            ctx.fillRect(x + 2, y + 1, 6, 2);
          }
        }
      }
    },
    { repeat: [18, 18] }
  );

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 64;
  shadowCanvas.height = 64;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const grad = sCtx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(3, 24, 35, 0.58)');
    grad.addColorStop(0.65, 'rgba(3, 24, 35, 0.24)');
    grad.addColorStop(1, 'rgba(3, 24, 35, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
  }
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);
  contactShadow.colorSpace = THREE.SRGBColorSpace;
  contactShadow.needsUpdate = true;

  const all = [
    grass,
    cobblePath,
    sand,
    desertPath,
    ice,
    icePath,
    brick,
    woodPlank,
    cliffRock,
    water,
    contactShadow,
  ];

  return {
    grass,
    cobblePath,
    sand,
    desertPath,
    ice,
    icePath,
    brick,
    woodPlank,
    cliffRock,
    water,
    contactShadow,
    dispose: () => {
      for (const tex of all) {
        tex.dispose();
      }
    },
  };
}

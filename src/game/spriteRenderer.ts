import { getCharacterProfile } from '../data/characters';
import { CharacterId, LightMode, PaintingData, ThemeId } from '../types/museum';

export const PALETTE = {
  NEGRO: '#040504',
  BLANCO: '#FCFCFC',
  GRIS: '#989898',
  PASTO: '#008F3F',
  HOJA: '#2B6825',
  ARENA: '#FFDAA6',
  ARENA_OSCURA: '#E0B880',
  TEAL: '#027A8C',
  TEAL_OSCURO: '#014C57',
  TEAL_CLARO: '#05A2BA',
  AGUA: '#3CBCFC',
  AGUA_OSCURA: '#0068DE',
  CORAZON: '#D82820',
  MADERA: '#8A4800',
  MADERA_CLARA: '#B86A20',
  DORADO: '#F8B800',
  PIEL: '#FCE0A8',
  ROPA_AZUL: '#0058F8',
  ROPA_ROJA: '#D82820',
};

export interface VoxelPalette {
  id: ThemeId;
  name: string;
  piedra: string[];
  piedraC: string[];
  madera: string[];
  cesped: string[];
  tierra: string[];
  oro: string[];
  piel: string[];
  pelo: string[];
  ropaAzul: string[];
  ropaRoja: string[];
  agua: string[];
  hojas: string[];
}

export const PALETAS: Record<ThemeId, VoxelPalette> = {
  classic: {
    id: 'classic',
    name: 'Clásico Híbrido',
    piedra: ['#6b6b6b', '#7a7a7a', '#5a5a5a', '#4a4a4a'],
    piedraC: ['#8a8a8a', '#9a9a9a', '#7a7a7a', '#6a6a6a'],
    madera: ['#8b5a2b', '#a0703a', '#6b4420', '#5a3410'],
    cesped: ['#4a7c3a', '#5a8c4a', '#3a6c2a', '#2a5c1a'],
    tierra: ['#8b6f47', '#7b5f37', '#9b7f57', '#6b4f27'],
    oro: ['#d4af37', '#f4cf57', '#b48f17', '#947f07'],
    piel: ['#f4c8a0', '#e4b890', '#d4a880', '#c49870'],
    pelo: ['#4a2c1a', '#3a1c0a', '#5a3c2a', '#2a0c00'],
    ropaAzul: ['#3a5a8a', '#2a4a7a', '#4a6a9a', '#1a3a6a'],
    ropaRoja: ['#8a3a3a', '#7a2a2a', '#9a4a4a', '#6a1a1a'],
    agua: ['#3a8ccc', '#2a7cbc', '#4a9cdc', '#1a6cac'],
    hojas: ['#2a6c2a', '#3a7c3a', '#1a5c1a', '#4a8c4a'],
  },
  night: {
    id: 'night',
    name: 'Calabozo Nocturno',
    piedra: ['#323846', '#424a5c', '#252b36', '#181c24'],
    piedraC: ['#4a5468', '#5b677e', '#3a4252', '#282e3a'],
    madera: ['#4e3624', '#61442f', '#3c291b', '#291b12'],
    cesped: ['#1d3b2b', '#264e39', '#142a1f', '#0c1a13'],
    tierra: ['#3b3228', '#4b3f33', '#2d251e', '#1c1713'],
    oro: ['#ffcc00', '#ffe066', '#cca300', '#997a00'],
    piel: ['#d8b08c', '#c69d7a', '#b48a68', '#987050'],
    pelo: ['#251810', '#1c120c', '#332216', '#120b07'],
    ropaAzul: ['#223a60', '#182b48', '#304f80', '#101d30'],
    ropaRoja: ['#992222', '#801818', '#b33030', '#661010'],
    agua: ['#184e77', '#123d5e', '#23699e', '#0c273d'],
    hojas: ['#16381e', '#1e4c29', '#0f2715', '#286235'],
  },
  twilight: {
    id: 'twilight',
    name: 'Crepúsculo Cósmico',
    piedra: ['#5c4a63', '#6e5875', '#493a4f', '#362a3b'],
    piedraC: ['#75617d', '#897291', '#614f68', '#4c3e52'],
    madera: ['#6d4239', '#825045', '#57342d', '#402621'],
    cesped: ['#3d5c48', '#4b6e58', '#2e4737', '#1f3025'],
    tierra: ['#6e4a42', '#80564d', '#573a34', '#3d2824'],
    oro: ['#fca048', '#ffb96e', '#d98132', '#b3631f'],
    piel: ['#fcd0b0', '#eabda0', '#d8a990', '#c0927a'],
    pelo: ['#3d1f30', '#2d1422', '#4e2a3e', '#1f0c16'],
    ropaAzul: ['#4a3a78', '#382a60', '#5e4b94', '#281d48'],
    ropaRoja: ['#963250', '#802640', '#ad4062', '#661930'],
    agua: ['#6a4a8c', '#573a75', '#7f59a6', '#432a5c'],
    hojas: ['#2f4d38', '#3b5f46', '#223829', '#477354'],
  },
  gameboy: {
    id: 'gameboy',
    name: 'Retro Game Boy (1989)',
    piedra: ['#306230', '#8bac0f', '#0f380f', '#0f380f'],
    piedraC: ['#8bac0f', '#9bbc0f', '#306230', '#0f380f'],
    madera: ['#306230', '#8bac0f', '#0f380f', '#0f380f'],
    cesped: ['#8bac0f', '#9bbc0f', '#306230', '#0f380f'],
    tierra: ['#306230', '#8bac0f', '#0f380f', '#0f380f'],
    oro: ['#9bbc0f', '#9bbc0f', '#8bac0f', '#306230'],
    piel: ['#9bbc0f', '#8bac0f', '#8bac0f', '#306230'],
    pelo: ['#0f380f', '#0f380f', '#306230', '#0f380f'],
    ropaAzul: ['#306230', '#0f380f', '#8bac0f', '#0f380f'],
    ropaRoja: ['#306230', '#0f380f', '#8bac0f', '#0f380f'],
    agua: ['#8bac0f', '#306230', '#9bbc0f', '#0f380f'],
    hojas: ['#306230', '#8bac0f', '#0f380f', '#9bbc0f'],
  },
};

export interface RoomRenderDescriptor {
  id: string;
  isOutdoor: boolean;
  layout: string[];
  torches?: { x: number; y: number }[];
  interactives?: Array<{
    type: string;
    x: number;
    y: number;
  }>;
}

interface Particle {
  type: 'water' | 'leaf' | 'spark' | 'magic';
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity?: number;
  t?: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles = 55;

  reset(): void {
    this.particles = [];
  }

  update(room: RoomRenderDescriptor | null, torches: { x: number; y: number }[], palette: VoxelPalette): void {
    if (!room) return;
    const items = room.interactives || [];

    if (room.isOutdoor) {
      const fountain = items.find((i) => i.type === 'fountain');
      const tree = items.find((i) => i.type === 'tree');

      if (fountain && this.particles.length < this.maxParticles && Math.random() < 0.55) {
        this.particles.push({
          type: 'water',
          x: fountain.x + 16 + (Math.random() * 14 - 7),
          y: fountain.y + 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1.1 - Math.random() * 0.8,
          gravity: 0.06,
          life: 24 + Math.floor(Math.random() * 14),
          maxLife: 38,
          color: Math.random() < 0.5 ? '#ffffff' : palette.agua[1],
          size: Math.random() < 0.7 ? 1 : 2,
        });
      }

      if (this.particles.length < this.maxParticles && Math.random() < 0.14) {
        const tx = tree ? tree.x : Math.random() * 220;
        const ty = tree ? tree.y : Math.random() * 60;
        this.particles.push({
          type: 'leaf',
          x: tx + Math.random() * 28,
          y: ty + Math.random() * 16,
          vx: 0.28 + Math.random() * 0.28,
          vy: 0.24 + Math.random() * 0.22,
          t: Math.random() * 100,
          life: 75 + Math.floor(Math.random() * 40),
          maxLife: 115,
          color: palette.hojas[Math.floor(Math.random() * palette.hojas.length)],
          size: 2,
        });
      }
    } else {
      if (torches.length && this.particles.length < this.maxParticles && Math.random() < 0.3) {
        const t = torches[Math.floor(Math.random() * torches.length)];
        this.particles.push({
          type: 'spark',
          x: t.x + 7 + (Math.random() - 0.5) * 4,
          y: t.y + 2,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.4 - Math.random() * 0.4,
          gravity: -0.005,
          life: 18 + Math.floor(Math.random() * 10),
          maxLife: 28,
          color: Math.random() < 0.6 ? palette.oro[1] : palette.ropaRoja[0],
          size: 1,
        });
      }

      if (this.particles.length < this.maxParticles && Math.random() < 0.08) {
        this.particles.push({
          type: 'magic',
          x: 20 + Math.random() * 216,
          y: 20 + Math.random() * 136,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.15 - Math.random() * 0.15,
          life: 50 + Math.floor(Math.random() * 40),
          maxLife: 90,
          color: palette.oro[0],
          size: 1,
        });
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= 1;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      if (p.type === 'water') {
        p.vy += p.gravity || 0;
        p.x += p.vx;
        p.y += p.vy;
      } else if (p.type === 'leaf') {
        p.t = (p.t || 0) + 0.05;
        p.x += p.vx + Math.sin(p.t) * 0.35;
        p.y += p.vy;
      } else {
        p.vy += p.gravity || 0;
        p.x += p.vx;
        p.y += p.vy;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = Math.min(1, (p.life / p.maxLife) * 1.4);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      ctx.restore();
    }
  }
}

export class SpriteRenderer {
  public currentThemeName: ThemeId = 'classic';
  public palette: VoxelPalette = PALETAS.classic;
  public lightMode: LightMode = 'auto';
  public particles = new ParticleSystem();
  private lightCanvas: HTMLCanvasElement | null = null;
  private lightCtx: CanvasRenderingContext2D | null = null;

  setTheme(themeName: ThemeId): void {
    this.currentThemeName = themeName;
    this.palette = PALETAS[themeName];
    this.particles.reset();
  }

  nextTheme(): ThemeId {
    const keys: ThemeId[] = ['classic', 'night', 'twilight', 'gameboy'];
    const nextIdx = (keys.indexOf(this.currentThemeName) + 1) % keys.length;
    this.setTheme(keys[nextIdx]);
    return keys[nextIdx];
  }

  toggleLighting(): LightMode {
    const modes: LightMode[] = ['auto', 'on', 'off'];
    this.lightMode = modes[(modes.indexOf(this.lightMode) + 1) % modes.length];
    return this.lightMode;
  }

  getUiPalette() {
    const t = this.currentThemeName;
    if (t === 'night') {
      return { ...PALETTE, NEGRO: '#04070f', BLANCO: '#dce6f4', TEAL: '#184e77', DORADO: '#ffcc00' };
    }
    if (t === 'twilight') {
      return { ...PALETTE, NEGRO: '#1a1018', BLANCO: '#f4e4d8', TEAL: '#6a4a8c', DORADO: '#fca048' };
    }
    if (t === 'gameboy') {
      return { ...PALETTE, NEGRO: '#0f380f', BLANCO: '#9bbc0f', TEAL: '#306230', DORADO: '#9bbc0f' };
    }
    return PALETTE;
  }

  renderTile(
    ctx: CanvasRenderingContext2D,
    tileType: string,
    x: number,
    y: number,
    animTick = 0
  ): void {
    ctx.imageSmoothingEnabled = false;
    const px = Math.floor(x);
    const py = Math.floor(y);

    switch (tileType) {
      case 'wall':
        this.drawVoxelWall(ctx, px, py);
        break;
      case 'ice_wall':
        this.drawIceWall(ctx, px, py);
        break;
      case 'grass':
        this.drawVoxelGrass(ctx, px, py);
        break;
      case 'sand':
        this.drawVoxelSand(ctx, px, py);
        break;
      case 'ice_floor':
        this.drawIceFloor(ctx, px, py);
        break;
      case 'dungeon_floor':
        this.drawVoxelStoneFloor(ctx, px, py);
        break;
      case 'path':
        this.drawVoxelPath(ctx, px, py);
        break;
      case 'bush':
        this.drawVoxelBush(ctx, px, py);
        break;
      case 'door':
        this.drawVoxelDoor(ctx, px, py);
        break;
      case 'exit_portal':
        this.drawExitPortal(ctx, px, py, animTick);
        break;
      case 'water':
        this.drawVoxelWater(ctx, px, py, animTick);
        break;
      case 'pedestal':
        this.drawVoxelPedestal(ctx, px, py, animTick);
        break;
      case 'arcade':
        this.drawVoxelArcade(ctx, px, py, animTick);
        break;
      case 'painting':
        this.drawVoxelPainting(ctx, px, py);
        break;
      case 'fountain_center':
        this.drawVoxelFountain(ctx, px, py, animTick);
        break;
      case 'tree_top_left':
      case 'tree_bottom_left':
        this.drawVoxelTree(ctx, px, py, tileType);
        break;
      case 'shelf':
        this.drawVoxelShelf(ctx, px, py);
        break;
      default:
        this.drawVoxelStoneFloor(ctx, px, py);
    }
  }

  private drawVoxelWall(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const p = this.palette.piedra;
    ctx.fillStyle = p[3];
    ctx.fillRect(x, y, 16, 16);
    const brick = (bx: number, by: number, bw: number) => {
      ctx.fillStyle = p[0];
      ctx.fillRect(x + bx, y + by, bw, 3);
      ctx.fillStyle = p[1];
      ctx.fillRect(x + bx, y + by, bw, 1);
      ctx.fillRect(x + bx, y + by, 1, 3);
      ctx.fillStyle = p[2];
      ctx.fillRect(x + bx, y + by + 2, bw, 1);
    };
    brick(0, 0, 7);
    brick(8, 0, 8);
    brick(0, 4, 3);
    brick(4, 4, 7);
    brick(12, 4, 4);
    brick(0, 8, 7);
    brick(8, 8, 8);
    brick(0, 12, 3);
    brick(4, 12, 7);
    brick(12, 12, 4);
    if ((x + y) % 5 === 0) {
      ctx.fillStyle = 'rgba(60,120,40,0.45)';
      ctx.fillRect(x + 5, y + 5, 3, 1);
    }
  }

  private drawIceWall(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#3f6079';
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = '#75c5dd';
    ctx.fillRect(x + 1, y + 1, 14, 13);
    ctx.fillStyle = '#b9e7ef';
    ctx.fillRect(x + 2, y + 2, 10, 4);
    ctx.fillStyle = '#e2f7f5';
    ctx.fillRect(x + 2, y + 2, 5, 2);
  }

  private drawIceFloor(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#79b7cc';
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = '#97cfdf';
    ctx.fillRect(x + 1, y + 1, 6, 6);
    ctx.fillRect(x + 9, y + 9, 6, 6);
    ctx.fillStyle = '#cbeff5';
    ctx.fillRect(x + 2, y + 2, 3, 1);
    ctx.fillRect(x + 10, y + 10, 3, 1);
  }

  private drawVoxelGrass(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const p = this.palette.cesped;
    ctx.fillStyle = p[0];
    ctx.fillRect(x, y, 16, 16);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = p[(i % 3) + 1];
      ctx.fillRect(x + ((i * 3) % 14), y + ((i * 5) % 14), 2, 2);
    }
    ctx.fillStyle = p[2];
    ctx.fillRect(x + 3, y + 3, 1, 3);
    ctx.fillRect(x + 10, y + 8, 1, 3);
  }

  private drawVoxelSand(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#d9aa66';
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = '#f6d48c';
    ctx.fillRect(x + 2, y + 4, 4, 1);
    ctx.fillRect(x + 9, y + 11, 5, 1);
    ctx.fillStyle = '#b9854e';
    ctx.fillRect(x + 6, y + 8, 2, 1);
    ctx.fillRect(x + 12, y + 3, 2, 1);
  }

  private drawVoxelStoneFloor(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const p = this.palette.piedraC;
    ctx.fillStyle = p[0];
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = p[1];
    ctx.fillRect(x + 1, y + 1, 6, 6);
    ctx.fillRect(x + 9, y + 9, 6, 6);
    ctx.fillStyle = p[2];
    ctx.fillRect(x + 9, y + 1, 6, 6);
    ctx.fillRect(x + 1, y + 9, 6, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x, y + 7, 16, 1);
    ctx.fillRect(x + 7, y, 1, 16);
  }

  private drawVoxelPath(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const p = this.palette.tierra;
    ctx.fillStyle = p[0];
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = p[1];
    ctx.fillRect(x + 2, y + 6, 3, 1);
    ctx.fillRect(x + 9, y + 2, 3, 1);
    ctx.fillStyle = p[3];
    ctx.fillRect(x + 5, y + 5, 1, 1);
    ctx.fillRect(x + 11, y + 9, 1, 1);
  }

  private drawVoxelBush(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const p = this.palette.hojas;
    ctx.fillStyle = p[0];
    ctx.fillRect(x + 2, y + 4, 12, 10);
    ctx.fillStyle = p[1];
    ctx.fillRect(x + 4, y + 6, 3, 3);
    ctx.fillRect(x + 9, y + 6, 3, 3);
    ctx.fillStyle = p[3];
    ctx.fillRect(x + 5, y + 5, 2, 2);
  }

  private drawVoxelDoor(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const p = this.palette.madera;
    ctx.fillStyle = p[3];
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = p[0];
    ctx.fillRect(x + 2, y + 2, 12, 14);
    ctx.fillStyle = p[1];
    ctx.fillRect(x + 2, y + 2, 5, 14);
    ctx.fillRect(x + 9, y + 2, 5, 14);
    ctx.fillStyle = this.palette.oro[0];
    ctx.fillRect(x + 11, y + 8, 2, 2);
  }

  private drawExitPortal(ctx: CanvasRenderingContext2D, x: number, y: number, animTick: number): void {
    const pulse = Math.floor(animTick * 0.15) % 2;
    ctx.fillStyle = '#083f53';
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = pulse === 0 ? '#16a6bb' : '#3cbcfc';
    ctx.fillRect(x + 2, y + 2, 12, 12);
    ctx.fillStyle = '#ffe8a2';
    ctx.fillRect(x + 5, y + 5, 6, 6);
  }

  private drawVoxelTorch(ctx: CanvasRenderingContext2D, x: number, y: number, animTick: number): void {
    const p = this.palette.madera;
    const g = this.palette.piedra;
    ctx.fillStyle = g[3];
    ctx.fillRect(x + 5, y + 6, 6, 8);
    ctx.fillStyle = p[0];
    ctx.fillRect(x + 7, y + 4, 2, 7);
    const flameFrame = Math.floor((animTick + x * 2) * 0.25) % 3;
    const fOff = flameFrame === 1 ? -1 : flameFrame === 2 ? 1 : 0;
    ctx.fillStyle = this.palette.oro[1];
    ctx.fillRect(x + 6 + fOff, y + 1, 4, 4);
    ctx.fillStyle = this.palette.ropaRoja[0];
    ctx.fillRect(x + 7 + fOff, y, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 7 + fOff, y + 2, 2, 2);
  }

  private drawVoxelWater(ctx: CanvasRenderingContext2D, x: number, y: number, animTick: number): void {
    const w = this.palette.agua;
    const shift = Math.floor(animTick * 0.15) % 4;
    ctx.fillStyle = w[0];
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = w[2];
    ctx.fillRect(x + 2 + shift * 2, y + 4, 4, 1);
    ctx.fillRect(x + 8 - shift * 2, y + 11, 4, 1);
  }

  drawVoxelPedestal(ctx: CanvasRenderingContext2D, x: number, y: number, animTick = 0): void {
    const p = this.palette.piedra;
    ctx.fillStyle = p[0];
    ctx.fillRect(x + 2, y + 8, 12, 8);
    ctx.fillStyle = p[1];
    ctx.fillRect(x + 4, y + 4, 8, 6);
    ctx.fillStyle = p[2];
    ctx.fillRect(x + 3, y + 2, 10, 3);
    const floatOffset = Math.round(Math.sin(animTick * 0.1) * 1.5);
    ctx.fillStyle = this.palette.oro[0];
    ctx.fillRect(x + 6, y + floatOffset, 4, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(x + 6, y + floatOffset, 2, 2);
  }

  drawVoxelArcade(ctx: CanvasRenderingContext2D, x: number, y: number, animTick = 0): void {
    ctx.fillStyle = '#273a5b';
    ctx.fillRect(x + 2, y + 2, 12, 14);
    ctx.fillStyle = '#082f42';
    ctx.fillRect(x + 4, y + 4, 8, 6);
    ctx.fillStyle = Math.floor(animTick * 0.12) % 2 === 0 ? '#68e0d4' : '#f7c85b';
    ctx.fillRect(x + 5, y + 5, 6, 4);
    ctx.fillStyle = '#d82820';
    ctx.fillRect(x + 5, y + 12, 2, 2);
    ctx.fillStyle = '#f8b800';
    ctx.fillRect(x + 9, y + 12, 2, 2);
  }

  drawVoxelPainting(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const o = this.palette.oro;
    ctx.fillStyle = o[2];
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = o[0];
    ctx.fillRect(x + 1, y + 1, 14, 14);
    ctx.fillStyle = '#12100a';
    ctx.fillRect(x + 3, y + 3, 10, 10);
    ctx.fillStyle = o[1];
    ctx.fillRect(x + 5, y + 5, 3, 3);
    ctx.fillStyle = this.palette.agua[0];
    ctx.fillRect(x + 9, y + 6, 2, 4);
    ctx.fillStyle = this.palette.ropaRoja[0];
    ctx.fillRect(x + 5, y + 9, 4, 2);
  }

  private drawVoxelFountain(ctx: CanvasRenderingContext2D, x: number, y: number, animTick: number): void {
    const p = this.palette.piedra;
    const w = this.palette.agua;
    ctx.fillStyle = p[0];
    ctx.fillRect(x + 2, y + 8, 12, 6);
    ctx.fillRect(x + 4, y + 6, 8, 2);
    const waterPhase = Math.floor(animTick * 0.2) % 2;
    ctx.fillStyle = w[waterPhase];
    ctx.fillRect(x + 4, y + 8, 8, 4);
    ctx.fillStyle = w[2];
    ctx.fillRect(x + 7, y + 4, 2, 4);
    ctx.fillRect(x + 6, y + 2, 1, 2);
    ctx.fillRect(x + 9, y + 2, 1, 2);
  }

  private drawVoxelTree(ctx: CanvasRenderingContext2D, x: number, y: number, type: string): void {
    const p = this.palette.madera;
    const l = this.palette.hojas;
    if (type === 'tree_bottom_left') {
      ctx.fillStyle = this.palette.cesped[0];
      ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = l[0];
      ctx.fillRect(x, y, 16, 7);
      ctx.fillStyle = p[0];
      ctx.fillRect(x + 5, y + 5, 6, 11);
    } else {
      ctx.fillStyle = l[0];
      ctx.fillRect(x + 2, y + 2, 12, 12);
      ctx.fillRect(x + 4, y, 8, 4);
      ctx.fillStyle = l[1];
      ctx.fillRect(x + 4, y + 3, 3, 3);
      ctx.fillRect(x + 9, y + 5, 3, 3);
      ctx.fillStyle = l[3];
      ctx.fillRect(x + 5, y + 2, 2, 2);
    }
  }

  private drawVoxelShelf(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const p = this.palette.madera;
    ctx.fillStyle = p[0];
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = p[1];
    ctx.fillRect(x, y + 4, 16, 2);
    ctx.fillRect(x, y + 10, 16, 2);
    ctx.fillStyle = this.palette.ropaRoja[0];
    ctx.fillRect(x + 2, y + 1, 3, 3);
    ctx.fillStyle = this.palette.ropaAzul[0];
    ctx.fillRect(x + 6, y + 1, 4, 3);
    ctx.fillStyle = this.palette.oro[0];
    ctx.fillRect(x + 11, y + 1, 3, 3);
  }

  drawVoxelSign(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const p = this.palette.piedra;
    const o = this.palette.oro;
    ctx.fillStyle = p[3];
    ctx.fillRect(x + 2, y + 3, 12, 10);
    ctx.fillStyle = p[0];
    ctx.fillRect(x + 3, y + 4, 10, 8);
    ctx.fillStyle = o[1];
    ctx.fillRect(x + 4, y + 6, 8, 1);
    ctx.fillRect(x + 4, y + 8, 6, 1);
    ctx.fillRect(x + 4, y + 10, 7, 1);
  }

  drawVoxelGuestbook(ctx: CanvasRenderingContext2D, px: number, py: number, animTick = 0): void {
    const x = Math.floor(px);
    const y = Math.floor(py);
    const m = this.palette.madera;
    const o = this.palette.oro;
    // Sombra base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(x + 2, y + 14, 12, 2);
    // Atril de madera
    ctx.fillStyle = m[0];
    ctx.fillRect(x + 5, y + 8, 6, 7);
    ctx.fillStyle = m[1];
    ctx.fillRect(x + 2, y + 4, 12, 6);
    // Páginas abiertas en crema
    ctx.fillStyle = '#f8f3dc';
    ctx.fillRect(x + 3, y + 3, 10, 5);
    ctx.fillStyle = '#cfc5a4';
    ctx.fillRect(x + 7, y + 3, 2, 5);
    // Renglones escritos y listón rojo/dorado
    ctx.fillStyle = '#4c6f73';
    ctx.fillRect(x + 4, y + 4, 2, 1);
    ctx.fillRect(x + 4, y + 6, 2, 1);
    ctx.fillRect(x + 10, y + 4, 2, 1);
    ctx.fillStyle = this.palette.ropaRoja[0];
    ctx.fillRect(x + 8, y + 7, 1, 3);
    // Destello dorado suave
    if (Math.floor(animTick / 20) % 2 === 0) {
      ctx.fillStyle = o[1];
      ctx.fillRect(x + 11, y + 1, 2, 2);
    }
  }

  renderTorches(ctx: CanvasRenderingContext2D, torches: { x: number; y: number }[], animTick = 0): void {
    for (const t of torches) {
      this.drawVoxelTorch(ctx, t.x, t.y, animTick);
    }
  }

  renderLighting(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    player: { x: number; y: number },
    room: RoomRenderDescriptor,
    torches: { x: number; y: number }[],
    animTick = 0
  ): void {
    if (this.lightMode === 'off') return;
    const theme = this.currentThemeName;
    const isNight = theme === 'night';
    const isTwilight = theme === 'twilight';
    const isGB = theme === 'gameboy';

    if (this.lightMode === 'auto' && room.isOutdoor && !isNight && !isTwilight) return;

    const darknessAlpha = room.isOutdoor
      ? isTwilight
        ? 0.45
        : isNight
          ? 0.65
          : 0.56
      : isGB
        ? 0.48
        : 0.72;

    if (!this.lightCanvas || this.lightCanvas.width !== width || this.lightCanvas.height !== height) {
      this.lightCanvas = document.createElement('canvas');
      this.lightCanvas.width = width;
      this.lightCanvas.height = height;
      this.lightCtx = this.lightCanvas.getContext('2d');
    }
    const lCtx = this.lightCtx;
    if (!lCtx || !this.lightCanvas) return;

    lCtx.clearRect(0, 0, width, height);
    lCtx.fillStyle = isGB
      ? `rgba(15, 56, 15, ${darknessAlpha})`
      : isTwilight
        ? `rgba(28, 12, 36, ${darknessAlpha})`
        : `rgba(6, 12, 22, ${darknessAlpha})`;
    lCtx.fillRect(0, 0, width, height);

    lCtx.globalCompositeOperation = 'destination-out';
    const punchLight = (lx: number, ly: number, baseRadius: number, flicker = 0) => {
      const r = Math.max(12, baseRadius + flicker);
      const grad = lCtx.createRadialGradient(lx, ly, Math.max(2, r * 0.16), lx, ly, r);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.65, 'rgba(0,0,0,0.58)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      lCtx.fillStyle = grad;
      lCtx.beginPath();
      lCtx.arc(lx, ly, r, 0, Math.PI * 2);
      lCtx.fill();
    };

    punchLight(player.x + 8, player.y + 8, isNight ? 52 : 62, Math.sin(animTick * 0.12) * 1.5);

    torches.forEach((t, i) => {
      punchLight(t.x + 8, t.y + 8, 46, Math.sin(animTick * 0.2 + i * 1.7) * 2.2);
    });

    (room.interactives || []).forEach((item, i) => {
      if (
        item.type === 'pedestal' ||
        item.type === 'painting' ||
        item.type === 'arcade' ||
        item.type === 'guestbook'
      ) {
        punchLight(item.x + 8, item.y + 8, 28, Math.sin(animTick * 0.08 + i) * 1.2);
      } else if (item.type === 'fountain') {
        punchLight(item.x + 16, item.y + 12, 48, Math.sin(animTick * 0.1) * 2);
      }
    });

    lCtx.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.drawImage(this.lightCanvas, 0, 0);
    ctx.restore();
  }

  renderPlayer(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    direction: 'up' | 'down' | 'left' | 'right',
    walkFrame = 0,
    characterId: CharacterId = 'explorador'
  ): void {
    ctx.imageSmoothingEnabled = false;
    const p = this.palette;
    const profile = getCharacterProfile(characterId);
    const x = Math.floor(px);
    const y = Math.floor(py);
    const isCustomChar = characterId !== 'explorador';
    const tunica = isCustomChar ? profile.tunicColor : p.hojas[0];
    const tunicaSombra = isCustomChar ? profile.trousersColor : p.hojas[2];
    const gorro = isCustomChar ? profile.tunicColor : p.hojas[1];
    const acento = isCustomChar ? profile.trimColor : p.oro[0];
    const piel = isCustomChar ? profile.skinColor : p.piel[0];
    const botas = isCustomChar ? profile.bootColor : p.madera[0];

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x + 3, y + 14, 10, 2);

    if (direction === 'down' || direction === 'up') {
      ctx.fillStyle = botas;
      if (walkFrame === 0) {
        ctx.fillRect(x + 5, y + 12, 3, 2);
        ctx.fillRect(x + 9, y + 12, 2, 2);
      } else {
        ctx.fillRect(x + 4, y + 12, 2, 2);
        ctx.fillRect(x + 9, y + 12, 3, 2);
      }
      ctx.fillStyle = '#e8d8a0';
      ctx.fillRect(x + 5, y + 11, 2, 1);
      ctx.fillRect(x + 9, y + 11, 2, 1);

      ctx.fillStyle = tunica;
      ctx.fillRect(x + 4, y + 7, 8, 4);
      ctx.fillStyle = profile.scarfColor;
      ctx.fillRect(x + 4, y + 9, 8, 1);
      ctx.fillStyle = tunicaSombra;
      ctx.fillRect(x + 4, y + 10, 8, 1);

      if (direction === 'down') {
        ctx.fillStyle = piel;
        ctx.fillRect(x + 5, y + 3, 6, 4);
        if (profile.hatStyle === 'robot') {
          ctx.fillStyle = acento;
          ctx.fillRect(x + 5, y + 4, 6, 2);
        } else {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x + 6, y + 5, 1, 1);
          ctx.fillRect(x + 9, y + 5, 1, 1);
        }
        ctx.fillStyle = gorro;
        ctx.fillRect(x + 4, y + 1, 8, 3);
      } else {
        ctx.fillStyle = gorro;
        ctx.fillRect(x + 4, y + 1, 8, 5);
        ctx.fillStyle = tunicaSombra;
        ctx.fillRect(x + 4, y + 5, 8, 1);
      }

      if (profile.hatStyle === 'headphones') {
        ctx.fillStyle = acento;
        ctx.fillRect(x + 3, y + 2, 1, 4);
        ctx.fillRect(x + 12, y + 2, 1, 4);
      } else if (profile.hatStyle === 'chef') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5, y, 6, 2);
      } else if (profile.hatStyle === 'wizard') {
        ctx.fillStyle = acento;
        ctx.fillRect(x + 3, y + 3, 10, 1);
        ctx.fillStyle = gorro;
        ctx.fillRect(x + 6, y, 4, 1);
      } else if (profile.hatStyle === 'robot') {
        ctx.fillStyle = acento;
        ctx.fillRect(x + 7, y, 2, 1);
      } else {
        ctx.fillStyle = gorro;
        ctx.fillRect(x + 3, y, 2, 1);
      }
    } else {
      const isLeft = direction === 'left';
      const cx = x + (isLeft ? 0 : 1);
      ctx.fillStyle = botas;
      if (walkFrame === 0) {
        ctx.fillRect(cx + 6, y + 12, 3, 2);
      } else {
        ctx.fillRect(cx + 5, y + 12, 2, 2);
        ctx.fillRect(cx + 8, y + 12, 2, 2);
      }
      ctx.fillStyle = '#e8d8a0';
      ctx.fillRect(cx + 6, y + 11, 3, 1);
      ctx.fillStyle = tunica;
      ctx.fillRect(cx + 5, y + 7, 6, 4);
      ctx.fillStyle = tunicaSombra;
      ctx.fillRect(cx + 5, y + 10, 6, 1);
      ctx.fillStyle = piel;
      ctx.fillRect(cx + 5, y + 3, 6, 4);
      if (profile.hatStyle === 'robot') {
        ctx.fillStyle = acento;
        ctx.fillRect(cx + (isLeft ? 5 : 8), y + 4, 3, 2);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx + (isLeft ? 6 : 9), y + 5, 1, 1);
      }
      ctx.fillStyle = gorro;
      ctx.fillRect(cx + 5, y + 1, 6, 3);
      ctx.fillRect(cx + (isLeft ? 3 : 11), y + 2, 2, 1);
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 3.5, y + 0.5, 9, 14);
  }

  renderNPC(ctx: CanvasRenderingContext2D, px: number, py: number, type: 'receptionist' | 'shopkeeper' = 'receptionist'): void {
    ctx.imageSmoothingEnabled = false;
    const p = this.palette;
    const x = Math.floor(px);
    const y = Math.floor(py);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x + 4, y + 14, 8, 2);

    if (type === 'receptionist') {
      ctx.fillStyle = p.ropaRoja[0];
      ctx.fillRect(x + 4, y + 7, 8, 7);
      ctx.fillStyle = p.piel[0];
      ctx.fillRect(x + 5, y + 3, 6, 4);
      ctx.fillStyle = p.pelo[1];
      ctx.fillRect(x + 4, y + 2, 8, 3);
      ctx.fillRect(x + 4, y + 5, 2, 4);
      ctx.fillRect(x + 10, y + 5, 2, 4);
    } else {
      ctx.fillStyle = p.ropaAzul[0];
      ctx.fillRect(x + 4, y + 7, 8, 7);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 5, y + 8, 6, 5);
      ctx.fillStyle = p.piel[0];
      ctx.fillRect(x + 5, y + 3, 6, 4);
      ctx.fillStyle = p.ropaAzul[1];
      ctx.fillRect(x + 4, y + 1, 8, 3);
    }
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 6, y + 5, 1, 1);
    ctx.fillRect(x + 9, y + 5, 1, 1);
  }

  renderSparkle(ctx: CanvasRenderingContext2D, px: number, py: number, animTick = 0): void {
    const x = Math.floor(px);
    const y = Math.floor(py);
    const phase = Math.floor(animTick * 0.3) % 4;
    const size = 2 + phase;
    ctx.fillStyle = this.palette.oro[1];
    ctx.fillRect(x + 8 - size / 2, y - size / 2, size, size);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(x + 7, y - 1, 2, 2);
  }

  renderHeart(ctx: CanvasRenderingContext2D, px: number, py: number, filled = true): void {
    const x = Math.floor(px);
    const y = Math.floor(py);
    ctx.fillStyle = filled ? this.palette.ropaRoja[0] : '#333333';
    ctx.fillRect(x + 1, y, 2, 1);
    ctx.fillRect(x + 5, y, 2, 1);
    ctx.fillRect(x, y + 1, 8, 2);
    ctx.fillRect(x + 1, y + 3, 6, 2);
    ctx.fillRect(x + 2, y + 5, 4, 1);
    ctx.fillRect(x + 3, y + 6, 2, 1);
    if (filled) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(x + 1, y + 1, 2, 1);
    }
  }
}

export function renderProceduralPainting(canvas: HTMLCanvasElement, data: PaintingData): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const pal = data.palette?.length ? data.palette : ['#027A8C', '#3CBCFC', '#FCFCFC', '#040504'];
  ctx.fillStyle = pal[0];
  ctx.fillRect(0, 0, 160, 120);

  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = pal[(i + 1) % pal.length];
    const w = 18 + ((data.id * 17 + i * 13) % 58);
    const h = 14 + ((data.id * 23 + i * 19) % 48);
    const x = (data.id * 29 + i * 23) % (160 - w);
    const y = (data.id * 31 + i * 17) % (120 - h);
    ctx.fillRect(x, y, w, h);
  }

  // Pequeño detalle focal pixelado
  ctx.fillStyle = pal[pal.length - 1];
  ctx.fillRect(68, 48, 24, 24);
  ctx.fillStyle = pal[1] || '#f8b800';
  ctx.fillRect(74, 54, 12, 12);

  ctx.strokeStyle = '#e1c875';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 156, 116);
}

export const spriteRenderer = new SpriteRenderer();

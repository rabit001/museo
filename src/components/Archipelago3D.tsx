import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Aperture,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  ChevronDown,
  ChevronUp,
  Compass,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { retroAudio } from '../game/audio';
import { createHeroRig, HeroRig, updateHeroAnimation } from '../three/heroCharacter';
import { createProceduralTextures } from '../three/textures';
import {
  ArchipelagoWorld3D,
  buildArchipelagoWorld3D,
  DECK_Y,
  ExhibitTrigger,
} from '../three/worldBuilder';
import { CharacterId, Island, MuseumPiece, MuseumThemeConfig } from '../types/museum';
import { ArchipelagoPerspectiveCanvas } from './ArchipelagoPerspectiveCanvas';
import { MiniCompassHandle, MiniCompassRadar } from './MiniCompassRadar';

type CameraPreset = 'cerca' | 'media' | 'panoramica';

interface Archipelago3DProps {
  islands: Island[];
  piecesByIsland: Record<string, MuseumPiece[]>;
  characterId?: CharacterId;
  theme?: MuseumThemeConfig;
  controlsPaused: boolean;
  onSelectIsland: (islandId: string) => void;
  onOpenPiece: (piece: MuseumPiece) => void;
  onEnter2DMode: (islandId: string) => void;
}

const PRESET_CONFIG: Record<
  CameraPreset,
  { dist: number; height: number; lookAhead: number; aperture: number; maxblur: number }
> = {
  cerca: { dist: 7.4, height: 3.4, lookAhead: 2.0, aperture: 0.00024, maxblur: 0.0046 },
  media: { dist: 13.2, height: 6.4, lookAhead: 2.2, aperture: 0.00018, maxblur: 0.0038 },
  panoramica: { dist: 24.5, height: 13.8, lookAhead: 1.5, aperture: 0.00014, maxblur: 0.0032 },
};

function probeWebGLCapability(): { supported: boolean; isSoftware: boolean } {
  try {
    const probe = document.createElement('canvas');
    const attrs: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: true,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    };
    const gl =
      (probe.getContext('webgl2', attrs) as WebGL2RenderingContext | null) ||
      (probe.getContext('webgl', attrs) as WebGLRenderingContext | null) ||
      (probe.getContext('experimental-webgl', attrs) as WebGLRenderingContext | null);
    if (!gl) {
      return { supported: false, isSoftware: true };
    }
    try {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
        if (/SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(renderer)) {
          return { supported: true, isSoftware: true };
        }
      }
      return { supported: true, isSoftware: false };
    } finally {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    return { supported: false, isSoftware: true };
  }
}

function shortestAngleDiff(from: number, to: number): number {
  let diff = (to - from) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

// Module-level reusable math objects (zero allocations inside render loop)
const _camTargetPos = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3();
const _camForward = new THREE.Vector3();
const _heroChest = new THREE.Vector3();
const _toHero = new THREE.Vector3();
const _targetQuat = new THREE.Quaternion();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _heroForward = new THREE.Vector3();

export const Archipelago3D: React.FC<Archipelago3DProps> = ({
  islands,
  piecesByIsland,
  characterId = 'explorador',
  theme,
  controlsPaused,
  onSelectIsland,
  onOpenPiece,
  onEnter2DMode,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const radarRef = useRef<MiniCompassHandle | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const worldRef = useRef<ArchipelagoWorld3D | null>(null);
  const texturesRef = useRef<ReturnType<typeof createProceduralTextures> | null>(null);
  const heroRef = useRef<HeroRig | null>(null);

  // Latest callbacks & state refs to avoid tearing down WebGL on prop updates
  const controlsPausedRef = useRef(controlsPaused);
  controlsPausedRef.current = controlsPaused;
  const onSelectIslandRef = useRef(onSelectIsland);
  onSelectIslandRef.current = onSelectIsland;
  const onOpenPieceRef = useRef(onOpenPiece);
  onOpenPieceRef.current = onOpenPiece;

  // Player & camera mutable physics state
  const playerRef = useRef({
    x: 0,
    y: DECK_Y,
    z: 7.5,
    vx: 0,
    vz: 0,
    vy: 0,
    yaw: Math.PI, // facing -Z toward Patio 404 fountain
    grounded: true,
    safeX: 0,
    safeY: DECK_Y,
    safeZ: 7.5,
  });

  const cameraStateRef = useRef({
    yaw: 0, // camera looks toward -Z when yaw=0
    dist: PRESET_CONFIG.cerca.dist,
    height: PRESET_CONFIG.cerca.height,
    lookAhead: PRESET_CONFIG.cerca.lookAhead,
    targetDist: PRESET_CONFIG.cerca.dist,
    targetHeight: PRESET_CONFIG.cerca.height,
    targetLookAhead: PRESET_CONFIG.cerca.lookAhead,
    aperture: PRESET_CONFIG.cerca.aperture,
    maxblur: PRESET_CONFIG.cerca.maxblur,
    targetAperture: PRESET_CONFIG.cerca.aperture,
    targetMaxblur: PRESET_CONFIG.cerca.maxblur,
    initialized: false,
  });

  const keysRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    camLeft: false,
    camRight: false,
    sprint: false,
    jumpQueued: false,
  });

  const activeTriggerRef = useRef<ExhibitTrigger | null>(null);
  const activeLocationRef = useRef<{ islandId: string | null; label: string }>({
    islandId: null,
    label: 'Patio 404',
  });

  const [webglCap] = useState(() => probeWebGLCapability());
  const [camPreset, setCamPreset] = useState<CameraPreset>('cerca');
  const [dofEnabled, setDofEnabled] = useState(true);
  const dofEnabledRef = useRef(true);
  dofEnabledRef.current = dofEnabled;
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [webglError, setWebglError] = useState(() => !webglCap.supported);
  const [nearbyTrigger, setNearbyTrigger] = useState<{
    id: string;
    kind: 'island' | 'piece';
    islandId: string;
    label: string;
    sublabel: string;
  } | null>(null);
  const [locationLabel, setLocationLabel] = useState('Patio 404');
  const [currentIslandId, setCurrentIslandId] = useState<string | null>('patio');

  const applyCameraPreset = useCallback((preset: CameraPreset) => {
    setCamPreset(preset);
    const cfg = PRESET_CONFIG[preset];
    cameraStateRef.current.targetDist = cfg.dist;
    cameraStateRef.current.targetHeight = cfg.height;
    cameraStateRef.current.targetLookAhead = cfg.lookAhead;
    cameraStateRef.current.targetAperture = cfg.aperture;
    cameraStateRef.current.targetMaxblur = cfg.maxblur;
  }, []);

  const recenterCamera = useCallback(() => {
    const p = playerRef.current;
    // Place camera behind the player's facing yaw
    const targetYaw = p.yaw + Math.PI;
    cameraStateRef.current.yaw = targetYaw;
  }, []);

  const triggerInteract = useCallback(() => {
    const trig = activeTriggerRef.current;
    if (trig) {
      if (trig.kind === 'piece' && trig.piece) {
        onOpenPieceRef.current(trig.piece);
      } else {
        onSelectIslandRef.current(trig.islandId);
      }
      return;
    }
    const loc = activeLocationRef.current;
    if (loc.islandId) {
      onSelectIslandRef.current(loc.islandId);
    }
  }, []);

  // Initialize Three.js WebGL scene once when WebGL is supported
  useEffect(() => {
    if (!webglCap.supported) return;
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = webglCap.isSoftware;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'default',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isSoftwareGl;
    if (!isSoftwareGl) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';

    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(theme?.skyColor || '#6ec9da');
    scene.background = skyColor;
    scene.fog = new THREE.Fog(theme?.skyColor || '#6ec9da', 44, 152);
    sceneRef.current = scene;

    // PMREM environment lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.6;
    pmremGenerator.dispose();

    // Warm sun + cool sky hemisphere lighting
    const hemiLight = new THREE.HemisphereLight(0xdcf6ff, 0x3b6953, 0.78);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff1d6, 1.55);
    dirLight.position.set(22, 34, 24);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    dirLight.shadow.camera.near = 2;
    dirLight.shadow.camera.far = 110;
    const shadowHalf = 28;
    dirLight.shadow.camera.left = -shadowHalf;
    dirLight.shadow.camera.right = shadowHalf;
    dirLight.shadow.camera.top = shadowHalf;
    dirLight.shadow.camera.bottom = -shadowHalf;
    scene.add(dirLight);
    scene.add(dirLight.target);

    const initW = container.clientWidth || window.innerWidth;
    const initH = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(52, initW / initH, 0.2, 260);

    // Depth-of-field post-processing pipeline on hardware GPUs (with MSAA for crisp edges)
    let composerTarget: THREE.WebGLRenderTarget | null = null;
    let composer: EffectComposer | null = null;
    let renderPass: RenderPass | null = null;
    let bokehPass: BokehPass | null = null;
    let outputPass: OutputPass | null = null;

    if (!isSoftwareGl) {
      composerTarget = new THREE.WebGLRenderTarget(initW, initH, {
        type: THREE.HalfFloatType,
        samples: 4,
      });
      composer = new EffectComposer(renderer, composerTarget);
      composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      composer.setSize(initW, initH);

      renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      bokehPass = new BokehPass(scene, camera, {
        focus: PRESET_CONFIG.cerca.dist,
        aperture: PRESET_CONFIG.cerca.aperture,
        maxblur: PRESET_CONFIG.cerca.maxblur,
      });
      composer.addPass(bokehPass);

      outputPass = new OutputPass();
      composer.addPass(outputPass);
    }

    const textures = createProceduralTextures();
    texturesRef.current = textures;

    const hero = createHeroRig(textures.contactShadow, characterId);
    heroRef.current = hero;
    scene.add(hero.root);

    // Build initial archipelago world
    const initialWorld = buildArchipelagoWorld3D(islands, piecesByIsland, textures, theme);
    worldRef.current = initialWorld;
    scene.add(initialWorld.group);

    // Place explorer cleanly at spawn point
    playerRef.current.x = initialWorld.spawnPoint.x;
    playerRef.current.y = initialWorld.spawnPoint.y;
    playerRef.current.z = initialWorld.spawnPoint.z;
    playerRef.current.safeX = initialWorld.spawnPoint.x;
    playerRef.current.safeY = initialWorld.spawnPoint.y;
    playerRef.current.safeZ = initialWorld.spawnPoint.z;
    hero.root.position.set(
      initialWorld.spawnPoint.x,
      initialWorld.spawnPoint.y,
      initialWorld.spawnPoint.z
    );
    hero.root.quaternion.setFromAxisAngle(_yAxis, playerRef.current.yaw);

    // Mouse drag orbit + wheel zoom on canvas
    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 2) return;
      dragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      cameraStateRef.current.yaw -= dx * 0.0065;
      cameraStateRef.current.targetHeight = THREE.MathUtils.clamp(
        cameraStateRef.current.targetHeight + dy * 0.025,
        2.1,
        16.5
      );
    };

    const onPointerUp = () => {
      dragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (controlsPausedRef.current) return;
      e.preventDefault();
      const cs = cameraStateRef.current;
      cs.targetDist = THREE.MathUtils.clamp(cs.targetDist + e.deltaY * 0.012, 4.6, 28);
      cs.targetHeight = THREE.MathUtils.clamp(cs.targetHeight + e.deltaY * 0.0055, 2.2, 16);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) {
        composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        composer.setSize(w, h);
      }
    };
    window.addEventListener('resize', onResize);

    // WebGL context loss handling
    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
    };
    const onContextRestored = () => {
      contextLost = false;
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    // Animation loop
    const clock = new THREE.Clock();
    let rafId = 0;
    let timerId = 0;
    let disposed = false;
    let elapsed = 0;

    const afterDraw = (fn: () => void) => {
      if (!isSoftwareGl) {
        rafId = requestAnimationFrame(fn);
        return;
      }
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const check = () => {
          if (disposed) return;
          if (!sync || gl.getSyncParameter(sync, gl.SYNC_STATUS) === gl.SIGNALED) {
            if (sync) gl.deleteSync(sync);
            timerId = window.setTimeout(fn, 80);
          } else {
            timerId = window.setTimeout(check, 24);
          }
        };
        timerId = window.setTimeout(check, 40);
      } else {
        timerId = window.setTimeout(fn, 80);
      }
    };

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(0.05, clock.getDelta() || 0.016);
      elapsed += dt;

      const world = worldRef.current;
      const p = playerRef.current;
      const k = keysRef.current;
      const cs = cameraStateRef.current;

      if (world && !contextLost) {
        // Animate water, fountain, telescope, beacons & workshop steam
        textures.water.offset.x = (elapsed * 0.025) % 1;
        textures.water.offset.y = (elapsed * 0.018) % 1;

        if (world.animated.fountainRing) {
          const pulse = 1 + Math.sin(elapsed * 3.4) * 0.14;
          world.animated.fountainRing.scale.set(pulse, pulse, 1);
        }
        if (world.animated.fountainJet) {
          world.animated.fountainJet.scale.y = 0.88 + Math.sin(elapsed * 6.5) * 0.16;
        }
        if (world.animated.telescopePivot) {
          world.animated.telescopePivot.rotation.y = Math.sin(elapsed * 0.45) * 0.42;
        }
        for (let i = 0; i < world.animated.beaconMeshes.length; i++) {
          const bm = world.animated.beaconMeshes[i];
          bm.rotation.y += dt * 1.45;
          bm.position.y = 1.92 + Math.sin(elapsed * 2.8 + i) * 0.16;
        }
        for (const puff of world.animated.steamPuffs) {
          const cycle = (elapsed * 0.65 + puff.phase) % 3;
          puff.mesh.position.y = puff.baseY + cycle * 1.15;
          const sc = 0.75 + cycle * 0.35;
          puff.mesh.scale.setScalar(sc);
        }

        // Camera orbit via Q / E
        if (!controlsPausedRef.current) {
          if (k.camLeft) cs.yaw += 1.9 * dt;
          if (k.camRight) cs.yaw -= 1.9 * dt;
        }

        // Camera-relative explorer movement (Mario 64 style!)
        let moveX = 0;
        let moveZ = 0;
        let rawX = 0;
        let rawZ = 0;
        if (!controlsPausedRef.current) {
          rawX = (k.right ? 1 : 0) - (k.left ? 1 : 0);
          rawZ = (k.down ? 1 : 0) - (k.up ? 1 : 0);
          if (rawX !== 0 || rawZ !== 0) {
            const len = Math.hypot(rawX, rawZ);
            const nx = rawX / len;
            const nz = rawZ / len;
            const cosY = Math.cos(cs.yaw);
            const sinY = Math.sin(cs.yaw);
            moveX = nx * cosY + nz * sinY;
            moveZ = -nx * sinY + nz * cosY;
          }
        }

        const maxSpeed = k.sprint ? 8.6 : 5.4;
        if (moveX !== 0 || moveZ !== 0) {
          // SLERP character quaternion smoothly toward desired direction BEFORE accelerating forward
          const desiredYaw = Math.atan2(moveX, moveZ);
          _targetQuat.setFromAxisAngle(_yAxis, desiredYaw);
          hero.root.quaternion.slerp(_targetQuat, 1 - Math.exp(-10.5 * dt));

          _heroForward.set(0, 0, 1).applyQuaternion(hero.root.quaternion);
          p.yaw = Math.atan2(_heroForward.x, _heroForward.z);

          const alignment = _heroForward.x * moveX + _heroForward.z * moveZ;
          const turnFactor = Math.max(0.14, Math.pow(Math.max(0, (alignment + 0.35) / 1.35), 1.35));
          const targetSpeed = maxSpeed * turnFactor;
          p.vx = THREE.MathUtils.damp(p.vx, _heroForward.x * targetSpeed, 10, dt);
          p.vz = THREE.MathUtils.damp(p.vz, _heroForward.z * targetSpeed, 10, dt);

          // Gentle Mario 64 Lakitu auto-follow when steering left/right so diagonal bridges come smoothly into view
          if (!dragging && !k.camLeft && !k.camRight && rawX !== 0 && rawZ <= 0) {
            const desiredCamYaw = p.yaw + Math.PI;
            const camDiff = shortestAngleDiff(cs.yaw, desiredCamYaw);
            const followRate = rawZ === 0 ? 1.85 : 1.05;
            cs.yaw += camDiff * Math.min(1, followRate * dt);
          }
        } else {
          p.vx = THREE.MathUtils.damp(p.vx, 0, 12, dt);
          p.vz = THREE.MathUtils.damp(p.vz, 0, 12, dt);
        }

        const nextX = p.x + p.vx * dt;
        const nextZ = p.z + p.vz * dt;

        // Circle obstacle collision resolution
        let resolvedX = nextX;
        let resolvedZ = nextZ;
        const playerRadius = 0.45;
        for (const col of world.colliders) {
          const dx = resolvedX - col.x;
          const dz = resolvedZ - col.z;
          const dist = Math.hypot(dx, dz);
          const minDist = col.radius + playerRadius;
          if (dist < minDist) {
            if (dist > 0.0001) {
              const push = (minDist - dist) / dist;
              resolvedX += dx * push;
              resolvedZ += dz * push;
            } else {
              resolvedZ += minDist;
            }
          }
        }

        // Sample terrain surface
        const surface = world.sampleWalkableHeight(resolvedX, resolvedZ);

        // Bridge edge railing safety: if currently on a bridge and stepping off sideways, try sliding
        const currSurface = world.sampleWalkableHeight(p.x, p.z);
        if (!surface.walkable && currSurface.onBridge && p.grounded) {
          // Allow walking only onto X or Z component that stays walkable, preventing accidental slips off bridges
          const tryX = world.sampleWalkableHeight(resolvedX, p.z);
          const tryZ = world.sampleWalkableHeight(p.x, resolvedZ);
          if (tryX.walkable) {
            resolvedZ = p.z;
          } else if (tryZ.walkable) {
            resolvedX = p.x;
          } else {
            resolvedX = p.x;
            resolvedZ = p.z;
          }
        }

        p.x = resolvedX;
        p.z = resolvedZ;

        const finalSurface = world.sampleWalkableHeight(p.x, p.z);

        // Jump input
        if (k.jumpQueued && !controlsPausedRef.current) {
          k.jumpQueued = false;
          if (p.grounded) {
            p.vy = 9.2;
            p.grounded = false;
            retroAudio.playJump();
          }
        } else {
          k.jumpQueued = false;
        }

        // Gravity & vertical terrain snap
        p.vy -= 25.0 * dt;
        p.y += p.vy * dt;

        if (finalSurface.walkable) {
          if (p.y <= finalSurface.groundY + 0.08 && p.vy <= 0.5) {
            if (!p.grounded && p.vy < -3.5) {
              hero.landingSquash = 1.0;
              retroAudio.playStep();
            }
            p.y = finalSurface.groundY;
            p.vy = 0;
            p.grounded = true;
            p.safeX = p.x;
            p.safeY = finalSurface.groundY;
            p.safeZ = p.z;
          } else if (p.y > finalSurface.groundY + 0.14) {
            p.grounded = false;
          }
        } else {
          p.grounded = false;
          // Gentle bounce back onto the nearest path edge if explorer jumps into the sea!
          if (p.y < 0.18) {
            p.x = p.safeX;
            p.y = p.safeY + 1.2;
            p.z = p.safeZ;
            p.vx = 0;
            p.vz = 0;
            p.vy = 2.0;
            retroAudio.playFountain();
          }
        }

        // Update hero position (quaternion already updated smoothly via SLERP above)
        const horizSpeed = Math.hypot(p.vx, p.vz);
        hero.root.position.set(p.x, p.y, p.z);

        const groundBelow = finalSurface.walkable ? finalSurface.groundY : 0;
        const heightAboveGround = Math.max(0, p.y - groundBelow);
        updateHeroAnimation(hero, dt, horizSpeed / 5.4, heightAboveGround, !p.grounded);

        // Move directional shadow frustum cleanly with explorer so shadows on paths are always crisp
        dirLight.position.set(p.x + 18, p.y + 28, p.z + 20);
        dirLight.target.position.set(p.x, p.y, p.z);
        dirLight.target.updateMatrixWorld();

        // Update smooth Mario 64 Lakitu chase camera
        cs.dist = THREE.MathUtils.damp(cs.dist, cs.targetDist, 8, dt);
        cs.height = THREE.MathUtils.damp(cs.height, cs.targetHeight, 8, dt);
        cs.lookAhead = THREE.MathUtils.damp(cs.lookAhead, cs.targetLookAhead, 8, dt);

        const desiredCamX = p.x + Math.sin(cs.yaw) * cs.dist;
        const desiredCamZ = p.z + Math.cos(cs.yaw) * cs.dist;
        const desiredCamY = Math.max(p.y, DECK_Y) + cs.height;

        _camTargetPos.set(desiredCamX, desiredCamY, desiredCamZ);
        if (!cs.initialized) {
          camera.position.copy(_camTargetPos);
          cs.initialized = true;
        } else {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, _camTargetPos.x, 10, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, _camTargetPos.y, 9, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, _camTargetPos.z, 10, dt);
        }

        // Look slightly ahead of the explorer along camera view direction
        _camLookTarget.set(
          p.x - Math.sin(cs.yaw) * cs.lookAhead,
          p.y + 1.45,
          p.z - Math.cos(cs.yaw) * cs.lookAhead
        );
        camera.lookAt(_camLookTarget);

        // Update Depth-of-Field focus plane dynamically onto the explorer and nearby path
        cs.aperture = THREE.MathUtils.damp(cs.aperture, cs.targetAperture, 7, dt);
        cs.maxblur = THREE.MathUtils.damp(cs.maxblur, cs.targetMaxblur, 7, dt);
        if (bokehPass && dofEnabledRef.current) {
          camera.getWorldDirection(_camForward);
          _heroChest.set(p.x, p.y + 1.15, p.z);
          const focusDist = Math.max(
            2.4,
            _toHero.subVectors(_heroChest, camera.position).dot(_camForward) + 1.2
          );
          const uniforms = bokehPass.uniforms as Record<string, THREE.IUniform>;
          uniforms['focus'].value = focusDist;
          uniforms['aperture'].value = cs.aperture;
          uniforms['maxblur'].value = cs.maxblur;
        }

        // Check proximity to island/piece pedestals
        let closestTrig: ExhibitTrigger | null = null;
        let closestDist = Infinity;
        for (const trig of world.triggers) {
          const d = Math.hypot(p.x - trig.x, p.z - trig.z);
          if (d <= trig.radius && d < closestDist) {
            closestDist = d;
            closestTrig = trig;
          }
        }

        if ((closestTrig?.id || null) !== (activeTriggerRef.current?.id || null)) {
          activeTriggerRef.current = closestTrig;
          setNearbyTrigger(
            closestTrig
              ? {
                  id: closestTrig.id,
                  kind: closestTrig.kind,
                  islandId: closestTrig.islandId,
                  label: closestTrig.label,
                  sublabel: closestTrig.sublabel,
                }
              : null
          );
        }

        // Track current island or bridge banner
        const nextIslandId = finalSurface.islandId;
        let nextLabel = 'Puente del Archipiélago';
        if (nextIslandId) {
          const found = world.islandNodes.find((n) => n.island.id === nextIslandId);
          if (found) nextLabel = found.island.title;
        } else if (!finalSurface.walkable) {
          nextLabel = 'Aguas del Archipiélago';
        }
        if (
          nextIslandId !== activeLocationRef.current.islandId ||
          nextLabel !== activeLocationRef.current.label
        ) {
          activeLocationRef.current = { islandId: nextIslandId, label: nextLabel };
          setCurrentIslandId(nextIslandId);
          setLocationLabel(nextLabel);
        }

        // Refresh heading-up circular compass radar
        radarRef.current?.update(p.x, p.z, p.yaw, cs.yaw);
      }

      if (!contextLost) {
        if (composer && dofEnabledRef.current) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      }
      afterDraw(tick);
    };

    afterDraw(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      bokehPass?.dispose();
      outputPass?.dispose();
      renderPass?.dispose();
      composer?.dispose();
      composerTarget?.dispose();
      worldRef.current?.dispose();
      heroRef.current?.dispose();
      textures.dispose();
      envRT.dispose();
      renderer.dispose();
    };
    // Initial setup runs once; dynamic islands/pieces/theme/character updates handled by effects below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap 3D character appearance dynamically when characterId changes
  useEffect(() => {
    const scene = sceneRef.current;
    const textures = texturesRef.current;
    if (!scene || !textures) return;

    if (heroRef.current) {
      scene.remove(heroRef.current.root);
      heroRef.current.dispose();
    }

    const nextHero = createHeroRig(textures.contactShadow, characterId);
    const p = playerRef.current;
    nextHero.root.position.set(p.x, p.y, p.z);
    nextHero.root.quaternion.setFromAxisAngle(_yAxis, p.yaw);
    heroRef.current = nextHero;
    scene.add(nextHero.root);
  }, [characterId]);

  // Rebuild 3D archipelago dynamically when islands, pieces, or theme change
  useEffect(() => {
    const scene = sceneRef.current;
    const textures = texturesRef.current;
    if (!scene || !textures) return;

    const skyHex = theme?.skyColor || '#6ec9da';
    scene.background = new THREE.Color(skyHex);
    scene.fog = new THREE.Fog(skyHex, 44, 152);

    // Remove previous world if this isn't the exact same initial mount run
    if (worldRef.current) {
      scene.remove(worldRef.current.group);
      worldRef.current.dispose();
    }

    const nextWorld = buildArchipelagoWorld3D(islands, piecesByIsland, textures, theme);
    worldRef.current = nextWorld;
    scene.add(nextWorld.group);

    // Ensure explorer stays on valid solid terrain after edits
    const p = playerRef.current;
    const surface = nextWorld.sampleWalkableHeight(p.x, p.z);
    if (!surface.walkable) {
      p.x = nextWorld.spawnPoint.x;
      p.y = nextWorld.spawnPoint.y;
      p.z = nextWorld.spawnPoint.z;
      p.safeX = p.x;
      p.safeY = p.y;
      p.safeZ = p.z;
      p.vx = 0;
      p.vz = 0;
      p.vy = 0;
    }
  }, [islands, piecesByIsland, theme]);

  // Clear held keys whenever modals/editor pause controls
  useEffect(() => {
    if (controlsPaused) {
      keysRef.current = {
        up: false,
        down: false,
        left: false,
        right: false,
        camLeft: false,
        camRight: false,
        sprint: false,
        jumpQueued: false,
      };
    }
  }, [controlsPaused]);

  // Keyboard bindings for 3D walking, camera orbit, jump & interact
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (controlsPausedRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const k = keysRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          k.up = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          k.down = true;
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          k.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          k.right = true;
          e.preventDefault();
          break;
        case 'q':
        case 'Q':
          k.camLeft = true;
          break;
        case 'e':
        case 'E':
          k.camRight = true;
          break;
        case 'Shift':
          k.sprint = true;
          break;
        case ' ':
          k.jumpQueued = true;
          e.preventDefault();
          break;
        case 'r':
        case 'R':
          recenterCamera();
          break;
        case 'h':
        case 'H':
          setHudCollapsed((prev) => !prev);
          break;
        case 'b':
        case 'B':
          setDofEnabled((prev) => !prev);
          break;
        case 'Enter':
        case 'f':
        case 'F':
          e.preventDefault();
          triggerInteract();
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = keysRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          k.up = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          k.down = false;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          k.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          k.right = false;
          break;
        case 'q':
        case 'Q':
          k.camLeft = false;
          break;
        case 'e':
        case 'E':
          k.camRight = false;
          break;
        case 'Shift':
          k.sprint = false;
          break;
      }
    };

    const onBlur = () => {
      keysRef.current = {
        up: false,
        down: false,
        left: false,
        right: false,
        camLeft: false,
        camRight: false,
        sprint: false,
        jumpQueued: false,
      };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [recenterCamera, triggerInteract]);

  const holdKey = (key: 'up' | 'down' | 'left' | 'right' | 'camLeft' | 'camRight', active: boolean) => {
    keysRef.current[key] = active;
  };

  if (webglError) {
    return (
      <ArchipelagoPerspectiveCanvas
        islands={islands}
        piecesByIsland={piecesByIsland}
        characterId={characterId}
        theme={theme}
        controlsPaused={controlsPaused}
        onSelectIsland={onSelectIsland}
        onOpenPiece={onOpenPiece}
        onEnter2DMode={onEnter2DMode}
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {/* Contenedor WebGL aislado (sin children de React dentro) */}
      <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Mini-brújula / radar circular con orientación y puntos cardinales */}
      {!controlsPaused && <MiniCompassRadar islands={islands} radarRef={radarRef} />}

      {/* Placa discreta del territorio actual */}
      <div className="pointer-events-none fixed left-1/2 top-[92px] z-10 -translate-x-1/2 sm:top-[74px]">
        <div className="pointer-events-auto flex items-center gap-2.5 border-2 border-[#e2c672]/80 bg-[#072634]/90 px-3.5 py-1.5 shadow-[0_6px_16px_rgba(3,22,32,0.45)]">
          <span className="font-pixel text-[9px] tracking-wider text-[#f8da7c]">
            {locationLabel.toUpperCase()}
          </span>
          {currentIslandId && (
            <button
              type="button"
              onClick={() => onEnter2DMode(currentIslandId)}
              className="font-pixel border border-[#72c6c1]/70 bg-[#144c58] px-2 py-0.5 text-[8px] text-[#e7fbf7] transition-colors hover:bg-[#1f6c7a]"
            >
              SALAS 2D
            </button>
          )}
        </div>
      </div>

      {/* Aviso flotante de interacción cercana (sin backdrop-blur sobre WebGL) */}
      {nearbyTrigger && !controlsPaused && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-20 w-[min(92vw,420px)] -translate-x-1/2 sm:bottom-20">
          <button
            type="button"
            onClick={triggerInteract}
            className="pointer-events-auto flex w-full items-center justify-between gap-3 border-2 border-[#f4d47d] bg-[#072634]/95 px-4 py-2.5 text-left shadow-[0_10px_25px_rgba(2,20,28,0.55)] transition-transform hover:-translate-y-0.5"
          >
            <div className="min-w-0">
              <p className="font-pixel truncate text-[9px] text-[#f4d47d]">
                {nearbyTrigger.kind === 'piece' ? 'PIEZA CERCANA' : 'ENTRADA DE ISLA'}
              </p>
              <p className="mt-1 truncate text-base font-bold text-[#fff9e6]">
                {nearbyTrigger.label}
              </p>
              <p className="truncate text-xs text-[#b9ded5]">{nearbyTrigger.sublabel}</p>
            </div>
            <span className="font-pixel shrink-0 border border-[#f4d47d] bg-[#b25f37] px-2.5 py-1.5 text-[8px] text-[#fff9e6]">
              ENTER
            </span>
          </button>
        </div>
      )}

      {/* Dock inferior plegable de cámara y controles */}
      <div className="pointer-events-none fixed bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-3 sm:bottom-5 sm:left-6 sm:right-6">
        {/* Controles táctiles en pantallas pequeñas */}
        <div className="pointer-events-auto grid grid-cols-3 gap-1 md:hidden">
          <div />
          <button
            type="button"
            aria-label="Caminar adelante"
            onPointerDown={() => holdKey('up', true)}
            onPointerUp={() => holdKey('up', false)}
            onPointerLeave={() => holdKey('up', false)}
            onPointerCancel={() => holdKey('up', false)}
            className="flex h-10 w-10 items-center justify-center border-2 border-white/60 bg-[#072938]/90 text-[#fff8e2] active:bg-[#b25f37]"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <div />
          <button
            type="button"
            aria-label="Caminar izquierda"
            onPointerDown={() => holdKey('left', true)}
            onPointerUp={() => holdKey('left', false)}
            onPointerLeave={() => holdKey('left', false)}
            onPointerCancel={() => holdKey('left', false)}
            className="flex h-10 w-10 items-center justify-center border-2 border-white/60 bg-[#072938]/90 text-[#fff8e2] active:bg-[#b25f37]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Caminar atrás"
            onPointerDown={() => holdKey('down', true)}
            onPointerUp={() => holdKey('down', false)}
            onPointerLeave={() => holdKey('down', false)}
            onPointerCancel={() => holdKey('down', false)}
            className="flex h-10 w-10 items-center justify-center border-2 border-white/60 bg-[#072938]/90 text-[#fff8e2] active:bg-[#b25f37]"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Caminar derecha"
            onPointerDown={() => holdKey('right', true)}
            onPointerUp={() => holdKey('right', false)}
            onPointerLeave={() => holdKey('right', false)}
            onPointerCancel={() => holdKey('right', false)}
            className="flex h-10 w-10 items-center justify-center border-2 border-white/60 bg-[#072938]/90 text-[#fff8e2] active:bg-[#b25f37]"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Barra compacta de cámara e indicaciones */}
        <div className="pointer-events-auto mx-auto hidden flex-col items-center md:flex">
          {hudCollapsed ? (
            <button
              type="button"
              onClick={() => setHudCollapsed(false)}
              className="font-pixel inline-flex items-center gap-1.5 border-2 border-[#e2c672]/75 bg-[#072634]/90 px-3 py-1.5 text-[8px] text-[#fff8e2]"
            >
              <ChevronUp className="h-3.5 w-3.5 text-[#f4d47d]" />
              <span>CONTROLES Y CÁMARA (H)</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 border-2 border-[#e2c672]/75 bg-[#072634]/90 px-3 py-2 shadow-[0_8px_20px_rgba(3,20,28,0.45)]">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#d6ede3]">
                <Camera className="h-3.5 w-3.5 text-[#f4d47d]" />
                <span>Cámara:</span>
              </span>

              {(
                [
                  ['cerca', 'Cerca'],
                  ['media', 'Media'],
                  ['panoramica', 'Panorámica'],
                ] as [CameraPreset, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => applyCameraPreset(id)}
                  className={`font-pixel border px-2.5 py-1 text-[8px] transition-colors ${
                    camPreset === id
                      ? 'border-[#f4d47d] bg-[#b25f37] text-[#fff9e6]'
                      : 'border-white/30 bg-[#0b394b] text-[#d6ede3] hover:bg-[#14556a]'
                  }`}
                >
                  {label}
                </button>
              ))}

              <button
                type="button"
                onClick={recenterCamera}
                title="Centrar cámara detrás del personaje (R)"
                className="font-pixel inline-flex items-center gap-1 border border-white/35 bg-[#0b394b] px-2.5 py-1 text-[8px] text-[#fff9e6] hover:bg-[#14556a]"
              >
                <RotateCcw className="h-3 w-3 text-[#f4d47d]" />
                <span>Detrás (R)</span>
              </button>

              {!webglCap.isSoftware && (
                <button
                  type="button"
                  onClick={() => setDofEnabled((prev) => !prev)}
                  title="Alternar profundidad de campo / desenfoque de distancias (B)"
                  className={`font-pixel inline-flex items-center gap-1 border px-2.5 py-1 text-[8px] transition-colors ${
                    dofEnabled
                      ? 'border-[#f4d47d] bg-[#1a5f6d] text-[#fff9e6]'
                      : 'border-white/30 bg-[#0b394b] text-[#b8d8ce] hover:bg-[#14556a]'
                  }`}
                >
                  <Aperture className="h-3 w-3 text-[#f4d47d]" />
                  <span>Enfoque</span>
                </button>
              )}

              <span className="mx-1 hidden h-4 w-px bg-white/20 lg:inline-block" />

              <span className="hidden text-xs text-[#b9ded5] lg:inline">
                WASD / Flechas caminar (Shift correr) · Q/E girar · Espacio saltar · Enter abrir
              </span>

              <button
                type="button"
                onClick={() => setHudCollapsed(true)}
                aria-label="Ocultar barra inferior"
                className="ml-1 border border-white/25 bg-black/25 p-1 text-[#d6ede3] hover:bg-[#14556a]"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Botones táctiles de salto e interacción en móvil */}
        <div className="pointer-events-auto flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => {
              keysRef.current.jumpQueued = true;
            }}
            className="font-pixel border-2 border-white/65 bg-[#072938]/90 px-3 py-2.5 text-[9px] text-[#fff8e2] active:bg-[#1f6c7a]"
          >
            SALTAR
          </button>
          <button
            type="button"
            onClick={triggerInteract}
            className="font-pixel inline-flex items-center gap-1 border-2 border-[#f4d47d] bg-[#b25f37]/95 px-3 py-2.5 text-[9px] text-[#fff9e6]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>ABRIR</span>
          </button>
          <button
            type="button"
            onClick={recenterCamera}
            aria-label="Centrar cámara"
            className="border-2 border-white/60 bg-[#072938]/90 p-2.5 text-[#f4d47d]"
          >
            <Compass className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import * as THREE from 'three';
import { getCharacterProfile } from '../data/characters';
import { CharacterId } from '../types/museum';

export interface HeroRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  headGroup: THREE.Group;
  hatTip: THREE.Mesh;
  shadowDisc: THREE.Mesh;
  walkPhase: number;
  landingSquash: number;
  dispose: () => void;
}

export function createHeroRig(
  contactShadowTexture: THREE.Texture,
  characterId: CharacterId = 'explorador'
): HeroRig {
  const profile = getCharacterProfile(characterId);
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const root = new THREE.Group();
  root.name = `Museo404Explorer_${profile.id}`;

  const shadowGeo = trackGeo(new THREE.PlaneGeometry(1.15, 1.15));
  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: contactShadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    })
  );
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.03;
  root.add(shadowDisc);

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const tunicMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: profile.tunicColor,
      roughness: profile.hatStyle === 'robot' ? 0.32 : 0.65,
      metalness: profile.hatStyle === 'robot' ? 0.45 : 0.05,
    })
  );
  const trimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: profile.trimColor,
      roughness: 0.38,
      metalness: 0.35,
      emissive: profile.hatStyle === 'robot' ? new THREE.Color(profile.trimColor) : new THREE.Color(0x000000),
      emissiveIntensity: profile.hatStyle === 'robot' ? 0.45 : 0,
    })
  );
  const beltMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x5c361e,
      roughness: 0.72,
      metalness: 0.08,
    })
  );
  const bootMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: profile.bootColor,
      roughness: 0.75,
      metalness: 0.08,
    })
  );
  const trousersMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: profile.trousersColor,
      roughness: 0.78,
      metalness: 0.04,
    })
  );
  const skinMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: profile.skinColor,
      roughness: profile.hatStyle === 'robot' ? 0.35 : 0.58,
      metalness: profile.hatStyle === 'robot' ? 0.35 : 0.02,
    })
  );
  const eyeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x18242e,
      roughness: 0.25,
      metalness: 0.1,
    })
  );
  const scarfMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: profile.scarfColor,
      roughness: 0.62,
      metalness: 0.04,
    })
  );

  function makeLeg(side: -1 | 1): THREE.Group {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.16, 0.46, 0);

    const thigh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 0.28, 0.18)), trousersMat);
    thigh.position.y = -0.14;
    thigh.castShadow = true;
    pivot.add(thigh);

    const boot = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.21, 0.18, 0.28)), bootMat);
    boot.position.set(0, -0.37, 0.04);
    boot.castShadow = true;
    pivot.add(boot);

    return pivot;
  }

  const leftLegPivot = makeLeg(-1);
  const rightLegPivot = makeLeg(1);
  bodyGroup.add(leftLegPivot, rightLegPivot);

  const torso = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.54, 0.56, 0.36)), tunicMat);
  torso.position.y = 0.72;
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  const belt = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.57, 0.1, 0.39)),
    profile.hatStyle === 'chef' ? scarfMat : beltMat
  );
  belt.position.y = 0.54;
  belt.castShadow = true;
  bodyGroup.add(belt);

  const buckle = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.14, 0.11, 0.05)), trimMat);
  buckle.position.set(0, 0.54, 0.2);
  bodyGroup.add(buckle);

  const scarf = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.58, 0.12, 0.42)), scarfMat);
  scarf.position.y = 0.99;
  scarf.castShadow = true;
  bodyGroup.add(scarf);

  const backpack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.4, 0.42, 0.18)), beltMat);
  backpack.position.set(0, 0.74, -0.25);
  backpack.castShadow = true;
  bodyGroup.add(backpack);

  const backpackRoll = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.08, 0.08, 0.42, 8)),
    trimMat
  );
  backpackRoll.rotation.z = Math.PI / 2;
  backpackRoll.position.set(0, 0.96, -0.25);
  backpackRoll.castShadow = true;
  bodyGroup.add(backpackRoll);

  function makeArm(side: -1 | 1): THREE.Group {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.36, 0.92, 0);

    const sleeve = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 0.32, 0.16)), tunicMat);
    sleeve.position.y = -0.14;
    sleeve.castShadow = true;
    pivot.add(sleeve);

    const hand = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.15, 0.14, 0.15)), skinMat);
    hand.position.y = -0.34;
    hand.castShadow = true;
    pivot.add(hand);

    return pivot;
  }

  const leftArmPivot = makeArm(-1);
  const rightArmPivot = makeArm(1);
  bodyGroup.add(leftArmPivot, rightArmPivot);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.05, 0);
  bodyGroup.add(headGroup);

  const head = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.46, 0.42, 0.44)), skinMat);
  head.position.y = 0.21;
  head.castShadow = true;
  headGroup.add(head);

  if (profile.hatStyle === 'robot') {
    const visor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.4, 0.13, 0.06)), trimMat);
    visor.position.set(0, 0.23, 0.22);
    headGroup.add(visor);
  } else {
    const leftEye = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.07, 0.09, 0.04)), eyeMat);
    leftEye.position.set(-0.11, 0.22, 0.22);
    const rightEye = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.07, 0.09, 0.04)), eyeMat);
    rightEye.position.set(0.11, 0.22, 0.22);
    const nose = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.07, 0.07)), skinMat);
    nose.position.set(0, 0.16, 0.24);
    headGroup.add(leftEye, rightEye, nose);
  }

  // Hat / accessory per character style
  let hatTip: THREE.Mesh;

  if (profile.hatStyle === 'chef') {
    const band = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.48, 0.1, 0.48)), trimMat);
    band.position.set(0, 0.44, 0);
    const toque = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.28, 0.23, 0.34, 8)), tunicMat);
    toque.position.set(0, 0.65, 0);
    toque.castShadow = true;
    headGroup.add(band, toque);
    hatTip = toque;
  } else if (profile.hatStyle === 'headphones') {
    const capBrim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.5, 0.07, 0.56)), tunicMat);
    capBrim.position.set(0, 0.42, 0.06);
    const arch = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.54, 0.09, 0.14)), trimMat);
    arch.position.set(0, 0.49, 0);
    const earL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.09, 0.2, 0.2)), trimMat);
    earL.position.set(-0.27, 0.23, 0);
    const earR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.09, 0.2, 0.2)), trimMat);
    earR.position.set(0.27, 0.23, 0);
    headGroup.add(capBrim, arch, earL, earR);
    hatTip = arch;
  } else if (profile.hatStyle === 'wizard') {
    const brim = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.48, 0.5, 0.06, 8)), tunicMat);
    brim.position.set(0, 0.42, 0);
    brim.castShadow = true;
    const band = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.26, 0.28, 0.1, 8)), trimMat);
    band.position.set(0, 0.48, 0);
    const cone = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(0.27, 0.56, 7)), tunicMat);
    cone.position.set(0, 0.76, -0.04);
    cone.rotation.x = -0.22;
    cone.castShadow = true;
    headGroup.add(brim, band, cone);
    hatTip = cone;
  } else if (profile.hatStyle === 'robot') {
    const helmet = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.5, 0.12, 0.48)), tunicMat);
    helmet.position.set(0, 0.44, 0);
    const stalk = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 6)), trousersMat);
    stalk.position.set(0, 0.62, 0);
    const orb = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 0.12, 0.12)), trimMat);
    orb.position.set(0, 0.78, 0);
    headGroup.add(helmet, stalk, orb);
    hatTip = orb;
  } else {
    const hatBrim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.56, 0.07, 0.56)), tunicMat);
    hatBrim.position.set(0, 0.42, 0.04);
    hatBrim.castShadow = true;
    const hatBand = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.49, 0.08, 0.49)), trimMat);
    hatBand.position.set(0, 0.47, 0);
    const cone = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(0.28, 0.44, 6)), tunicMat);
    cone.position.set(0, 0.67, -0.06);
    cone.rotation.x = -0.32;
    cone.castShadow = true;
    headGroup.add(hatBrim, hatBand, cone);
    hatTip = cone;
  }

  return {
    root,
    bodyGroup,
    leftLegPivot,
    rightLegPivot,
    leftArmPivot,
    rightArmPivot,
    headGroup,
    hatTip,
    shadowDisc,
    walkPhase: 0,
    landingSquash: 0,
    dispose: () => {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
    },
  };
}

export function updateHeroAnimation(
  rig: HeroRig,
  dt: number,
  speedRatio: number,
  heightAboveGround: number,
  isAirborne: boolean
): void {
  const clampedSpeed = Math.min(1.2, Math.max(0, speedRatio));

  if (isAirborne) {
    rig.leftLegPivot.rotation.x = THREE.MathUtils.damp(rig.leftLegPivot.rotation.x, 0.45, 12, dt);
    rig.rightLegPivot.rotation.x = THREE.MathUtils.damp(rig.rightLegPivot.rotation.x, -0.35, 12, dt);
    rig.leftArmPivot.rotation.x = THREE.MathUtils.damp(rig.leftArmPivot.rotation.x, -0.65, 12, dt);
    rig.rightArmPivot.rotation.x = THREE.MathUtils.damp(rig.rightArmPivot.rotation.x, -0.65, 12, dt);
    rig.leftArmPivot.rotation.z = THREE.MathUtils.damp(rig.leftArmPivot.rotation.z, -0.32, 10, dt);
    rig.rightArmPivot.rotation.z = THREE.MathUtils.damp(rig.rightArmPivot.rotation.z, 0.32, 10, dt);
  } else if (clampedSpeed > 0.04) {
    rig.walkPhase += dt * (8.5 + clampedSpeed * 5.2);
    const swing = Math.sin(rig.walkPhase) * 0.72 * Math.min(1, clampedSpeed);
    const bob = Math.abs(Math.cos(rig.walkPhase)) * 0.09 * Math.min(1, clampedSpeed);

    rig.leftLegPivot.rotation.x = swing;
    rig.rightLegPivot.rotation.x = -swing;
    rig.leftArmPivot.rotation.x = -swing * 0.82;
    rig.rightArmPivot.rotation.x = swing * 0.82;
    rig.leftArmPivot.rotation.z = THREE.MathUtils.damp(rig.leftArmPivot.rotation.z, -0.08, 10, dt);
    rig.rightArmPivot.rotation.z = THREE.MathUtils.damp(rig.rightArmPivot.rotation.z, 0.08, 10, dt);
    rig.bodyGroup.position.y = bob;
    rig.headGroup.rotation.z = Math.sin(rig.walkPhase * 0.5) * 0.04;
  } else {
    rig.walkPhase += dt * 2.2;
    rig.leftLegPivot.rotation.x = THREE.MathUtils.damp(rig.leftLegPivot.rotation.x, 0, 14, dt);
    rig.rightLegPivot.rotation.x = THREE.MathUtils.damp(rig.rightLegPivot.rotation.x, 0, 14, dt);
    rig.leftArmPivot.rotation.x = THREE.MathUtils.damp(rig.leftArmPivot.rotation.x, 0, 14, dt);
    rig.rightArmPivot.rotation.x = THREE.MathUtils.damp(rig.rightArmPivot.rotation.x, 0, 14, dt);
    rig.leftArmPivot.rotation.z = THREE.MathUtils.damp(rig.leftArmPivot.rotation.z, -0.06, 10, dt);
    rig.rightArmPivot.rotation.z = THREE.MathUtils.damp(rig.rightArmPivot.rotation.z, 0.06, 10, dt);
    rig.bodyGroup.position.y = Math.sin(rig.walkPhase) * 0.02;
    rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, 0, 10, dt);
  }

  rig.landingSquash = THREE.MathUtils.damp(rig.landingSquash, 0, 14, dt);
  const sy = 1 - rig.landingSquash * 0.22;
  const sxz = 1 + rig.landingSquash * 0.15;
  rig.bodyGroup.scale.set(sxz, sy, sxz);

  rig.shadowDisc.position.y = Math.max(0.03, -heightAboveGround + 0.03);
  const shadowScale = Math.max(0.42, 1 - heightAboveGround * 0.14);
  rig.shadowDisc.scale.setScalar(shadowScale);
  (rig.shadowDisc.material as THREE.MeshBasicMaterial).opacity = Math.max(
    0.2,
    0.72 - heightAboveGround * 0.12
  );
}

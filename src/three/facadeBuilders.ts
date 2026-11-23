import * as THREE from 'three';
import { ProceduralTexturePack } from './proceduralTextures';

export interface SceneSharedMaterials {
  primaryWall: THREE.MeshPhysicalMaterial;
  trimDetail: THREE.MeshPhysicalMaterial;
  sconceEmissive: THREE.MeshStandardMaterial;
  interiorGlow: THREE.MeshStandardMaterial;
}

export interface BuiltSceneResult {
  root: THREE.Group;
  sconceLights: THREE.PointLight[];
  dispose: () => void;
}

function createGlassMaterial(isSoftwareGl: boolean): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xb7d4ea,
    metalness: 0.08,
    roughness: 0.08,
    transmission: isSoftwareGl ? 0 : 0.65,
    transparent: true,
    opacity: isSoftwareGl ? 0.42 : 0.72,
    ior: 1.5,
    thickness: 0.25,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
}

function createShrubGroup(
  foliageMat: THREE.Material,
  trunkMat: THREE.Material,
  potMat: THREE.Material,
  scale = 1,
): THREE.Group {
  const group = new THREE.Group();

  const planter = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.35, 0.75), potMat);
  planter.position.y = 0.175;
  planter.castShadow = true;
  planter.receiveShadow = true;
  group.add(planter);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.65, 8), trunkMat);
  trunk.position.y = 0.55;
  trunk.castShadow = true;
  group.add(trunk);

  const crownOffsets: [number, number, number, number][] = [
    [0, 0.95, 0, 0.34],
    [-0.18, 0.82, 0.12, 0.24],
    [0.18, 0.84, -0.1, 0.25],
    [0.05, 1.15, 0.06, 0.22],
  ];
  for (const [x, y, z, r] of crownOffsets) {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), foliageMat);
    puff.position.set(x, y, z);
    puff.castShadow = true;
    puff.receiveShadow = true;
    group.add(puff);
  }

  group.scale.setScalar(scale);
  return group;
}

function addWallSconce(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  fixtureMat: THREE.Material,
  emissiveMat: THREE.Material,
  sconceLights: THREE.PointLight[],
  addLight = true,
) {
  const sconce = new THREE.Group();
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.1), fixtureMat);
  housing.castShadow = true;
  sconce.add(housing);

  const topLens = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.07), emissiveMat);
  topLens.rotation.x = -Math.PI / 2;
  topLens.position.y = 0.132;
  sconce.add(topLens);

  const bottomLens = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.07), emissiveMat);
  bottomLens.rotation.x = Math.PI / 2;
  bottomLens.position.y = -0.132;
  sconce.add(bottomLens);

  sconce.position.set(x, y, z);
  parent.add(sconce);

  if (addLight) {
    const light = new THREE.PointLight(0xffcf8b, 0, 6.5, 1.8);
    light.position.set(x, y - 0.1, z + 0.35);
    parent.add(light);
    sconceLights.push(light);
  }
}

export function buildResidentialFacadeScene(
  mats: SceneSharedMaterials,
  textures: ProceduralTexturePack,
  isSoftwareGl: boolean,
): BuiltSceneResult {
  const root = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const sconceLights: THREE.PointLight[] = [];

  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const concreteMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.concreteMap,
      roughness: 0.88,
      metalness: 0.02,
    }),
  );
  const grassMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.grassMap,
      roughness: 0.94,
      metalness: 0.0,
    }),
  );
  const woodMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.woodAlbedoMap,
      bumpMap: textures.woodBumpMap,
      bumpScale: 0.018,
      roughness: 0.62,
      metalness: 0.04,
    }),
  );
  const darkMetalMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x22262c,
      roughness: 0.35,
      metalness: 0.78,
    }),
  );
  const steelMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xd0d6de,
      roughness: 0.22,
      metalness: 0.9,
    }),
  );
  const glassMat = track(createGlassMaterial(isSoftwareGl));
  const foliageMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x45693c,
      roughness: 0.86,
      metalness: 0.02,
    }),
  );
  const trunkMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x5c4330,
      roughness: 0.9,
      metalness: 0.0,
    }),
  );
  const planterMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x555b63,
      roughness: 0.82,
      metalness: 0.05,
    }),
  );
  const shadowMat = track(
    new THREE.MeshBasicMaterial({
      map: textures.contactShadowMap,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    }),
  );

  // 1. Grounded architectural maquete plinth, lot & driveway (disjoint Y offsets >= 0.02)
  const plinthBase = new THREE.Mesh(track(new THREE.BoxGeometry(22.2, 0.24, 18.2)), darkMetalMat);
  plinthBase.position.set(0, -0.24, 1);
  root.add(plinthBase);

  const lawn = new THREE.Mesh(track(new THREE.BoxGeometry(22, 0.14, 18)), grassMat);
  lawn.position.set(0, -0.07, 1);
  lawn.receiveShadow = true;
  root.add(lawn);

  const driveway = new THREE.Mesh(track(new THREE.BoxGeometry(9.6, 0.06, 7.6)), concreteMat);
  driveway.position.set(0.2, 0.03, 3.6);
  driveway.receiveShadow = true;
  root.add(driveway);

  // Stepping walkway stones
  for (let i = 0; i < 4; i++) {
    const stone = new THREE.Mesh(track(new THREE.BoxGeometry(1.4, 0.04, 0.65)), concreteMat);
    stone.position.set(-0.6, 0.075, 2.2 + i * 0.95);
    stone.receiveShadow = true;
    root.add(stone);
  }

  // Soft contact shadow grounding beneath main volume
  const houseShadow = new THREE.Mesh(track(new THREE.PlaneGeometry(11.4, 7.6)), shadowMat);
  houseShadow.rotation.x = -Math.PI / 2;
  houseShadow.position.set(0, 0.068, -0.6);
  root.add(houseShadow);

  // 2. Ground floor masonry volume (Primary paintable surface)
  const groundMass = new THREE.Mesh(track(new THREE.BoxGeometry(8.2, 2.95, 5.0)), mats.primaryWall);
  groundMass.position.set(0.1, 1.475, -0.8);
  groundMass.castShadow = true;
  groundMass.receiveShadow = true;
  root.add(groundMass);

  // Recessed dark entry niche
  const entryBack = new THREE.Mesh(track(new THREE.BoxGeometry(2.1, 2.6, 0.18)), darkMetalMat);
  entryBack.position.set(-0.55, 1.35, 1.72);
  root.add(entryBack);

  // Wood pivot door + stainless vertical pull handle
  const pivotDoor = new THREE.Mesh(track(new THREE.BoxGeometry(1.22, 2.45, 0.09)), woodMat);
  pivotDoor.position.set(-0.55, 1.25, 1.78);
  pivotDoor.castShadow = true;
  root.add(pivotDoor);

  const doorHandle = new THREE.Mesh(track(new THREE.CylinderGeometry(0.022, 0.022, 1.15, 10)), steelMat);
  doorHandle.position.set(-0.1, 1.25, 1.86);
  root.add(doorHandle);

  // Ground floor side sidelight glass & wide aluminum window
  const sidelight = new THREE.Mesh(track(new THREE.BoxGeometry(0.42, 2.3, 0.06)), glassMat);
  sidelight.position.set(-1.38, 1.25, 1.76);
  root.add(sidelight);

  // Ground floor wide aluminum window (4-bar frame + center mullion, zero Z-fighting)
  const winX = 1.95;
  const winY = 1.45;
  const winZ = 1.77;
  const winW = 2.55;
  const winH = 1.55;
  const barT = 0.09;

  const groundWindowGlow = new THREE.Mesh(track(new THREE.PlaneGeometry(winW - 0.16, winH - 0.16)), mats.interiorGlow);
  groundWindowGlow.position.set(winX, winY, winZ - 0.03);
  root.add(groundWindowGlow);

  const groundWindowGlass = new THREE.Mesh(track(new THREE.BoxGeometry(winW - 0.14, winH - 0.14, 0.03)), glassMat);
  groundWindowGlass.position.set(winX, winY, winZ + 0.01);
  root.add(groundWindowGlass);

  const winTop = new THREE.Mesh(track(new THREE.BoxGeometry(winW, barT, 0.14)), darkMetalMat);
  winTop.position.set(winX, winY + winH / 2 - barT / 2, winZ + 0.02);
  winTop.castShadow = true;
  root.add(winTop);

  const winBot = new THREE.Mesh(track(new THREE.BoxGeometry(winW, barT, 0.16)), darkMetalMat);
  winBot.position.set(winX, winY - winH / 2 + barT / 2, winZ + 0.03);
  winBot.castShadow = true;
  root.add(winBot);

  const winLeft = new THREE.Mesh(track(new THREE.BoxGeometry(barT, winH, 0.14)), darkMetalMat);
  winLeft.position.set(winX - winW / 2 + barT / 2, winY, winZ + 0.02);
  root.add(winLeft);

  const winRight = new THREE.Mesh(track(new THREE.BoxGeometry(barT, winH, 0.14)), darkMetalMat);
  winRight.position.set(winX + winW / 2 - barT / 2, winY, winZ + 0.02);
  root.add(winRight);

  const winCenterMullion = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, winH - barT, 0.1)), darkMetalMat);
  winCenterMullion.position.set(winX, winY, winZ + 0.02);
  root.add(winCenterMullion);

  // Garage / side wood slatted panel accent
  const sideWoodAccent = new THREE.Mesh(track(new THREE.BoxGeometry(1.1, 2.8, 0.18)), woodMat);
  sideWoodAccent.position.set(-3.35, 1.45, 1.71);
  sideWoodAccent.castShadow = true;
  root.add(sideWoodAccent);

  // 3. Second floor dramatic cantilever box (Primary + Trim Platibanda)
  const upperVolume = new THREE.Mesh(track(new THREE.BoxGeometry(9.4, 2.55, 5.4)), mats.primaryWall);
  upperVolume.position.set(0, 4.25, -0.3);
  upperVolume.castShadow = true;
  upperVolume.receiveShadow = true;
  root.add(upperVolume);

  // Cantilever projecting U-frame / platibanda band (Trim paintable!)
  const upperBandTop = new THREE.Mesh(track(new THREE.BoxGeometry(9.7, 0.34, 1.35)), mats.trimDetail);
  upperBandTop.position.set(0, 5.42, 2.25);
  upperBandTop.castShadow = true;
  upperBandTop.receiveShadow = true;
  root.add(upperBandTop);

  const upperBandBottom = new THREE.Mesh(track(new THREE.BoxGeometry(9.7, 0.32, 1.35)), mats.trimDetail);
  upperBandBottom.position.set(0, 3.05, 2.25);
  upperBandBottom.castShadow = true;
  upperBandBottom.receiveShadow = true;
  root.add(upperBandBottom);

  const upperWingLeft = new THREE.Mesh(track(new THREE.BoxGeometry(0.45, 2.65, 1.35)), mats.trimDetail);
  upperWingLeft.position.set(-4.62, 4.24, 2.25);
  upperWingLeft.castShadow = true;
  root.add(upperWingLeft);

  const upperWingRight = new THREE.Mesh(track(new THREE.BoxGeometry(0.45, 2.65, 1.35)), mats.trimDetail);
  upperWingRight.position.set(4.62, 4.24, 2.25);
  upperWingRight.castShadow = true;
  root.add(upperWingRight);

  // Wood slatted soffit beneath cantilever ceiling
  const soffit = new THREE.Mesh(track(new THREE.BoxGeometry(8.8, 0.08, 1.2)), woodMat);
  soffit.position.set(0, 5.22, 2.22);
  root.add(soffit);

  // Upper recessed balcony glass sliding doors + warm interior glow
  const upperInterior = new THREE.Mesh(track(new THREE.PlaneGeometry(5.6, 1.9)), mats.interiorGlow);
  upperInterior.position.set(1.2, 4.22, 2.41);
  root.add(upperInterior);

  const upperGlassDoor = new THREE.Mesh(track(new THREE.BoxGeometry(5.65, 1.95, 0.06)), glassMat);
  upperGlassDoor.position.set(1.2, 4.22, 2.44);
  root.add(upperGlassDoor);

  // Aluminum mullions on upper glass
  for (const mx of [-1.6, 0.25, 2.1, 4.0]) {
    const mullion = new THREE.Mesh(track(new THREE.BoxGeometry(0.07, 1.98, 0.1)), darkMetalMat);
    mullion.position.set(mx, 4.22, 2.45);
    root.add(mullion);
  }

  // Frameless glass balcony balustrade + stainless spigots
  const balconyGlass = new THREE.Mesh(track(new THREE.BoxGeometry(5.85, 0.92, 0.04)), glassMat);
  balconyGlass.position.set(1.2, 3.68, 2.86);
  root.add(balconyGlass);

  const balconyCap = new THREE.Mesh(track(new THREE.BoxGeometry(5.9, 0.04, 0.07)), steelMat);
  balconyCap.position.set(1.2, 4.15, 2.86);
  root.add(balconyCap);

  // Parapet / roof cap trim (Platibanda)
  const roofCap = new THREE.Mesh(track(new THREE.BoxGeometry(9.85, 0.18, 5.75)), darkMetalMat);
  roofCap.position.set(0, 5.62, -0.2);
  roofCap.castShadow = true;
  root.add(roofCap);

  // 4. Perimeter front garden wall (Muro frontal) & Gate (Portão) - Paintable!
  const muroLeft = new THREE.Mesh(track(new THREE.BoxGeometry(3.2, 1.45, 0.28)), mats.primaryWall);
  muroLeft.position.set(-4.3, 0.725, 4.65);
  muroLeft.castShadow = true;
  muroLeft.receiveShadow = true;
  root.add(muroLeft);

  const muroLeftCap = new THREE.Mesh(track(new THREE.BoxGeometry(3.3, 0.1, 0.34)), mats.trimDetail);
  muroLeftCap.position.set(-4.3, 1.49, 4.65);
  muroLeftCap.castShadow = true;
  root.add(muroLeftCap);

  const muroRight = new THREE.Mesh(track(new THREE.BoxGeometry(2.6, 1.45, 0.28)), mats.primaryWall);
  muroRight.position.set(4.5, 0.725, 4.65);
  muroRight.castShadow = true;
  muroRight.receiveShadow = true;
  root.add(muroRight);

  const muroRightCap = new THREE.Mesh(track(new THREE.BoxGeometry(2.7, 0.1, 0.34)), mats.trimDetail);
  muroRightCap.position.set(4.5, 1.49, 4.65);
  muroRightCap.castShadow = true;
  root.add(muroRightCap);

  // Architectural metal gate slats
  const gateGroup = new THREE.Group();
  const gateFrame = new THREE.Mesh(track(new THREE.BoxGeometry(2.8, 1.42, 0.06)), darkMetalMat);
  gateFrame.position.set(-1.25, 0.74, 4.65);
  gateGroup.add(gateFrame);
  for (let i = -5; i <= 5; i++) {
    const slat = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 1.32, 0.09)), darkMetalMat);
    slat.position.set(-1.25 + i * 0.23, 0.74, 4.65);
    gateGroup.add(slat);
  }
  root.add(gateGroup);

  // House number plaque on muro
  const plaque = new THREE.Mesh(track(new THREE.BoxGeometry(0.45, 0.24, 0.04)), steelMat);
  plaque.position.set(-3.2, 1.05, 4.81);
  root.add(plaque);

  // 5. Architectural wall sconces (Arandelas) for evening/night lighting
  addWallSconce(root, -2.5, 4.2, 2.46, darkMetalMat, mats.sconceEmissive, sconceLights, true);
  addWallSconce(root, -2.25, 1.75, 1.74, darkMetalMat, mats.sconceEmissive, sconceLights, true);
  addWallSconce(root, 3.85, 1.75, 1.74, darkMetalMat, mats.sconceEmissive, sconceLights, true);
  addWallSconce(root, -3.2, 1.05, 4.82, darkMetalMat, mats.sconceEmissive, sconceLights, false);

  // 6. Grounded landscaping shrubs
  const shrub1 = createShrubGroup(foliageMat, trunkMat, planterMat, 1.05);
  shrub1.position.set(-4.9, 0.01, 3.3);
  root.add(shrub1);

  const shrub2 = createShrubGroup(foliageMat, trunkMat, planterMat, 0.9);
  shrub2.position.set(4.1, 0.01, 2.3);
  root.add(shrub2);

  const shrub3 = createShrubGroup(foliageMat, trunkMat, planterMat, 0.8);
  shrub3.position.set(3.4, 0.01, 3.8);
  root.add(shrub3);

  return {
    root,
    sconceLights,
    dispose: () => {
      for (const d of disposables) {
        d.dispose();
      }
    },
  };
}

export function buildCommercialFacadeScene(
  mats: SceneSharedMaterials,
  textures: ProceduralTexturePack,
  isSoftwareGl: boolean,
): BuiltSceneResult {
  const root = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const sconceLights: THREE.PointLight[] = [];

  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const sidewalkMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.concreteMap,
      roughness: 0.85,
      metalness: 0.03,
    }),
  );
  const darkMetalMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x1e2229,
      roughness: 0.34,
      metalness: 0.8,
    }),
  );
  const steelMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xd9dee6,
      roughness: 0.22,
      metalness: 0.9,
    }),
  );
  const woodMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.woodAlbedoMap,
      bumpMap: textures.woodBumpMap,
      bumpScale: 0.015,
      roughness: 0.6,
      metalness: 0.04,
    }),
  );
  const glassMat = track(createGlassMaterial(isSoftwareGl));
  const foliageMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x45693c,
      roughness: 0.86,
      metalness: 0.02,
    }),
  );
  const trunkMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x5c4330,
      roughness: 0.9,
      metalness: 0.0,
    }),
  );
  const planterMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x353b42,
      roughness: 0.78,
      metalness: 0.08,
    }),
  );
  const shadowMat = track(
    new THREE.MeshBasicMaterial({
      map: textures.contactShadowMap,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );

  // 1. Urban sidewalk, architectural plinth & curb
  const commercialPlinth = new THREE.Mesh(track(new THREE.BoxGeometry(20.2, 0.24, 15.2)), darkMetalMat);
  commercialPlinth.position.set(0, -0.24, 1.5);
  root.add(commercialPlinth);

  const sidewalk = new THREE.Mesh(track(new THREE.BoxGeometry(20, 0.14, 15)), sidewalkMat);
  sidewalk.position.set(0, -0.07, 1.5);
  sidewalk.receiveShadow = true;
  root.add(sidewalk);

  const curb = new THREE.Mesh(track(new THREE.BoxGeometry(20, 0.08, 0.35)), darkMetalMat);
  curb.position.set(0, 0.02, 5.2);
  curb.receiveShadow = true;
  root.add(curb);

  const shadowDisc = new THREE.Mesh(track(new THREE.PlaneGeometry(10.8, 5.8)), shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.set(0, 0.025, 0.4);
  root.add(shadowDisc);

  // 2. Main commercial building shell (Primary paintable wall)
  const mainBody = new THREE.Mesh(track(new THREE.BoxGeometry(9.6, 4.6, 4.6)), mats.primaryWall);
  mainBody.position.set(0, 2.3, -1.2);
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  root.add(mainBody);

  // Left & Right projecting architectural pilasters (Primary paintable)
  const leftPilaster = new THREE.Mesh(track(new THREE.BoxGeometry(1.15, 4.6, 0.75)), mats.primaryWall);
  leftPilaster.position.set(-4.22, 2.3, 1.25);
  leftPilaster.castShadow = true;
  leftPilaster.receiveShadow = true;
  root.add(leftPilaster);

  const rightPilaster = new THREE.Mesh(track(new THREE.BoxGeometry(1.15, 4.6, 0.75)), mats.primaryWall);
  rightPilaster.position.set(4.22, 2.3, 1.25);
  rightPilaster.castShadow = true;
  rightPilaster.receiveShadow = true;
  root.add(rightPilaster);

  // Upper Testeira / Platibanda fascia band (Trim paintable!)
  const fascia = new THREE.Mesh(track(new THREE.BoxGeometry(9.8, 1.25, 0.85)), mats.trimDetail);
  fascia.position.set(0, 4.08, 1.3);
  fascia.castShadow = true;
  fascia.receiveShadow = true;
  root.add(fascia);

  // Trim molding cornice cap & base sill
  const topCap = new THREE.Mesh(track(new THREE.BoxGeometry(10.0, 0.16, 0.98)), darkMetalMat);
  topCap.position.set(0, 4.76, 1.32);
  topCap.castShadow = true;
  root.add(topCap);

  const woodMarqueeSoffit = new THREE.Mesh(track(new THREE.BoxGeometry(7.3, 0.08, 0.72)), woodMat);
  woodMarqueeSoffit.position.set(0, 3.44, 1.26);
  root.add(woodMarqueeSoffit);

  // Minimalist illuminated architectural signage bar
  const signBacking = new THREE.Mesh(track(new THREE.BoxGeometry(4.4, 0.54, 0.08)), darkMetalMat);
  signBacking.position.set(0, 4.08, 1.75);
  root.add(signBacking);

  const signAccentLine = new THREE.Mesh(track(new THREE.BoxGeometry(3.9, 0.1, 0.04)), mats.sconceEmissive);
  signAccentLine.position.set(0, 4.08, 1.8);
  root.add(signAccentLine);

  // 3. Recessed glass vitrine & showroom interior display
  const showroomBackdrop = new THREE.Mesh(track(new THREE.PlaneGeometry(7.2, 3.25)), mats.interiorGlow);
  showroomBackdrop.position.set(0, 1.72, 0.55);
  root.add(showroomBackdrop);

  // Display plinths inside window for depth
  for (const px of [-2.2, 2.2]) {
    const plinth = new THREE.Mesh(track(new THREE.BoxGeometry(1.1, 0.75, 0.7)), mats.trimDetail);
    plinth.position.set(px, 0.375, 0.88);
    root.add(plinth);
  }

  // Vitrine glass panels
  const vitrineGlass = new THREE.Mesh(track(new THREE.BoxGeometry(7.3, 3.32, 0.05)), glassMat);
  vitrineGlass.position.set(0, 1.72, 1.18);
  root.add(vitrineGlass);

  // Vertical mullions & entry door frame
  for (const mx of [-3.6, -1.05, 1.05, 3.6]) {
    const mullion = new THREE.Mesh(track(new THREE.BoxGeometry(0.08, 3.38, 0.12)), darkMetalMat);
    mullion.position.set(mx, 1.72, 1.2);
    root.add(mullion);
  }
  const transomBar = new THREE.Mesh(track(new THREE.BoxGeometry(2.14, 0.08, 0.12)), darkMetalMat);
  transomBar.position.set(0, 2.6, 1.2);
  root.add(transomBar);

  // Double door stainless handles
  for (const hx of [-0.14, 0.14]) {
    const handle = new THREE.Mesh(track(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 8)), steelMat);
    handle.position.set(hx, 1.22, 1.28);
    root.add(handle);
  }

  // Lower base plinth band (Trim paintable!)
  const leftBasePlinth = new THREE.Mesh(track(new THREE.BoxGeometry(1.22, 0.38, 0.82)), mats.trimDetail);
  leftBasePlinth.position.set(-4.22, 0.19, 1.27);
  root.add(leftBasePlinth);

  const rightBasePlinth = new THREE.Mesh(track(new THREE.BoxGeometry(1.22, 0.38, 0.82)), mats.trimDetail);
  rightBasePlinth.position.set(4.22, 0.19, 1.27);
  root.add(rightBasePlinth);

  // 4. Exterior sconce lights on pilasters + marquee
  addWallSconce(root, -4.22, 2.65, 1.66, darkMetalMat, mats.sconceEmissive, sconceLights, true);
  addWallSconce(root, 4.22, 2.65, 1.66, darkMetalMat, mats.sconceEmissive, sconceLights, true);

  const planterLeft = createShrubGroup(foliageMat, trunkMat, planterMat, 0.95);
  planterLeft.position.set(-4.22, 0.02, 2.3);
  root.add(planterLeft);

  const planterRight = createShrubGroup(foliageMat, trunkMat, planterMat, 0.95);
  planterRight.position.set(4.22, 0.02, 2.3);
  root.add(planterRight);

  return {
    root,
    sconceLights,
    dispose: () => {
      for (const d of disposables) {
        d.dispose();
      }
    },
  };
}

export function buildInteriorRoomScene(
  mats: SceneSharedMaterials,
  textures: ProceduralTexturePack,
): BuiltSceneResult {
  const root = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];

  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const floorMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.woodAlbedoMap,
      bumpMap: textures.woodBumpMap,
      bumpScale: 0.012,
      roughness: 0.52,
      metalness: 0.04,
    }),
  );
  const ceilingMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xf7f8fa,
      roughness: 0.9,
      metalness: 0.0,
    }),
  );
  const trimMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.42,
      metalness: 0.04,
    }),
  );
  const oakMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xb6895b,
      roughness: 0.6,
      metalness: 0.03,
    }),
  );
  const fabricMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xebe6dd,
      roughness: 0.94,
      metalness: 0.0,
    }),
  );
  const rollerHandleMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x0b3d91,
      roughness: 0.4,
      metalness: 0.1,
    }),
  );
  const chromeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xd5dbe3,
      roughness: 0.2,
      metalness: 0.9,
    }),
  );
  const trayMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x29303b,
      roughness: 0.65,
      metalness: 0.1,
    }),
  );
  const goldMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xc5a25d,
      roughness: 0.3,
      metalness: 0.85,
    }),
  );

  // Floor
  const floor = new THREE.Mesh(track(new THREE.BoxGeometry(7.2, 0.14, 5.4)), floorMat);
  floor.position.set(0, -0.07, 0.2);
  floor.receiveShadow = true;
  root.add(floor);

  // Main painted feature wall
  const backWall = new THREE.Mesh(track(new THREE.BoxGeometry(7.2, 3.6, 0.22)), mats.primaryWall);
  backWall.position.set(0, 1.8, -1.9);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  root.add(backWall);

  // Side return wall (neutral off-white)
  const leftWall = new THREE.Mesh(track(new THREE.BoxGeometry(0.22, 3.6, 5.4)), ceilingMat);
  leftWall.position.set(-3.55, 1.8, 0.2);
  leftWall.receiveShadow = true;
  root.add(leftWall);

  // Baseboard (rodapé)
  const baseboard = new THREE.Mesh(track(new THREE.BoxGeometry(7.0, 0.18, 0.05)), trimMat);
  baseboard.position.set(0, 0.09, -1.77);
  root.add(baseboard);

  // Architectural Boiserie molding panels on painted wall
  const framePositions = [-2.2, 0, 2.2];
  for (const fx of framePositions) {
    const w = 1.65;
    const h = 2.05;
    const cy = 1.82;
    const thick = 0.045;
    const depth = 0.035;

    const topBar = new THREE.Mesh(track(new THREE.BoxGeometry(w, thick, depth)), mats.primaryWall);
    topBar.position.set(fx, cy + h / 2, -1.77);
    topBar.castShadow = true;
    root.add(topBar);

    const botBar = new THREE.Mesh(track(new THREE.BoxGeometry(w, thick, depth)), mats.primaryWall);
    botBar.position.set(fx, cy - h / 2, -1.77);
    botBar.castShadow = true;
    root.add(botBar);

    const leftBar = new THREE.Mesh(track(new THREE.BoxGeometry(thick, h, depth)), mats.primaryWall);
    leftBar.position.set(fx - w / 2, cy, -1.77);
    leftBar.castShadow = true;
    root.add(leftBar);

    const rightBar = new THREE.Mesh(track(new THREE.BoxGeometry(thick, h, depth)), mats.primaryWall);
    rightBar.position.set(fx + w / 2, cy, -1.77);
    rightBar.castShadow = true;
    root.add(rightBar);
  }

  // Framed art inside center boiserie
  const artFrame = new THREE.Mesh(track(new THREE.BoxGeometry(0.92, 1.15, 0.04)), goldMat);
  artFrame.position.set(0, 1.92, -1.76);
  artFrame.castShadow = true;
  root.add(artFrame);

  const artMat = new THREE.Mesh(track(new THREE.BoxGeometry(0.84, 1.07, 0.045)), trimMat);
  artMat.position.set(0, 1.92, -1.755);
  root.add(artMat);

  const artCenter = new THREE.Mesh(track(new THREE.BoxGeometry(0.56, 0.76, 0.05)), rollerHandleMat);
  artCenter.position.set(0, 1.92, -1.75);
  root.add(artCenter);

  // Oak bench below artwork
  const benchTop = new THREE.Mesh(track(new THREE.BoxGeometry(2.1, 0.08, 0.62)), oakMat);
  benchTop.position.set(-0.3, 0.46, -1.2);
  benchTop.castShadow = true;
  benchTop.receiveShadow = true;
  root.add(benchTop);

  for (const lx of [-1.2, 0.6]) {
    for (const lz of [-1.42, -0.98]) {
      const leg = new THREE.Mesh(track(new THREE.CylinderGeometry(0.032, 0.024, 0.44, 10)), oakMat);
      leg.position.set(lx, 0.22, lz);
      leg.castShadow = true;
      root.add(leg);
    }
  }

  // Drop cloth (Lona de proteção) & Paint Roller + Tray prop ("Pintura & Rolo")
  const dropCloth = new THREE.Mesh(track(new THREE.BoxGeometry(1.75, 0.02, 1.45)), fabricMat);
  dropCloth.position.set(1.15, 0.015, 0.55);
  dropCloth.receiveShadow = true;
  root.add(dropCloth);

  const tray = new THREE.Mesh(track(new THREE.BoxGeometry(0.52, 0.09, 0.36)), trayMat);
  tray.position.set(1.1, 0.07, 0.55);
  tray.castShadow = true;
  root.add(tray);

  const paintPool = new THREE.Mesh(track(new THREE.BoxGeometry(0.42, 0.03, 0.28)), mats.primaryWall);
  paintPool.position.set(1.1, 0.11, 0.55);
  root.add(paintPool);

  // Roller cylinder + wire frame + handle
  const rollerGroup = new THREE.Group();
  const rollerSleeve = new THREE.Mesh(track(new THREE.CylinderGeometry(0.055, 0.055, 0.28, 16)), mats.primaryWall);
  rollerSleeve.rotation.z = Math.PI / 2;
  rollerSleeve.castShadow = true;
  rollerGroup.add(rollerSleeve);

  const rollerStem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8)), chromeMat);
  rollerStem.rotation.x = Math.PI / 2;
  rollerStem.position.set(0, 0, 0.22);
  rollerGroup.add(rollerStem);

  const rollerGrip = new THREE.Mesh(track(new THREE.CylinderGeometry(0.024, 0.022, 0.18, 10)), rollerHandleMat);
  rollerGrip.rotation.x = Math.PI / 2;
  rollerGrip.position.set(0, 0, 0.42);
  rollerGroup.add(rollerGrip);

  rollerGroup.position.set(0.85, 0.15, 0.42);
  rollerGroup.rotation.y = 0.45;
  root.add(rollerGroup);

  return {
    root,
    sconceLights: [],
    dispose: () => {
      for (const d of disposables) {
        d.dispose();
      }
    },
  };
}

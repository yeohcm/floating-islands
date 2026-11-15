import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createAwningTexture, createSignTexture, tagLandmark } from '../materials.js';

function createPohutukawa(palette, scale = 1) {
  const tree = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85 });

  // Smooth curved gnarled trunk & secondary limb
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.04, 0.22, 0.02),
    new THREE.Vector3(0.02, 0.44, -0.01),
  ]);
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 12, 0.055, 10, false), trunkMat);
  trunk.castShadow = true;
  tree.add(trunk);

  const limbCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.02, 0.2, 0.01),
    new THREE.Vector3(0.14, 0.36, 0.05),
    new THREE.Vector3(0.22, 0.45, -0.02),
  ]);
  const limb = new THREE.Mesh(new THREE.TubeGeometry(limbCurve, 10, 0.032, 8, false), trunkMat);
  limb.castShadow = true;
  tree.add(limb);

  // Smooth billowy canopy clusters + crimson blossom puffs
  const crownOffsets = [
    [0, 0.54, 0, 0.29],
    [-0.19, 0.46, 0.11, 0.22],
    [0.21, 0.48, -0.08, 0.23],
    [0.04, 0.51, -0.18, 0.19],
  ];
  crownOffsets.forEach(([cx, cy, cz, r], i) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), palette.foliage);
    leaf.position.set(cx, cy, cz);
    leaf.scale.set(1.08, 0.72, 1.04);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    tree.add(leaf);

    if (i < 3) {
      const blossom = new THREE.Mesh(
        new THREE.SphereGeometry(r * 0.44, 14, 12),
        palette.pohutukawaBlossom
      );
      blossom.scale.set(1.15, 0.68, 1.15);
      blossom.position.set(cx * 1.1, cy + r * 0.46, cz * 1.1);
      tree.add(blossom);
    }
  });

  tree.scale.setScalar(scale);
  return tree;
}

function createCabbageTree(palette, scale = 1) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.048, 0.62, 12),
    new THREE.MeshStandardMaterial({ color: 0x7c6855, roughness: 0.85 })
  );
  trunk.position.y = 0.31;
  trunk.castShadow = true;
  tree.add(trunk);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), palette.grassBright);
    tuft.scale.set(0.65, 1.35, 0.65);
    tuft.position.set(Math.cos(a) * 0.065, 0.62, Math.sin(a) * 0.065);
    tuft.rotation.z = -Math.cos(a) * 0.55;
    tuft.rotation.x = Math.sin(a) * 0.55;
    tree.add(tuft);
  }
  tree.scale.setScalar(scale);
  return tree;
}

function createStreetLamp(palette) {
  const lamp = new THREE.Group();
  // Smooth curved swan-neck streetlamp post
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.42, 0),
    new THREE.Vector3(0.04, 0.51, 0),
    new THREE.Vector3(0.12, 0.49, 0),
  ]);
  const pole = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.018, 10, false), palette.steelDark);
  lamp.add(pole);

  const bulbMat = palette.registerEmissive(
    new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xffb74d,
      emissiveIntensity: 0.3,
    }),
    0.3,
    2.4
  );
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), bulbMat);
  bulb.position.set(0.12, 0.46, 0);
  lamp.add(bulb);
  return lamp;
}

function createPedestrian(shirtColor, pantsColor = 0x1e293b) {
  const p = new THREE.Group();
  const legs = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.02, 0.055, 6, 10),
    new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.75 })
  );
  legs.position.y = 0.045;
  p.add(legs);

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.025, 0.055, 8, 12),
    new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.65 })
  );
  torso.position.y = 0.13;
  p.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.024, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.55 })
  );
  head.position.y = 0.205;
  p.add(head);
  return p;
}

function createHeritageShop(cfg, palette) {
  const shop = new THREE.Group();
  shop.position.set(cfg.x, 0.12, cfg.z);

  const wallMat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.68 });
  const trimMat = palette.sandstone;
  const dirToRoad = cfg.x < -0.45 ? 1 : -1;

  // Smooth rounded building mass
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(cfg.w, cfg.h, cfg.d, 4, 0.045),
    wallMat
  );
  body.position.y = cfg.h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  shop.add(body);

  // Smooth rounded cornice molding
  const cornice = new THREE.Mesh(
    new RoundedBoxGeometry(cfg.w + 0.07, 0.075, cfg.d + 0.07, 3, 0.025),
    trimMat
  );
  cornice.position.y = cfg.h + 0.02;
  cornice.castShadow = true;
  shop.add(cornice);

  // Smooth cylindrical corner columns/pilasters
  [-cfg.d * 0.44, cfg.d * 0.44].forEach((pz) => {
    const pilaster = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.042, cfg.h, 12),
      trimMat
    );
    pilaster.position.set(dirToRoad * (cfg.w * 0.48), cfg.h / 2, pz);
    shop.add(pilaster);
  });

  if (cfg.roofType === 'pitched') {
    // Smooth barrel/mansard slate roof + rounded chimney
    const roof = new THREE.Mesh(
      new RoundedBoxGeometry(cfg.w * 0.9, 0.22, cfg.d * 0.92, 4, 0.065),
      cfg.roofMat
    );
    roof.position.y = cfg.h + 0.14;
    roof.castShadow = true;
    shop.add(roof);

    const chimney = new THREE.Mesh(
      new CylinderOrRoundedChimney(palette.heritageBrick),
      palette.heritageBrick
    );
    chimney.position.set(-dirToRoad * 0.18, cfg.h + 0.26, cfg.d * 0.22);
    shop.add(chimney);
  } else {
    // Smooth Art Deco arched parapet + rounded HVAC unit
    const parapet = new THREE.Mesh(
      new RoundedBoxGeometry(0.1, 0.19, cfg.d * 0.58, 3, 0.035),
      trimMat
    );
    parapet.position.set(dirToRoad * (cfg.w / 2 - 0.02), cfg.h + 0.12, 0);
    shop.add(parapet);

    const acUnit = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, 0.12, 0.22, 3, 0.025),
      palette.steel
    );
    acUnit.position.set(-dirToRoad * 0.15, cfg.h + 0.11, -0.12);
    shop.add(acUnit);
  }

  // Ground floor storefront windows
  const gfWin = new THREE.Mesh(
    new RoundedBoxGeometry(cfg.w + 0.025, 0.34, cfg.d * 0.68, 3, 0.025),
    palette.warmWindow
  );
  gfWin.position.y = 0.24;
  shop.add(gfWin);

  // Upper floor arched windows
  if (cfg.h > 0.95) {
    [-cfg.d * 0.22, cfg.d * 0.22].forEach((wz) => {
      const uWin = new THREE.Mesh(
        new RoundedBoxGeometry(cfg.w + 0.025, 0.24, 0.2, 3, 0.025),
        palette.warmWindow
      );
      uWin.position.set(0, 0.72, wz);
      shop.add(uWin);

      const sill = new THREE.Mesh(
        new RoundedBoxGeometry(cfg.w + 0.05, 0.035, 0.24, 2, 0.01),
        trimMat
      );
      sill.position.set(0, 0.59, wz);
      shop.add(sill);
    });
  }

  // Curved striped fabric café awning facing Queen St
  const awningTex = createAwningTexture(cfg.awning, '#f8fafc');
  const awningMat = new THREE.MeshStandardMaterial({ map: awningTex, roughness: 0.65 });
  const awning = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, cfg.d * 0.84, 16, 1, false, 0, Math.PI * 0.55),
    awningMat
  );
  awning.rotation.x = Math.PI / 2;
  if (dirToRoad < 0) awning.rotation.y = Math.PI;
  awning.position.set(dirToRoad * (cfg.w / 2 - 0.02), 0.38, 0);
  awning.castShadow = true;
  shop.add(awning);

  // Outdoor sidewalk café table & smooth domed patio umbrella
  const tableX = dirToRoad * (cfg.w / 2 + 0.22);
  const tableZ = cfg.d * 0.22;
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.022, 18), palette.sandstone);
  tableTop.position.set(tableX, 0.14, tableZ);
  shop.add(tableTop);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.14, 10), palette.steelDark);
  tableLeg.position.set(tableX, 0.07, tableZ);
  shop.add(tableLeg);

  const umbrella = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
    new THREE.MeshStandardMaterial({ color: cfg.awning, roughness: 0.6, side: THREE.DoubleSide })
  );
  umbrella.position.set(tableX, 0.22, tableZ);
  umbrella.castShadow = true;
  shop.add(umbrella);

  const signTex = createSignTexture(cfg.sign, '#0f172a', '#fde047');
  const signMat = palette.registerEmissive(
    new THREE.MeshStandardMaterial({
      map: signTex,
      emissiveMap: signTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.35,
    }),
    0.35,
    1.6
  );
  const signBoard = new THREE.Mesh(
    new RoundedBoxGeometry(0.04, 0.17, 0.54, 2, 0.01),
    signMat
  );
  signBoard.position.set(dirToRoad * (cfg.w / 2 + 0.04), cfg.h - 0.14, 0);
  shop.add(signBoard);

  return shop;
}

function CylinderOrRoundedChimney() {
  return new RoundedBoxGeometry(0.12, 0.26, 0.12, 3, 0.025);
}

export function createCityDetails(palette) {
  const group = new THREE.Group();

  // 1. Vero Centre (x: 0.75, z: -2.95) — smooth elliptical/cylindrical curtain-wall skyscraper with halo
  const vero = new THREE.Group();
  vero.position.set(0.75, 0.12, -2.95);

  const veroPodium = new THREE.Mesh(
    new RoundedBoxGeometry(1.36, 0.45, 1.3, 4, 0.06),
    palette.concrete
  );
  veroPodium.position.y = 0.22;
  veroPodium.castShadow = true;
  veroPodium.receiveShadow = true;
  vero.add(veroPodium);

  // Smooth 36-segment cylindrical-elliptical glass shaft
  const veroBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.74, 0.78, 3.0, 36),
    palette.glassTowerDark
  );
  veroBase.position.y = 1.9;
  veroBase.castShadow = true;
  veroBase.receiveShadow = true;
  vero.add(veroBase);

  // Smooth tubular exterior architectural fins
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const fin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.038, 3.1, 12),
      palette.steel
    );
    fin.position.set(Math.cos(a) * 0.75, 1.95, Math.sin(a) * 0.75);
    vero.add(fin);
  }

  const skyLobby = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.72, 0.14, 36),
    palette.warmWindow
  );
  skyLobby.position.y = 3.45;
  vero.add(skyLobby);

  const veroUpper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.66, 1.15, 36),
    palette.glassTower
  );
  veroUpper.position.y = 4.08;
  veroUpper.castShadow = true;
  vero.add(veroUpper);

  const veroCrown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.5, 0.42, 36),
    palette.steel
  );
  veroCrown.position.y = 4.82;
  vero.add(veroCrown);

  const haloMat = palette.registerEmissive(
    new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      emissive: 0x93c5fd,
      emissiveIntensity: 0.15,
      metalness: 0.75,
      roughness: 0.2,
    }),
    0.15,
    1.1
  );
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.045, 18, 48), haloMat);
  halo.rotation.x = Math.PI / 2 - 0.24;
  halo.position.y = 5.14;
  vero.add(halo);

  tagLandmark(
    vero,
    'Vero Centre',
    'Sleek curved glass skyscraper on Shortland Street crowned with its signature tilted silver halo.'
  );
  group.add(vero);

  // 2. Commercial Bay / PwC Tower (x: 0.95, z: -0.45) — smooth rounded-corner glass curtain wall
  const pwc = new THREE.Group();
  pwc.position.set(0.95, 0.12, -0.45);

  const cbayPodium = new THREE.Mesh(
    new RoundedBoxGeometry(1.36, 0.52, 1.44, 4, 0.06),
    palette.sandstone
  );
  cbayPodium.position.y = 0.26;
  cbayPodium.castShadow = true;
  cbayPodium.receiveShadow = true;
  pwc.add(cbayPodium);

  const pwcBody = new THREE.Mesh(
    new RoundedBoxGeometry(1.14, 3.1, 1.2, 5, 0.14),
    palette.glassTower
  );
  pwcBody.position.y = 2.02;
  pwcBody.castShadow = true;
  pwcBody.receiveShadow = true;
  pwc.add(pwcBody);

  [1.4, 2.3, 3.2].forEach((ry) => {
    const band = new THREE.Mesh(
      new RoundedBoxGeometry(1.18, 0.06, 1.24, 4, 0.14),
      palette.steel
    );
    band.position.y = ry;
    pwc.add(band);
  });

  // Smooth tapered top crown
  const pwcTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.78, 0.88, 32),
    palette.glassTowerDark
  );
  pwcTop.position.y = 3.95;
  pwcTop.castShadow = true;
  pwc.add(pwcTop);

  const cbayFin = new THREE.Mesh(
    new RoundedBoxGeometry(0.75, 0.14, 0.05, 2, 0.015),
    palette.warmWindow
  );
  cbayFin.position.set(0, 3.62, 0.62);
  pwc.add(cbayFin);

  tagLandmark(
    pwc,
    'Commercial Bay / PwC Tower',
    'Curved-glass waterfront skyscraper and retail precinct at the foot of Queen Street opposite Britomart.'
  );
  group.add(pwc);

  // 3. West CBD Curved Setback Tower (x: -3.8, z: -3.3)
  const westTower = new THREE.Group();
  westTower.position.set(-3.8, 0.12, -3.3);
  const wt1 = new THREE.Mesh(
    new RoundedBoxGeometry(1.24, 2.25, 1.16, 5, 0.14),
    palette.glassTowerDark
  );
  wt1.position.y = 1.12;
  wt1.castShadow = true;
  wt1.receiveShadow = true;
  westTower.add(wt1);

  const wtSetback = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.72, 0.86, 4, 0.1),
    palette.concrete
  );
  wtSetback.position.y = 2.58;
  wtSetback.castShadow = true;
  westTower.add(wtSetback);

  const helipad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.05, 24),
    palette.steelDark
  );
  helipad.position.y = 2.96;
  westTower.add(helipad);

  const spireMast = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.032, 0.65, 12), palette.steel);
  spireMast.position.set(0.18, 3.25, 0);
  westTower.add(spireMast);
  group.add(westTower);

  // 4. Auckland Town Hall & Civic Corner (x: -3.55, z: -0.25)
  const civic = new THREE.Group();
  civic.position.set(-3.55, 0.12, -0.25);

  const civicHall = new THREE.Mesh(
    new RoundedBoxGeometry(1.12, 0.82, 1.18, 4, 0.05),
    palette.sandstone
  );
  civicHall.position.y = 0.41;
  civicHall.castShadow = true;
  civicHall.receiveShadow = true;
  civic.add(civicHall);

  const civicRoof = new THREE.Mesh(
    new RoundedBoxGeometry(1.04, 0.22, 1.1, 4, 0.06),
    palette.slateRoof
  );
  civicRoof.position.y = 0.91;
  civicRoof.castShadow = true;
  civic.add(civicRoof);

  const civicClock = new THREE.Mesh(
    new RoundedBoxGeometry(0.36, 1.48, 0.36, 4, 0.04),
    palette.sandstone
  );
  civicClock.position.set(0.38, 0.74, 0.38);
  civicClock.castShadow = true;
  civic.add(civicClock);

  const clockTrim = new THREE.Mesh(
    new RoundedBoxGeometry(0.42, 0.08, 0.42, 3, 0.02),
    palette.terracotta
  );
  clockTrim.position.set(0.38, 1.48, 0.38);
  civic.add(clockTrim);

  const clockDial = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.39, 20), palette.warmWindow);
  clockDial.rotation.z = Math.PI / 2;
  clockDial.position.set(0.38, 1.24, 0.38);
  civic.add(clockDial);

  const clockDial2 = clockDial.clone();
  clockDial2.rotation.x = Math.PI / 2;
  clockDial2.rotation.z = 0;
  civic.add(clockDial2);

  const civicDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: 0x3b7a75, roughness: 0.38, metalness: 0.3 })
  );
  civicDome.position.set(0.38, 1.52, 0.38);
  civic.add(civicDome);

  const civicSpire = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0x3b7a75, roughness: 0.38 })
  );
  civicSpire.position.set(0.38, 1.82, 0.38);
  civic.add(civicSpire);

  for (let pz = -0.35; pz <= 0.35; pz += 0.35) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.55, 14), palette.concrete);
    col.position.set(0.58, 0.28, pz);
    civic.add(col);
  }

  const civicWin = new THREE.Mesh(
    new RoundedBoxGeometry(1.15, 0.24, 0.72, 3, 0.025),
    palette.warmWindow
  );
  civicWin.position.y = 0.48;
  civic.add(civicWin);

  tagLandmark(
    civic,
    'Auckland Town Hall & Civic',
    'Historic Edwardian Baroque Town Hall on Queen Street beside Aotea Square, featuring its ornate corner clocktower.'
  );
  group.add(civic);

  // 5. Smooth Rounded Queen Street Heritage & Boutique Shopfronts
  const shopConfigs = [
    {
      x: -1.42, z: 0.92, w: 0.86, h: 0.96, d: 0.88,
      color: 0xd97706, awning: '#0f766e', sign: 'FLAT WHITE',
      roofType: 'pitched', roofMat: palette.slateRoof,
    },
    {
      x: -1.42, z: 1.98, w: 0.88, h: 1.24, d: 0.94,
      color: 0x475569, awning: '#b91c1c', sign: 'KIWI CAFE',
      roofType: 'deco', roofMat: palette.slateRoof,
    },
    {
      x: 0.65, z: 1.32, w: 0.9, h: 1.12, d: 0.92,
      color: 0x0284c7, awning: '#f59e0b', sign: 'QUEEN ST',
      roofType: 'deco', roofMat: palette.slateRoof,
    },
    {
      x: 0.65, z: 2.34, w: 0.88, h: 0.88, d: 0.86,
      color: 0x9c4637, awning: '#1e293b', sign: 'AOTEAROA',
      roofType: 'pitched', roofMat: palette.terracotta,
    },
  ];

  shopConfigs.forEach((cfg) => group.add(createHeritageShop(cfg, palette)));

  // 6. Traffic Light Pole at Queen St / Customs St Intersection
  const tlGroup = new THREE.Group();
  tlGroup.position.set(-0.98, 0.14, 2.58);
  const tlPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.56, 10), palette.steelDark);
  tlPole.position.y = 0.28;
  tlGroup.add(tlPole);
  const tlArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.32, 8), palette.steelDark);
  tlArm.rotation.z = Math.PI / 2;
  tlArm.position.set(0.15, 0.54, 0);
  tlGroup.add(tlArm);
  const tlBox = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.14, 0.05, 2, 0.012), palette.steelDark);
  tlBox.position.set(0.28, 0.5, 0);
  tlGroup.add(tlBox);
  const tlRed = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.8 })
  );
  tlRed.position.set(0.28, 0.54, 0.03);
  const tlGreen = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.8 })
  );
  tlGreen.position.set(0.28, 0.46, 0.03);
  tlGroup.add(tlRed, tlGreen);
  group.add(tlGroup);

  // 7. Miniature Pedestrians
  [
    [-1.02, 0.14, 1.2, 0xef4444],
    [-1.02, 0.14, 1.45, 0x3b82f6],
    [0.12, 0.14, 2.1, 0xf59e0b],
    [-3.1, 0.18, -1.5, 0x10b981],
    [2.95, 0.19, 1.1, 0xec4899],
    [2.95, 0.19, 1.55, 0xf8fafc],
  ].forEach(([px, py, pz, col]) => {
    const ped = createPedestrian(col);
    ped.position.set(px, py, pz);
    group.add(ped);
  });

  // 8. Smooth Rounded Moving AT CityLink Bus
  const bus = new THREE.Group();
  const busBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.25, 0.22, 0.64, 4, 0.045),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 })
  );
  busBody.position.y = 0.16;
  busBody.castShadow = true;
  bus.add(busBody);

  const busRoof = new THREE.Mesh(
    new RoundedBoxGeometry(0.21, 0.04, 0.58, 3, 0.018),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })
  );
  busRoof.position.y = 0.28;
  bus.add(busRoof);

  [-0.18, 0.18].forEach((wz) => {
    [-0.11, 0.11].forEach((wx) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.03, 14), palette.steelDark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.045, wz);
      bus.add(wheel);
    });
  });

  const busWin = new THREE.Mesh(
    new RoundedBoxGeometry(0.26, 0.09, 0.52, 3, 0.02),
    palette.warmWindow
  );
  busWin.position.y = 0.2;
  bus.add(busWin);

  const busLights = new THREE.Mesh(
    new RoundedBoxGeometry(0.18, 0.04, 0.02, 2, 0.008),
    new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xfff3c4, emissiveIntensity: 1.8 })
  );
  busLights.position.set(0, 0.1, 0.32);
  bus.add(busLights);

  tagLandmark(
    bus,
    'AT CityLink Bus',
    'Iconic crimson Link bus running along Queen Street connecting Wynyard Quarter, Britomart, and Karangahape Road.'
  );
  group.add(bus);

  // 9. Native Trees + Swan-neck Streetlamps
  const pohutukawaPositions = [
    [-5.55, 0.14, 1.35, 0.95],
    [-3.15, 0.14, 3.65, 1.1],
    [-4.3, 0.14, 0.15, 0.85],
    [-3.6, 0.18, -1.7, 0.9],
    [1.85, 0.14, 3.35, 0.85],
    [-2.5, 0.14, 3.65, 0.9],
    [7.22, 0.55, -3.45, 0.85],
  ];
  pohutukawaPositions.forEach(([x, y, z, s]) => {
    const t = createPohutukawa(palette, s);
    t.position.set(x, y, z);
    group.add(t);
  });

  [
    [-4.9, 0.55, 2.7, 0.9],
    [-3.7, 0.55, 2.4, 0.85],
    [-2.75, 0.16, -1.3, 0.95],
  ].forEach(([x, y, z, s]) => {
    const ct = createCabbageTree(palette, s);
    ct.position.set(x, y, z);
    group.add(ct);
  });

  for (let z = -3.6; z <= 3.0; z += 1.65) {
    const lamp = createStreetLamp(palette);
    lamp.position.set(-0.98, 0.14, z);
    group.add(lamp);
  }

  // 10. Smooth Billowy Volumetric-Style Clouds beneath/around the floating island
  const clouds = [];
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.88,
    transparent: true,
    opacity: 0.92,
  });

  const cloudSeeds = [
    { x: -6.5, y: -3.2, z: 4.5, s: 1.1 },
    { x: 5.8, y: -2.9, z: 5.2, s: 1.25 },
    { x: -4.2, y: -4.5, z: -5.4, s: 1.35 },
    { x: 6.4, y: -3.8, z: -3.2, s: 1.0 },
    { x: 0.8, y: -5.2, z: 5.6, s: 1.15 },
  ];

  cloudSeeds.forEach((cs, idx) => {
    const cloud = new THREE.Group();
    [
      [0, 0, 0, 0.72],
      [-0.56, -0.08, 0.12, 0.54],
      [0.58, -0.05, -0.1, 0.56],
      [0.15, 0.24, 0.16, 0.48],
      [-0.22, 0.18, -0.15, 0.44],
    ].forEach(([px, py, pz, r]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), cloudMat);
      puff.position.set(px, py, pz);
      puff.scale.set(1.12, 0.68, 1.05);
      cloud.add(puff);
    });
    cloud.position.set(cs.x, cs.y, cs.z);
    cloud.scale.setScalar(cs.s);
    group.add(cloud);
    clouds.push({ mesh: cloud, baseX: cs.x, baseY: cs.y, phase: idx * 1.4 });
  });

  return {
    group,
    update(elapsed) {
      const cycle = (elapsed * 0.11) % 1;
      const z = -0.55 + Math.sin(cycle * Math.PI * 2) * 3.25;
      const dz = Math.cos(cycle * Math.PI * 2);
      const laneX = dz >= 0 ? -0.22 : -0.68;
      bus.position.set(laneX, 0.14, z);
      bus.rotation.y = dz >= 0 ? 0 : Math.PI;

      const isGreen = Math.floor(elapsed / 5) % 2 === 0;
      tlGreen.material.emissiveIntensity = isGreen ? 2.2 : 0.15;
      tlRed.material.emissiveIntensity = isGreen ? 0.15 : 2.2;

      clouds.forEach((c) => {
        c.mesh.position.x = c.baseX + Math.sin(elapsed * 0.22 + c.phase) * 0.55;
        c.mesh.position.y = c.baseY + Math.cos(elapsed * 0.35 + c.phase) * 0.15;
      });
    },
  };
}

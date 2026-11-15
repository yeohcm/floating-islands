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
    leaf.receiveShadow = false;
    tree.add(leaf);

    if (i < 3) {
      const blossom = new THREE.Mesh(
        new THREE.SphereGeometry(r * 0.44, 14, 12),
        palette.pohutukawaBlossom
      );
      blossom.scale.set(1.15, 0.68, 1.15);
      blossom.position.set(cx * 1.05, cy + r * 0.56, cz * 1.05);
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
    tuft.position.set(Math.cos(a) * 0.065, 0.62 + (i % 2) * 0.018, Math.sin(a) * 0.065);
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
  } else if (cfg.roofType === 'dome') {
    // Edwardian flagship heritage pediment + copper-green corner cupola dome
    const pediment = new THREE.Mesh(
      new RoundedBoxGeometry(0.12, 0.22, cfg.d * 0.56, 3, 0.035),
      trimMat
    );
    pediment.position.set(dirToRoad * (cfg.w / 2 - 0.02), cfg.h + 0.13, 0);
    pediment.castShadow = true;
    shop.add(pediment);

    const cupolaBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.14, 18),
      trimMat
    );
    cupolaBase.position.set(-dirToRoad * 0.06, cfg.h + 0.11, 0);
    shop.add(cupolaBase);

    const cupolaDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ color: 0x3b7a75, roughness: 0.38, metalness: 0.32 })
    );
    cupolaDome.position.set(-dirToRoad * 0.06, cfg.h + 0.18, 0);
    cupolaDome.castShadow = true;
    shop.add(cupolaDome);
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

  // Upper floor arched windows (add second storey when taller than 1.18)
  if (cfg.h > 0.95) {
    const winRows = cfg.h > 1.18 ? [0.68, 0.95] : [0.7];
    const winH = cfg.h > 1.18 ? 0.19 : 0.23;
    winRows.forEach((wy) => {
      [-cfg.d * 0.22, cfg.d * 0.22].forEach((wz) => {
        const uWin = new THREE.Mesh(
          new RoundedBoxGeometry(cfg.w + 0.025, winH, 0.2, 3, 0.022),
          palette.warmWindow
        );
        uWin.position.set(0, wy, wz);
        shop.add(uWin);

        const sill = new THREE.Mesh(
          new RoundedBoxGeometry(cfg.w + 0.05, 0.032, 0.23, 2, 0.01),
          trimMat
        );
        sill.position.set(0, wy - winH * 0.5 - 0.015, wz);
        shop.add(sill);
      });
    });
  }

  // Curved striped fabric café awning facing Queen St
  const awningTex = createAwningTexture(cfg.awning, '#f8fafc');
  const awningMat = new THREE.MeshStandardMaterial({ map: awningTex, roughness: 0.65 });
  const awning = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.21, cfg.d * 0.84, 16, 1, false, 0, Math.PI * 0.55),
    awningMat
  );
  awning.rotation.x = Math.PI / 2;
  if (dirToRoad < 0) awning.rotation.y = Math.PI;
  awning.position.set(dirToRoad * (cfg.w / 2 - 0.02), 0.38, 0);
  awning.castShadow = true;
  shop.add(awning);

  // Outdoor sidewalk café table & smooth domed patio umbrella kept inside footpath
  const tableX = dirToRoad * (cfg.w / 2 + 0.12);
  const tableZ = cfg.d * 0.22;
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.02, 16), palette.sandstone);
  tableTop.position.set(tableX, 0.14, tableZ);
  shop.add(tableTop);
  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.14, 10), palette.steelDark);
  tableLeg.position.set(tableX, 0.07, tableZ);
  shop.add(tableLeg);

  const umbrella = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.48),
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
    new RoundedBoxGeometry(0.04, 0.15, 0.56, 2, 0.01),
    signMat
  );
  signBoard.position.set(dirToRoad * (cfg.w / 2 + 0.04), cfg.h - 0.08, 0);
  shop.add(signBoard);

  tagLandmark(
    shop,
    `Queen St — ${cfg.sign}`,
    cfg.desc || 'Heritage & boutique retail shopfront lining Auckland’s golden-mile Queen Street boulevard.'
  );

  return shop;
}

function CylinderOrRoundedChimney() {
  return new RoundedBoxGeometry(0.12, 0.26, 0.12, 3, 0.025);
}

function createATBusSideTexture(isKerbside) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');

  // Metallic silver/light-grey upper cantrail & rear swept AT Metro flash
  const silverGrad = ctx.createLinearGradient(0, 0, 0, 192);
  silverGrad.addColorStop(0, '#e5ebf2');
  silverGrad.addColorStop(0.55, '#cfd8e3');
  silverGrad.addColorStop(1, '#b8c4d4');
  ctx.fillStyle = silverGrad;
  ctx.fillRect(0, 0, 512, 192);

  // Map longitudinal canvas X cleanly: on kerbside (+X), U=0 (+Z front) -> X=0; on offside (-X), U=0 (-Z rear) -> X=0
  const fx = (fromFront) => (isKerbside ? fromFront : 512 - fromFront);
  const drawFromFrontRect = (fromFront, w, y, h, fill) => {
    ctx.fillStyle = fill;
    const x0 = fx(fromFront);
    const x1 = fx(fromFront + w);
    ctx.fillRect(Math.min(x0, x1), y, Math.abs(x1 - x0), h);
  };

  // Lower AT Metro deep navy-blue body skirt with signature rear silver sweep
  ctx.fillStyle = '#0b2244';
  ctx.beginPath();
  ctx.moveTo(fx(0), 108);
  ctx.lineTo(fx(442), 108);
  ctx.lineTo(fx(476), 192);
  ctx.lineTo(fx(0), 192);
  ctx.closePath();
  ctx.fill();

  // Subtle metallic navy lower sill shadow & wheel arch cutouts aligned to 3D axles (wz = ±0.22 -> 112px & 400px)
  drawFromFrontRect(0, 466, 176, 16, '#071731');
  drawFromFrontRect(78, 68, 146, 46, '#111827');
  drawFromFrontRect(366, 68, 146, 46, '#111827');

  // Continuous flush-bonded black window belt along upper torso
  drawFromFrontRect(10, 446, 24, 78, '#0f172a');

  // Bright crisp white & silver horizontal waistline dividing stripe
  drawFromFrontRect(0, 452, 104, 5, '#f8fafc');
  drawFromFrontRect(0, 456, 109, 3, '#cbd5e1');

  // Helper to paint backlit passenger windows with seated silhouettes & stanchions
  const drawPane = (fromFront, w, y = 30, h = 68) => {
    const x0 = fx(fromFront);
    const x1 = fx(fromFront + w);
    const rx = Math.min(x0, x1);
    const rw = Math.abs(x1 - x0);

    const wGrad = ctx.createLinearGradient(0, y, 0, y + h);
    wGrad.addColorStop(0, '#ffd996');
    wGrad.addColorStop(1, '#fff2cb');
    ctx.fillStyle = wGrad;
    ctx.beginPath();
    ctx.roundRect(rx, y, rw, h, 4);
    ctx.fill();

    // Opening hopper transom bar + diagonal sky sheen
    ctx.fillStyle = 'rgba(15,23,42,0.48)';
    ctx.fillRect(rx, y + 16, rw, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(rx + 6, y + 3, 12, h - 6);

    // Subtle yellow vertical AT Metro grab rail + passenger silhouette
    ctx.fillStyle = 'rgba(250,204,21,0.72)';
    ctx.fillRect(rx + rw * 0.5, y + 8, 2.5, h - 10);
    if (rw > 42) {
      ctx.fillStyle = 'rgba(11,34,68,0.38)';
      ctx.beginPath();
      ctx.arc(rx + rw * 0.3, y + 40, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  if (isKerbside) {
    // Front overhang twin glazed low-floor passenger entry doors (fromFront 16..74)
    drawFromFrontRect(16, 58, 26, 150, '#111827');
    drawPane(20, 23, 32, 122);
    drawPane(47, 23, 32, 122);
    // Green AT HOP tag-on card reader dot inside doorway
    drawFromFrontRect(43, 4, 118, 8, '#22c55e');

    // Amber LED side route display ("105") just behind front entrance
    drawFromFrontRect(82, 28, 82, 18, '#090d16');
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('105', fx(96), 91);

    // Kerbside passenger windows behind doors
    [118, 192, 266, 340].forEach((sf) => drawPane(sf, 66));
    drawPane(412, 38);

    // Accessibility buggy/wheelchair blue badge behind front wheel
    drawFromFrontRect(156, 16, 122, 16, '#0284c7');
  } else {
    // Offside driver cab sliding window + full continuous passenger windows
    drawPane(16, 48, 34, 62);
    [72, 146, 220, 294, 368].forEach((sf) => drawPane(sf, 66));
  }

  // Crisp upright AT roundel + METRO branding + NZ Bus fleet ID NB4284
  const brandX = isKerbside ? 268 : 254;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(brandX - 44, 140, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0b2244';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AT', brandX - 44, 141);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('METRO', brandX - 24, 141);

  // Fleet identifier NB4284 near front cab panel
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  const fleetX = fx(isKerbside ? 202 : 92);
  ctx.fillText('NB4284', fleetX, 124);

  // Amber side indicator marker lights along lower navy skirt
  [52, 256, 434].forEach((sf) => drawFromFrontRect(sf, 10, 162, 5, '#f59e0b'));

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function buildATMetroBus(palette) {
  const bus = new THREE.Group();
  const w = 0.28;
  const h = 0.22;
  const len = 0.78;

  const navyMat = new THREE.MeshStandardMaterial({
    color: 0x0b2244,
    roughness: 0.26,
    metalness: 0.22,
  });
  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xd8e0e9,
    roughness: 0.28,
    metalness: 0.42,
  });
  const glassMaskMat = new THREE.MeshStandardMaterial({
    color: 0x0b1220,
    roughness: 0.1,
    metalness: 0.85,
  });
  const tyreMat = new THREE.MeshStandardMaterial({ color: 0x161b22, roughness: 0.86 });

  const makeSideMat = (isKerb) => {
    const tex = createATBusSideTexture(isKerb);
    return palette.registerEmissive(
      new THREE.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: 0xffd580,
        emissiveIntensity: 0.16,
        roughness: 0.28,
        metalness: 0.28,
      }),
      0.16,
      0.85
    );
  };

  // Rounded Enviro200 single-deck bus shell (+X kerbside, -X offside, +Y silver roof, +Z front)
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(w, h, len, 4, 0.032),
    [makeSideMat(true), makeSideMat(false), silverMat, palette.steelDark, navyMat, navyMat]
  );
  body.position.y = 0.165;
  body.castShadow = true;
  body.receiveShadow = true;
  bus.add(body);

  // Silver roof crown fairing + rooftop Thermo King HVAC pod
  const roofCrown = new THREE.Mesh(
    new RoundedBoxGeometry(w * 0.88, 0.032, len * 0.94, 3, 0.014),
    silverMat
  );
  roofCrown.position.y = 0.278;
  roofCrown.castShadow = true;
  bus.add(roofCrown);

  const acPod = new THREE.Mesh(
    new RoundedBoxGeometry(0.17, 0.034, 0.28, 3, 0.012),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })
  );
  acPod.position.set(0, 0.302, -0.08);
  acPod.castShadow = true;
  bus.add(acPod);

  // 4 realistic low-floor rubber tyres + brushed silver alloy wheel hubs
  const tyreGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.034, 18);
  const hubGeo = new THREE.CylinderGeometry(0.027, 0.027, 0.037, 14);
  [-0.22, 0.22].forEach((wz) => {
    [-0.128, 0.128].forEach((wx) => {
      const tyre = new THREE.Mesh(tyreGeo, tyreMat);
      tyre.rotation.z = Math.PI / 2;
      tyre.position.set(wx, 0.046, wz);
      tyre.castShadow = true;
      bus.add(tyre);

      const hub = new THREE.Mesh(hubGeo, palette.steel);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(wx, 0.046, wz);
      bus.add(hub);
    });
  });

  // === FRONT ENVIRO200 FASCIA (z = +0.39) ===
  const frontBrow = new THREE.Mesh(
    new RoundedBoxGeometry(w * 0.94, 0.038, 0.036, 3, 0.012),
    silverMat
  );
  frontBrow.position.set(0, 0.252, len * 0.485);
  bus.add(frontBrow);

  // Gloss-black flush front windscreen mask + pantograph wipers
  const windscreen = new THREE.Mesh(
    new RoundedBoxGeometry(w * 0.9, 0.118, 0.024, 3, 0.01),
    glassMaskMat
  );
  windscreen.position.set(0, 0.188, len * 0.49);
  windscreen.rotation.x = -0.06;
  bus.add(windscreen);

  [-0.045, 0.045].forEach((wx) => {
    const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.006, 0.008), palette.steelDark);
    wiper.position.set(wx, 0.145, len * 0.503);
    wiper.rotation.z = 0.22;
    bus.add(wiper);
  });

  // Glowing amber LED Route 105 WESTMERE destination display inside upper front glass
  const destTex = createSignTexture('105 WESTMERE', '#090d16', '#f59e0b');
  const destBoard = new THREE.Mesh(
    new RoundedBoxGeometry(0.19, 0.028, 0.014, 2, 0.005),
    palette.registerEmissive(
      new THREE.MeshStandardMaterial({
        map: destTex,
        emissiveMap: destTex,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.6,
      }),
      1.6,
      2.2
    )
  );
  destBoard.position.set(0, 0.23, len * 0.5);
  bus.add(destBoard);

  // Navy front bumper + silver ADL grille trim + AT front badge + NB4284 rego plate
  const frontBumper = new THREE.Mesh(
    new RoundedBoxGeometry(w * 0.96, 0.064, 0.038, 3, 0.014),
    navyMat
  );
  frontBumper.position.set(0, 0.088, len * 0.49);
  bus.add(frontBumper);

  const grilleBar = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.012, 0.01, 2, 0.004), silverMat);
  grilleBar.position.set(0, 0.118, len * 0.506);
  bus.add(grilleBar);

  const atBadge = new THREE.Mesh(
    new THREE.CircleGeometry(0.015, 14),
    new THREE.MeshStandardMaterial({ map: createSignTexture('AT', '#ffffff', '#0b2244') })
  );
  atBadge.position.set(0, 0.122, len * 0.513);
  bus.add(atBadge);

  const plate = new THREE.Mesh(
    new RoundedBoxGeometry(0.068, 0.02, 0.008, 2, 0.003),
    new THREE.MeshStandardMaterial({ map: createSignTexture('NB4284', '#f8fafc', '#0f172a') })
  );
  plate.position.set(0, 0.072, len * 0.51);
  bus.add(plate);

  // Twin projector LED headlights + amber turn indicators
  const hlMat = new THREE.MeshStandardMaterial({
    color: 0xfff8dc,
    emissive: 0xfff8dc,
    emissiveIntensity: 2.2,
  });
  const indMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.6,
  });
  [-0.095, 0.095].forEach((lx) => {
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), hlMat);
    hl.position.set(lx, 0.092, len * 0.505);
    bus.add(hl);

    const ind = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), indMat);
    ind.position.set(lx * 1.18, 0.096, len * 0.503);
    bus.add(ind);
  });

  // Cantilevered bus wing mirrors (kerbside & offside)
  [
    { x: 0.158, y: 0.21, z: 0.39, armX: 0.028 },
    { x: -0.155, y: 0.195, z: 0.37, armX: -0.022 },
  ].forEach((m) => {
    const mirror = new THREE.Mesh(new RoundedBoxGeometry(0.018, 0.044, 0.014, 2, 0.004), palette.steelDark);
    mirror.position.set(m.x, m.y, m.z);
    bus.add(mirror);
    const stalk = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(m.armX), 0.008, 0.008), palette.steelDark);
    stalk.position.set(m.x - m.armX * 0.5, m.y + 0.015, m.z - 0.012);
    bus.add(stalk);
  });

  // === REAR ENVIRO200 FASCIA (z = -0.39) ===
  const rearMask = new THREE.Mesh(
    new RoundedBoxGeometry(w * 0.84, 0.1, 0.02, 2, 0.008),
    glassMaskMat
  );
  rearMask.position.set(0, 0.205, -len * 0.492);
  bus.add(rearMask);

  const rearRoute = new THREE.Mesh(
    new RoundedBoxGeometry(0.07, 0.028, 0.012, 2, 0.004),
    palette.registerEmissive(
      new THREE.MeshStandardMaterial({
        map: createSignTexture('105', '#090d16', '#f59e0b'),
        emissive: 0xf59e0b,
        emissiveIntensity: 1.4,
      }),
      1.4,
      2.0
    )
  );
  rearRoute.position.set(0, 0.23, -len * 0.498);
  bus.add(rearRoute);

  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xff2626,
    emissive: 0xff2626,
    emissiveIntensity: 1.8,
  });
  [-0.105, 0.105].forEach((tx) => {
    const tl = new THREE.Mesh(new RoundedBoxGeometry(0.016, 0.052, 0.012, 2, 0.004), tailMat);
    tl.position.set(tx, 0.11, -len * 0.498);
    bus.add(tl);
  });

  tagLandmark(
    bus,
    'AT Metro Bus NB4284 (Route 105)',
    'NZ Bus Alexander Dennis Enviro200 in AT Metro navy-and-silver livery operating Route 105 (Britomart – Westmere) along Queen Street.'
  );
  return bus;
}

export function createCityDetails(palette) {
  const group = new THREE.Group();

  // 1. Vero Centre (x: 0.88, z: -3.74) — smooth elliptical/cylindrical curtain-wall skyscraper with halo
  const vero = new THREE.Group();
  vero.position.set(0.88, 0.12, -3.74);

  const veroPodium = new THREE.Mesh(
    new RoundedBoxGeometry(1.16, 0.45, 1.04, 4, 0.06),
    palette.concrete
  );
  veroPodium.position.y = 0.22;
  veroPodium.castShadow = true;
  veroPodium.receiveShadow = true;
  vero.add(veroPodium);

  // Smooth 36-segment cylindrical-elliptical glass shaft
  const veroBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.6, 3.0, 36),
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
      new THREE.CylinderGeometry(0.028, 0.034, 3.1, 12),
      palette.steel
    );
    fin.position.set(Math.cos(a) * 0.58, 1.95, Math.sin(a) * 0.58);
    vero.add(fin);
  }

  const skyLobby = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.55, 0.14, 36),
    palette.warmWindow
  );
  skyLobby.position.y = 3.45;
  vero.add(skyLobby);

  const veroUpper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.52, 1.15, 36),
    palette.glassTower
  );
  veroUpper.position.y = 4.08;
  veroUpper.castShadow = true;
  vero.add(veroUpper);

  const veroCrown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.4, 0.42, 36),
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
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 18, 48), haloMat);
  halo.rotation.x = Math.PI / 2 - 0.24;
  halo.position.y = 5.14;
  vero.add(halo);

  tagLandmark(
    vero,
    'Vero Centre',
    'Sleek curved glass skyscraper on Shortland Street crowned with its signature tilted silver halo.'
  );
  group.add(vero);

  // 2. Commercial Bay / PwC Tower (x: 0.88, z: -0.66) — smooth rounded-corner glass curtain wall
  const pwc = new THREE.Group();
  pwc.position.set(0.88, 0.12, -0.66);

  const cbayPodium = new THREE.Mesh(
    new RoundedBoxGeometry(1.16, 0.52, 1.02, 4, 0.06),
    palette.sandstone
  );
  cbayPodium.position.y = 0.26;
  cbayPodium.castShadow = true;
  cbayPodium.receiveShadow = true;
  pwc.add(cbayPodium);

  const pwcBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.96, 3.1, 0.92, 5, 0.12),
    palette.glassTower
  );
  pwcBody.position.y = 2.02;
  pwcBody.castShadow = true;
  pwcBody.receiveShadow = true;
  pwc.add(pwcBody);

  [1.4, 2.3, 3.2].forEach((ry) => {
    const band = new THREE.Mesh(
      new RoundedBoxGeometry(1.0, 0.06, 0.96, 4, 0.12),
      palette.steel
    );
    band.position.y = ry;
    pwc.add(band);
  });

  // Smooth tapered top crown
  const pwcTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.62, 0.88, 32),
    palette.glassTowerDark
  );
  pwcTop.position.y = 3.95;
  pwcTop.castShadow = true;
  pwc.add(pwcTop);

  const cbayFin = new THREE.Mesh(
    new RoundedBoxGeometry(0.62, 0.14, 0.05, 2, 0.015),
    palette.warmWindow
  );
  cbayFin.position.set(0, 3.62, 0.48);
  pwc.add(cbayFin);

  tagLandmark(
    pwc,
    'Commercial Bay / PwC Tower',
    'Curved-glass waterfront skyscraper and retail precinct along Queen Street opposite Britomart.'
  );
  group.add(pwc);

  // 3. West CBD Curved Setback Tower (x: -4.15, z: -4.55)
  const westTower = new THREE.Group();
  westTower.position.set(-4.15, 0.12, -4.55);
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

  // 4. Auckland Town Hall & Civic Corner (x: -3.25, z: 0.15)
  const civic = new THREE.Group();
  civic.position.set(-3.25, 0.12, 0.15);

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

  // 5. Expanded Queen Street Golden Mile Heritage & Boutique Shopfronts (15 Shops along Both Sides)
  const shopConfigs = [
    // West Side (x: -1.54, facing +X across Queen St footpath)
    {
      x: -1.54, z: 2.2, w: 0.78, h: 1.22, d: 0.86,
      color: 0x475569, awning: '#b91c1c', sign: 'KIWI CAFE',
      roofType: 'deco', roofMat: palette.slateRoof,
    },
    {
      x: -1.54, z: 1.18, w: 0.78, h: 0.98, d: 0.86,
      color: 0xd97706, awning: '#0f766e', sign: 'FLAT WHITE',
      roofType: 'pitched', roofMat: palette.slateRoof,
    },
    {
      x: -1.54, z: 0.16, w: 0.78, h: 1.16, d: 0.86,
      color: 0xc2410c, awning: '#1e3a8a', sign: 'WHITCOULLS',
      roofType: 'deco', roofMat: palette.slateRoof,
    },
    {
      x: -1.54, z: -0.88, w: 0.78, h: 1.34, d: 0.9,
      color: 0xd6c7b2, awning: '#881337', sign: 'SMITH & CAUGHEY',
      roofType: 'dome', roofMat: palette.slateRoof,
      desc: 'Historic Edwardian Queen Street flagship emporium crowned with its ornate copper-green cupola.',
    },
    {
      x: -1.54, z: -1.94, w: 0.78, h: 1.04, d: 0.86,
      color: 0x15803d, awning: '#ca8a04', sign: 'CIVIC BISTRO',
      roofType: 'pitched', roofMat: palette.slateRoof,
    },
    {
      x: -1.54, z: -2.98, w: 0.78, h: 1.18, d: 0.86,
      color: 0x0f766e, awning: '#ea580c', sign: 'POUNAMU ART',
      roofType: 'deco', roofMat: palette.slateRoof,
    },
    {
      x: -1.54, z: -4.02, w: 0.78, h: 0.94, d: 0.86,
      color: 0xb4533c, awning: '#0284c7', sign: 'AOTEA BAKERY',
      roofType: 'pitched', roofMat: palette.terracotta,
    },
    {
      x: -1.54, z: -5.06, w: 0.78, h: 1.14, d: 0.86,
      color: 0x6d28d9, awning: '#f59e0b', sign: 'K-RD VINTAGE',
      roofType: 'deco', roofMat: palette.slateRoof,
    },
    {
      x: -1.54, z: -6.08, w: 0.78, h: 0.92, d: 0.84,
      color: 0xa16207, awning: '#166534', sign: 'MYERS DELI',
      roofType: 'pitched', roofMat: palette.slateRoof,
    },
    // East Side (x: 0.64, facing -X across Queen St footpath)
    {
      x: 0.64, z: 2.28, w: 0.78, h: 0.92, d: 0.78,
      color: 0x9c4637, awning: '#1e293b', sign: 'AOTEAROA',
      roofType: 'pitched', roofMat: palette.terracotta,
    },
    {
      x: 0.64, z: 1.34, w: 0.78, h: 1.12, d: 0.78,
      color: 0x0284c7, awning: '#f59e0b', sign: 'QUEEN ST',
      roofType: 'deco', roofMat: palette.slateRoof,
    },
    {
      x: 0.64, z: 0.4, w: 0.78, h: 1.02, d: 0.78,
      color: 0x991b1b, awning: '#065f46', sign: 'VULCAN LANE',
      roofType: 'pitched', roofMat: palette.slateRoof,
    },
    {
      x: 0.64, z: -1.72, w: 0.78, h: 1.08, d: 0.78,
      color: 0x4d7c0f, awning: '#dc2626', sign: 'SHORTLAND ST',
      roofType: 'deco', roofMat: palette.slateRoof,
    },
    {
      x: 0.64, z: -2.66, w: 0.78, h: 0.96, d: 0.78,
      color: 0xe11d48, awning: '#0d9488', sign: 'GELATO BAR',
      roofType: 'pitched', roofMat: palette.terracotta,
    },
    {
      x: 0.64, z: -4.8, w: 0.78, h: 1.1, d: 0.78,
      color: 0x1d4ed8, awning: '#eab308', sign: 'HIGH ST BOOKS',
      roofType: 'deco', roofMat: palette.slateRoof,
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

  // 7. Miniature Pedestrians along Queen Street Sidewalks & Waterfront
  [
    [-1.04, 0.15, 1.8, 0xef4444],
    [-1.04, 0.15, -0.4, 0x3b82f6],
    [-1.04, 0.15, -3.5, 0x10b981],
    [-1.04, 0.15, -5.4, 0xf59e0b],
    [0.14, 0.15, 2.0, 0xf59e0b],
    [0.14, 0.15, -1.2, 0xec4899],
    [0.14, 0.15, -4.1, 0x3b82f6],
    [2.95, 0.19, 1.1, 0xec4899],
    [2.95, 0.19, 1.55, 0xf8fafc],
  ].forEach(([px, py, pz, col]) => {
    const ped = createPedestrian(col);
    ped.position.set(px, py, pz);
    group.add(ped);
  });

  // 8. Detailed Moving AT Metro Bus NB4284 (Route 105 Alexander Dennis Enviro200)
  const bus = buildATMetroBus(palette);
  group.add(bus);

  // 9. Native Trees + Swan-neck Streetlamps along Both Sides of Queen Street
  const pohutukawaPositions = [
    [-5.55, 0.12, -1.25, 0.9],
    [-4.95, 0.12, 3.65, 0.95],
    [-4.85, 0.12, -2.85, 0.85],
    [-2.85, 0.12, -5.55, 0.88],
    [-2.65, 0.12, -3.75, 0.82],
    [7.22, 0.55, -3.45, 0.85],
  ];
  pohutukawaPositions.forEach(([x, y, z, s]) => {
    const t = createPohutukawa(palette, s);
    t.position.set(x, y, z);
    group.add(t);
  });

  [
    [-4.65, 0.56, 2.32, 0.9],
    [-3.55, 0.54, 2.15, 0.85],
    [-4.35, 0.18, -1.35, 0.95],
  ].forEach(([x, y, z, s]) => {
    const ct = createCabbageTree(palette, s);
    ct.position.set(x, y, z);
    group.add(ct);
  });

  // West & East sidewalk streetlamps placed in building gaps overlooking Queen St
  [-5.57, -3.5, -1.41, 0.67, 2.75].forEach((z) => {
    const lamp = createStreetLamp(palette);
    lamp.position.set(-0.96, 0.14, z);
    group.add(lamp);
  });
  [-5.25, -3.2, -1.25, 0.87, 2.75].forEach((z) => {
    const lamp = createStreetLamp(palette);
    lamp.position.set(0.06, 0.14, z);
    lamp.rotation.y = Math.PI;
    group.add(lamp);
  });

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
    bus,
    update(elapsed) {
      const cycle = (elapsed * 0.085) % 1;
      const z = -1.95 + Math.sin(cycle * Math.PI * 2) * 4.55;
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

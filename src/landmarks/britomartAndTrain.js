import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createSignTexture, tagLandmark } from '../materials.js';

function createAMSideTexture(hasCab, isTail) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Brushed stainless steel base
  const grad = ctx.createLinearGradient(0, 0, 0, 160);
  grad.addColorStop(0, '#e2e8f0');
  grad.addColorStop(0.55, '#cbd5e1');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 160);

  // Subtle horizontal stainless corrugation lines
  ctx.fillStyle = 'rgba(255,255,255,0.24)';
  for (let y = 96; y < 148; y += 8) {
    ctx.fillRect(0, y, 512, 2);
  }
  ctx.fillStyle = 'rgba(15,23,42,0.12)';
  for (let y = 98; y < 148; y += 8) {
    ctx.fillRect(0, y, 512, 1);
  }

  // Dark navy blue upper window band
  ctx.fillStyle = '#0f284f';
  ctx.fillRect(0, 14, 512, 66);

  // Thin silver pin-stripe at bottom of navy band
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 80, 512, 4);

  // Rounded-corner passenger windows inside navy band
  const drawWindow = (x, w) => {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(x - 2, 22, w + 4, 48, 8);
    ctx.fill();
    ctx.fillStyle = '#ffe5a3';
    ctx.beginPath();
    ctx.roundRect(x, 24, w, 44, 6);
    ctx.fill();
  };

  // Two bright safety-yellow twin doors per side (CAF AM Class signature!)
  const doorPositions = [118, 344];
  doorPositions.forEach((dx) => {
    ctx.fillStyle = '#ffd000';
    ctx.beginPath();
    ctx.roundRect(dx, 14, 54, 136, 4);
    ctx.fill();
    // Door center vertical rubber seal
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(dx + 25, 14, 4, 136);
    // Door twin windows
    ctx.fillStyle = '#ffe5a3';
    ctx.beginPath();
    ctx.roundRect(dx + 6, 26, 15, 42, 4);
    ctx.roundRect(dx + 33, 26, 15, 42, 4);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, 14, 54, 136);
  });

  drawWindow(32, 70);
  drawWindow(190, 68);
  drawWindow(264, 68);
  drawWindow(414, 66);

  if (hasCab) {
    ctx.save();
    if (isTail) {
      ctx.translate(512, 0);
      ctx.scale(-1, 1);
    }
    ctx.fillStyle = '#0f284f';
    ctx.beginPath();
    ctx.moveTo(474, 14);
    ctx.lineTo(512, 14);
    ctx.lineTo(512, 128);
    ctx.lineTo(445, 128);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffd000';
    ctx.beginPath();
    ctx.moveTo(458, 112);
    ctx.lineTo(512, 92);
    ctx.lineTo(512, 152);
    ctx.lineTo(432, 152);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(462, 88, 22, 12, 3);
    ctx.fill();
    ctx.fillStyle = '#0f284f';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('AT', 466, 98);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function buildTrainCar({ isLead = false, isTail = false, hasPantograph = false, palette }) {
  const car = new THREE.Group();

  const navyMat = new THREE.MeshStandardMaterial({
    color: 0x0f284f,
    roughness: 0.25,
    metalness: 0.3,
  });
  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xd1d8e0,
    roughness: 0.24,
    metalness: 0.72,
  });
  const yellowSafetyMat = new THREE.MeshStandardMaterial({
    color: 0xffd000,
    roughness: 0.28,
    metalness: 0.15,
  });
  const darkRoof = new THREE.MeshStandardMaterial({
    color: 0x2a323d,
    roughness: 0.5,
    metalness: 0.45,
  });

  const sideTex = createAMSideTexture(isLead || isTail, isTail);
  const sideMat = palette.registerEmissive(
    new THREE.MeshStandardMaterial({
      map: sideTex,
      emissiveMap: sideTex,
      emissive: 0xffd885,
      emissiveIntensity: 0.12,
      roughness: 0.26,
      metalness: 0.5,
    }),
    0.12,
    0.75
  );

  const len = 1.04;
  const width = 0.38;
  const height = 0.34;

  // Smooth rounded underframe skirt & bogies with cylindrical wheels
  const chassis = new THREE.Mesh(
    new RoundedBoxGeometry(width * 0.92, 0.08, len, 3, 0.02),
    darkRoof
  );
  chassis.position.y = 0.065;
  chassis.castShadow = true;
  car.add(chassis);

  [-0.32, 0.32].forEach((wz) => {
    const bogie = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.84, 0.055, 0.22, 2, 0.015),
      palette.steelDark
    );
    bogie.position.set(0, 0.032, wz);
    car.add(bogie);
  });

  // Smooth rounded stainless-steel carriage body
  const bodyMats = [
    sideMat,
    sideMat,
    stainlessMat,
    darkRoof,
    stainlessMat,
    stainlessMat,
  ];
  const body = new THREE.Mesh(
    new RoundedBoxGeometry(width, height - 0.03, len * 0.96, 4, 0.038),
    bodyMats
  );
  body.position.y = 0.235;
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  // Smooth arched roof fairing & rounded HVAC pod
  const roof = new THREE.Mesh(
    new RoundedBoxGeometry(width * 0.84, 0.048, len * 0.9, 3, 0.02),
    darkRoof
  );
  roof.position.y = 0.40;
  car.add(roof);

  const hvac = new THREE.Mesh(
    new RoundedBoxGeometry(width * 0.58, 0.038, 0.28, 3, 0.016),
    palette.concreteDark
  );
  hvac.position.set(0, 0.43, isLead ? -0.1 : isTail ? 0.1 : 0);
  car.add(hvac);

  // Smooth rounded accordion gangway bellows
  const bellowMat = new THREE.MeshStandardMaterial({ color: 0x1e242c, roughness: 0.85 });
  if (!isLead) {
    const bFront = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.74, 0.25, 0.08, 3, 0.025),
      bellowMat
    );
    bFront.position.set(0, 0.23, len * 0.50);
    car.add(bFront);
  }
  if (!isTail) {
    const bRear = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.74, 0.25, 0.08, 3, 0.025),
      bellowMat
    );
    bRear.position.set(0, 0.23, -len * 0.50);
    car.add(bRear);
  }

  // Smooth Aerodynamic Sloped Nose Cab (AMA / AMP)
  if (isLead || isTail) {
    const dir = isLead ? 1 : -1;
    const cabGroup = new THREE.Group();
    cabGroup.position.set(0, 0.2, dir * (len * 0.47));
    if (isTail) cabGroup.rotation.y = Math.PI;

    // Rounded yellow front safety nose apron
    const yellowApron = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.97, 0.115, 0.17, 4, 0.035),
      yellowSafetyMat
    );
    yellowApron.position.set(0, -0.065, 0.065);
    yellowApron.castShadow = true;
    cabGroup.add(yellowApron);

    const coupler = new THREE.Mesh(
      new RoundedBoxGeometry(0.11, 0.045, 0.08, 2, 0.012),
      palette.steelDark
    );
    coupler.position.set(0, -0.11, 0.135);
    cabGroup.add(coupler);

    // Smooth curved navy blue cab surround mask
    const cabMask = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.95, 0.195, 0.16, 4, 0.04),
      navyMat
    );
    cabMask.position.set(0, 0.072, 0.045);
    cabMask.rotation.x = 0.28;
    cabMask.castShadow = true;
    cabGroup.add(cabMask);

    // Curved glossy black windshield
    const windshield = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.82, 0.12, 0.04, 3, 0.016),
      new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.08, metalness: 0.9 })
    );
    windshield.position.set(0, 0.085, 0.11);
    windshield.rotation.x = 0.28;
    cabGroup.add(windshield);

    const lampColor = isLead ? 0xfff8dc : 0xff2626;
    const lampMat = new THREE.MeshStandardMaterial({
      color: lampColor,
      emissive: lampColor,
      emissiveIntensity: isLead ? 2.6 : 1.8,
    });

    [-0.12, 0.12].forEach((lx) => {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), lampMat);
      lamp.position.set(lx, -0.025, 0.145);
      cabGroup.add(lamp);
    });

    if (isLead) {
      const topLamp = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), lampMat);
      topLamp.position.set(0, 0.185, 0.065);
      cabGroup.add(topLamp);

      const destBoard = new THREE.Mesh(
        new RoundedBoxGeometry(0.17, 0.028, 0.02, 2, 0.006),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.7 })
      );
      destBoard.position.set(0, 0.155, 0.09);
      cabGroup.add(destBoard);
    }

    car.add(cabGroup);
  }

  // Pantograph on AMP car
  if (hasPantograph) {
    const panto = new THREE.Group();
    panto.position.set(0, 0.425, 0.22);

    const insMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });
    [-0.08, 0.08].forEach((ix) => {
      const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.035, 10), insMat);
      ins.position.set(ix, 0.015, 0);
      panto.add(ins);
    });

    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8), palette.steel);
    arm1.position.set(0, 0.06, -0.04);
    arm1.rotation.x = 0.65;
    panto.add(arm1);

    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8), palette.steel);
    arm2.position.set(0, 0.13, -0.02);
    arm2.rotation.x = -0.65;
    panto.add(arm2);

    const collector = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.018, 0.03, 2, 0.006), palette.steel);
    collector.position.set(0, 0.18, 0.02);
    panto.add(collector);
    car.add(panto);
  }

  tagLandmark(
    car,
    'AT Metro AM Class (AMA / AMT / AMP)',
    'Auckland’s CAF-built 3-car stainless steel electric train with navy cab mask, high-visibility yellow nose & doors, running on 25 kV AC.'
  );

  return car;
}

function createOffsetCurve(curve, offsetDist, offsetY = 0, samples = 240) {
  const pts = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const pt = p.clone().addScaledVector(right, offsetDist);
    pt.y += offsetY;
    pts.push(pt);
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

// Build a seamless, continuous swept ribbon BufferGeometry along a closed 3D curve!
function createSweptTrackDeckGeometry(curve, halfWidth = 0.28, thickness = 0.11, steps = 260) {
  const profile = [
    [-halfWidth, 0],
    [ halfWidth, 0],
    [ halfWidth * 0.92, -thickness],
    [-halfWidth * 0.92, -thickness],
  ];
  const pLen = profile.length;
  const positions = [];
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= steps; i++) {
    const t = (i % steps) / steps;
    const center = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const normal = new THREE.Vector3().crossVectors(right, tangent).normalize();

    for (let j = 0; j < pLen; j++) {
      const [px, py] = profile[j];
      const v = center
        .clone()
        .addScaledVector(right, px)
        .addScaledVector(normal, py - 0.015);
      positions.push(v.x, v.y, v.z);
    }
  }

  for (let i = 0; i < steps; i++) {
    const rowA = i * pLen;
    const rowB = (i + 1) * pLen;
    for (let j = 0; j < pLen; j++) {
      const jNext = (j + 1) % pLen;
      const a = rowA + j;
      const b = rowB + j;
      const c = rowB + jNext;
      const d = rowA + jNext;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function sampleTrackWithDwell(u) {
  const dwellStart = 0.06;
  const dwellEnd = 0.16;
  const stationT = 0.09;

  if (u < dwellStart) {
    return (u / dwellStart) * stationT;
  }
  if (u <= dwellEnd) {
    return stationT;
  }
  const rem = (u - dwellEnd) / (1 - dwellEnd);
  return (stationT + rem * (1 - stationT)) % 1;
}

export function createBritomartAndTrain(palette) {
  const group = new THREE.Group();

  const controlPoints = [
    new THREE.Vector3(-2.6, 0.29, 4.78),
    new THREE.Vector3(0.6, 0.29, 4.78),
    new THREE.Vector3(2.52, 0.36, 4.32),
    new THREE.Vector3(2.42, 0.85, 2.0),
    new THREE.Vector3(2.22, 1.15, -1.2),
    new THREE.Vector3(2.02, 1.15, -4.75),
    new THREE.Vector3(-0.9, 1.15, -5.45),
    new THREE.Vector3(-4.4, 1.05, -4.85),
    new THREE.Vector3(-6.25, 0.62, -2.2),
    new THREE.Vector3(-6.3, 0.3, 0.65),
    new THREE.Vector3(-5.55, 0.29, 3.82),
  ];

  const trackCurve = new THREE.CatmullRomCurve3(controlPoints, true, 'catmullrom', 0.5);

  // 1. Continuous Smooth Swept Viaduct Deck & Parapet Curbs (NO choppy boxes!)
  const viaductGeo = createSweptTrackDeckGeometry(trackCurve, 0.28, 0.11, 260);
  const viaductMesh = new THREE.Mesh(viaductGeo, palette.concreteDark);
  viaductMesh.castShadow = true;
  viaductMesh.receiveShadow = true;
  group.add(viaductMesh);

  // Smooth continuous side parapet curbs along the track
  const leftParapetCurve = createOffsetCurve(trackCurve, -0.26, 0.015, 240);
  const rightParapetCurve = createOffsetCurve(trackCurve, 0.26, 0.015, 240);
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(leftParapetCurve, 240, 0.028, 8, true), palette.concrete),
    new THREE.Mesh(new THREE.TubeGeometry(rightParapetCurve, 240, 0.028, 8, true), palette.concrete)
  );

  // Smooth Steel Twin Rails
  const leftRailCurve = createOffsetCurve(trackCurve, -0.11, 0.025, 240);
  const rightRailCurve = createOffsetCurve(trackCurve, 0.11, 0.025, 240);
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(leftRailCurve, 240, 0.016, 8, true), palette.steel),
    new THREE.Mesh(new THREE.TubeGeometry(rightRailCurve, 240, 0.016, 8, true), palette.steel)
  );

  // Sleepers, smooth cylindrical piers with flared capitals & catenary gantries
  const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x4b423b, roughness: 0.85 });
  const sleeperGeo = new RoundedBoxGeometry(0.34, 0.026, 0.075, 2, 0.008);
  const pillarGeo = new THREE.CylinderGeometry(0.1, 0.13, 1, 18);
  const capitalGeo = new THREE.CylinderGeometry(0.22, 0.11, 0.12, 18);

  const sleeperCount = 135;
  const up = new THREE.Vector3(0, 1, 0);
  const dummyQuat = new THREE.Quaternion();
  const dummyMat = new THREE.Matrix4();

  for (let i = 0; i < sleeperCount; i++) {
    const t = i / sleeperCount;
    const pt = trackCurve.getPointAt(t);
    const tangent = trackCurve.getTangentAt(t).normalize();

    dummyMat.lookAt(pt, pt.clone().add(tangent), up);
    dummyQuat.setFromRotationMatrix(dummyMat);

    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.copy(pt);
    sleeper.quaternion.copy(dummyQuat);
    group.add(sleeper);

    if (pt.y > 0.36 && i % 5 === 0) {
      const h = pt.y - 0.08;
      const pillar = new THREE.Mesh(pillarGeo, palette.concrete);
      pillar.scale.set(1, h, 1);
      pillar.position.set(pt.x, h / 2 + 0.05, pt.z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      group.add(pillar);

      const capital = new THREE.Mesh(capitalGeo, palette.concrete);
      capital.position.set(pt.x, pt.y - 0.12, pt.z);
      group.add(capital);
    }

    if (i % 11 === 0) {
      const gantry = new THREE.Group();
      gantry.position.copy(pt);
      gantry.quaternion.copy(dummyQuat);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.72, 10), palette.steelDark);
      pole.position.set(-0.33, 0.34, 0);
      gantry.add(pole);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.45, 8), palette.steelDark);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(-0.12, 0.64, 0);
      gantry.add(arm);

      group.add(gantry);
    }
  }

  // Overhead 25kV contact wire
  const wireCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 140 }, (_, i) => {
      const p = trackCurve.getPointAt(i / 140);
      return new THREE.Vector3(p.x, p.y + 0.6, p.z);
    }),
    true
  );
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 180, 0.008, 6, true), palette.steelDark)
  );

  // 2. Smooth Rounded Stone Tunnel Arch Portal beside Maungawhau
  const tunnelGroup = new THREE.Group();
  tunnelGroup.position.set(-6.3, 0.12, 0.65);
  tunnelGroup.rotation.y = 0.08;

  // Smooth rounded grassy hillock over tunnel
  const hillockGeo = new THREE.SphereGeometry(0.82, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55);
  hillockGeo.scale(0.78, 1.08, 1.05);
  const hillock = new THREE.Mesh(hillockGeo, palette.grass);
  hillock.position.y = 0.1;
  hillock.castShadow = true;
  hillock.receiveShadow = true;
  tunnelGroup.add(hillock);

  // Smooth stone portal rings on both ends
  [0.64, -0.64].forEach((mz) => {
    const portalArch = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.1, 14, 28, Math.PI),
      palette.basaltRock
    );
    portalArch.position.set(0, 0.34, mz);
    portalArch.castShadow = true;
    tunnelGroup.add(portalArch);

    [-0.36, 0.36].forEach((px) => {
      const jamb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.11, 0.36, 12),
        palette.basaltRock
      );
      jamb.position.set(px, 0.18, mz);
      tunnelGroup.add(jamb);
    });
  });
  group.add(tunnelGroup);

  // 3. Smooth Rounded Britomart / Waitematā Station
  const station = new THREE.Group();
  station.position.set(0.6, 0.14, 3.88);

  const cpoBody = new THREE.Mesh(
    new RoundedBoxGeometry(2.4, 0.92, 0.86, 4, 0.045),
    palette.heritageBrick
  );
  cpoBody.position.y = 0.46;
  cpoBody.castShadow = true;
  cpoBody.receiveShadow = true;
  station.add(cpoBody);

  const cpoPlinth = new THREE.Mesh(
    new RoundedBoxGeometry(2.48, 0.14, 0.94, 3, 0.03),
    palette.sandstone
  );
  cpoPlinth.position.y = 0.07;
  station.add(cpoPlinth);

  const cpoTrim = new THREE.Mesh(
    new RoundedBoxGeometry(2.5, 0.12, 0.94, 3, 0.03),
    palette.sandstone
  );
  cpoTrim.position.y = 0.94;
  station.add(cpoTrim);

  const cpoRoof = new THREE.Mesh(
    new RoundedBoxGeometry(2.34, 0.18, 0.78, 3, 0.04),
    palette.slateRoof
  );
  cpoRoof.position.y = 1.07;
  station.add(cpoRoof);

  // Smooth cylindrical sandstone columns/pilasters framing windows
  for (let px = -1.14; px <= 1.14; px += 0.38) {
    const pilaster = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.048, 0.84, 14),
      palette.sandstone
    );
    pilaster.position.set(px, 0.5, 0.43);
    station.add(pilaster);
  }

  const pediment = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, 0.34, 0.9, 3, 0.035),
    palette.sandstone
  );
  pediment.position.y = 1.15;
  station.add(pediment);

  // Smooth copper dome cupola + finial
  const cupola = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x3b7a75, roughness: 0.38, metalness: 0.35 })
  );
  cupola.position.y = 1.32;
  station.add(cupola);

  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.2, 10), palette.steel);
  finial.position.y = 1.64;
  station.add(finial);

  // Arched warm station windows (rounded top arch!)
  for (let wx = -0.95; wx <= 0.95; wx += 0.38) {
    const win = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, 0.34, 0.9, 3, 0.03),
      palette.warmWindow
    );
    win.position.set(wx, 0.48, 0);
    station.add(win);

    const winArch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.9, 16),
      palette.warmWindow
    );
    winArch.rotation.x = Math.PI / 2;
    winArch.position.set(wx, 0.65, 0);
    station.add(winArch);
  }

  const signTex = createSignTexture('BRITOMART', '#0f3c6e', '#5eead4');
  const signMat = palette.registerEmissive(
    new THREE.MeshStandardMaterial({
      map: signTex,
      emissiveMap: signTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.35,
    }),
    0.35,
    1.4
  );
  const stationSign = new THREE.Mesh(
    new RoundedBoxGeometry(0.95, 0.22, 0.04, 2, 0.01),
    signMat
  );
  stationSign.position.set(0, 0.86, 0.47);
  station.add(stationSign);

  // Smooth high-segment glass-and-steel platform canopy
  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.48,
    roughness: 0.12,
    metalness: 0.15,
    clearcoat: 0.8,
  });
  const canopy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 2.75, 32, 1, true, 0, Math.PI),
    canopyMat
  );
  canopy.rotation.z = Math.PI / 2;
  canopy.rotation.x = -Math.PI / 2;
  canopy.position.set(0, 0.72, 0.88);
  station.add(canopy);

  [-1.25, -0.62, 0, 0.62, 1.25].forEach((ax) => {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.024, 12, 32, Math.PI), palette.steel);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(ax, 0.72, 0.88);
    station.add(arch);
  });

  const platform = new THREE.Mesh(
    new RoundedBoxGeometry(2.7, 0.14, 0.45, 3, 0.025),
    palette.concrete
  );
  platform.position.set(0, 0.07, 0.58);
  platform.receiveShadow = true;
  station.add(platform);

  [-0.75, 0.75].forEach((bx) => {
    const bench = new THREE.Mesh(
      new RoundedBoxGeometry(0.26, 0.04, 0.1, 2, 0.01),
      palette.woodBoardwalk
    );
    bench.position.set(bx, 0.17, 0.56);
    station.add(bench);
  });

  [
    [-0.45, 0x3b82f6],
    [-0.32, 0xf59e0b],
    [0.42, 0xef4444],
  ].forEach(([px, col]) => {
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.028, 0.14, 12),
      new THREE.MeshStandardMaterial({ color: col })
    );
    body.position.set(px, 0.21, 0.62);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xf1c27d })
    );
    head.position.set(px, 0.3, 0.62);
    station.add(body, head);
  });

  tagLandmark(
    station,
    'Britomart (Waitematā Station)',
    'Auckland’s central rail hub uniting the 1912 Edwardian Chief Post Office with a sleek glass-and-steel train canopy.'
  );
  group.add(station);

  // 4. Build the 3-Car AT Metro AM Class Consist (AMA + AMT + AMP)
  const leadCar = buildTrainCar({ isLead: true, palette });
  const midCar = buildTrainCar({ palette });
  const tailCar = buildTrainCar({ isTail: true, hasPantograph: true, palette });

  leadCar.name = 'TrainLeadCar';
  midCar.name = 'TrainMidCar';
  tailCar.name = 'TrainTailCar';

  group.add(leadCar, midCar, tailCar);

  const totalDuration = 28;
  const keyCount = 180;
  const times = [];
  const trackLength = trackCurve.getLength();
  const carSpacing = 1.13 / trackLength;
  const carOffsets = [
    { obj: leadCar, offset: carSpacing },
    { obj: midCar, offset: 0.0 },
    { obj: tailCar, offset: -carSpacing },
  ];

  const tracks = [];
  const lookMatrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const prevQuat = new THREE.Quaternion();

  for (let s = 0; s <= keyCount; s++) {
    const u = s / keyCount;
    times.push(u * totalDuration);
  }

  carOffsets.forEach(({ obj, offset }) => {
    const posValues = [];
    const quatValues = [];

    for (let s = 0; s <= keyCount; s++) {
      const u = s / keyCount;
      const baseT = sampleTrackWithDwell(u);
      const t = (baseT + offset + 1) % 1;

      const p = trackCurve.getPointAt(t);
      const tangent = trackCurve.getTangentAt(t).normalize();
      posValues.push(p.x, p.y + 0.04, p.z);

      lookMatrix.lookAt(p.clone().add(tangent), p, up);
      quat.setFromRotationMatrix(lookMatrix);
      if (s > 0 && prevQuat.dot(quat) < 0) {
        quat.set(-quat.x, -quat.y, -quat.z, -quat.w);
      }
      prevQuat.copy(quat);
      quatValues.push(quat.x, quat.y, quat.z, quat.w);
    }

    tracks.push(new THREE.VectorKeyframeTrack(`${obj.name}.position`, times, posValues));
    tracks.push(new THREE.QuaternionKeyframeTrack(`${obj.name}.quaternion`, times, quatValues));
  });

  const trainClip = new THREE.AnimationClip('ATMetroLoop', totalDuration, tracks);
  const mixer = new THREE.AnimationMixer(group);
  const action = mixer.clipAction(trainClip);
  action.play();

  return {
    group,
    mixer,
    action,
    leadCar,
    midCar,
    getTrainStatus() {
      const u = (action.time % totalDuration) / totalDuration;
      if (u >= 0.06 && u <= 0.16) {
        return 'Stopped at Britomart';
      }
      if (u > 0.72 && u < 0.88) {
        return 'Passing Maungawhau';
      }
      if (u > 0.2 && u < 0.55) {
        return 'Quay St Viaduct';
      }
      return 'In Transit';
    },
  };
}

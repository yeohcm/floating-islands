import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createSignTexture, tagLandmark } from '../materials.js';

function createAMSideTexture(hasCab, isTail, carLabel = 'AMA 103') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // Brushed stainless-steel metallic base with subtle top-to-bottom sheen
  const grad = ctx.createLinearGradient(0, 0, 0, 320);
  grad.addColorStop(0, '#eef2f7');
  grad.addColorStop(0.54, '#cfd8e3');
  grad.addColorStop(0.86, '#9fb0c3');
  grad.addColorStop(1, '#475569');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 320);

  // Fine stainless-steel horizontal body corrugation flutes
  for (let y = 188; y < 292; y += 9) {
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(0, y, 1024, 2);
    ctx.fillStyle = 'rgba(15,23,42,0.14)';
    ctx.fillRect(0, y + 2, 1024, 2);
  }

  // Lower skirt band & yellow jacking point markers
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 294, 1024, 26);
  ctx.fillStyle = '#facc15';
  [74, 938].forEach((jx) => ctx.fillRect(jx, 298, 12, 8));

  // AT Metro deep navy-blue upper window band
  ctx.fillStyle = '#0b2244';
  ctx.fillRect(0, 24, 1024, 138);

  // Signature crimson & crisp silver twin waist pin-stripes
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(0, 162, 1024, 6);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 168, 1024, 5);

  // Subtle vertical body panel bolster seams
  ctx.fillStyle = 'rgba(15,23,42,0.16)';
  [218, 366, 658, 806].forEach((sx) => ctx.fillRect(sx, 174, 2, 120));

  // Panoramic rounded-corner passenger windows with warm interior & seated silhouettes
  const drawWindow = (x, w) => {
    ctx.fillStyle = '#162032';
    ctx.beginPath();
    ctx.roundRect(x - 4, 40, w + 8, 104, 14);
    ctx.fill();

    const winGrad = ctx.createLinearGradient(x, 44, x, 140);
    winGrad.addColorStop(0, '#ffd89a');
    winGrad.addColorStop(1, '#fff1c9');
    ctx.fillStyle = winGrad;
    ctx.beginPath();
    ctx.roundRect(x, 44, w, 96, 11);
    ctx.fill();

    // Subtle navy seat backs & passenger silhouettes inside cabin
    ctx.fillStyle = 'rgba(15,34,68,0.34)';
    ctx.beginPath();
    ctx.roundRect(x + 12, 92, 24, 48, 8);
    ctx.roundRect(x + w - 36, 92, 24, 48, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 24, 82, 10, 0, Math.PI * 2);
    ctx.arc(x + w - 24, 82, 10, 0, Math.PI * 2);
    ctx.fill();

    // Hopper transom bar + diagonal glass sky reflection
    ctx.fillStyle = 'rgba(15,23,42,0.45)';
    ctx.fillRect(x, 68, w, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.moveTo(x + 10, 46);
    ctx.lineTo(x + 42, 46);
    ctx.lineTo(x + 18, 138);
    ctx.lineTo(x + 4, 138);
    ctx.closePath();
    ctx.fill();
  };

  // Two high-visibility safety-yellow twin sliding plug doors per side
  const doorPositions = [234, 682];
  doorPositions.forEach((dx) => {
    // Dark recessed door aperture frame
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(dx - 3, 24, 114, 270, 8);
    ctx.fill();

    ctx.fillStyle = '#ffd000';
    ctx.beginPath();
    ctx.roundRect(dx, 26, 108, 266, 6);
    ctx.fill();

    // Central vertical black rubber door seal
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(dx + 51, 26, 6, 266);

    // Twin door passenger windows
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(dx + 10, 44, 34, 96, 8);
    ctx.roundRect(dx + 64, 44, 34, 96, 8);
    ctx.fill();
    ctx.fillStyle = '#ffeab0';
    ctx.beginPath();
    ctx.roundRect(dx + 13, 47, 28, 90, 6);
    ctx.roundRect(dx + 67, 47, 28, 90, 6);
    ctx.fill();

    // Illuminated green door-release push buttons
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(dx + 42, 186, 5, 0, Math.PI * 2);
    ctx.arc(dx + 66, 186, 5, 0, Math.PI * 2);
    ctx.fill();

    // Lower stainless kick-plate & warning yellow sill
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(dx + 2, 274, 104, 10);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(dx + 2, 284, 104, 6);
  });

  drawWindow(62, 146);
  drawWindow(374, 134);
  drawWindow(518, 134);
  drawWindow(816, 138);

  // AT Metro circular emblem + car unit number on central stainless panel
  ctx.fillStyle = '#0b2244';
  ctx.beginPath();
  ctx.arc(432, 224, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('AT', 421, 230);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(carLabel, 464, 231);

  if (hasCab) {
    ctx.save();
    if (isTail) {
      ctx.translate(1024, 0);
      ctx.scale(-1, 1);
    }
    // Swept aerodynamic navy cab side wrap
    ctx.fillStyle = '#0b2244';
    ctx.beginPath();
    ctx.moveTo(940, 24);
    ctx.lineTo(1024, 24);
    ctx.lineTo(1024, 250);
    ctx.lineTo(892, 250);
    ctx.closePath();
    ctx.fill();

    // Cab driver side drop-window
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(958, 44);
    ctx.lineTo(1008, 44);
    ctx.lineTo(1008, 134);
    ctx.lineTo(936, 134);
    ctx.closePath();
    ctx.fill();

    // Angled high-visibility yellow cab nose skirt
    ctx.fillStyle = '#ffd000';
    ctx.beginPath();
    ctx.moveTo(912, 224);
    ctx.lineTo(1024, 184);
    ctx.lineTo(1024, 294);
    ctx.lineTo(862, 294);
    ctx.closePath();
    ctx.fill();

    // Crimson cab stripe accent
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.moveTo(886, 226);
    ctx.lineTo(1024, 178);
    ctx.lineTo(1024, 186);
    ctx.lineTo(886, 234);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function buildTrainCar({
  isLead = false,
  isTail = false,
  hasPantograph = false,
  carLabel = 'AMT 103',
  destinationText = 'BRITOMART',
  palette,
}) {
  const car = new THREE.Group();

  const navyMat = new THREE.MeshStandardMaterial({
    color: 0x0b2244,
    roughness: 0.24,
    metalness: 0.34,
  });
  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xd5dde6,
    roughness: 0.22,
    metalness: 0.74,
  });
  const yellowSafetyMat = new THREE.MeshStandardMaterial({
    color: 0xffd000,
    roughness: 0.26,
    metalness: 0.14,
  });
  const darkRoof = new THREE.MeshStandardMaterial({
    color: 0x262f3b,
    roughness: 0.52,
    metalness: 0.44,
  });
  const hvConduitMat = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.45,
  });

  const sideTex = createAMSideTexture(isLead || isTail, isTail, carLabel);
  const sideMat = palette.registerEmissive(
    new THREE.MeshStandardMaterial({
      map: sideTex,
      emissiveMap: sideTex,
      emissive: 0xffd885,
      emissiveIntensity: 0.14,
      roughness: 0.24,
      metalness: 0.48,
    }),
    0.14,
    0.78
  );

  const len = 1.04;
  const width = 0.36;
  const height = 0.33;

  // Underframe chassis + underfloor traction inverter / transformer / air brake boxes
  const chassis = new THREE.Mesh(
    new RoundedBoxGeometry(width * 0.9, 0.062, len * 0.94, 3, 0.018),
    darkRoof
  );
  chassis.position.y = 0.074;
  chassis.castShadow = true;
  car.add(chassis);

  [
    [-0.09, 0.042, 0.09, 0.16],
    [0.09, 0.046, 0.09, 0.16],
    [0.0, 0.04, 0.14, 0.11],
  ].forEach(([ux, uy, uw, ud], idx) => {
    const eq = new THREE.Mesh(
      new RoundedBoxGeometry(uw, uy, ud, 2, 0.008),
      palette.steelDark
    );
    eq.position.set(ux, 0.052, (idx - 1) * 0.11);
    car.add(eq);
  });

  // Two detailed powered/trailer bogies, each with 2 steel axles & 4 flanged cylindrical wheels
  const wheelGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.02, 16);
  const rimGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.022, 14);
  const axleGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.245, 10);
  const springGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.032, 10);

  [-0.32, 0.32].forEach((wz) => {
    const bogieFrame = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.8, 0.04, 0.22, 2, 0.012),
      palette.steelDark
    );
    bogieFrame.position.set(0, 0.042, wz);
    car.add(bogieFrame);

    [-0.135, 0.135].forEach((sx) => {
      const spring = new THREE.Mesh(springGeo, palette.steel);
      spring.position.set(sx, 0.048, wz);
      car.add(spring);
    });

    [-0.068, 0.068].forEach((axOff) => {
      const az = wz + axOff;
      const axle = new THREE.Mesh(axleGeo, palette.steelDark);
      axle.rotation.z = Math.PI / 2;
      axle.position.set(0, 0.032, az);
      car.add(axle);

      [-0.115, 0.115].forEach((wx) => {
        const wheel = new THREE.Mesh(wheelGeo, palette.steelDark);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.032, az);
        car.add(wheel);

        const rim = new THREE.Mesh(rimGeo, palette.steel);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(wx, 0.032, az);
        car.add(rim);
      });
    });
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
    new RoundedBoxGeometry(width, height - 0.04, len * 0.95, 4, 0.036),
    bodyMats
  );
  body.position.y = 0.235;
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  // Arched roof fairing, twin longitudinal roof ribs, 25 kV orange conduit, & dual HVAC pods
  const roof = new THREE.Mesh(
    new RoundedBoxGeometry(width * 0.86, 0.042, len * 0.91, 3, 0.018),
    darkRoof
  );
  roof.position.y = 0.39;
  car.add(roof);

  [-0.085, 0.085].forEach((rx) => {
    const rib = new THREE.Mesh(
      new RoundedBoxGeometry(0.018, 0.016, len * 0.86, 2, 0.004),
      palette.steelDark
    );
    rib.position.set(rx, 0.412, 0);
    car.add(rib);
  });

  const conduit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, len * 0.82, 8),
    hvConduitMat
  );
  conduit.rotation.x = Math.PI / 2;
  conduit.position.set(0.04, 0.414, 0);
  car.add(conduit);

  const hvacCenterZ = isLead ? -0.13 : isTail ? 0.13 : 0.0;
  [hvacCenterZ - 0.12, hvacCenterZ + 0.14].forEach((hz, idx) => {
    if ((isLead || isTail) && idx === 1) return;
    const hvac = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.6, 0.038, 0.22, 3, 0.014),
      palette.concrete
    );
    hvac.position.set(0, 0.422, hz);
    car.add(hvac);

    [-0.055, 0.055].forEach((fz) => {
      const fan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.042, 0.042, 14),
        darkRoof
      );
      fan.position.set(0, 0.424, hz + fz);
      car.add(fan);
    });
  });

  // Multi-ring Articulated Accordion Gangway Bellows + inter-car coupler bar
  const bellowMat = new THREE.MeshStandardMaterial({ color: 0x1e242c, roughness: 0.85 });
  const buildGangway = (gz) => {
    [-0.024, 0, 0.024].forEach((dz) => {
      const ring = new THREE.Mesh(
        new RoundedBoxGeometry(width * 0.74, 0.245, 0.02, 3, 0.008),
        bellowMat
      );
      ring.position.set(0, 0.225, gz + dz);
      car.add(ring);
    });
    const drawbar = new THREE.Mesh(
      new RoundedBoxGeometry(0.05, 0.03, 0.09, 2, 0.006),
      palette.steelDark
    );
    drawbar.position.set(0, 0.07, gz);
    car.add(drawbar);
  };
  if (!isLead) buildGangway(len * 0.50);
  if (!isTail) buildGangway(-len * 0.50);

  // Contoured Aerodynamic CAF AM Class Cab Front (AMA / AMP)
  if (isLead || isTail) {
    const dir = isLead ? 1 : -1;
    const cabGroup = new THREE.Group();
    cabGroup.position.set(0, 0.2, dir * (len * 0.465));
    if (isTail) cabGroup.rotation.y = Math.PI;

    // Obstacle deflector snowplow cowcatcher + Scharfenberg automatic coupler
    const plow = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.86, 0.05, 0.11, 3, 0.015),
      palette.steelDark
    );
    plow.position.set(0, -0.116, 0.05);
    cabGroup.add(plow);

    const coupler = new THREE.Mesh(
      new RoundedBoxGeometry(0.085, 0.04, 0.09, 2, 0.01),
      palette.steelDark
    );
    coupler.position.set(0, -0.105, 0.14);
    cabGroup.add(coupler);

    // Angled high-visibility yellow safety nose apron
    const yellowApron = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.96, 0.108, 0.17, 4, 0.034),
      yellowSafetyMat
    );
    yellowApron.position.set(0, -0.058, 0.068);
    yellowApron.rotation.x = 0.12;
    yellowApron.castShadow = true;
    cabGroup.add(yellowApron);

    // Swept navy cab mask surround + crimson pin-stripe lip
    const cabMask = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.94, 0.188, 0.16, 4, 0.04),
      navyMat
    );
    cabMask.position.set(0, 0.068, 0.042);
    cabMask.rotation.x = 0.3;
    cabMask.castShadow = true;
    cabGroup.add(cabMask);

    const crimsonLip = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.96, 0.016, 0.05, 2, 0.005),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.35 })
    );
    crimsonLip.position.set(0, -0.006, 0.132);
    cabGroup.add(crimsonLip);

    // Flush-mounted curved dark-glass windshield + twin wiper blades + warm cab console
    const windshield = new THREE.Mesh(
      new RoundedBoxGeometry(width * 0.8, 0.116, 0.04, 3, 0.015),
      new THREE.MeshStandardMaterial({ color: 0x09111e, roughness: 0.08, metalness: 0.88 })
    );
    windshield.position.set(0, 0.076, 0.106);
    windshield.rotation.x = 0.3;
    cabGroup.add(windshield);

    [-0.045, 0.055].forEach((wx) => {
      const wiper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.075, 6),
        palette.steelDark
      );
      wiper.position.set(wx, 0.062, 0.129);
      wiper.rotation.set(0.3, 0, -0.35);
      cabGroup.add(wiper);
    });

    // Side cab CCTV wing mirrors
    [-1, 1].forEach((sideSign) => {
      const mirror = new THREE.Mesh(
        new RoundedBoxGeometry(0.022, 0.052, 0.028, 2, 0.006),
        palette.steelDark
      );
      mirror.position.set(sideSign * (width * 0.52), 0.07, 0.05);
      cabGroup.add(mirror);
    });

    // Recessed headlight clusters (warm white LED on Lead, ruby red LED on Tail)
    const lampColor = isLead ? 0xfff8dc : 0xff2626;
    const lampMat = new THREE.MeshStandardMaterial({
      color: lampColor,
      emissive: lampColor,
      emissiveIntensity: isLead ? 2.8 : 2.0,
    });

    [-0.115, 0.115].forEach((lx) => {
      const housing = new THREE.Mesh(
        new RoundedBoxGeometry(0.062, 0.042, 0.028, 2, 0.008),
        palette.steelDark
      );
      housing.position.set(lx, -0.028, 0.142);
      cabGroup.add(housing);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 12), lampMat);
      lamp.position.set(lx, -0.028, 0.152);
      cabGroup.add(lamp);

      if (isLead) {
        const ditchLamp = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10), lampMat);
        ditchLamp.position.set(lx * 0.72, -0.072, 0.146);
        cabGroup.add(ditchLamp);
      }
    });

    // Illuminated amber destination board + top marker lamp
    const topLamp = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 10), lampMat);
    topLamp.position.set(0, 0.18, 0.06);
    cabGroup.add(topLamp);

    const destTex = createSignTexture(destinationText, '#090d16', '#f59e0b');
    const destBoard = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, 0.028, 0.02, 2, 0.006),
      palette.registerEmissive(
        new THREE.MeshStandardMaterial({
          map: destTex,
          emissiveMap: destTex,
          emissive: 0xf59e0b,
          emissiveIntensity: 1.5,
        }),
        1.5,
        2.0
      )
    );
    destBoard.position.set(0, 0.148, 0.088);
    destBoard.rotation.x = 0.28;
    cabGroup.add(destBoard);

    car.add(cabGroup);
  }

  // Detailed Brecknell Willis Z-frame Pantograph on AMP car
  if (hasPantograph) {
    const panto = new THREE.Group();
    panto.position.set(0, 0.41, 0.2);

    const insMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });
    [
      [-0.075, -0.04],
      [0.075, -0.04],
      [-0.075, 0.04],
      [0.075, 0.04],
    ].forEach(([ix, iz]) => {
      const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.013, 0.028, 10), insMat);
      ins.position.set(ix, 0.014, iz);
      panto.add(ins);
    });

    const baseFrame = new THREE.Mesh(
      new RoundedBoxGeometry(0.17, 0.014, 0.11, 2, 0.004),
      palette.steelDark
    );
    baseFrame.position.set(0, 0.03, 0);
    panto.add(baseFrame);

    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.115, 8), palette.steel);
    arm1.position.set(0, 0.055, -0.035);
    arm1.rotation.x = 0.72;
    panto.add(arm1);

    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.115, 8), palette.steel);
    arm2.position.set(0, 0.105, -0.02);
    arm2.rotation.x = -0.72;
    panto.add(arm2);

    const collector = new THREE.Mesh(
      new RoundedBoxGeometry(0.21, 0.014, 0.028, 2, 0.005),
      palette.steel
    );
    collector.position.set(0, 0.138, 0.018);
    panto.add(collector);
    car.add(panto);
  }

  tagLandmark(
    car,
    `AT Metro ${carLabel}`,
    'Auckland’s CAF-built 3-car stainless steel electric train with crimson-and-navy AM livery, flanged bogie wheels, and 25 kV AC pantograph.'
  );

  return car;
}

function findClosestT(curve, target, samples = 800) {
  let bestT = 0;
  let bestDistSq = Infinity;
  for (let i = 0; i < samples; i++) {
    const t = i / samples;
    const dSq = curve.getPointAt(t).distanceToSquared(target);
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestT = t;
    }
  }
  return bestT;
}

function sampleWrappedPoint(curve, rawT) {
  const t = ((rawT % 1) + 1) % 1;
  return {
    pt: curve.getPointAt(t),
    tangent: curve.getTangentAt(t).normalize(),
  };
}

function createOffsetCurve(
  curve,
  offsetDist,
  offsetY = 0,
  tStart = 0,
  tEnd = 1,
  closed = true,
  samples = 220,
  sagAmplitude = 0,
  sagCycles = 1
) {
  const pts = [];
  const up = new THREE.Vector3(0, 1, 0);
  const count = closed ? samples : samples + 1;
  for (let i = 0; i < count; i++) {
    const u = i / samples;
    const rawT = tStart + u * (tEnd - tStart);
    const { pt, tangent } = sampleWrappedPoint(curve, rawT);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const out = pt.clone().addScaledVector(right, offsetDist);
    const sag = sagAmplitude ? Math.abs(Math.sin(u * Math.PI * sagCycles)) * sagAmplitude : 0;
    out.y += offsetY - sag;
    pts.push(out);
  }
  return new THREE.CatmullRomCurve3(pts, closed);
}

// Sweeps a counter-clockwise 2D cross-section [pxAlongRight, pyAlongNormal] with true outward normals.
function createSweptSegmentGeometry(
  curve,
  tStart,
  tEnd,
  closed,
  profile,
  yOffset = 0,
  steps = 220,
  flipWinding = false
) {
  const pLen = profile.length;
  const positions = [];
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);

  for (let i = 0; i <= steps; i++) {
    const rawT = closed
      ? (i % steps) / steps
      : tStart + (i / steps) * (tEnd - tStart);
    const { pt, tangent } = sampleWrappedPoint(curve, rawT);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const normal = new THREE.Vector3().crossVectors(right, tangent).normalize();

    for (let j = 0; j < pLen; j++) {
      const [px, py] = profile[j];
      const v = pt
        .clone()
        .addScaledVector(right, px)
        .addScaledVector(normal, py + yOffset);
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
      if (flipWinding) {
        indices.push(a, b, d, b, c, d);
      } else {
        indices.push(a, d, b, d, c, b);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildRailSignal(group, curve, tPos, sideOffset, aspectColor, palette) {
  const { pt, tangent } = sampleWrappedPoint(curve, tPos);
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
  const pos = pt.clone().addScaledVector(right, sideOffset);

  const signal = new THREE.Group();
  signal.position.set(pos.x, pt.y, pos.z);
  const look = new THREE.Matrix4().lookAt(pos.clone().add(tangent), pos, up);
  signal.quaternion.setFromRotationMatrix(look);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.014, 0.42, 8),
    palette.steelDark
  );
  mast.position.y = 0.21;
  signal.add(mast);

  const head = new THREE.Mesh(
    new RoundedBoxGeometry(0.055, 0.11, 0.04, 2, 0.01),
    palette.steelDark
  );
  head.position.y = 0.42;
  signal.add(head);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.015, 8, 8),
    new THREE.MeshStandardMaterial({
      color: aspectColor,
      emissive: aspectColor,
      emissiveIntensity: 2.2,
    })
  );
  lamp.position.set(0, 0.44, 0.022);
  signal.add(lamp);

  group.add(signal);
}

function buildTrackInfrastructure(
  group,
  trackCurve,
  palette,
  {
    tStart = 0,
    tEnd = 1,
    closed = true,
    steps = 220,
    sleeperCount = 135,
    viaductSpan = null, // [vStart, vEnd]
    pierSpacingStep = 10,
    retainingWallSpan = null, // [wStart, wEnd]
    withCatenary = true,
    gantrySide = -0.34,
    wireSpan = null,
  } = {}
) {
  const ballastMat = new THREE.MeshStandardMaterial({
    color: 0x575f6b,
    roughness: 0.94,
    metalness: 0.04,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xdbe3ec,
    roughness: 0.26,
    metalness: 0.85,
  });

  // 1. Sloped crushed-basalt ballast bed (clockwise in [right, normal] -> true outward normals)
  const ballastProfile = [
    [-0.19, 0.0],
    [0.19, 0.0],
    [0.275, -0.095],
    [-0.275, -0.095],
  ];
  const ballastGeo = createSweptSegmentGeometry(
    trackCurve,
    tStart,
    tEnd,
    closed,
    ballastProfile,
    -0.012,
    steps
  );
  const ballastMesh = new THREE.Mesh(ballastGeo, ballastMat);
  ballastMesh.castShadow = true;
  ballastMesh.receiveShadow = true;
  group.add(ballastMesh);

  // 2. Concrete box-girder viaduct & hammerhead T-piers strictly along elevated span
  if (viaductSpan) {
    const [vStart, vEnd] = viaductSpan;
    const vSteps = Math.max(40, Math.round(steps * (vEnd - vStart)));
    const deckProfile = [
      [-0.31, -0.055],
      [0.31, -0.055],
      [0.24, -0.145],
      [-0.24, -0.145],
    ];
    const deckGeo = createSweptSegmentGeometry(
      trackCurve,
      vStart,
      vEnd,
      false,
      deckProfile,
      0.0,
      vSteps
    );
    const deckMesh = new THREE.Mesh(deckGeo, palette.concreteDark);
    deckMesh.castShadow = true;
    deckMesh.receiveShadow = true;
    group.add(deckMesh);

    // Slimmer safety edge kerbs + tubular handrails along elevated viaduct
    [-0.3, 0.3].forEach((sideX) => {
      const railBar = createOffsetCurve(trackCurve, sideX, 0.045, vStart, vEnd, false, vSteps);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(railBar, vSteps, 0.011, 6, false), palette.steel));
    });
  }

  // Optional sculpted basalt retaining wall along Maungawhau coastal reserve
  if (retainingWallSpan) {
    const [wStart, wEnd] = retainingWallSpan;
    const wSteps = 44;
    const wallProfile = [
      [-0.3, 0.07],
      [-0.22, 0.07],
      [-0.22, -0.09],
      [-0.3, -0.09],
    ];
    const wallMesh = new THREE.Mesh(
      createSweptSegmentGeometry(trackCurve, wStart, wEnd, false, wallProfile, 0.0, wSteps),
      palette.basaltRock
    );
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    group.add(wallMesh);
  }

  // 3. Twin Metallic Running Rails at gauge ±0.115
  const railCurveLeft = createOffsetCurve(trackCurve, -0.115, 0.022, tStart, tEnd, closed, steps);
  const railCurveRight = createOffsetCurve(trackCurve, 0.115, 0.022, tStart, tEnd, closed, steps);
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(railCurveLeft, steps, 0.014, 8, closed), railMat),
    new THREE.Mesh(new THREE.TubeGeometry(railCurveRight, steps, 0.014, 8, closed), railMat)
  );

  // 4. Timber/Concrete Sleepers + Viaduct Hammerhead Piers
  const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x62584f, roughness: 0.88 });
  const sleeperGeo = new RoundedBoxGeometry(0.32, 0.024, 0.064, 2, 0.006);
  const pillarGeo = new THREE.CylinderGeometry(0.085, 0.115, 1, 8);
  const plinthGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.08, 12);
  const crossheadGeo = new RoundedBoxGeometry(0.56, 0.09, 0.18, 2, 0.02);

  const up = new THREE.Vector3(0, 1, 0);
  const dummyQuat = new THREE.Quaternion();
  const dummyMat = new THREE.Matrix4();

  for (let i = 0; i <= sleeperCount; i++) {
    if (closed && i === sleeperCount) break;
    const rawT = tStart + (i / sleeperCount) * (tEnd - tStart);
    const { pt, tangent } = sampleWrappedPoint(trackCurve, rawT);

    dummyMat.lookAt(pt, pt.clone().add(tangent), up);
    dummyQuat.setFromRotationMatrix(dummyMat);

    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.set(pt.x, pt.y + 0.002, pt.z);
    sleeper.quaternion.copy(dummyQuat);
    group.add(sleeper);

    if (viaductSpan && rawT >= viaductSpan[0] + 0.02 && rawT <= viaductSpan[1] - 0.02 && pt.y > 0.42 && i % pierSpacingStep === 0) {
      const deckBottomY = pt.y - 0.14;
      const groundTopY = 0.12;
      const h = Math.max(0.2, deckBottomY - groundTopY);

      const pierGroup = new THREE.Group();
      pierGroup.position.set(pt.x, 0, pt.z);
      pierGroup.quaternion.copy(dummyQuat);

      const col = new THREE.Mesh(pillarGeo, palette.concrete);
      col.scale.set(1, h, 1);
      col.position.y = groundTopY + h * 0.5;
      col.castShadow = true;
      col.receiveShadow = true;
      pierGroup.add(col);

      const plinth = new THREE.Mesh(plinthGeo, palette.concreteDark);
      plinth.position.y = groundTopY + 0.04;
      pierGroup.add(plinth);

      const crosshead = new THREE.Mesh(crossheadGeo, palette.concrete);
      crosshead.position.y = deckBottomY - 0.035;
      crosshead.castShadow = true;
      pierGroup.add(crosshead);

      group.add(pierGroup);
    }
  }

  // 5. Overhead 25 kV Catenary Masts & Dual Contact/Messenger Wires (strictly above ground!)
  if (withCatenary) {
    const [wStart, wEnd] = wireSpan || [tStart, tEnd];
    const wClosed = wireSpan ? false : closed;
    const mastCount = wClosed ? 12 : 8;

    for (let m = 0; m <= mastCount; m++) {
      if (wClosed && m === mastCount) break;
      const u = m / mastCount;
      if (!wClosed && (u < 0.03 || u > 0.97)) continue;
      const rawT = wStart + u * (wEnd - wStart);
      const { pt, tangent } = sampleWrappedPoint(trackCurve, rawT);

      dummyMat.lookAt(pt, pt.clone().add(tangent), up);
      dummyQuat.setFromRotationMatrix(dummyMat);

      const gantry = new THREE.Group();
      gantry.position.copy(pt);
      gantry.quaternion.copy(dummyQuat);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.019, 0.68, 8),
        palette.steelDark
      );
      pole.position.set(gantrySide, 0.31, 0);
      gantry.add(pole);

      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.011, Math.abs(gantrySide) * 1.15, 6),
        palette.steelDark
      );
      arm.rotation.z = Math.PI / 2;
      arm.position.set(gantrySide * 0.45, 0.57, 0);
      gantry.add(arm);

      const stay = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, Math.abs(gantrySide) * 1.1, 6),
        palette.steel
      );
      stay.rotation.z = gantrySide > 0 ? 0.52 : -0.52;
      stay.position.set(gantrySide * 0.52, 0.61, 0);
      gantry.add(stay);

      group.add(gantry);
    }

    const wSteps = Math.max(80, Math.round(steps * 0.75));
    const contactWire = createOffsetCurve(trackCurve, 0, 0.548, wStart, wEnd, wClosed, wSteps);
    const messengerWire = createOffsetCurve(
      trackCurve,
      0,
      0.625,
      wStart,
      wEnd,
      wClosed,
      wSteps,
      0.025,
      mastCount
    );
    group.add(
      new THREE.Mesh(new THREE.TubeGeometry(contactWire, wSteps, 0.006, 6, wClosed), palette.steel),
      new THREE.Mesh(new THREE.TubeGeometry(messengerWire, wSteps, 0.0045, 6, wClosed), palette.steelDark)
    );
  }
}

// Builds a complete open-archway cut-and-cover CRL portal, dark interior tunnel bore,
// approach retaining wing-walls, and landscaped green embankment hiding the dive underground.
function buildCRLPortalTunnel(group, curve, tMouth, tDeep, isEntry, palette) {
  const { pt: mouthPt, tangent: mouthTangent } = sampleWrappedPoint(curve, tMouth);
  const up = new THREE.Vector3(0, 1, 0);
  const outwardDir = mouthTangent.clone().multiplyScalar(isEntry ? -1 : 1).normalize();

  // 1. Open Horseshoe Arch Portal Headwall & Wing Walls at tMouth
  const portal = new THREE.Group();
  portal.position.set(mouthPt.x, 0.0, mouthPt.z);
  const mat = new THREE.Matrix4().lookAt(mouthPt.clone().add(outwardDir), mouthPt, up);
  portal.quaternion.setFromRotationMatrix(mat);

  // Side concrete portal piers framing the open doorway (x = ±0.35, clear of 0.36 train!)
  [-0.35, 0.35].forEach((px) => {
    const pier = new THREE.Mesh(
      new RoundedBoxGeometry(0.14, 0.82, 0.24, 3, 0.02),
      palette.concrete
    );
    pier.position.set(px, 0.52, 0);
    pier.castShadow = true;
    pier.receiveShadow = true;
    portal.add(pier);
  });

  // Upper lintel beam strictly above the open arch crown (y = 0.85..1.04)
  const lintel = new THREE.Mesh(
    new RoundedBoxGeometry(0.86, 0.19, 0.26, 3, 0.025),
    palette.concrete
  );
  lintel.position.set(0, 0.94, 0);
  lintel.castShadow = true;
  portal.add(lintel);

  // Concrete horseshoe arch collar around open tunnel doorway (inner crown y = 0.54 + 0.315 = 0.855)
  const archRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.065, 14, 28, Math.PI),
    palette.concreteDark
  );
  archRing.position.set(0, 0.54, 0.11);
  portal.add(archRing);

  // Illuminated CRL sign plaque + green tunnel entry signal
  const signTex = createSignTexture('CRL • CITY RAIL', '#0f172a', '#2dd4bf');
  const crlSign = new THREE.Mesh(
    new RoundedBoxGeometry(0.54, 0.11, 0.03, 2, 0.008),
    palette.registerEmissive(
      new THREE.MeshStandardMaterial({
        map: signTex,
        emissiveMap: signTex,
        emissive: 0xffffff,
        emissiveIntensity: 0.4,
      }),
      0.4,
      1.5
    )
  );
  crlSign.position.set(0, 0.95, 0.13);
  portal.add(crlSign);

  const signalLamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2.2,
    })
  );
  signalLamp.position.set(-0.35, 0.72, 0.125);
  portal.add(signalLamp);

  group.add(portal);

  // 2. Tapered Approach Retaining Wing-Walls outside tMouth
  const approachDt = 0.045;
  const aStart = isEntry ? tMouth - approachDt : tMouth;
  const aEnd = isEntry ? tMouth : tMouth + approachDt;
  const aSteps = 22;

  const buildWingWallSweep = (sideSign) => {
    const positions = [];
    const indices = [];
    for (let i = 0; i <= aSteps; i++) {
      const s = i / aSteps;
      // taperProgress = 0 at open tip, 1 at portal mouth
      const taper = isEntry ? s : 1 - s;
      const rawT = aStart + s * (aEnd - aStart);
      const { pt, tangent } = sampleWrappedPoint(curve, rawT);
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const topY = 0.28 + taper * 0.62;
      const botY = 0.115;
      const innerX = sideSign * 0.29;
      const outerX = sideSign * (0.39 + taper * 0.05);

      const ringPts =
        sideSign > 0
          ? [
              [innerX, topY],
              [outerX, topY],
              [outerX, botY],
              [innerX, botY],
            ]
          : [
              [outerX, topY],
              [innerX, topY],
              [innerX, botY],
              [outerX, botY],
            ];
      ringPts.forEach(([rx, ry]) => {
        const v = pt.clone().addScaledVector(right, rx);
        v.y = ry;
        positions.push(v.x, v.y, v.z);
      });
    }
    for (let i = 0; i < aSteps; i++) {
      const rA = i * 4;
      const rB = (i + 1) * 4;
      for (let j = 0; j < 4; j++) {
        const jN = (j + 1) % 4;
        indices.push(rA + j, rA + jN, rB + j, rA + jN, rB + jN, rB + j);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, palette.concrete);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  };
  buildWingWallSweep(-1);
  buildWingWallSweep(1);

  // 3. Dark Open Tunnel Bore Liner from tMouth -> tDeep + Exterior Landscaped Cut-and-Cover Berm
  const tMin = Math.min(tMouth, tDeep);
  const tMax = Math.max(tMouth, tDeep);
  const boreSteps = 44;

  // Inner pitch-black U-arch bore liner (follow track Y smoothly downward)
  const boreProfile = [
    [-0.31, -0.02],
    [-0.31, 0.34],
    [-0.21, 0.56],
    [0.0, 0.62],
    [0.21, 0.56],
    [0.31, 0.34],
    [0.31, -0.02],
  ];
  const boreMat = new THREE.MeshStandardMaterial({
    color: 0x060a12,
    roughness: 0.96,
    side: THREE.DoubleSide,
  });
  const boreMesh = new THREE.Mesh(
    createSweptSegmentGeometry(curve, tMin, tMax, false, boreProfile, 0, boreSteps, true),
    boreMat
  );
  group.add(boreMesh);

  // Warm recessed LED strip markers inside tunnel bore walls
  const stripMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.6,
  });
  [0.2, 0.5].forEach((uInside) => {
    const rawT = tMouth + uInside * (tDeep - tMouth);
    const { pt, tangent } = sampleWrappedPoint(curve, rawT);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const q = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(pt.clone().add(tangent), pt, up)
    );
    [-0.28, 0.28].forEach((lx) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, 0.14), stripMat);
      strip.position.copy(pt).addScaledVector(right, lx);
      strip.position.y += 0.26;
      strip.quaternion.copy(q);
      group.add(strip);
    });
  });

  // Solid dark deep bulkhead cap well below island deck at tDeep
  const { pt: deepPt, tangent: deepTan } = sampleWrappedPoint(curve, tDeep);
  const bulkhead = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.08), boreMat);
  bulkhead.position.set(deepPt.x, deepPt.y + 0.28, deepPt.z);
  bulkhead.quaternion.setFromRotationMatrix(
    new THREE.Matrix4().lookAt(deepPt.clone().add(deepTan), deepPt, up)
  );
  group.add(bulkhead);

  // Exterior Concrete Tunnel Roof & Landscaped Green Mound covering the descent [tMouth..tDeep]
  const bermPos = [];
  const bermIdx = [];
  const shellPos = [];
  const shellIdx = [];

  for (let i = 0; i <= boreSteps; i++) {
    const s = i / boreSteps;
    const rawT = tMin + s * (tMax - tMin);
    // distFromMouth = 0 at tMouth, 1 at tDeep
    const distFromMouth = isEntry ? s : 1 - s;
    const { pt, tangent } = sampleWrappedPoint(curve, rawT);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();

    const baseGroundY = 0.115;
    const topHeight = 0.94 - Math.pow(distFromMouth, 0.85) * 0.72; // tapers cleanly to 0.22 at tDeep
    const hw = 0.44 + Math.sin(distFromMouth * Math.PI) * 0.1;

    // Landscaped curved green mound over tunnel concrete hood (px strictly increasing L->R!)
    const bermRing = [
      [-hw * 1.24, baseGroundY],
      [-hw * 0.82, topHeight + 0.015],
      [0, topHeight + 0.075],
      [hw * 0.82, topHeight + 0.015],
      [hw * 1.24, baseGroundY],
    ];
    bermRing.forEach(([rx, ry]) => {
      const v = pt.clone().addScaledVector(right, rx);
      v.y = ry;
      bermPos.push(v.x, v.y, v.z);
    });

    // Concrete cut-and-cover roof slab edge (clockwise: [-X,bot]->[-X,top]->[+X,top]->[+X,bot])
    const shellRing = [
      [-hw * 0.9, baseGroundY],
      [-hw * 0.9, topHeight - 0.03],
      [hw * 0.9, topHeight - 0.03],
      [hw * 0.9, baseGroundY],
    ];
    shellRing.forEach(([rx, ry]) => {
      const v = pt.clone().addScaledVector(right, rx);
      v.y = ry;
      shellPos.push(v.x, v.y, v.z);
    });
  }

  for (let i = 0; i < boreSteps; i++) {
    const bA = i * 5;
    const bB = (i + 1) * 5;
    for (let j = 0; j < 4; j++) {
      bermIdx.push(bA + j, bA + j + 1, bB + j, bA + j + 1, bB + j + 1, bB + j);
    }
    const sA = i * 4;
    const sB = (i + 1) * 4;
    for (let j = 0; j < 4; j++) {
      const jN = (j + 1) % 4;
      shellIdx.push(sA + j, sA + jN, sB + j, sA + jN, sB + jN, sB + j);
    }
  }

  const bermGeo = new THREE.BufferGeometry();
  bermGeo.setAttribute('position', new THREE.Float32BufferAttribute(bermPos, 3));
  bermGeo.setIndex(bermIdx);
  bermGeo.computeVertexNormals();
  const bermMesh = new THREE.Mesh(bermGeo, palette.grass);
  bermMesh.castShadow = true;
  bermMesh.receiveShadow = true;
  group.add(bermMesh);

  const shellGeo = new THREE.BufferGeometry();
  shellGeo.setAttribute('position', new THREE.Float32BufferAttribute(shellPos, 3));
  shellGeo.setIndex(shellIdx);
  shellGeo.computeVertexNormals();
  const shellMesh = new THREE.Mesh(shellGeo, palette.concreteDark);
  shellMesh.castShadow = true;
  shellMesh.receiveShadow = true;
  group.add(shellMesh);
}

function sampleTrackWithDwell(u, dwellStart, dwellEnd, stationT) {
  if (u < dwellStart) {
    return (u / dwellStart) * stationT;
  }
  if (u <= dwellEnd) {
    return stationT;
  }
  const rem = (u - dwellEnd) / (1 - dwellEnd);
  return (stationT + rem * (1 - stationT)) % 1;
}

function buildTrainClip(name, cars, trackCurve, duration, dwell, { hideDeepUnderground = false } = {}) {
  const keyCount = 240;
  const times = [];
  const trackLength = trackCurve.getLength();
  const carSpacing = 1.13 / trackLength;
  const bogieDt = 0.32 / trackLength;
  const carOffsets = [
    { obj: cars[0], offset: carSpacing },
    { obj: cars[1], offset: 0.0 },
    { obj: cars[2], offset: -carSpacing },
  ];

  const tracks = [];
  const up = new THREE.Vector3(0, 1, 0);
  const lookMatrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const prevQuat = new THREE.Quaternion();

  for (let s = 0; s <= keyCount; s++) {
    times.push((s / keyCount) * duration);
  }

  carOffsets.forEach(({ obj, offset }) => {
    const posValues = [];
    const quatValues = [];
    const scaleValues = [];

    for (let s = 0; s <= keyCount; s++) {
      const u = s / keyCount;
      const baseT = sampleTrackWithDwell(u, dwell.start, dwell.end, dwell.stationT);
      const centerT = (baseT + offset + 1) % 1;

      const tFront = (centerT + bogieDt + 1) % 1;
      const tRear = (centerT - bogieDt + 1) % 1;
      const pFront = trackCurve.getPointAt(tFront);
      const pRear = trackCurve.getPointAt(tRear);
      const mid = new THREE.Vector3().addVectors(pFront, pRear).multiplyScalar(0.5);
      const tangent = new THREE.Vector3().subVectors(pFront, pRear).normalize();

      posValues.push(mid.x, mid.y + 0.036, mid.z);

      lookMatrix.lookAt(mid.clone().add(tangent), mid, up);
      quat.setFromRotationMatrix(lookMatrix);
      if (s > 0 && prevQuat.dot(quat) < 0) {
        quat.set(-quat.x, -quat.y, -quat.z, -quat.w);
      }
      prevQuat.copy(quat);
      quatValues.push(quat.x, quat.y, quat.z, quat.w);

      if (hideDeepUnderground) {
        const sc = mid.y < -0.5 ? 0.0001 : mid.y < -0.36 ? THREE.MathUtils.smoothstep(mid.y, -0.5, -0.36) : 1.0;
        const clamped = Math.max(0.0001, sc);
        scaleValues.push(clamped, clamped, clamped);
      }
    }

    tracks.push(new THREE.VectorKeyframeTrack(`${obj.name}.position`, times, posValues));
    tracks.push(new THREE.QuaternionKeyframeTrack(`${obj.name}.quaternion`, times, quatValues));
    if (hideDeepUnderground) {
      tracks.push(new THREE.VectorKeyframeTrack(`${obj.name}.scale`, times, scaleValues));
    }
  });

  return new THREE.AnimationClip(name, duration, tracks);
}

export function createBritomartAndTrain(palette) {
  const group = new THREE.Group();

  // Track 1: Outer Coastal & Elevated Quay Viaduct Loop (Counter-Clockwise)
  const controlPoints = [
    new THREE.Vector3(-2.35, 0.24, 5.42), // 0: West approach to Britomart Platform 2
    new THREE.Vector3(0.5, 0.24, 5.42),   // 1: Britomart Platform 2 (straight alongside central island platform)
    new THREE.Vector3(2.35, 0.3, 4.95),   // 2: Southeast departure curve
    new THREE.Vector3(2.72, 0.72, 2.75),  // 3: Ascending waterfront viaduct ramp
    new THREE.Vector3(2.72, 1.12, -0.1),  // 4: Elevated Quay St Viaduct past Ferry Bldg
    new THREE.Vector3(2.68, 1.12, -3.45), // 5: Elevated viaduct past Marina
    new THREE.Vector3(2.05, 1.12, -6.35), // 6: Northeast harbour bend
    new THREE.Vector3(-0.85, 1.12, -7.25),// 7: North viaduct overlooking Upper Queen St & Harbour Bridge
    new THREE.Vector3(-4.35, 1.0, -6.55), // 8: Northwest curve past West CBD Tower
    new THREE.Vector3(-6.35, 0.62, -3.55),// 9: Descending western viaduct ramp
    new THREE.Vector3(-6.58, 0.26, 0.45), // 10: West coastal reserve (strictly clear of Maungawhau!)
    new THREE.Vector3(-6.42, 0.24, 3.15), // 11: Southwest curve outside Maungawhau Park
    new THREE.Vector3(-4.75, 0.24, 4.95), // 12: Southwest approach toward Britomart
  ];
  const trackCurve = new THREE.CatmullRomCurve3(controlPoints, true, 'centripetal', 0.5);

  const t1Station = findClosestT(trackCurve, controlPoints[1]);
  const t1ViaductStart = findClosestT(trackCurve, new THREE.Vector3(2.25, 0.29, 5.02));
  const t1ViaductEnd = findClosestT(trackCurve, new THREE.Vector3(-6.48, 0.34, -0.45));
  const t1WallStart = findClosestT(trackCurve, controlPoints[10]);
  const t1WallEnd = findClosestT(trackCurve, controlPoints[11]);

  buildTrackInfrastructure(group, trackCurve, palette, {
    tStart: 0,
    tEnd: 1,
    closed: true,
    steps: 260,
    sleeperCount: 150,
    viaductSpan: [t1ViaductStart, t1ViaductEnd],
    pierSpacingStep: 10,
    retainingWallSpan: [t1WallStart, t1WallEnd],
    withCatenary: true,
    gantrySide: -0.34,
  });

  // Track 2: Inner CRL Underground & Surface Waterfront Loop (Clockwise — strictly nested inside Track 1)
  const crlPoints = [
    new THREE.Vector3(1.72, 0.24, 4.55),  // 0: Southeast curve into Britomart Platform 1
    new THREE.Vector3(0.5, 0.24, 4.66),   // 1: Britomart Platform 1 (parallel to Track 1 at z=5.42!)
    new THREE.Vector3(-1.3, 0.24, 4.66),  // 2: West departure from Britomart (level on surface)
    new THREE.Vector3(-2.05, 0.24, 4.6),  // 3: West CRL Portal Mouth (y=0.24 above deck)
    new THREE.Vector3(-2.4, 0.08, 4.5),   // 4: Dive inside West Portal concrete hood
    new THREE.Vector3(-3.35, -0.78, 4.18),// 5: West CRL Portal Deep End (well below ground)
    new THREE.Vector3(-3.45, -0.94, 1.45),// 6: Deep underground beside Maungawhau
    new THREE.Vector3(-2.85, -0.94, -2.15),// 7: Deep underground beneath Sky Tower
    new THREE.Vector3(-1.35, -0.9, -4.95),// 8: Deep underground curving northeast
    new THREE.Vector3(0.25, -0.78, -5.85),// 9: North CRL Portal Deep End
    new THREE.Vector3(1.18, 0.08, -5.62), // 10: Climb inside North Portal concrete hood
    new THREE.Vector3(1.52, 0.24, -5.45), // 11: North CRL Portal Mouth
    new THREE.Vector3(2.04, 0.24, -3.55), // 12: Surface Waterfront Corridor
    new THREE.Vector3(2.04, 0.24, -0.35), // 13: Surface Waterfront Corridor
    new THREE.Vector3(2.04, 0.24, 2.75),  // 14: Surface Waterfront Corridor inside Track 1 viaduct
  ];
  const trackCurve2 = new THREE.CatmullRomCurve3(crlPoints, true, 'centripetal', 0.5);

  const t2Station = findClosestT(trackCurve2, crlPoints[1]);
  const t2WestMouth = findClosestT(trackCurve2, crlPoints[3]);
  const t2WestDeep = findClosestT(trackCurve2, crlPoints[5]);
  const t2NorthDeep = findClosestT(trackCurve2, crlPoints[9]);
  const t2NorthMouth = findClosestT(trackCurve2, crlPoints[11]);

  // Surface rails & ballast extend 0.025 inside both open mouths; overhead wires stop right at the portal headwalls
  buildTrackInfrastructure(group, trackCurve2, palette, {
    tStart: t2NorthMouth - 0.025,
    tEnd: 1 + t2WestMouth + 0.025,
    closed: false,
    steps: 170,
    sleeperCount: 84,
    withCatenary: true,
    gantrySide: 0.34,
    wireSpan: [t2NorthMouth, 1 + t2WestMouth],
  });

  // Cut-and-cover open archway CRL portals & landscaped berms
  buildCRLPortalTunnel(group, trackCurve2, t2WestMouth, t2WestDeep, true, palette);
  buildCRLPortalTunnel(group, trackCurve2, t2NorthMouth, t2NorthDeep, false, palette);

  // Trackside green/amber departure signals
  buildRailSignal(group, trackCurve, t1Station + 0.05, -0.34, 0x10b981, palette);
  buildRailSignal(group, trackCurve2, t2WestMouth - 0.035, 0.34, 0xf59e0b, palette);

  // 3. Britomart / Waitematā Twin-Platform Station & Central Glass Canopy
  const station = new THREE.Group();
  station.position.set(0.5, 0.12, 3.74);

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

  const cupola = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x3b7a75, roughness: 0.38, metalness: 0.35 })
  );
  cupola.position.y = 1.32;
  station.add(cupola);

  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.2, 10), palette.steel);
  finial.position.y = 1.64;
  station.add(finial);

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

  // Glass-and-steel vaulted train shed spanning BOTH Track 2 (local z=0.92), Central Island Platform (local z=1.30), & Track 1 (local z=1.68)
  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.46,
    roughness: 0.12,
    metalness: 0.15,
    clearcoat: 0.8,
  });
  const canopy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.94, 0.94, 2.75, 32, 1, true, 0, Math.PI),
    canopyMat
  );
  canopy.rotation.z = Math.PI / 2;
  canopy.rotation.x = -Math.PI / 2;
  canopy.position.set(0, 0.72, 1.3);
  station.add(canopy);

  [-1.25, -0.62, 0, 0.62, 1.25].forEach((ax) => {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.024, 12, 32, Math.PI), palette.steel);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(ax, 0.72, 1.3);
    station.add(arch);
  });

  // North side CPO concourse platform + Central island platform between Track 1 & Track 2
  const yellowTactileMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.65 });

  const northPlatform = new THREE.Mesh(
    new RoundedBoxGeometry(2.6, 0.14, 0.24, 3, 0.02),
    palette.concrete
  );
  northPlatform.position.set(0, 0.08, 0.56);
  northPlatform.receiveShadow = true;
  station.add(northPlatform);

  const islandPlatform = new THREE.Mesh(
    new RoundedBoxGeometry(2.7, 0.14, 0.3, 3, 0.02),
    palette.concrete
  );
  islandPlatform.position.set(0, 0.08, 1.3);
  islandPlatform.receiveShadow = true;
  station.add(islandPlatform);

  [-0.13, 0.13].forEach((tz) => {
    const tactile = new THREE.Mesh(new THREE.BoxGeometry(2.64, 0.008, 0.022), yellowTactileMat);
    tactile.position.set(0, 0.152, 1.3 + tz);
    station.add(tactile);
  });

  [-0.75, 0.75].forEach((bx) => {
    const bench = new THREE.Mesh(
      new RoundedBoxGeometry(0.26, 0.04, 0.1, 2, 0.01),
      palette.woodBoardwalk
    );
    bench.position.set(bx, 0.17, 1.3);
    station.add(bench);
  });

  [
    [-0.45, 0x3b82f6, 1.32],
    [-0.25, 0xf59e0b, 1.26],
    [0.42, 0xef4444, 1.34],
    [0.12, 0x10b981, 0.58],
  ].forEach(([px, col, pz]) => {
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.026, 0.14, 12),
      new THREE.MeshStandardMaterial({ color: col })
    );
    body.position.set(px, 0.22, pz);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xf1c27d })
    );
    head.position.set(px, 0.31, pz);
    station.add(body, head);
  });

  tagLandmark(
    station,
    'Britomart (Waitematā Station)',
    'Auckland’s central rail hub uniting the 1912 Edwardian Chief Post Office with twin through-tracks and a glass-and-steel vaulted canopy.'
  );
  group.add(station);

  // 4. Build Two High-Detail 3-Car AT Metro AM Class Consists (AMA + AMT + AMP)
  const leadCar = buildTrainCar({
    isLead: true,
    carLabel: 'AMA 103',
    destinationText: 'BRITOMART',
    palette,
  });
  const midCar = buildTrainCar({ carLabel: 'AMT 103', palette });
  const tailCar = buildTrainCar({
    isTail: true,
    hasPantograph: true,
    carLabel: 'AMP 103',
    destinationText: 'ONEHUNGA',
    palette,
  });
  leadCar.name = 'TrainLeadCar';
  midCar.name = 'TrainMidCar';
  tailCar.name = 'TrainTailCar';

  const leadCar2 = buildTrainCar({
    isLead: true,
    carLabel: 'AMA 218',
    destinationText: 'CRL CITY',
    palette,
  });
  const midCar2 = buildTrainCar({ carLabel: 'AMT 218', palette });
  const tailCar2 = buildTrainCar({
    isTail: true,
    hasPantograph: true,
    carLabel: 'AMP 218',
    destinationText: 'MAUNGAWHAU',
    palette,
  });
  leadCar2.name = 'Train2LeadCar';
  midCar2.name = 'Train2MidCar';
  tailCar2.name = 'Train2TailCar';

  group.add(leadCar, midCar, tailCar, leadCar2, midCar2, tailCar2);

  const totalDuration = 28;
  const crlDuration = 24;

  const trainClip1 = buildTrainClip(
    'ATMetroLoop',
    [leadCar, midCar, tailCar],
    trackCurve,
    totalDuration,
    { start: t1Station, end: t1Station + 0.08, stationT: t1Station }
  );

  const trainClip2 = buildTrainClip(
    'ATMetroCRLLoop',
    [leadCar2, midCar2, tailCar2],
    trackCurve2,
    crlDuration,
    { start: t2Station, end: t2Station + 0.08, stationT: t2Station },
    { hideDeepUnderground: true }
  );

  const mixer = new THREE.AnimationMixer(group);
  const action1 = mixer.clipAction(trainClip1);
  const action2 = mixer.clipAction(trainClip2);
  action1.play();
  action2.play();
  action2.time = 11;

  return {
    group,
    mixer,
    action: action1,
    action2,
    leadCar,
    midCar,
    leadCar2,
    midCar2,
    getTrainStatus() {
      const u = (action1.time % totalDuration) / totalDuration;
      if (u >= t1Station && u <= t1Station + 0.08) {
        return 'Stopped at Britomart (Opposite CRL Train Active)';
      }
      if (u > 0.74 && u < 0.9) {
        return 'Passing Maungawhau Coast (CRL Running)';
      }
      if (u > 0.18 && u < 0.52) {
        return 'Quay St Viaduct (Opposite CRL Train Active)';
      }
      return '2 Trains Operating (Surface & CRL Underground)';
    },
  };
}

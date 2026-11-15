import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { tagLandmark } from '../materials.js';

export function createSkyTower(palette) {
  const group = new THREE.Group();
  group.position.set(-1.95, 0.12, -1.75);

  // Smooth rounded SkyCity plaza podium & circular glass atrium rotunda
  const podium1 = new THREE.Mesh(
    new RoundedBoxGeometry(2.05, 0.3, 2.05, 5, 0.12),
    palette.concreteDark
  );
  podium1.position.y = 0.15;
  podium1.castShadow = true;
  podium1.receiveShadow = true;
  group.add(podium1);

  const atriumGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 0.92, 0.24, 36),
    palette.warmWindow
  );
  atriumGlass.position.y = 0.36;
  group.add(atriumGlass);

  const podium2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.9, 0.32, 36),
    palette.concrete
  );
  podium2.position.y = 0.56;
  podium2.castShadow = true;
  podium2.receiveShadow = true;
  group.add(podium2);

  // 8 smooth tapered structural buttresses flaring out at the base
  const legCount = 8;
  for (let i = 0; i < legCount; i++) {
    const angle = (i / legCount) * Math.PI * 2;
    const leg = new THREE.Mesh(
      new RoundedBoxGeometry(0.11, 1.48, 0.24, 3, 0.03),
      palette.concrete
    );
    leg.position.set(Math.cos(angle) * 0.44, 1.18, Math.sin(angle) * 0.44);
    leg.rotation.y = -angle + Math.PI / 2;
    leg.rotation.x = 0.18;
    leg.castShadow = true;
    group.add(leg);
  }

  // High-resolution smooth tapered concrete shaft (48 radial segments)
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.36, 5.2, 48),
    palette.concrete
  );
  shaft.position.y = 3.2;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  group.add(shaft);

  // 12 smooth fluted half-round ribs along the shaft
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const rib = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.032, 5.1, 12),
      palette.concreteDark
    );
    rib.position.set(Math.cos(angle) * 0.285, 3.2, Math.sin(angle) * 0.285);
    group.add(rib);
  }

  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x00e5c3,
    emissive: 0x00e5c3,
    emissiveIntensity: 1.6,
    roughness: 0.18,
    metalness: 0.2,
  });

  // Glowing vertical LED strips on upper shaft
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const strip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 1.55, 10),
      ledMat
    );
    strip.position.set(Math.cos(angle) * 0.275, 4.9, Math.sin(angle) * 0.275);
    group.add(strip);
  }

  // Smooth Observation Pod (Main SkyDeck + Orbit 360 rotating restaurant)
  const podGroup = new THREE.Group();
  podGroup.position.y = 5.75;

  // Smooth curved lower cone collar + filleted torus rim
  const lowerCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.27, 0.38, 48),
    palette.concrete
  );
  lowerCollar.position.y = -0.18;
  lowerCollar.castShadow = true;
  podGroup.add(lowerCollar);

  const lowerRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.67, 0.035, 16, 48),
    palette.concrete
  );
  lowerRim.rotation.x = Math.PI / 2;
  lowerRim.position.y = 0.0;
  podGroup.add(lowerRim);

  // Rotating Orbit 360° restaurant ring (48 segments)
  const orbitRing = new THREE.Group();
  const orbitGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.68, 0.24, 48),
    palette.warmWindow
  );
  orbitRing.add(orbitGlass);

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const mullion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8),
      palette.steelDark
    );
    mullion.position.set(Math.cos(a) * 0.695, 0, Math.sin(a) * 0.695);
    orbitRing.add(mullion);
  }
  orbitRing.position.y = 0.11;
  podGroup.add(orbitRing);

  // Smooth rounded middle observation slab & SkyWalk ring
  const midSlab = new THREE.Mesh(
    new THREE.CylinderGeometry(0.77, 0.73, 0.14, 48),
    palette.concrete
  );
  midSlab.position.y = 0.28;
  midSlab.castShadow = true;
  podGroup.add(midSlab);

  const skyDeckGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.73, 0.76, 0.26, 48),
    palette.glassTower
  );
  skyDeckGlass.position.y = 0.46;
  podGroup.add(skyDeckGlass);

  // Glowing smooth LED torus rings around pod
  const ledRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.035, 16, 48), ledMat);
  ledRing1.rotation.x = Math.PI / 2;
  ledRing1.position.y = 0.28;
  podGroup.add(ledRing1);

  const ledRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.69, 0.035, 16, 48), ledMat);
  ledRing2.rotation.x = Math.PI / 2;
  ledRing2.position.y = 0.62;
  podGroup.add(ledRing2);

  // Smooth curved upper pod dome cap
  const podCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.74, 0.36, 48),
    palette.concrete
  );
  podCap.position.y = 0.76;
  podCap.castShadow = true;
  podGroup.add(podCap);

  // Upper illuminated lantern cage (48 segments)
  const upperLantern = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.43, 0.72, 48),
    ledMat
  );
  upperLantern.position.y = 1.26;
  podGroup.add(upperLantern);

  // Smooth curved vertical fins around upper lantern
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const fin = new THREE.Mesh(
      new RoundedBoxGeometry(0.04, 0.78, 0.14, 3, 0.015),
      palette.concrete
    );
    fin.position.set(Math.cos(a) * 0.34, 1.26, Math.sin(a) * 0.34);
    fin.rotation.y = -a + Math.PI / 2;
    podGroup.add(fin);
  }

  group.add(podGroup);

  // Smooth Red & White Aviation Mast Spire
  const spireGroup = new THREE.Group();
  spireGroup.position.y = 7.35;

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.35 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.35 });

  const spireSegs = [
    { h: 0.55, r1: 0.16, r2: 0.13, mat: whiteMat },
    { h: 0.55, r1: 0.13, r2: 0.10, mat: redMat },
    { h: 0.55, r1: 0.10, r2: 0.07, mat: whiteMat },
    { h: 0.55, r1: 0.07, r2: 0.04, mat: redMat },
    { h: 0.45, r1: 0.04, r2: 0.014, mat: whiteMat },
  ];

  let curY = 0;
  spireSegs.forEach((s) => {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(s.r2, s.r1, s.h, 32), s.mat);
    seg.position.y = curY + s.h / 2;
    seg.castShadow = true;
    spireGroup.add(seg);
    curY += s.h;
  });

  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xff2a2a,
    emissive: 0xff1111,
    emissiveIntensity: 2.2,
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), beaconMat);
  beacon.position.y = curY + 0.04;
  spireGroup.add(beacon);

  const towerLight = new THREE.PointLight(0x00e5c3, 1.5, 9, 1.5);
  towerLight.position.set(0, 6.8, 0);
  group.add(towerLight);

  group.add(spireGroup);

  tagLandmark(
    group,
    'Sky Tower (328 m)',
    'The tallest freestanding structure in the Southern Hemisphere, featuring the rotating Orbit 360° restaurant, SkyDeck, and dynamic LED light shows.'
  );

  let currentTheme = 'teal';
  const themeColors = {
    teal: new THREE.Color(0x00e5c3),
    matariki: new THREE.Color(0xa855f7),
    gold: new THREE.Color(0xfbbf24),
    crimson: new THREE.Color(0xef4444),
  };

  return {
    group,
    setLightTheme(theme) {
      currentTheme = theme;
      if (theme !== 'rainbow' && themeColors[theme]) {
        const c = themeColors[theme];
        ledMat.color.copy(c);
        ledMat.emissive.copy(c);
        towerLight.color.copy(c);
      }
    },
    update(elapsed, isNight) {
      orbitRing.rotation.y = elapsed * 0.25;
      const pulse = 0.6 + Math.pow(Math.max(0, Math.sin(elapsed * 3.2)), 4) * 2.8;
      beaconMat.emissiveIntensity = pulse;

      if (currentTheme === 'rainbow') {
        const hue = (elapsed * 0.12) % 1;
        const c = new THREE.Color().setHSL(hue, 0.85, 0.55);
        ledMat.color.copy(c);
        ledMat.emissive.copy(c);
        towerLight.color.copy(c);
      }

      ledMat.emissiveIntensity = isNight ? 2.4 : 1.1;
      towerLight.intensity = isNight ? 4.5 : 0.8;
    },
  };
}

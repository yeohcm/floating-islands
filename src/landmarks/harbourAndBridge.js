import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { tagLandmark } from '../materials.js';

function createBridgeDeckGeometry(spanLen, width = 0.72, thickness = 0.11, steps = 56) {
  const hw = width * 0.5;
  const profile = [
    [-hw, 0],
    [ hw, 0],
    [ hw * 0.9, -thickness],
    [-hw * 0.9, -thickness],
  ];
  const pLen = profile.length;
  const positions = [];
  const indices = [];

  for (let i = 0; i <= steps; i++) {
    const u = i / steps - 0.5;
    const x = u * spanLen;
    const y = 1.2 + Math.cos(u * Math.PI) * 0.36;
    const dydx = (-Math.PI / spanLen) * Math.sin(u * Math.PI) * 0.36;
    const len = Math.hypot(1, dydx);
    const nx = -dydx / len;
    const ny = 1 / len;

    for (let j = 0; j < pLen; j++) {
      const [pz, py] = profile[j];
      positions.push(x + nx * py, y + ny * py, pz);
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

function createHarbourBridge(palette) {
  const bridge = new THREE.Group();
  bridge.position.set(5.15, -0.25, -4.05);

  const deckMat = palette.concreteDark;
  const steelMat = palette.steel;
  const spanLen = 4.65;

  // Continuous smooth cambered bridge deck (no kinked box segments!)
  const deckGeo = createBridgeDeckGeometry(spanLen, 0.74, 0.11, 56);
  const deckMesh = new THREE.Mesh(deckGeo, deckMat);
  deckMesh.castShadow = true;
  deckMesh.receiveShadow = true;
  bridge.add(deckMesh);

  // Smooth side barrier rails along deck
  [-0.35, 0.35].forEach((rz) => {
    const railPts = [];
    for (let i = 0; i <= 32; i++) {
      const u = i / 32 - 0.5;
      railPts.push(new THREE.Vector3(u * spanLen, 1.22 + Math.cos(u * Math.PI) * 0.36, rz));
    }
    const railCurve = new THREE.CatmullRomCurve3(railPts);
    bridge.add(new THREE.Mesh(new THREE.TubeGeometry(railCurve, 48, 0.02, 8, false), palette.concrete));
  });

  // Smooth rounded concrete piers & end abutments
  [-2.2, -1.32, -0.44, 0.44, 1.32, 2.2].forEach((px, idx) => {
    const isEnd = idx === 0 || idx === 5;
    const pier = new THREE.Mesh(
      new RoundedBoxGeometry(isEnd ? 0.34 : 0.2, isEnd ? 1.55 : 1.85, isEnd ? 0.82 : 0.64, 3, 0.045),
      palette.concrete
    );
    pier.position.set(px, isEnd ? 0.52 : 0.34, 0);
    pier.castShadow = true;
    pier.receiveShadow = true;
    bridge.add(pier);
  });

  // Signature "Coat Hanger" Twin Arch Trusses
  const vectorNodes = [];
  const archHalfSpan = 1.45;

  [-0.33, 0.33].forEach((az) => {
    const archPts = [];
    const steps = 22;
    for (let i = 0; i <= steps; i++) {
      const u = (i / steps) * 2 - 1;
      const x = u * archHalfSpan;
      const y = 1.4 + (1 - u * u) * 0.94;
      archPts.push(new THREE.Vector3(x, y, az));

      if (i > 0 && i < steps && i % 2 === 0) {
        const deckY = 1.2 + Math.cos((x / spanLen) * Math.PI) * 0.36;
        const h = y - deckY;
        const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, h, 8), steelMat);
        hanger.position.set(x, deckY + h / 2, az);
        bridge.add(hanger);

        if (az > 0) {
          const ledMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x38bdf8,
            emissiveIntensity: 1.5,
          });
          const node = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), ledMat);
          node.position.set(x, y, az + 0.03);
          bridge.add(node);
          vectorNodes.push({ mat: ledMat, phase: i * 0.45 });
        }
      }
    }

    const archCurve = new THREE.CatmullRomCurve3(archPts);
    const archMesh = new THREE.Mesh(
      new THREE.TubeGeometry(archCurve, 48, 0.04, 12, false),
      steelMat
    );
    archMesh.castShadow = true;
    bridge.add(archMesh);

    const lowerPts = archPts.map((p) => new THREE.Vector3(p.x, p.y - 0.18, az));
    const lowerCurve = new THREE.CatmullRomCurve3(lowerPts);
    const lowerArch = new THREE.Mesh(
      new THREE.TubeGeometry(lowerCurve, 40, 0.024, 10, false),
      steelMat
    );
    bridge.add(lowerArch);

    for (let i = 0; i < archPts.length - 1; i++) {
      const pA = i % 2 === 0 ? archPts[i] : lowerPts[i];
      const pB = i % 2 === 0 ? lowerPts[i + 1] : archPts[i + 1];
      const diag = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.LineCurve3(pA, pB), 1, 0.013, 6, false),
        steelMat
      );
      bridge.add(diag);
    }
  });

  for (let x = -0.9; x <= 0.9; x += 0.45) {
    const u = x / archHalfSpan;
    const y = 1.4 + (1 - u * u) * 0.94;
    const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.66, 8), steelMat);
    brace.rotation.x = Math.PI / 2;
    brace.position.set(x, y, 0);
    bridge.add(brace);
  }

  // Smooth rounded miniature cars crossing the bridge
  const cars = [];
  const carColors = [0xef4444, 0xf8fafc, 0x3b82f6, 0xfbbf24];
  for (let i = 0; i < 4; i++) {
    const car = new THREE.Group();
    const body = new THREE.Mesh(
      new RoundedBoxGeometry(0.22, 0.085, 0.12, 3, 0.025),
      new THREE.MeshStandardMaterial({ color: carColors[i], roughness: 0.3, metalness: 0.2 })
    );
    car.add(body);

    const hlMat = new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xfff3c4,
      emissiveIntensity: 1.8,
    });
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), hlMat);
    hl.position.set(i % 2 === 0 ? 0.11 : -0.11, -0.01, 0);
    car.add(hl);

    bridge.add(car);
    cars.push({
      mesh: car,
      laneZ: i % 2 === 0 ? 0.16 : -0.16,
      dir: i % 2 === 0 ? 1 : -1,
      offset: i * 0.27,
      speed: 0.24 + (i % 2) * 0.05,
    });
  }

  tagLandmark(
    bridge,
    'Auckland Harbour Bridge',
    'Iconic 8-lane steel box-girder and "coat hanger" arch spanning the Waitematā Harbour, lit by Vector Lights at night.'
  );

  return { bridge, vectorNodes, cars, spanLen };
}

function createFerryBuilding(palette) {
  const wharf = new THREE.Group();
  wharf.position.set(3.82, 0.05, 1.45);

  // Smooth rounded Queens Wharf timber pier
  const pierDeck = new THREE.Mesh(
    new RoundedBoxGeometry(1.48, 0.14, 1.78, 4, 0.04),
    palette.woodBoardwalk
  );
  pierDeck.position.set(0.15, 0.0, 0);
  pierDeck.castShadow = true;
  pierDeck.receiveShadow = true;
  wharf.add(pierDeck);

  const pierRim = new THREE.Mesh(
    new RoundedBoxGeometry(1.52, 0.08, 1.82, 4, 0.03),
    palette.concreteDark
  );
  pierRim.position.set(0.15, -0.05, 0);
  wharf.add(pierRim);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4636, roughness: 0.85 });
  [
    [0.78, -0.75],
    [0.78, 0.75],
    [0.78, 0],
    [-0.35, -0.75],
    [-0.35, 0.75],
  ].forEach(([px, pz]) => {
    const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.95, 12), woodMat);
    pile.position.set(px, -0.45, pz);
    wharf.add(pile);
  });

  // Historic Ferry Building with rounded edges & arched windows
  const building = new THREE.Mesh(
    new RoundedBoxGeometry(0.76, 0.62, 1.28, 4, 0.035),
    palette.heritageBrick
  );
  building.position.set(0.0, 0.39, 0);
  building.castShadow = true;
  wharf.add(building);

  const plinth = new THREE.Mesh(
    new RoundedBoxGeometry(0.82, 0.1, 1.34, 3, 0.025),
    palette.sandstone
  );
  plinth.position.set(0, 0.12, 0);
  wharf.add(plinth);

  [-0.56, -0.19, 0.19, 0.56].forEach((pz) => {
    const pil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.04, 0.62, 12),
      palette.sandstone
    );
    pil.position.set(0.39, 0.39, pz);
    wharf.add(pil);
  });

  const trim = new THREE.Mesh(
    new RoundedBoxGeometry(0.84, 0.09, 1.36, 3, 0.025),
    palette.sandstone
  );
  trim.position.set(0.0, 0.73, 0);
  wharf.add(trim);

  const slateHip = new THREE.Mesh(
    new RoundedBoxGeometry(0.72, 0.18, 1.22, 4, 0.05),
    palette.slateRoof
  );
  slateHip.position.set(0, 0.84, 0);
  slateHip.castShadow = true;
  wharf.add(slateHip);

  const veranda = new THREE.Mesh(
    new RoundedBoxGeometry(0.28, 0.04, 1.22, 3, 0.015),
    palette.steelDark
  );
  veranda.position.set(0.49, 0.36, 0);
  veranda.rotation.z = -0.22;
  wharf.add(veranda);

  for (let wz = -0.38; wz <= 0.38; wz += 0.38) {
    const win = new THREE.Mesh(
      new RoundedBoxGeometry(0.8, 0.24, 0.16, 3, 0.025),
      palette.warmWindow
    );
    win.position.set(0.0, 0.42, wz);
    wharf.add(win);
  }

  const tower = new THREE.Mesh(
    new RoundedBoxGeometry(0.34, 0.44, 0.34, 3, 0.03),
    palette.sandstone
  );
  tower.position.set(0.0, 1.06, 0);
  tower.castShadow = true;
  wharf.add(tower);

  const clockFaceX = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.36, 18),
    palette.warmWindow
  );
  clockFaceX.rotation.z = Math.PI / 2;
  clockFaceX.position.set(0.0, 1.08, 0);
  wharf.add(clockFaceX);

  const clockFaceZ = clockFaceX.clone();
  clockFaceZ.rotation.x = Math.PI / 2;
  clockFaceZ.rotation.z = 0;
  wharf.add(clockFaceZ);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x3f8f7d, roughness: 0.38, metalness: 0.35 })
  );
  dome.position.set(0.0, 1.28, 0);
  wharf.add(dome);

  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.16, 10), palette.steel);
  finial.position.set(0, 1.5, 0);
  wharf.add(finial);

  tagLandmark(
    wharf,
    'Auckland Ferry Building',
    'Historic 1912 Edwardian Baroque terminal at Queens Wharf serving ferries to Devonport, Waiheke, and Rangitoto.'
  );

  return wharf;
}

function createFullersFerry(palette) {
  const ferry = new THREE.Group();

  const blueMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.28, metalness: 0.25 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28 });

  // Smooth rounded twin catamaran hulls
  [-0.12, 0.12].forEach((hx) => {
    const hull = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.64, 10, 16), blueMat);
    hull.rotation.x = Math.PI / 2;
    hull.position.set(hx, 0.025, 0);
    ferry.add(hull);
  });

  const deck = new THREE.Mesh(
    new RoundedBoxGeometry(0.35, 0.055, 0.7, 3, 0.02),
    whiteMat
  );
  deck.position.y = 0.075;
  deck.castShadow = true;
  ferry.add(deck);

  const cabin = new THREE.Mesh(
    new RoundedBoxGeometry(0.29, 0.13, 0.48, 3, 0.03),
    whiteMat
  );
  cabin.position.set(0, 0.16, -0.02);
  cabin.castShadow = true;
  ferry.add(cabin);

  const cabinWindows = new THREE.Mesh(
    new RoundedBoxGeometry(0.30, 0.065, 0.4, 2, 0.015),
    palette.warmWindow
  );
  cabinWindows.position.set(0, 0.17, 0);
  ferry.add(cabinWindows);

  const bridgeHouse = new THREE.Mesh(
    new RoundedBoxGeometry(0.22, 0.09, 0.24, 3, 0.025),
    blueMat
  );
  bridgeHouse.position.set(0, 0.265, 0.07);
  ferry.add(bridgeHouse);

  const wake = new THREE.Mesh(
    new THREE.CircleGeometry(0.22, 16),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.5 })
  );
  wake.rotation.x = -Math.PI / 2;
  wake.scale.set(0.75, 1.6, 1);
  wake.position.set(0, -0.01, -0.48);
  ferry.add(wake);

  tagLandmark(
    ferry,
    'Waitematā Harbour Ferry',
    'Catamaran ferry gliding between downtown Queens Wharf and Auckland’s North Shore & Hauraki Gulf islands.'
  );

  return { ferry, wake };
}

function createSailboat(color = 0xf8fafc, hullColor = 0x1e3a8a) {
  const boat = new THREE.Group();
  // Smooth hydrodynamic yacht hull
  const hullGeo = new THREE.CapsuleGeometry(0.075, 0.28, 10, 18);
  hullGeo.rotateX(Math.PI / 2);
  hullGeo.scale(1, 0.62, 1);
  const hull = new THREE.Mesh(
    hullGeo,
    new THREE.MeshStandardMaterial({ color: hullColor, roughness: 0.3 })
  );
  hull.position.y = 0.03;
  boat.add(hull);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.012, 0.62, 10),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5 })
  );
  mast.position.set(0, 0.33, 0.04);
  boat.add(mast);

  // Smooth curved billowing mainsail
  const sailGeo = new THREE.PlaneGeometry(0.26, 0.48, 8, 10);
  const sPos = sailGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    const u = (sPos.getX(i) + 0.13) / 0.26; // 0 at mast, 1 at leech
    const v = (sPos.getY(i) + 0.24) / 0.48; // 0 at boom, 1 at top
    // Taper width toward top of mast & bow out with wind
    const widthAtV = 1 - v * 0.88;
    const zCoord = 0.04 - u * 0.26 * widthAtV;
    const billow = Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * 0.045 * widthAtV;
    sPos.setXYZ(i, billow, v * 0.48 + 0.1, zCoord);
  }
  sailGeo.computeVertexNormals();
  const sail = new THREE.Mesh(
    sailGeo,
    new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.5 })
  );
  sail.castShadow = true;
  boat.add(sail);

  return boat;
}

export function createHarbourAndBridge(palette) {
  const group = new THREE.Group();

  const { bridge, vectorNodes, cars, spanLen } = createHarbourBridge(palette);
  group.add(bridge);

  const wharf = createFerryBuilding(palette);
  group.add(wharf);

  const { ferry, wake } = createFullersFerry(palette);
  group.add(ferry);

  const boat1 = createSailboat(0xffffff, 0x1e3a8a);
  boat1.position.set(6.35, -0.22, 3.05);
  group.add(boat1);

  const boat2 = createSailboat(0xfef08a, 0x0f766e);
  boat2.position.set(5.15, -0.22, -1.65);
  boat2.rotation.y = 0.7;
  group.add(boat2);

  const boat3 = createSailboat(0xffffff, 0xb91c1c);
  boat3.position.set(4.35, -0.22, -0.82);
  boat3.rotation.y = -0.35;
  group.add(boat3);

  // Smooth curved-wing harbour seagulls
  const gulls = [];
  const gullMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  for (let i = 0; i < 4; i++) {
    const gull = new THREE.Group();
    const wingGeo = new THREE.CapsuleGeometry(0.01, 0.11, 4, 8);
    wingGeo.rotateZ(Math.PI / 2);
    const lw = new THREE.Mesh(wingGeo, gullMat);
    lw.position.x = -0.055;
    const rw = new THREE.Mesh(wingGeo, gullMat);
    rw.position.x = 0.055;
    gull.add(lw, rw);
    group.add(gull);
    gulls.push({
      mesh: gull,
      lw,
      rw,
      radius: 1.1 + i * 0.32,
      centerX: 5.4,
      centerZ: 0.5 + (i % 2) * 1.4,
      height: 2.2 + i * 0.28,
      speed: 0.55 + i * 0.08,
      phase: i * 1.7,
    });
  }

  return {
    group,
    update(elapsed, isNight) {
      cars.forEach((c) => {
        const p = (elapsed * c.speed + c.offset) % 1;
        const u = c.dir > 0 ? p - 0.5 : 0.5 - p;
        const x = u * spanLen;
        const y = 1.25 + Math.cos(u * Math.PI) * 0.36;
        const tilt = -Math.sin(u * Math.PI) * 0.22;
        c.mesh.position.set(x, y, c.laneZ);
        c.mesh.rotation.z = tilt;
      });

      vectorNodes.forEach((n) => {
        const wave = 0.5 + 0.5 * Math.sin(elapsed * 3.0 - n.phase);
        const hue = (0.52 + wave * 0.18) % 1;
        n.mat.color.setHSL(hue, 0.9, 0.6);
        n.mat.emissive.setHSL(hue, 0.9, 0.55);
        n.mat.emissiveIntensity = isNight ? 1.4 + wave * 1.8 : 0.4;
      });

      const fPhase = (elapsed * 0.085) % 1;
      const zPos = 1.2 + Math.sin(fPhase * Math.PI * 2) * 2.65;
      const zVel = Math.cos(fPhase * Math.PI * 2);
      const xPos = 5.45 + Math.cos(fPhase * Math.PI * 2) * 0.42;
      ferry.position.set(xPos, -0.21 + Math.sin(elapsed * 2.4) * 0.02, zPos);
      ferry.rotation.y = zVel >= 0 ? 0 : Math.PI;
      ferry.rotation.z = Math.sin(elapsed * 1.9) * 0.04;
      wake.visible = Math.abs(zVel) > 0.15;

      boat1.position.y = -0.21 + Math.sin(elapsed * 2.0 + 1.0) * 0.022;
      boat1.rotation.z = Math.sin(elapsed * 1.3) * 0.07;
      boat1.rotation.y = -0.4 + Math.sin(elapsed * 0.25) * 0.35;

      boat2.position.y = -0.21 + Math.cos(elapsed * 1.8) * 0.022;
      boat2.rotation.z = Math.cos(elapsed * 1.4) * 0.07;

      boat3.position.y = -0.21 + Math.sin(elapsed * 1.6 + 2.1) * 0.018;
      boat3.rotation.z = Math.sin(elapsed * 1.2) * 0.05;

      gulls.forEach((g) => {
        const angle = elapsed * g.speed + g.phase;
        g.mesh.position.set(
          g.centerX + Math.cos(angle) * g.radius,
          g.height + Math.sin(elapsed * 1.8 + g.phase) * 0.12,
          g.centerZ + Math.sin(angle) * g.radius
        );
        g.mesh.rotation.y = -angle;
        const flap = Math.sin(elapsed * 8.5 + g.phase) * 0.45;
        g.lw.rotation.z = 0.2 + flap;
        g.rw.rotation.z = -0.2 - flap;
      });
    },
  };
}

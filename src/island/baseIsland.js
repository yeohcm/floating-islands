import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { tagLandmark } from '../materials.js';

function createSmoothClosedShape(pts2D, samples = 120) {
  const spline = new THREE.SplineCurve(pts2D);
  const sampled = spline.getPoints(samples);
  // Remove duplicate closing point so ExtrudeGeometry bevel miter never divides by 0 (NaN)
  sampled.pop();
  const shape = new THREE.Shape(sampled);
  shape.closePath();
  return { shape, sampled };
}

function createMainlandShape(inset = 0) {
  // World (x, z) -> Shape (x, -z) for rotateX(-PI/2)
  const raw = [
    [-5.8 + inset, -(-7.35 + inset)],
    [-2.2,         -(-8.05 + inset)],
    [ 1.6,         -(-7.85 + inset)],
    [ 3.05 - inset,-(-6.15 + inset)],
    [ 3.12 - inset,-(-2.85)],
    [ 2.92 - inset,-( 0.45)],
    [ 3.16 - inset,-( 2.95)],
    [ 2.95 - inset,-( 5.15 - inset)],
    [ 1.25,        -( 5.98 - inset)],
    [-2.5,         -( 6.08 - inset)],
    [-5.95 + inset,-( 5.35 - inset)],
    [-7.18 + inset,-( 2.85)],
    [-7.35 + inset,-(-0.65)],
    [-7.05 + inset,-(-4.85)],
  ];
  const pts = raw.map(([x, y]) => new THREE.Vector2(x, y));
  pts.push(pts[0].clone());
  return createSmoothClosedShape(pts, 140).shape;
}

function createHarbourShape(inset = 0) {
  // Smooth crescent bay nestled along x ≈ 3.05..7.85
  const raw = [
    [3.02 + inset * 0.4, -( -4.95 + inset)],
    [4.65,               -( -5.85 + inset)],
    [6.65 - inset,       -( -5.25 + inset)],
    [7.72 - inset,       -( -2.85)],
    [7.88 - inset,       -(  0.15)],
    [7.62 - inset,       -(  3.25)],
    [6.45 - inset,       -(  5.35 - inset)],
    [4.45,               -(  5.78 - inset)],
    [3.02 + inset * 0.4, -(  4.95 - inset)],
    [3.08 + inset * 0.4, -(  2.65)],
    [2.88 + inset * 0.4, -(  0.35)],
    [3.05 + inset * 0.4, -( -2.25)],
  ];
  const pts = raw.map(([x, y]) => new THREE.Vector2(x, y));
  pts.push(pts[0].clone());
  return createSmoothClosedShape(pts, 140).shape;
}

export function createBaseIsland(palette) {
  const group = new THREE.Group();

  // 1. Smoothly Curved & Beveled Mainland Peninsula Deck
  const deckShape = createMainlandShape(0);
  const deckGeo = new THREE.ExtrudeGeometry(deckShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.09,
    bevelSegments: 5,
    curveSegments: 64,
  });
  deckGeo.rotateX(-Math.PI / 2);
  const deckUv = deckGeo.attributes.uv;
  for (let i = 0; i < deckUv.count; i++) {
    deckUv.setXY(i, deckUv.getX(i) * 0.18, deckUv.getY(i) * 0.18);
  }
  deckGeo.computeVertexNormals();
  const deck = new THREE.Mesh(deckGeo, palette.sidewalk);
  deck.position.y = -0.13;
  deck.receiveShadow = true;
  deck.castShadow = true;
  group.add(deck);

  // Smoothly Beveled Upper Terracotta Soil Rim under Mainland
  const soilShape = createMainlandShape(0.12);
  const soilGeo = new THREE.ExtrudeGeometry(soilShape, {
    depth: 0.65,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.08,
    bevelSegments: 4,
    curveSegments: 48,
  });
  soilGeo.rotateX(-Math.PI / 2);
  soilGeo.computeVertexNormals();
  const upperSoil = new THREE.Mesh(soilGeo, palette.soil);
  upperSoil.position.y = -0.82;
  upperSoil.castShadow = true;
  upperSoil.receiveShadow = true;
  group.add(upperSoil);

  // 2. Smooth Organic Floating Island Bowl Underneath Entire Diorama (Land + Harbour)
  const bowlGeo = new THREE.CylinderGeometry(1, 1, 4.8, 72, 24);
  const bowlPos = bowlGeo.attributes.position;
  for (let i = 0; i < bowlPos.count; i++) {
    const vx = bowlPos.getX(i);
    const vy = bowlPos.getY(i); // +2.4 at top, -2.4 at bottom
    const vz = bowlPos.getZ(i);
    const angle = Math.atan2(vz, vx);
    const t = Math.max(0, Math.min(1, (vy + 2.4) / 4.8)); // 0 at bottom tip, 1 at top rim

    // Smooth power profile tapering to a rounded tip at the bottom
    const profile = Math.pow(t, 0.58);
    // Elliptical organic contour matching the combined island + harbour footprint
    const baseRx = 7.45 + Math.cos(angle * 2) * 0.35 + Math.sin(angle * 3) * 0.22;
    const baseRz = 6.75 + Math.sin(angle * 2) * 0.28 - Math.cos(angle * 3) * 0.18;
    // Soft horizontal geological strata ripples
    const strata = 1 + Math.sin(t * Math.PI * 6) * 0.032 * (1 - t * 0.5);
    const lobe = 1 + Math.sin(angle * 5 + t * 2.2) * 0.055 * (1 - t * 0.3);

    const rx = (0.25 + (baseRx - 0.25) * profile) * strata * lobe;
    const rz = (0.25 + (baseRz - 0.25) * profile) * strata * lobe;

    bowlPos.setX(i, Math.cos(angle) * rx + 0.25 * profile);
    bowlPos.setZ(i, Math.sin(angle) * rz - 0.85 * profile);
    // Gently cup the bottom tip
    if (t < 0.08) {
      bowlPos.setY(i, vy + (0.08 - t) * 1.4);
    }
  }
  bowlGeo.computeVertexNormals();
  const bowlMesh = new THREE.Mesh(bowlGeo, palette.basaltRock);
  bowlMesh.position.set(0, -3.12, 0);
  bowlMesh.castShadow = true;
  bowlMesh.receiveShadow = true;
  group.add(bowlMesh);

  // Smooth rounded volcanic rock lobes / ledges clinging to the underside
  const lobeConfigs = [
    { x: -3.4, y: -3.2, z: 2.2, sx: 2.2, sy: 1.6, sz: 1.9 },
    { x: 3.6, y: -2.9, z: -1.6, sx: 2.1, sy: 1.5, sz: 1.8 },
    { x: -1.8, y: -3.4, z: -2.9, sx: 1.9, sy: 1.5, sz: 1.7 },
    { x: 2.2, y: -3.1, z: 2.8, sx: 1.8, sy: 1.4, sz: 1.6 },
  ];
  lobeConfigs.forEach((lc, idx) => {
    const lobeGeo = new THREE.SphereGeometry(1, 24, 18);
    const pos = lobeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const wave = 1 + Math.sin(x * 2.5 + idx) * 0.08 + Math.cos(z * 2.5) * 0.08;
      pos.setXYZ(i, x * lc.sx * wave, y * lc.sy, z * lc.sz * wave);
    }
    lobeGeo.computeVertexNormals();
    const mesh = new THREE.Mesh(lobeGeo, idx % 2 === 0 ? palette.basaltDark : palette.basaltRock);
    mesh.position.set(lc.x, lc.y, lc.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  // Hanging organic roots & smooth cutaway pipes
  const rootMat = new THREE.MeshStandardMaterial({ color: 0x5b4231, roughness: 0.85 });
  [
    [new THREE.Vector3(-4.6, -1.1, 4.7), new THREE.Vector3(-4.9, -2.2, 5.0), new THREE.Vector3(-4.7, -3.2, 4.6)],
    [new THREE.Vector3(-6.4, -1.1, 1.2), new THREE.Vector3(-6.7, -2.0, 1.4), new THREE.Vector3(-6.3, -2.9, 1.0)],
    [new THREE.Vector3(1.2, -1.1, 5.2), new THREE.Vector3(1.4, -1.9, 5.4), new THREE.Vector3(1.0, -2.7, 5.0)],
  ].forEach((pts) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const root = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.05, 10, false), rootMat);
    group.add(root);
  });

  // 3. Curved Waterfront Quay Seawall, Smooth Timber Boardwalk & Marina Pier
  const boardwalkPts = [
    new THREE.Vector3(3.02, 0, -3.6),
    new THREE.Vector3(3.06, 0, -1.8),
    new THREE.Vector3(2.90, 0, 0.4),
    new THREE.Vector3(3.10, 0, 2.7),
    new THREE.Vector3(2.96, 0, 4.4),
  ];
  const boardwalkCurve = new THREE.CatmullRomCurve3(boardwalkPts);
  const boardwalkGeo = new THREE.TubeGeometry(boardwalkCurve, 64, 0.24, 12, false);
  boardwalkGeo.scale(1, 0.18, 1);
  const boardwalk = new THREE.Mesh(boardwalkGeo, palette.woodBoardwalk);
  boardwalk.position.y = 0.15;
  boardwalk.receiveShadow = true;
  boardwalk.castShadow = true;
  group.add(boardwalk);

  // Curved seawall coping beneath boardwalk
  const seawallGeo = new THREE.TubeGeometry(boardwalkCurve, 64, 0.25, 12, false);
  seawallGeo.scale(1, 1.65, 1);
  const seawall = new THREE.Mesh(seawallGeo, palette.concreteDark);
  seawall.position.y = -0.32;
  seawall.castShadow = true;
  seawall.receiveShadow = true;
  group.add(seawall);

  // Smooth rounded marina finger pier jutting into Waitematā Harbour
  const marinaPier = new THREE.Mesh(
    new RoundedBoxGeometry(1.4, 0.08, 0.44, 3, 0.03),
    palette.woodBoardwalk
  );
  marinaPier.position.set(3.85, -0.07, -1.25);
  marinaPier.castShadow = true;
  marinaPier.receiveShadow = true;
  group.add(marinaPier);
  [3.5, 4.38].forEach((px) => {
    const pile = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.045, 0.72, 12),
      new THREE.MeshStandardMaterial({ color: 0x4e3929, roughness: 0.85 })
    );
    pile.position.set(px, -0.4, -1.25);
    group.add(pile);
  });

  // Rounded harbor mooring bollards along boardwalk
  for (let i = 0; i <= 7; i++) {
    const bp = boardwalkCurve.getPointAt(i / 7);
    const bollard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.06, 0.15, 14),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.35, metalness: 0.45 })
    );
    bollard.position.set(bp.x + 0.14, 0.22, bp.z);
    bollard.castShadow = true;
    group.add(bollard);
  }

  // 4. Curved Crescent Waitematā Harbour Water Basin (NO rectangular water box!)
  const seaFloorShape = createHarbourShape(-0.06);
  const seaFloorGeo = new THREE.ExtrudeGeometry(seaFloorShape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.1,
    bevelSegments: 4,
    curveSegments: 64,
  });
  seaFloorGeo.rotateX(-Math.PI / 2);
  seaFloorGeo.computeVertexNormals();
  const seaFloorMat = new THREE.MeshStandardMaterial({
    color: 0x184e60,
    roughness: 0.85,
  });
  const seaFloor = new THREE.Mesh(seaFloorGeo, seaFloorMat);
  seaFloor.position.y = -0.82;
  seaFloor.receiveShadow = true;
  group.add(seaFloor);

  // Curved translucent water volume with beveled rim
  const waterShape = createHarbourShape(0.02);
  const waterVolGeo = new THREE.ExtrudeGeometry(waterShape, {
    depth: 0.36,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 64,
  });
  waterVolGeo.rotateX(-Math.PI / 2);
  waterVolGeo.computeVertexNormals();
  const waterBasePos = Float32Array.from(waterVolGeo.attributes.position.array);
  const waterMesh = new THREE.Mesh(waterVolGeo, palette.water);
  waterMesh.position.y = -0.58;
  waterMesh.receiveShadow = true;
  group.add(waterMesh);
  tagLandmark(
    waterMesh,
    'Waitematā Harbour',
    'Sparkling curved bay of the "City of Sails", connecting the CBD waterfront, Ferry Building, and North Shore.'
  );

  // Cascading Waterfall & Mist Foam spilling over the eastern harbour rim!
  const waterfallGroup = new THREE.Group();
  waterfallGroup.position.set(7.76, -0.85, 0.25);
  const fallMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.72,
    roughness: 0.15,
  });
  for (let i = -2; i <= 2; i++) {
    const stream = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.16, 1.55, 12),
      fallMat
    );
    stream.position.set(Math.cos(i * 0.2) * 0.06, -0.15, i * 0.22);
    stream.rotation.z = -0.14;
    waterfallGroup.add(stream);
  }
  const mistPuffGeo = new THREE.SphereGeometry(0.22, 16, 14);
  const mistMat = new THREE.MeshStandardMaterial({
    color: 0xf0f9ff,
    transparent: true,
    opacity: 0.78,
    roughness: 0.9,
  });
  const mistPuffs = [];
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Mesh(mistPuffGeo, mistMat);
    puff.position.set(0.12, -0.92, (i - 2) * 0.24);
    waterfallGroup.add(puff);
    mistPuffs.push({ mesh: puff, phase: i * 1.2 });
  }
  group.add(waterfallGroup);

  // 5. Smooth Rounded Northcote Point / North Shore Headland Bluff + Coastal Lighthouse
  const northShore = new THREE.Group();
  northShore.position.set(7.15, 0.08, -3.95);

  const nsRockGeo = new THREE.SphereGeometry(1.08, 28, 20);
  nsRockGeo.scale(0.82, 0.85, 1.25);
  const nsRock = new THREE.Mesh(nsRockGeo, palette.basaltRock);
  nsRock.position.y = -0.26;
  nsRock.castShadow = true;
  nsRock.receiveShadow = true;
  northShore.add(nsRock);

  const nsGrassGeo = new THREE.SphereGeometry(1.02, 28, 18);
  nsGrassGeo.scale(0.84, 0.34, 1.26);
  const nsGrass = new THREE.Mesh(nsGrassGeo, palette.grassBright);
  nsGrass.position.y = 0.36;
  nsGrass.castShadow = true;
  nsGrass.receiveShadow = true;
  northShore.add(nsGrass);

  // Smooth coastal lighthouse on Northcote Point
  const lhTower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.125, 0.46, 20),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })
  );
  lhTower.position.set(0.18, 0.74, 0.72);
  lhTower.castShadow = true;
  northShore.add(lhTower);

  const lhStripe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.092, 0.106, 0.14, 20),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 })
  );
  lhStripe.position.set(0.18, 0.74, 0.72);
  northShore.add(lhStripe);

  const lhCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.38 })
  );
  lhCap.position.set(0.18, 1.02, 0.72);
  northShore.add(lhCap);

  const lhLamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 2.0 })
  );
  lhLamp.position.set(0.18, 0.99, 0.72);
  northShore.add(lhLamp);

  group.add(northShore);

  // 6. Roads: Lengthened Queen Street Boulevard, Raised Sidewalks & Customs Street
  const queenSt = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 10.6), palette.queenRoad || palette.road);
  queenSt.rotation.x = -Math.PI / 2;
  queenSt.position.set(-0.45, 0.146, -1.95);
  queenSt.receiveShadow = true;
  group.add(queenSt);

  // Raised paved West & East pedestrian promenades along Queen Street
  [-1.16, 0.26].forEach((sx) => {
    const walk = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.032, 9.8, 2, 0.008),
      palette.sidewalk
    );
    walk.position.set(sx, 0.132, -1.75);
    walk.receiveShadow = true;
    group.add(walk);
  });

  const customsRoad = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 5.3), palette.road);
  customsRoad.rotation.x = -Math.PI / 2;
  customsRoad.rotation.z = Math.PI / 2;
  customsRoad.position.set(0.15, 0.15, 3.05);
  customsRoad.receiveShadow = true;
  group.add(customsRoad);

  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
  [2.52, -0.85, -4.25].forEach((cz) => {
    for (let i = -2; i <= 2; i++) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.42), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(-0.45 + i * 0.18, 0.155, cz);
      group.add(stripe);
    }
  });

  // 7. Smooth Sculpted Rolling Maungawhau / Mt Eden Volcanic Cone
  const mtEden = new THREE.Group();
  mtEden.position.set(-4.15, 0.12, 1.85);

  const parkPad = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.78, 0.1, 48), palette.grass);
  parkPad.position.y = 0.04;
  parkPad.receiveShadow = true;
  mtEden.add(parkPad);

  const parkKerb = new THREE.Mesh(new THREE.TorusGeometry(1.76, 0.045, 10, 48), palette.basaltRock);
  parkKerb.rotation.x = Math.PI / 2;
  parkKerb.position.y = 0.05;
  parkKerb.receiveShadow = true;
  mtEden.add(parkKerb);

  // High-resolution smooth-shaded volcanic hill with subtle contoured pā terraces
  const coneGeo = new THREE.CylinderGeometry(0.78, 1.62, 1.48, 64, 24, true);
  const cPos = coneGeo.attributes.position;
  for (let i = 0; i < cPos.count; i++) {
    const vx = cPos.getX(i);
    const vy = cPos.getY(i);
    const vz = cPos.getZ(i);
    const angle = Math.atan2(vz, vx);
    const hNorm = (vy + 0.74) / 1.48;
    // Smooth S-curve slope profile + gentle organic lobes
    const bellCurve = 1 + Math.sin(hNorm * Math.PI) * 0.12;
    const ridge = Math.sin(angle * 3 + 0.5) * 0.065 + Math.cos(angle * 2 - 0.3) * 0.05;
    const terrace = Math.sin(hNorm * Math.PI * 5) * 0.028 * (1 - hNorm * 0.4);
    const scale = bellCurve + (ridge + terrace) * (1 - hNorm * 0.25);
    cPos.setX(i, vx * scale);
    cPos.setZ(i, vz * scale);
  }
  coneGeo.computeVertexNormals();
  const coneMesh = new THREE.Mesh(
    coneGeo,
    new THREE.MeshStandardMaterial({
      color: 0x62b058,
      roughness: 0.78,
      side: THREE.DoubleSide,
    })
  );
  coneMesh.position.y = 0.82;
  coneMesh.castShadow = true;
  coneMesh.receiveShadow = true;
  mtEden.add(coneMesh);

  // Smooth rounded crater rim + smooth recessed grassy crater bowl
  const rimTop = new THREE.Mesh(new THREE.TorusGeometry(0.77, 0.12, 18, 48), palette.grassBright);
  rimTop.rotation.x = Math.PI / 2;
  rimTop.position.y = 1.54;
  rimTop.castShadow = true;
  mtEden.add(rimTop);

  const craterBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.76, 32, 18, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: 0x4b7d46, roughness: 0.85, side: THREE.DoubleSide })
  );
  craterBowl.scale.set(1, 0.58, 1);
  craterBowl.position.y = 1.54;
  craterBowl.receiveShadow = true;
  mtEden.add(craterBowl);

  // Smooth rounded volcanic scoria boulders
  [
    [1.08, 0.42, 0.52, 0.18],
    [-1.12, 0.36, 0.58, 0.19],
    [0.45, 0.88, -0.85, 0.15],
  ].forEach(([rx, ry, rz, rr]) => {
    const rock = new THREE.Mesh(new THREE.SphereGeometry(rr, 14, 12), palette.basaltRock);
    rock.scale.set(1.2, 0.75, 0.95);
    rock.position.set(rx, ry, rz);
    rock.rotation.set(rx, ry, rz);
    rock.castShadow = true;
    mtEden.add(rock);
  });

  // Smooth curved timber boardwalk trail winding up to the summit
  const trailPts = [];
  for (let s = 0; s <= 16; s++) {
    const t = s / 16;
    const ang = -0.35 + t * 1.2;
    const rad = 1.56 - t * 0.80;
    const sy = 0.14 + t * 1.44;
    trailPts.push(new THREE.Vector3(Math.cos(ang) * rad, sy, Math.sin(ang) * rad));
  }
  const trailCurve = new THREE.CatmullRomCurve3(trailPts);
  const trailMesh = new THREE.Mesh(
    new THREE.TubeGeometry(trailCurve, 40, 0.085, 8, false),
    palette.woodBoardwalk
  );
  trailMesh.scale.set(1, 0.35, 1);
  mtEden.add(trailMesh);

  // Circular wooden summit viewing deck & trig beacon
  const deckRim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20), palette.woodBoardwalk);
  deckRim.position.set(Math.cos(0.85) * 0.79, 1.62, Math.sin(0.85) * 0.79);
  mtEden.add(deckRim);

  const trigPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.032, 0.28, 12), palette.steel);
  trigPole.position.set(Math.cos(0.85) * 0.79, 1.78, Math.sin(0.85) * 0.79);
  mtEden.add(trigPole);

  tagLandmark(
    mtEden,
    'Maungawhau (Mt Eden)',
    'Auckland’s iconic rolling volcanic cone (maunga) with smooth contoured slopes, timber summit boardwalk, and crater bowl.'
  );
  group.add(mtEden);

  // Smooth rounded Aotea Park lawn
  const aoteaLawn = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.18, 0.08, 36), palette.grassBright);
  aoteaLawn.position.set(-4.55, 0.15, -1.35);
  aoteaLawn.receiveShadow = true;
  group.add(aoteaLawn);

  return {
    group,
    update(elapsed) {
      // Gentle wave animation on the top surface of the curved water volume
      const pos = waterVolGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const by = waterBasePos[i * 3 + 1];
        if (by > 0.15) {
          const bx = waterBasePos[i * 3];
          const bz = waterBasePos[i * 3 + 2];
          const wave =
            Math.sin(bx * 1.9 + elapsed * 2.1) * 0.028 +
            Math.cos(bz * 1.4 - elapsed * 1.6) * 0.022;
          pos.setY(i, by + wave);
        }
      }
      pos.needsUpdate = true;

      // Animate waterfall mist puffs
      mistPuffs.forEach((m) => {
        const s = 0.85 + Math.sin(elapsed * 2.8 + m.phase) * 0.22;
        m.mesh.scale.setScalar(s);
        m.mesh.position.y = -0.92 + Math.cos(elapsed * 2.2 + m.phase) * 0.06;
      });
    },
  };
}

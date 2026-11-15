import * as THREE from 'three';

function createCanvasTexture(width, height, drawFn, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 4;
  return texture;
}

export function createWindowTexture({
  bg = '#2c3e50',
  litColor = '#ffd98e',
  dimColor = '#6488a4',
  spandrelColor = '#1e293b',
  cols = 6,
  rows = 12,
  seed = 1,
} = {}) {
  return createCanvasTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const padX = w / cols;
    const padY = h / rows;
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    for (let r = 0; r < rows; r++) {
      // Architectural floor spandrel band
      ctx.fillStyle = spandrelColor;
      ctx.fillRect(0, r * padY, w, padY * 0.16);

      for (let c = 0; c < cols; c++) {
        const rv = rand();
        ctx.fillStyle = rv > 0.42 ? litColor : rv > 0.15 ? dimColor : '#3a546d';
        ctx.fillRect(
          c * padX + padX * 0.14,
          r * padY + padY * 0.22,
          padX * 0.72,
          padY * 0.68
        );
      }
    }
  });
}

export function createBrickTexture(base = '#9c4637', mortar = '#dfd0be') {
  return createCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = mortar;
    ctx.fillRect(0, 0, w, h);
    const rows = 14;
    const cols = 7;
    const bh = h / rows;
    const bw = w / cols;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (bw * 0.5);
      for (let c = -1; c <= cols; c++) {
        const shade = (r * 7 + c * 13) % 4;
        ctx.fillStyle =
          shade === 0 ? base : shade === 1 ? '#8a3b2e' : shade === 2 ? '#ad5343' : '#964234';
        ctx.fillRect(c * bw + offset + 1.5, r * bh + 1.5, bw - 3, bh - 3);
      }
    }
  });
}

export function createWoodPlankTexture() {
  return createCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#8b684c';
    ctx.fillRect(0, 0, w, h);
    const planks = 10;
    const pw = w / planks;
    for (let i = 0; i < planks; i++) {
      const shade = i % 3 === 0 ? '#7d5c42' : i % 3 === 1 ? '#937054' : '#856246';
      ctx.fillStyle = shade;
      ctx.fillRect(i * pw + 1, 0, pw - 2, h);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(i * pw, 0, 1.5, h);
    }
  }, 2, 4);
}

export function createAwningTexture(c1 = '#0f766e', c2 = '#f8fafc') {
  return createCanvasTexture(128, 64, (ctx, w, h) => {
    const stripes = 8;
    const sw = w / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? c1 : c2;
      ctx.fillRect(i * sw, 0, sw, h);
    }
  });
}

export function createPavingTexture() {
  return createCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#cfd6de';
    ctx.fillRect(0, 0, w, h);
    const step = 32;
    ctx.strokeStyle = 'rgba(100,116,139,0.22)';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if ((x / step + y / step) % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
        }
        ctx.strokeRect(x, y, step, step);
      }
    }
  }, 6, 7);
}

export function createRoadTexture(repeatY = 1) {
  return createCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#333b44';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 700; i++) {
      const x = (i * 73) % w;
      const y = (i * 137) % h;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(x, y, 2, 2);
    }

    // Center dashed yellow line (NZ road markings)
    ctx.fillStyle = '#f5c542';
    for (let y = 12; y < h; y += 44) {
      ctx.fillRect(w / 2 - 4, y, 8, 22);
    }

    // Edge curb lines
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(6, 0, 5, h);
    ctx.fillRect(w - 11, 0, 5, h);
  }, 1, repeatY);
}

export function createSignTexture(text, bg = '#0f172a', fg = '#38bdf8') {
  return createCanvasTexture(256, 96, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = fg;
    ctx.lineWidth = 6;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.fillStyle = fg;
    ctx.font = 'bold 34px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
  });
}

export function createPalette() {
  const nightEmissives = [];

  const registerEmissive = (mat, dayIntensity, nightIntensity) => {
    mat.userData.dayIntensity = dayIntensity;
    mat.userData.nightIntensity = nightIntensity;
    nightEmissives.push(mat);
    return mat;
  };

  const windowTex1 = createWindowTexture({ bg: '#32485e', litColor: '#ffe099', dimColor: '#769cb8', seed: 3 });
  const windowTex2 = createWindowTexture({ bg: '#1e2e40', litColor: '#ffe7ad', dimColor: '#4c7391', cols: 8, rows: 14, seed: 7 });
  const heritageBrickTex = createBrickTexture();
  const woodPlankTex = createWoodPlankTexture();
  const pavingTex = createPavingTexture();

  const concrete = new THREE.MeshStandardMaterial({
    color: 0xd9dee3,
    roughness: 0.78,
    metalness: 0.05,
  });

  const concreteDark = new THREE.MeshStandardMaterial({
    color: 0x86909c,
    roughness: 0.85,
    metalness: 0.08,
  });

  const basaltRock = new THREE.MeshStandardMaterial({
    color: 0x464d59,
    roughness: 0.86,
    metalness: 0.06,
  });

  const basaltDark = new THREE.MeshStandardMaterial({
    color: 0x323844,
    roughness: 0.9,
    metalness: 0.05,
  });

  const soil = new THREE.MeshStandardMaterial({
    color: 0x825b3f,
    roughness: 0.9,
  });

  const grass = new THREE.MeshStandardMaterial({
    color: 0x5aa654,
    roughness: 0.82,
  });

  const grassBright = new THREE.MeshStandardMaterial({
    color: 0x6ec065,
    roughness: 0.78,
  });

  const foliage = new THREE.MeshStandardMaterial({
    color: 0x2f7440,
    roughness: 0.78,
  });

  const pohutukawaBlossom = new THREE.MeshStandardMaterial({
    color: 0xe1283b,
    roughness: 0.68,
  });

  const steel = new THREE.MeshStandardMaterial({
    color: 0xc5ced8,
    roughness: 0.32,
    metalness: 0.76,
  });

  const steelDark = new THREE.MeshStandardMaterial({
    color: 0x353f4b,
    roughness: 0.45,
    metalness: 0.7,
  });

  const glassTower = registerEmissive(
    new THREE.MeshStandardMaterial({
      map: windowTex1,
      emissiveMap: windowTex1,
      emissive: new THREE.Color(0xffd27d),
      emissiveIntensity: 0.15,
      roughness: 0.18,
      metalness: 0.58,
    }),
    0.15,
    1.15
  );

  const glassTowerDark = registerEmissive(
    new THREE.MeshStandardMaterial({
      map: windowTex2,
      emissiveMap: windowTex2,
      emissive: new THREE.Color(0xffe099),
      emissiveIntensity: 0.15,
      roughness: 0.16,
      metalness: 0.68,
    }),
    0.15,
    1.25
  );

  const warmWindow = registerEmissive(
    new THREE.MeshStandardMaterial({
      color: 0xffe4a0,
      emissive: 0xffc857,
      emissiveIntensity: 0.25,
      roughness: 0.25,
      metalness: 0.1,
    }),
    0.25,
    1.7
  );

  const heritageBrick = new THREE.MeshStandardMaterial({
    map: heritageBrickTex,
    roughness: 0.85,
    metalness: 0.04,
  });

  const sandstone = new THREE.MeshStandardMaterial({
    color: 0xe7d6ba,
    roughness: 0.8,
  });

  const terracotta = new THREE.MeshStandardMaterial({
    color: 0xb4533c,
    roughness: 0.78,
  });

  const slateRoof = new THREE.MeshStandardMaterial({
    color: 0x3f4c5c,
    roughness: 0.75,
  });

  const woodBoardwalk = new THREE.MeshStandardMaterial({
    map: woodPlankTex,
    roughness: 0.85,
  });

  const road = new THREE.MeshStandardMaterial({
    map: createRoadTexture(2),
    roughness: 0.85,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const queenRoad = new THREE.MeshStandardMaterial({
    map: createRoadTexture(4),
    roughness: 0.85,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const sidewalk = new THREE.MeshStandardMaterial({
    map: pavingTex,
    roughness: 0.82,
  });

  const water = new THREE.MeshPhysicalMaterial({
    color: 0x1693b8,
    emissive: 0x063647,
    emissiveIntensity: 0.2,
    roughness: 0.12,
    metalness: 0.1,
    transparent: true,
    opacity: 0.84,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
  });

  return {
    concrete,
    concreteDark,
    basaltRock,
    basaltDark,
    soil,
    grass,
    grassBright,
    foliage,
    pohutukawaBlossom,
    steel,
    steelDark,
    glassTower,
    glassTowerDark,
    warmWindow,
    heritageBrick,
    sandstone,
    terracotta,
    slateRoof,
    woodBoardwalk,
    road,
    queenRoad,
    sidewalk,
    water,
    nightEmissives,
    registerEmissive,
  };
}

export function tagLandmark(obj, title, description) {
  obj.traverse((child) => {
    if (child.isMesh) {
      child.userData.landmark = { title, description };
    }
  });
}

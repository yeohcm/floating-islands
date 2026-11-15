import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { createPalette } from './materials.js';
import { createBaseIsland } from './island/baseIsland.js';
import { createSkyTower } from './landmarks/skyTower.js';
import { createBritomartAndTrain } from './landmarks/britomartAndTrain.js';
import { createHarbourAndBridge } from './landmarks/harbourAndBridge.js';
import { createCityDetails } from './landmarks/cityDetails.js';

const container = document.getElementById('canvas-container');
const trainStatusEl = document.getElementById('train-status');
const timeBadgeEl = document.getElementById('time-badge');
const tooltipEl = document.getElementById('landmark-tooltip');
const togglePlayBtn = document.getElementById('toggle-play');
const toggleFollowBtn = document.getElementById('toggle-follow');

// 1. Renderer & Scene (matching webgl_animation_keyframes PBR aesthetic)
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const DAY_BG = new THREE.Color(0xbfe3dd); // Classic Three.js Littlest Tokyo sky
const SUNSET_BG = new THREE.Color(0xf4b998);
const NIGHT_BG = new THREE.Color(0x0c162b);
scene.background = DAY_BG.clone();
scene.fog = new THREE.FogExp2(0xbfe3dd, 0.012);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.85;

// 2. Camera & Controls
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 150);
camera.position.set(17.5, 11.2, 18.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 2.25, 0);
controls.minDistance = 5;
controls.maxDistance = 38;
controls.maxPolarAngle = Math.PI * 0.62;
controls.update();

// 3. Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x5c7285, 0.75);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.1);
sunLight.position.set(12, 18, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 2;
sunLight.shadow.camera.far = 48;
sunLight.shadow.camera.left = -12;
sunLight.shadow.camera.right = 12;
sunLight.shadow.camera.top = 12;
sunLight.shadow.camera.bottom = -12;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// Soft bounce fill light from Waitemata Harbour side
const fillLight = new THREE.DirectionalLight(0x88d4f7, 0.45);
fillLight.position.set(-10, 6, -10);
scene.add(fillLight);

// 4. Starfield (visible in Night mode)
const starCount = 320;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 0.85 + 0.1);
  const r = 45 + Math.random() * 25;
  starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPos[i * 3 + 1] = r * Math.cos(phi);
  starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.22,
  transparent: true,
  opacity: 0,
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// 5. Build Floating Auckland Diorama Island
const palette = createPalette();
const islandRoot = new THREE.Group();
scene.add(islandRoot);

const baseIsland = createBaseIsland(palette);
const skyTower = createSkyTower(palette);
const trainSystem = createBritomartAndTrain(palette);
const harbour = createHarbourAndBridge(palette);
const cityDetails = createCityDetails(palette);

islandRoot.add(
  baseIsland.group,
  skyTower.group,
  trainSystem.group,
  harbour.group,
  cityDetails.group
);

// 6. Camera Presets & Smooth Transitions
const CAMERA_PRESETS = {
  overview: { pos: new THREE.Vector3(17.5, 11.2, 18.5), target: new THREE.Vector3(0, 2.25, 0) },
  skytower: { pos: new THREE.Vector3(6.5, 8.2, 7.5), target: new THREE.Vector3(-1.95, 4.8, -1.75) },
  train: { pos: new THREE.Vector3(4.2, 4.2, 10.6), target: new THREE.Vector3(0.5, 0.8, 4.6) },
  harbour: { pos: new THREE.Vector3(12.2, 4.6, 3.6), target: new THREE.Vector3(5.0, 0.6, -0.8) },
  mteden: { pos: new THREE.Vector3(-9.2, 4.8, 8.6), target: new THREE.Vector3(-4.2, 1.0, 2.0) },
};

let activeTransition = null;
let followTrain = false;

function goToPreset(key) {
  const preset = CAMERA_PRESETS[key];
  if (!preset) return;
  followTrain = false;
  toggleFollowBtn.classList.remove('active');
  activeTransition = {
    startPos: camera.position.clone(),
    startTarget: controls.target.clone(),
    endPos: preset.pos.clone(),
    endTarget: preset.target.clone(),
    progress: 0,
  };
}

document.querySelectorAll('.cam-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cam-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    goToPreset(btn.dataset.cam);
  });
});

// 7. Time-of-Day Atmosphere Modes
const ATMOSPHERES = {
  day: {
    bg: DAY_BG,
    fogDensity: 0.011,
    sunColor: new THREE.Color(0xfff7e6),
    sunIntensity: 2.1,
    sunPos: new THREE.Vector3(12, 18, 10),
    hemiIntensity: 0.75,
    envIntensity: 0.85,
    starOpacity: 0,
    exposure: 1.05,
    isNight: false,
    badge: '☀️ Morning',
  },
  sunset: {
    bg: SUNSET_BG,
    fogDensity: 0.013,
    sunColor: new THREE.Color(0xff9248),
    sunIntensity: 1.85,
    sunPos: new THREE.Vector3(-15, 7, 11),
    hemiIntensity: 0.55,
    envIntensity: 0.6,
    starOpacity: 0.25,
    exposure: 0.98,
    isNight: true,
    badge: '🌇 Sunset',
  },
  night: {
    bg: NIGHT_BG,
    fogDensity: 0.015,
    sunColor: new THREE.Color(0x6384c6),
    sunIntensity: 0.55,
    sunPos: new THREE.Vector3(-8, 16, -8),
    hemiIntensity: 0.28,
    envIntensity: 0.3,
    starOpacity: 0.9,
    exposure: 0.95,
    isNight: true,
    badge: '🌙 Harbour Night',
  },
};

let currentMode = 'day';
let targetAtmo = ATMOSPHERES.day;

document.querySelectorAll('.mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    targetAtmo = ATMOSPHERES[currentMode];
    timeBadgeEl.textContent = targetAtmo.badge;
    document.body.classList.toggle('night-mode', currentMode === 'night');
  });
});

// 8. Sky Tower Light Show Swatches
document.querySelectorAll('.swatch').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.swatch').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    skyTower.setLightTheme(btn.dataset.light);
  });
});

// 9. Play / Pause & Follow Train
let isPlaying = true;
togglePlayBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  trainSystem.action.paused = !isPlaying;
  togglePlayBtn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
  togglePlayBtn.classList.toggle('active', !isPlaying);
});

toggleFollowBtn.addEventListener('click', () => {
  followTrain = !followTrain;
  toggleFollowBtn.classList.toggle('active', followTrain);
  if (followTrain) {
    activeTransition = null;
    document.querySelectorAll('.cam-btn').forEach((b) => b.classList.remove('active'));
  }
});

// 10. Landmark Hover & Click Inspection
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredLandmark = null;

window.addEventListener('pointermove', (e) => {
  if (e.target !== renderer.domElement) {
    hoveredLandmark = null;
    tooltipEl.classList.add('hidden');
    document.body.style.cursor = 'default';
    return;
  }

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(islandRoot.children, true);
  const hit = hits.find((h) => h.object.userData?.landmark);

  if (hit) {
    const info = hit.object.userData.landmark;
    hoveredLandmark = info;
    tooltipEl.innerHTML = `<strong>${info.title}</strong><span>${info.description}</span>`;
    tooltipEl.style.left = `${Math.min(e.clientX + 16, window.innerWidth - 260)}px`;
    tooltipEl.style.top = `${Math.max(16, Math.min(e.clientY + 16, window.innerHeight - 195))}px`;
    tooltipEl.classList.remove('hidden');
    document.body.style.cursor = 'pointer';
  } else {
    hoveredLandmark = null;
    tooltipEl.classList.add('hidden');
    document.body.style.cursor = 'default';
  }
});

// Cancel camera transition if user manually grabs OrbitControls
controls.addEventListener('start', () => {
  activeTransition = null;
});

// 11. Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 12. Animation Loop
const clock = new THREE.Clock();
let simTime = 0;
const trainWorldPos = new THREE.Vector3();

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);

  if (isPlaying) {
    simTime += delta;
    trainSystem.mixer.update(delta);
  }

  // Gentle floating island hover
  islandRoot.position.y = Math.sin(simTime * 0.7) * 0.14;

  // Update animated Auckland elements
  const isNightLit = targetAtmo.isNight;
  baseIsland.update(simTime);
  skyTower.update(simTime, isNightLit);
  harbour.update(simTime, isNightLit);
  cityDetails.update(simTime);

  // Update AT Metro live status pill
  trainStatusEl.textContent = `🚆 AT Metro: ${trainSystem.getTrainStatus()}`;

  // Smooth atmosphere interpolation
  const lerpAlpha = 1 - Math.exp(-delta * 3.2);
  scene.background.lerp(targetAtmo.bg, lerpAlpha);
  scene.fog.color.lerp(targetAtmo.bg, lerpAlpha);
  scene.fog.density += (targetAtmo.fogDensity - scene.fog.density) * lerpAlpha;
  sunLight.color.lerp(targetAtmo.sunColor, lerpAlpha);
  sunLight.intensity += (targetAtmo.sunIntensity - sunLight.intensity) * lerpAlpha;
  sunLight.position.lerp(targetAtmo.sunPos, lerpAlpha);
  hemiLight.intensity += (targetAtmo.hemiIntensity - hemiLight.intensity) * lerpAlpha;
  scene.environmentIntensity += (targetAtmo.envIntensity - scene.environmentIntensity) * lerpAlpha;
  starMat.opacity += (targetAtmo.starOpacity - starMat.opacity) * lerpAlpha;
  renderer.toneMappingExposure += (targetAtmo.exposure - renderer.toneMappingExposure) * lerpAlpha;

  // Modulate emissive intensities for windows, signs & lamps
  palette.nightEmissives.forEach((mat) => {
    const goal = isNightLit ? mat.userData.nightIntensity : mat.userData.dayIntensity;
    mat.emissiveIntensity += (goal - mat.emissiveIntensity) * lerpAlpha;
  });

  // Camera transition or Follow Train mode
  if (activeTransition) {
    activeTransition.progress = Math.min(1, activeTransition.progress + delta * 1.45);
    const t = 1 - Math.pow(1 - activeTransition.progress, 3); // easeOutCubic
    camera.position.lerpVectors(activeTransition.startPos, activeTransition.endPos, t);
    controls.target.lerpVectors(activeTransition.startTarget, activeTransition.endTarget, t);
    if (activeTransition.progress >= 1) {
      activeTransition = null;
    }
  } else if (followTrain) {
    trainSystem.midCar.getWorldPosition(trainWorldPos);
    controls.target.lerp(trainWorldPos, 0.08);
  }

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

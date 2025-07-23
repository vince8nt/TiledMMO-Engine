import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Tileset, Chunk } from './terrain';
import { loadObject } from './objects';
import { Player } from './player';
import { ChunkManager } from './chunkManager';

// setup stats/GUI panel
const gui = new GUI();
const stats = new Stats();
document.body.appendChild(stats.dom);

// setup 3d renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // add canvas

// setup scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
// const camera = new THREE.OrthographicCamera(window.innerWidth / -40, window.innerWidth / 40, window.innerHeight / 40, window.innerHeight / -40, 0.1, 100);

// Create player
const player = new Player();

// Camera zoom settings
let cameraDistance = 24;
let cameraHeight = 32;
const minDistance = 8;
const maxDistance = 48;

// Initialize chunk system
const tileset = new Tileset();
await tileset.loadChunkData();

// Create chunk manager (will be initialized later)
let chunkManager: ChunkManager;

// add Building objects
const burnedTower = await loadObject('Burned_Tower');
burnedTower.position.set(5, 0, -7);
scene.add( burnedTower );

const sproutTower = await loadObject('Sprout_Tower');
sproutTower.position.set(-11, 0, -7);
scene.add( sproutTower );

// Add player to scene
scene.add(player.getMesh());

// Initialize chunk manager
chunkManager = new ChunkManager(tileset, scene);
await chunkManager.loadChunkMap();

// Start animation loop after everything is initialized
renderer.setAnimationLoop(animate);

// Add scroll wheel zoom
document.addEventListener('wheel', (event) => {
    const zoomSpeed = 0.1;
    const delta = event.deltaY > 0 ? 1 : -1;
    
    // Update camera distance
    cameraDistance += delta * zoomSpeed * cameraDistance;
    cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance));
    
    // Update camera height proportionally
    cameraHeight = cameraDistance * 1.33; // Maintain aspect ratio
});



// lighting
const ambient = new THREE.AmbientLight();
ambient.intensity = 0.2;
scene.add(ambient);
// const light = new THREE.PointLight(0xFFFFFF, 1, 0, .5);
const light = new THREE.DirectionalLight(0xFFFFFF);
light.position.set(0, 2, 8);
scene.add(light);


// camera.position.z = 24;
// camera.position.y = 20;

// renderer.render(scene, camera);
function animate() {
  stats.update();
  player.update();
  
  // Update camera to follow player
  const playerPos = player.getPosition();
  camera.position.set(playerPos.x, playerPos.y + cameraHeight, playerPos.z + cameraDistance);
  camera.lookAt(playerPos);
  
  // Update chunks based on player position (if chunk manager is initialized)
  if (chunkManager) {
    chunkManager.updateChunks(playerPos.x, playerPos.z);
  }
  
  renderer.render(scene, camera);
}

// auto resize window
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Player } from './player';
import { GameWorld } from './game_world';
import { testChunkConverter } from './chunkConverterTest';
import { loadObject } from './objects';

// setup stats/GUI panel
const stats = new Stats();
document.body.appendChild(stats.dom);

// setup GUI
const gui = new GUI();

// setup 3d renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; // Better color management
renderer.toneMapping = THREE.NoToneMapping; // Disable tone mapping globally
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

// Animation timing
let lastTime = 0;

// Test chunk converter
testChunkConverter();

// Initialize enhanced game world
const gameWorld = new GameWorld(scene);
await gameWorld.initialize();

// Add player to scene
scene.add(player.getMesh());

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

// Wireframe toggle
let wireframeMode = false;
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 't') {
        wireframeMode = !wireframeMode;
        toggleWireframe(scene, wireframeMode);
        console.log('Wireframe mode:', wireframeMode ? 'ON' : 'OFF');
    }
});

/**
 * Toggle wireframe mode for all meshes in the scene
 */
function toggleWireframe(scene: THREE.Scene, enabled: boolean): void {
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            if (object.material instanceof THREE.Material) {
                // Check if the material supports wireframe
                if ('wireframe' in object.material) {
                    (object.material as any).wireframe = enabled;
                }
            } else if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if ('wireframe' in material) {
                        (material as any).wireframe = enabled;
                    }
                });
            }
        }
    });
}



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

function animate(currentTime: number) {
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;
  
  stats.update();
  player.update();
  
  // Update camera to follow player
  const playerPos = player.getPosition();
  camera.position.set(playerPos.x, playerPos.y + cameraHeight, playerPos.z + cameraDistance);
  camera.lookAt(playerPos);
  
  // Update enhanced game world
  gameWorld.update(playerPos.x, playerPos.z, deltaTime);
  
  renderer.render(scene, camera);
}

// auto resize window
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/orbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Tileset, Chunk } from './terrain';
import { loadObject } from './objects';

// setup stats/GUI panel
const gui = new GUI();
const stats = new Stats();
document.body.appendChild(stats.dom);

// setup 3d renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement); // add canvas

// setup scene + controls
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
// const camera = new THREE.OrthographicCamera(window.innerWidth / -40, window.innerWidth / 40, window.innerHeight / 40, window.innerHeight / -40, 0.1, 100);
const controls = new OrbitControls(camera, renderer.domElement);

// chunks
const tileset = new Tileset();
await tileset.loadChunkData();

// add some chunk copies
const chunk1:Chunk = tileset.genChunkFromName('chunk1')!;
scene.add(chunk1);
const chunk2:Chunk = tileset.genChunkFromName('chunk2')!;
chunk2.position.x = -16;
scene.add(chunk2);
const chunk3:Chunk = tileset.genChunkFromName('chunk3')!;
chunk3.position.z = -16;
scene.add(chunk3);
const chunk4:Chunk = tileset.genChunkFromName('chunk3')!;
chunk4.position.x = -16;
chunk4.position.z = -16;
scene.add(chunk4);

// add Building objects
const burnedTower = await loadObject('Burned_Tower');
burnedTower.position.set(5, 0, -7);
scene.add( burnedTower );

const sproutTower = await loadObject('Sprout_Tower');
sproutTower.position.set(-11, 0, -7);
scene.add( sproutTower );



// lighting
const ambient = new THREE.AmbientLight();
ambient.intensity = 0.2;
scene.add(ambient);
// const light = new THREE.PointLight(0xFFFFFF, 1, 0, .5);
const light = new THREE.DirectionalLight(0xFFFFFF);
light.position.set(0, 2, 8);
scene.add(light);


camera.position.z = 24;
camera.position.y = 20;
controls.update();

// renderer.render(scene, camera);
function animate() {
  stats.update();
  controls.update();
  renderer.render(scene, camera);
}

// auto resize window
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


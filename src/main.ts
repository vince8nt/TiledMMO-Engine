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
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);

// chunks
const tileset = new Tileset();
let chunk_dat:any[] = [
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',

  2, 'grass', 12, 'mount_d', 2, 'grass',
  1, 'grass', 1, 'mount_l', [2, 1], 'grass', 2, 'none',
  [1, 1], 'grass', [6, 1], 'mount_d', [1, 1], 'grass', 1, 'mount_r', 1, 'grass',
  1, 'grass', 1, 'mount_l', [2, 1], 'grass', [1, 1], 'tree', 1, 'none',
    [1, 1], 'mount_l', [6, 2], 'grass', [1, 1], 'mount_r', 1, 'mount_r', 1, 'grass',
  1, 'grass', 1, 'mount_l', [5, 1], 'grass',
    [6, 1], 'mount_u', [1, 1], 'grass', 1, 'mount_r', 1, 'grass',
  2, 'grass', 12, 'mount_u', 2, 'grass',

  
  1, 'path_ul', 14, 'path_u', 1, 'path_ur',
  1, 'path_l', 14, 'path', 1, 'path_r',
  1, 'path_l', 14, 'path', 1, 'path_r',
  1, 'path_dl', 14, 'path_d', 1, 'path_dr',
  48, 'grass'
];

let chunk_dat2:any[] = [
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  16, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none',
  1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none', 1, 'tree', 1, 'none'
];

let chunk_dat3:any[] = [
  192, 'grass',
  2, 'grass', 1, 'path', 2, 'grass', 1, 'path', 2, 'grass', 1, 'path', 7, 'grass',
  48, 'grass'
];

// add some chunk copies
const chunk1:Chunk = tileset.gen_chunk(chunk_dat);
scene.add(chunk1);
const chunk2:Chunk = tileset.gen_chunk(chunk_dat2);
chunk2.position.x = -16;
scene.add(chunk2);
const chunk3:Chunk = tileset.gen_chunk(chunk_dat3);
chunk3.position.z = -16;
scene.add(chunk3);
const chunk4:Chunk = tileset.gen_chunk(chunk_dat3);
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
const light = new THREE.PointLight(0xFFFFFF, 1, 0, .5);
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


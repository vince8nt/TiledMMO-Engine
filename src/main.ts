import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/orbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Tileset, Chunk } from './terrain';

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

// cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x20FF40});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

/*
const plane_geometry = new THREE.PlaneGeometry(5, 5);
const plane_texture = new THREE.TextureLoader().load( "textures/terrain_tileset.png" );
plane_texture.magFilter = THREE.NearestFilter;
plane_texture.colorSpace = THREE.SRGBColorSpace;
plane_texture.offset.x = 0.25;
plane_texture.offset.y = 0.0;
plane_texture.repeat.x = 0.25;
plane_texture.repeat.y = 0.25;

// plane_texture.rotation = Math.PI / 2;
// plane_texture.offset.y += .25;

// plane_texture.rotation = Math.PI;
// plane_texture.offset.x += .25;
// plane_texture.offset.y += .25;

// plane_texture.rotation = -Math.PI / 2;
// plane_texture.offset.x += .25;

const plane_material = new THREE.MeshStandardMaterial({ map: plane_texture});
const plane = new THREE.Mesh(plane_geometry, plane_material);
plane.rotateX(-Math.PI / 2);
plane.position.setX(3);
scene.add(plane);*/

const tileset = new Tileset();
let chunk_dat:any[] = [128, 'grass', 16, 'path', 112, 'grass'];
const chunk:Chunk = tileset.gen_chunk(chunk_dat);
scene.add(chunk);

// lighting
const ambient = new THREE.AmbientLight();
ambient.intensity = 0.2;
scene.add(ambient);
const light = new THREE.PointLight(0xFFFFFF, 1, 0, .5);
light.position.set(5, 2, 5);
scene.add(light);

camera.position.z = 5;
camera.position.y = 5;
controls.update();

// renderer.render(scene, camera);
function animate() {
  cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
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


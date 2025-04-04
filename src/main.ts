import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/orbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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

// lighting
const ambient = new THREE.AmbientLight();
ambient.intensity = 0.5;
scene.add(ambient);
const light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(1, 2, 3);
scene.add(light);

camera.position.z = 5;
controls.update();

// renderer.render(scene, camera);
function animate() {
  // cube.rotation.x += 0.01;
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


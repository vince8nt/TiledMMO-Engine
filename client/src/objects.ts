import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

export async function loadObject(name:string) : Promise<THREE.Group> {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath("objects/" + name + "/");
    var materials = await mtlLoader.loadAsync(name + ".mtl");
    materials.preload();
    var objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath("objects/" + name + "/");
    var object = await objLoader.loadAsync(name + ".obj");
    object.traverse(function (child) {
        if (child instanceof THREE.Mesh && child.material.map) {
            child.material.map.magFilter = THREE.NearestFilter;
            child.material.map.minFilter = THREE.NearestFilter;
        }
    });
    object.scale.set(0.0625, 0.0625, 0.0625);
    return object;
}

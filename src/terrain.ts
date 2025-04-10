import * as THREE from 'three';

export class Terrain extends THREE.Mesh {
    width:number;
    height:number;
    color:number;
    terrain:THREE.Mesh;

    constructor (width:number, height:number) {
        super();
        this.width = width;
        this.height = height;
        this.color = 0x50a000;

        this.createTerrain();

    }

    createTerrain() {
        if (this.terrain) {
            this.terrain.geometry.dispose();
            // this.terrain.material.dispose();
            this.terrain.grassTexture.dispose();
            this.remove(this.terrain);
        }
        const texture = new THREE.TextureLoader().load("textures/overworld.png");
        texture.magFilter = THREE.NearestFilter; // makes pixilated, but creates aliasing
        texture.offset.set(0.125, 0.0);
        // texture.repeat.set(0.25, 0.125);
        // const terrainMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const terrainMaterial = new THREE.MeshStandardMaterial({ map: texture });
        const terrainGeometry = new THREE.PlaneGeometry(this.width, this.height);
        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.position.set(this.width / 2, 0, this.height / 2);
        this.terrain.grassTexture = texture;
        this.add(this.terrain);
    }
}
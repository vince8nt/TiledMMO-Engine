import * as THREE from 'three';

export class Player {
    private mesh: THREE.Mesh;
    private velocity: THREE.Vector3;
    private speed: number = 0.1;
    private keys: { [key: string]: boolean } = {};

    constructor() {
        // Create sphere geometry and material
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Set initial position
        this.mesh.position.set(0, 0.5, 0);
        
        // Initialize velocity
        this.velocity = new THREE.Vector3();
        
        // Set up keyboard event listeners
        this.setupControls();
    }

    private setupControls(): void {
        document.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
    }

    public update(): void {
        // Reset velocity
        this.velocity.set(0, 0, 0);

        // Handle WASD movement
        if (this.keys['w']) {
            this.velocity.z -= this.speed;
        }
        if (this.keys['s']) {
            this.velocity.z += this.speed;
        }
        if (this.keys['a']) {
            this.velocity.x -= this.speed;
        }
        if (this.keys['d']) {
            this.velocity.x += this.speed;
        }

        // Apply velocity to position
        this.mesh.position.add(this.velocity);
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public getPosition(): THREE.Vector3 {
        return this.mesh.position.clone();
    }

    public setPosition(x: number, y: number, z: number): void {
        this.mesh.position.set(x, y, z);
    }
} 
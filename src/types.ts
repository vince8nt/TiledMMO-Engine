import * as THREE from 'three';

// Enhanced chunk data structure
export interface ChunkData {
    terrain: string; // chunk name reference
    objects?: ObjectPlacement[];
    sprites?: SpriteData[];
}

// Object placement within a chunk
export interface ObjectPlacement {
    type: string; // object name (e.g., "Burned_Tower", "Sprout_Tower")
    x: number; // local position within chunk (0-15)
    y: number; // local position within chunk (0-15)
    rotation?: number; // rotation in radians
    scale?: number; // scale factor
}

// Sprite data for 2D elements
export interface SpriteData {
    type: string; // sprite type/name
    x: number; // local position within chunk
    y: number; // local position within chunk
    layer: number; // rendering layer (0 = background, 1 = mid, 2 = foreground)
    animation?: {
        frames: number;
        speed: number;
        loop: boolean;
    };
}

// Enhanced chunk instance that extends THREE.Group
export class EnhancedChunk extends THREE.Group {
    static size: number = 16;
    
    public terrainChunk: THREE.Group;
    public objects: Map<string, THREE.Group> = new Map();
    public sprites: Map<string, THREE.Sprite> = new Map();
    
    constructor() {
        super();
        this.terrainChunk = new THREE.Group();
        this.add(this.terrainChunk);
    }
    
    addObject(id: string, object: THREE.Group): void {
        this.objects.set(id, object);
        this.add(object);
    }
    
    addSprite(id: string, sprite: THREE.Sprite): void {
        this.sprites.set(id, sprite);
        this.add(sprite);
    }
    
    removeObject(id: string): void {
        const object = this.objects.get(id);
        if (object) {
            this.remove(object);
            this.objects.delete(id);
        }
    }
    
    removeSprite(id: string): void {
        const sprite = this.sprites.get(id);
        if (sprite) {
            this.remove(sprite);
            this.sprites.delete(id);
        }
    }
} 
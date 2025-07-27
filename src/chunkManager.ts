import * as THREE from 'three';
import { Tileset, Chunk } from './terrain';
import { EnhancedChunk, ChunkData, ObjectPlacement, SpriteData } from './types';
import { loadObject } from './objects';
import { SpriteManager } from './sprites';

export class EnhancedChunkManager {
    private tileset: Tileset;
    private chunkMap: ChunkData[][];
    private loadedChunks: Map<string, EnhancedChunk> = new Map();
    private scene: THREE.Scene;
    private chunkSize: number = 16;
    private renderDistance: number = 3;
    private spriteManager: SpriteManager;
    private objectCache: Map<string, THREE.Group> = new Map();

    constructor(tileset: Tileset, scene: THREE.Scene) {
        this.tileset = tileset;
        this.scene = scene;
        this.chunkMap = [];
        this.spriteManager = new SpriteManager();
    }

    async loadChunkMap(): Promise<void> {
        try {
            const response = await fetch('./map_data/chunk_map.json');
            this.chunkMap = await response.json();
            console.log('Chunk map loaded:', this.chunkMap.length, 'x', this.chunkMap[0]?.length);
        } catch (error) {
            console.error('Failed to load chunk map:', error);
        }
    }

    async loadSpriteTextures(): Promise<void> {
        // Load common sprite textures - only load if they exist
        try {
            await this.spriteManager.loadSpriteTexture('smoke', './textures/smoke.png');
        } catch (error) {
            console.warn('Smoke texture not found, skipping...');
        }
        
        try {
            await this.spriteManager.loadSpriteTexture('grass_patch', './textures/grass_patch.png');
        } catch (error) {
            console.warn('Grass patch texture not found, skipping...');
        }
        
        // Add more sprite textures as needed
        console.log('Sprite textures loaded successfully');
    }

    private getChunkKey(x: number, z: number): string {
        return `${x},${z}`;
    }

    private worldToChunkCoords(worldX: number, worldZ: number): { x: number, z: number } {
        return {
            x: Math.floor(worldX / this.chunkSize),
            z: Math.floor(worldZ / this.chunkSize)
        };
    }

    private async loadObject(objectType: string): Promise<THREE.Group> {
        // Check cache first
        if (this.objectCache.has(objectType)) {
            return this.objectCache.get(objectType)!.clone();
        }

        // Load and cache the object
        const object = await loadObject(objectType);
        this.objectCache.set(objectType, object);
        return object.clone();
    }

    private async createEnhancedChunk(chunkData: ChunkData, chunkX: number, chunkZ: number): Promise<EnhancedChunk> {
        const enhancedChunk = new EnhancedChunk();
        
        // Load terrain
        if (chunkData.terrain && chunkData.terrain !== 'empty_chunk') {
            const terrainChunk = this.tileset.genChunkFromName(chunkData.terrain);
            if (terrainChunk) {
                enhancedChunk.terrainChunk.add(terrainChunk);
            }
        }

        // Load objects
        if (chunkData.objects) {
            for (const objectPlacement of chunkData.objects) {
                try {
                    const object = await this.loadObject(objectPlacement.type);
                    object.position.set(
                        objectPlacement.x,
                        0,
                        objectPlacement.y
                    );
                    if (objectPlacement.rotation !== undefined) {
                        object.rotation.y = objectPlacement.rotation;
                    }
                    // Note: loadObject already applies scale 0.0625, so we don't need to scale again
                    // unless a different scale is specified
                    if (objectPlacement.scale !== undefined && objectPlacement.scale !== 0.0625) {
                        object.scale.setScalar(objectPlacement.scale);
                    }
                    
                    const objectId = `${objectPlacement.type}_${objectPlacement.x}_${objectPlacement.y}`;
                    enhancedChunk.addObject(objectId, object);
                } catch (error) {
                    console.error(`Failed to load object ${objectPlacement.type}:`, error);
                }
            }
        }

        // Load sprites
        if (chunkData.sprites) {
            for (const spriteData of chunkData.sprites) {
                const sprite = this.spriteManager.createSprite(spriteData);
                if (sprite) {
                    const spriteId = `${spriteData.type}_${spriteData.x}_${spriteData.y}`;
                    enhancedChunk.addSprite(spriteId, sprite);
                }
            }
        }

        // Position the chunk in world coordinates
        enhancedChunk.position.set(
            chunkX * this.chunkSize,
            0,
            chunkZ * this.chunkSize
        );

        return enhancedChunk;
    }

    private async loadChunk(chunkX: number, chunkZ: number): Promise<void> {
        const chunkKey = this.getChunkKey(chunkX, chunkZ);
        
        // Check if chunk is already loaded
        if (this.loadedChunks.has(chunkKey)) {
            return;
        }

        // Check if chunk coordinates are within the map bounds
        if (chunkZ < 0 || chunkZ >= this.chunkMap.length || 
            chunkX < 0 || chunkX >= this.chunkMap[0].length) {
            return;
        }

        // Get chunk data from map
        const chunkData = this.chunkMap[chunkZ][chunkX];
        if (!chunkData || chunkData.terrain === 'empty_chunk') {
            return;
        }

        // Create and load enhanced chunk
        const enhancedChunk = await this.createEnhancedChunk(chunkData, chunkX, chunkZ);
        this.scene.add(enhancedChunk);
        this.loadedChunks.set(chunkKey, enhancedChunk);
        console.log(`Loaded chunk at (${chunkX}, ${chunkZ}): ${chunkData.terrain}`);
    }

    private unloadChunk(chunkX: number, chunkZ: number): void {
        const chunkKey = this.getChunkKey(chunkX, chunkZ);
        const chunk = this.loadedChunks.get(chunkKey);
        
        if (chunk) {
            this.scene.remove(chunk);
            this.loadedChunks.delete(chunkKey);
            console.log(`Unloaded enhanced chunk at (${chunkX}, ${chunkZ})`);
        }
    }

    private lastPlayerChunk: { x: number, z: number } | null = null;

    public async updateChunks(playerX: number, playerZ: number): Promise<void> {
        const playerChunk = this.worldToChunkCoords(playerX, playerZ);
        
        // Only update if player moved to a different chunk
        if (this.lastPlayerChunk && 
            this.lastPlayerChunk.x === playerChunk.x && 
            this.lastPlayerChunk.z === playerChunk.z) {
            return;
        }
        
        this.lastPlayerChunk = playerChunk;
        
        // Calculate which chunks should be loaded
        const chunksToLoad = new Set<string>();
        for (let z = playerChunk.z - this.renderDistance; z <= playerChunk.z + this.renderDistance; z++) {
            for (let x = playerChunk.x - this.renderDistance; x <= playerChunk.x + this.renderDistance; x++) {
                chunksToLoad.add(this.getChunkKey(x, z));
            }
        }

        // Unload chunks that are too far away
        const chunksToUnload: string[] = [];
        for (const [chunkKey, chunk] of this.loadedChunks) {
            if (!chunksToLoad.has(chunkKey)) {
                chunksToUnload.push(chunkKey);
            }
        }

        // Unload chunks
        for (const chunkKey of chunksToUnload) {
            const [x, z] = chunkKey.split(',').map(Number);
            this.unloadChunk(x, z);
        }

        // Load new chunks
        for (const chunkKey of chunksToLoad) {
            const [x, z] = chunkKey.split(',').map(Number);
            await this.loadChunk(x, z);
        }
    }

    public updateAnimations(deltaTime: number): void {
        this.spriteManager.updateAnimations(deltaTime);
    }

    public getLoadedChunkCount(): number {
        return this.loadedChunks.size;
    }
} 
import * as THREE from 'three';
import { Tileset, Chunk } from './terrain';

export class ChunkManager {
    private tileset: Tileset;
    private chunkMap: string[][];
    private loadedChunks: Map<string, Chunk> = new Map();
    private scene: THREE.Scene;
    private chunkSize: number = 16;
    private renderDistance: number = 3; // How many chunks to load around player

    constructor(tileset: Tileset, scene: THREE.Scene) {
        this.tileset = tileset;
        this.scene = scene;
        this.chunkMap = [];
    }

    async loadChunkMap(): Promise<void> {
        try {
            const response = await fetch('./src/chunk_map.json');
            this.chunkMap = await response.json();
            console.log('Chunk map loaded:', this.chunkMap.length, 'x', this.chunkMap[0]?.length);
        } catch (error) {
            console.error('Failed to load chunk map:', error);
        }
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

    private loadChunk(chunkX: number, chunkZ: number): void {
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

        // Get chunk name from map
        const chunkName = this.chunkMap[chunkZ][chunkX];
        if (!chunkName || chunkName === 'empty_chunk') {
            return;
        }

        // Generate and load chunk
        const chunk = this.tileset.genChunkFromName(chunkName);
        if (chunk) {
            // Position the chunk in world coordinates
            chunk.position.set(
                chunkX * this.chunkSize,
                0,
                chunkZ * this.chunkSize
            );
            
            this.scene.add(chunk);
            this.loadedChunks.set(chunkKey, chunk);
            console.log(`Loaded chunk at (${chunkX}, ${chunkZ}): ${chunkName}`);
        }
    }

    private unloadChunk(chunkX: number, chunkZ: number): void {
        const chunkKey = this.getChunkKey(chunkX, chunkZ);
        const chunk = this.loadedChunks.get(chunkKey);
        
        if (chunk) {
            this.scene.remove(chunk);
            this.loadedChunks.delete(chunkKey);
            console.log(`Unloaded chunk at (${chunkX}, ${chunkZ})`);
        }
    }

    public updateChunks(playerX: number, playerZ: number): void {
        const playerChunk = this.worldToChunkCoords(playerX, playerZ);
        
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
            this.loadChunk(x, z);
        }
    }

    public getLoadedChunkCount(): number {
        return this.loadedChunks.size;
    }
} 
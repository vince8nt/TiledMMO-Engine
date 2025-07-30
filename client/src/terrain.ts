import * as THREE from 'three';
import { Tile, TreeTile, MountainTile, TilesetMap } from './tiles';
import { ChunkConverter, ChunkGrid } from './chunkConverter';



export class Chunk extends THREE.Group {
    static size:number = 16;
}

export class Tileset {
    private chunkData: any = null;

    constructor() {}

    async loadChunkData(): Promise<void> {
        try {
            const response = await fetch('./map_data/chunks.json');
            this.chunkData = await response.json();
            console.log('Chunk data loaded:', Object.keys(this.chunkData));
            console.log('TilesetMap size:', TilesetMap.size);
            console.log('Available tiles:', Array.from(TilesetMap.keys()));
        } catch (error) {
            console.error('Failed to load chunk data:', error);
        }
    }

    getChunkData(chunkName: string): any[] | null {
        if (!this.chunkData) {
            console.warn('Chunk data not loaded. Call loadChunkData() first.');
            return null;
        }
        return this.chunkData[chunkName] || null;
    }

    genChunkFromName(chunkName: string): Chunk | null {
        const chunkData = this.getChunkData(chunkName);
        if (!chunkData) {
            console.error(`Chunk data not found for: ${chunkName}`);
            return null;
        }
        // console.log(`Generating chunk: ${chunkName}`, chunkData);
        return this.gen_chunk(chunkData);
    }

    gen_chunk(tiles: any[]): Chunk {
        // Convert list format to grid format
        const grid = ChunkConverter.convertChunkToList(tiles);
        
        // Generate optimized meshes for connected regions
        const optimizedChunk = this.generateOptimizedChunk(grid);
        
        return optimizedChunk;
    }

    /**
     * Generate optimized chunk using connected regions
     */
    private generateOptimizedChunk(grid: ChunkGrid): Chunk {
        const chunk = new Chunk();
        
        // Find all unique tile types in the grid
        const tileTypes = new Set<string>();
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (grid.tiles[y][x] !== 'none') {
                    tileTypes.add(grid.tiles[y][x]);
                }
            }
        }
        
        // Process each tile type
        for (const tileType of tileTypes) {
            const regions = ChunkConverter.findConnectedRegions(grid, tileType);
            
            for (const region of regions) {
                const mesh = this.createRegionMesh(tileType, region, grid);
                if (mesh) {
                    chunk.add(mesh);
                }
            }
        }
        
        return chunk;
    }

    /**
     * Create a mesh for a connected region
     */
    private createRegionMesh(tileType: string, region: {x: number, y: number, width: number, height: number}, grid: ChunkGrid): THREE.Mesh | null {
        const TileClass = TilesetMap.get(tileType);
        if (!TileClass) {
            console.warn(`Tile type not found: ${tileType}`);
            return null;
        }
        
        // For now, create individual tiles for the region
        // TODO: Implement actual mesh merging for better performance
        const group = new THREE.Group();
        
        for (let y = region.y; y < region.y + region.height; y++) {
            for (let x = region.x; x < region.x + region.width; x++) {
                const height = grid.heights[y][x];
                const tile = TileClass.getTileAt(x, y, height);
                group.add(tile);
            }
        }
        
        // Convert group to single mesh if possible
        // For now, just return the group as a mesh
        return group as any;
    }
}



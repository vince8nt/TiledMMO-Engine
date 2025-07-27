import * as THREE from 'three';
import { Tile, TreeTile, MountainTile, TilesetMap } from './tiles';



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
        console.log(`Generating chunk: ${chunkName}`, chunkData);
        return this.gen_chunk(chunkData);
    }

    gen_chunk(tiles:any[]) : Chunk {
        const chunk = new Chunk();
        let c_ind = 0;
        let tilesAdded = 0;
        for (let i = 0; i < tiles.length; i += 2) {
            let reps = tiles[i];
            let height = 0;
            if (Array.isArray(reps)) {
                height = reps[1];
                reps = reps[0];
            }
            let tile = tiles[i+1];
            let T = TilesetMap.get(tile);
            for (let r = 0; r < reps; r++) {
                if (T) {
                    let x = c_ind % Chunk.size;
                    let y = Math.floor(c_ind / Chunk.size);
                    chunk.add(T.getTileAt(x, y, height));
                    tilesAdded++;
                } 
                c_ind++;
            }
        }
        console.log(`Chunk generated with ${tilesAdded} tiles, total positions: ${c_ind}`);
        return chunk;
    }
}



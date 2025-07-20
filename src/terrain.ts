import * as THREE from 'three';
import { Tile, TreeTile, MountainTile, TilesetMap } from './tiles';



export class Chunk extends THREE.Mesh {
    static size:number = 16;
}

export class Tileset {
    constructor() {}

    gen_chunk(tiles:any[]) : Chunk {
        const chunk = new Chunk();
        let c_ind = 0;
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
                } 
                c_ind++;
            }
        }
        return chunk;
    }
}



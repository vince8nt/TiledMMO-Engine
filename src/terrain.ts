import * as THREE from 'three';



export class Chunk extends THREE.Mesh {
    static size:number = 16;
}

class Tile {
    static tileset_size:number = 8.0;
    x;
    y;
    wid_x;
    wid_y;
    rep_x;
    rep_y;
    rot;
    constructor(x:number, y:number, // offset on tileset image
            wid_x:number, wid_y:number, // tile width on tile image
            rep_x:number, rep_y:number, // repetitions
            rot:number) { // rotation in units of PI/2
        this.x = x;
        this.y = y;
        this.wid_x = wid_x;
        this.wid_y = wid_y;
        this.rep_x = rep_x;
        this.rep_y = rep_y;
        this.rot = rot;
    }

    getTileAt(x:number, y:number) {
        const plane_geometry = new THREE.PlaneGeometry(1, 1);
        const plane_texture = new THREE.TextureLoader().load( "textures/terrain_tileset.png" );
        plane_texture.magFilter = THREE.NearestFilter;
        plane_texture.colorSpace = THREE.SRGBColorSpace;

        let tx = this.x + x % this.rep_x;
        let ty = this.y + y % this.rep_y;
        switch (this.rot) {
            case 0:
                break;
            case 1:
                plane_texture.rotation = Math.PI / 2;
                ty += 1;
                break;
            case 2:
                plane_texture.rotation = Math.PI;
                tx += 1;
                ty += 1;
                break;
            case 3:
                plane_texture.rotation = -Math.PI / 2;
                tx += 1;
                break;
            default:
        }
        
        plane_texture.offset.x = tx / Tile.tileset_size;
        plane_texture.offset.y = ty / Tile.tileset_size;
        plane_texture.repeat.x = 1.0 / Tile.tileset_size;
        plane_texture.repeat.y = 1.0 / Tile.tileset_size;

        const plane_material = new THREE.MeshPhongMaterial({ map: plane_texture});
        const plane = new THREE.Mesh(plane_geometry, plane_material);
        plane.rotateX(-Math.PI / 2);
        plane.position.setX(x);
        plane.position.setZ(y);
        return plane;
    }
}

export class Tileset {
    static map = new Map([
        ['grass', new Tile(0, 0, 1, 1, 2, 2, 0)],
        ['grass_tuft', new Tile(0, 3, 1, 1, 1, 1, 0)],

        ['path', new Tile(2, 6, 1, 1, 2, 2, 0)],

        ['path_u', new Tile(2, 4, 1, 1, 1, 2, 3)],
        ['path_d', new Tile(2, 4, 1, 1, 1, 2, 1)],
        ['path_l', new Tile(2, 4, 1, 1, 1, 2, 0)],
        ['path_r', new Tile(2, 4, 1, 1, 1, 2, 2)],

        ['path_ul', new Tile(3, 4, 1, 1, 1, 1, 0)],
        ['path_ur', new Tile(3, 4, 1, 1, 1, 1, 3)],
        ['path_dl', new Tile(3, 4, 1, 1, 1, 1, 1)],
        ['path_dr', new Tile(3, 4, 1, 1, 1, 1, 2)],

        ['path_lu', new Tile(3, 5, 1, 1, 1, 1, 0)],
        ['path_ru', new Tile(3, 5, 1, 1, 1, 1, 3)],
        ['path_ld', new Tile(3, 5, 1, 1, 1, 1, 1)],
        ['path_rd', new Tile(3, 5, 1, 1, 1, 1, 2)]
    ]);

    constructor() {

    }

    gen_chunk(tiles:any[]) : Chunk {
        const chunk = new Chunk();
        let c_ind = 0;
        for (let i = 0; i < tiles.length; i += 2) {
            let reps = tiles[i];
            let tile = tiles[i+1];
            for (let r = 0; r < reps; r++) {
                let x = c_ind % Chunk.size;
                let y = Math.floor(c_ind / Chunk.size);
                let T = Tileset.map.get(tile);
                if (T)
                    chunk.add(T.getTileAt(x, y));
                c_ind++;
            }
        }
        return chunk;
    }
}



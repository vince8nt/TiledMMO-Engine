import * as THREE from 'three';



export class Chunk extends THREE.Mesh {
    static size:number = 16;
}

class Tile {
    static tileset_size:number = 8.0;
    x;
    y;
    rep_x;
    rep_y;
    rot;
    trans;
    constructor(x:number, y:number, // offset on tileset image
            rep_x:number, rep_y:number, // repetitions
            rot:number, // rotation in units of PI/2
            trans:boolean) { // transparent
        this.x = x;
        this.y = y;
        this.rep_x = rep_x;
        this.rep_y = rep_y;
        this.rot = rot;
        this.trans = trans;
    }

    getTileAt(x:number, y:number, z:number) : THREE.Mesh {
        const plane_geometry = new THREE.PlaneGeometry(1, 1);
        const plane_texture = new THREE.TextureLoader().load( "textures/terrain_tileset.png" );
        plane_texture.magFilter = THREE.NearestFilter;
        plane_texture.minFilter = THREE.NearestFilter;
        plane_texture.colorSpace = THREE.SRGBColorSpace;

        let tx = this.x + x % this.rep_x;
        let ty = this.y + y % this.rep_y;
        switch (this.rot) {
            case 0:
                break;
            case 1:
                tx = this.x + y % this.rep_x;
                ty = this.y + x % this.rep_y;
                plane_texture.rotation = Math.PI / 2;
                ty += 1;
                break;
            case 2:
                plane_texture.rotation = Math.PI;
                tx += 1;
                ty += 1;
                break;
            case 3:
                tx = this.x + y % this.rep_x;
                ty = this.y + x % this.rep_y
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
        if (this.trans)
            plane_material.alphaTest = 1.0;
        const plane = new THREE.Mesh(plane_geometry, plane_material);
        plane.rotateX(-Math.PI / 2);
        plane.position.setX(x);
        plane.position.setZ(y);
        plane.position.setY(z);
        return plane;
    }
}

class TreeTile extends Tile {

    constructor() {
        super(4, 5, 4, 3, 0, true);
    }

    getTileAt(x:number, y:number, z:number) : THREE.Mesh {
        const mesh = new THREE.Mesh();

        const plane_geometry = new THREE.PlaneGeometry(4, 3);
        const plane_texture = new THREE.TextureLoader().load( "textures/terrain_tileset.png" );
        plane_texture.magFilter = THREE.NearestFilter;
        plane_texture.minFilter = THREE.NearestFilter;
        plane_texture.colorSpace = THREE.SRGBColorSpace;
        plane_texture.offset.x = this.x / Tile.tileset_size;
        plane_texture.offset.y = this.y / Tile.tileset_size;
        plane_texture.repeat.x = this.rep_x / Tile.tileset_size;
        plane_texture.repeat.y = this.rep_y / Tile.tileset_size;
        const plane_material = new THREE.MeshPhongMaterial({ map: plane_texture});
        if (this.trans)
            plane_material.alphaTest = 1.0;
        const plane = new THREE.Mesh(plane_geometry, plane_material);
        plane.rotateX(-Math.PI / 4);
        plane.position.setX(x + 0.5);
        plane.position.setZ(y - 0.8);
        plane.position.setY(1 + z);
        plane.rotateY(0.001);
        mesh.add(plane);

        let T = Tileset.map.get('stump_ul');
        if (T)
            mesh.add(T.getTileAt(x, y - 1, z));
        T = Tileset.map.get('stump_ur');
        if (T)
            mesh.add(T.getTileAt(x + 1, y - 1, z));
        T = Tileset.map.get('stump_dl');
        if (T)
            mesh.add(T.getTileAt(x, y, z));
        T = Tileset.map.get('stump_dr');
        if (T)
            mesh.add(T.getTileAt(x + 1, y, z));

        return mesh;
    }
}

class MountainTile extends Tile {
    corner_type:number;
    constructor(x:number, y:number, rep_x:number, rep_y:number,
        rot:number, corner_type:number) {
        super(x, y, rep_x, rep_y, rot, true);
        this.corner_type = corner_type;
    }

    getTileAt(x:number, y:number, z:number) : THREE.Mesh {
        const plane_geometry = new THREE.PlaneGeometry(1, Math.sqrt(2));
        const plane_texture = new THREE.TextureLoader().load( "textures/terrain_tileset.png" );
        plane_texture.magFilter = THREE.NearestFilter;
        plane_texture.minFilter = THREE.NearestFilter;
        plane_texture.colorSpace = THREE.SRGBColorSpace;

        let tx = this.x + x % this.rep_x;
        let ty = this.y + y % this.rep_y;

        plane_texture.offset.x = tx / Tile.tileset_size;
        plane_texture.offset.y = ty / Tile.tileset_size;
        plane_texture.repeat.x = 1.0 / Tile.tileset_size;
        plane_texture.repeat.y = 1.0 / Tile.tileset_size;

        const plane_material = new THREE.MeshPhongMaterial({ map: plane_texture});
        const plane = new THREE.Mesh(plane_geometry, plane_material);
        plane.rotateY(this.rot * Math.PI / 2);
        plane.rotateX(-Math.PI / 4);
        
        plane.position.setX(x);
        plane.position.setZ(y);
        plane.position.setY(0.5 + z);

        return plane;
    }
}


export class Tileset {
    static map = new Map([
        ['grass', new Tile(0, 6, 2, 2, 0, false)],
        ['grass_tuft', new Tile(0, 4, 1, 1, 0, false)],

        ['tree', new TreeTile()],
        ['stump_ul', new Tile(1, 5, 1, 1, 2, false)],
        ['stump_ur', new Tile(0, 5, 1, 1, 2, false)],
        ['stump_dl', new Tile(0, 5, 1, 1, 0, false)],
        ['stump_dr', new Tile(1, 5, 1, 1, 0, false)],

        ['mount_u', new MountainTile(2, 4, 2, 1, 0, 0)],
        ['mount_d', new MountainTile(2, 4, 2, 1, 2, 0)],
        ['mount_l', new MountainTile(2, 4, 2, 1, 3, 0)],
        ['mount_r', new MountainTile(2, 4, 2, 1, 1, 0)],

        ['path', new Tile(2, 0, 2, 2, 0, false)],

        ['path_u', new Tile(2, 2, 1, 2, 3, true)],
        ['path_d', new Tile(2, 2, 1, 2, 1, true)],
        ['path_l', new Tile(2, 2, 1, 2, 0, true)],
        ['path_r', new Tile(2, 2, 1, 2, 2, true)],

        ['path_ul', new Tile(3, 3, 1, 1, 0, true)],
        ['path_ur', new Tile(3, 3, 1, 1, 3, true)],
        ['path_dl', new Tile(3, 3, 1, 1, 1, true)],
        ['path_dr', new Tile(3, 3, 1, 1, 2, true)],

        ['path_lu', new Tile(3, 2, 1, 1, 0, true)],
        ['path_ru', new Tile(3, 2, 1, 1, 3, true)],
        ['path_ld', new Tile(3, 2, 1, 1, 1, true)],
        ['path_rd', new Tile(3, 2, 1, 1, 2, true)]
    ]);

    constructor() {

    }

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
            let T = Tileset.map.get(tile);
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



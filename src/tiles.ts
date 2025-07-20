import * as THREE from 'three';
import tilesData from './tiles.json';

// Type definitions for tile data
interface TileData {
    type: 'Tile';
    x: number;
    y: number;
    rep_x: number;
    rep_y: number;
    rot: number;
    trans: boolean;
}
interface TreeTileData {
    type: 'TreeTile';
}
interface MountainTileData {
    type: 'MountainTile';
    x: number;
    y: number;
    rep_x: number;
    rep_y: number;
    rot: number;
    corner_type: number;
}
type AnyTileData = TileData | TreeTileData | MountainTileData;

function isTileData(data: AnyTileData): data is TileData {
    return data.type === 'Tile';
}
function isTreeTileData(data: AnyTileData): data is TreeTileData {
    return data.type === 'TreeTile';
}
function isMountainTileData(data: AnyTileData): data is MountainTileData {
    return data.type === 'MountainTile';
}

export class Tile {
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

export class TreeTile extends Tile {
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

        // The Tileset.map reference will be updated later to avoid circular dependency
        return mesh;
    }
}

export class MountainTile extends Tile {
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

export function createTilesetMap() {
    const map = new Map();
    for (const [key, value] of Object.entries(tilesData as Record<string, AnyTileData>)) {
        if (isTileData(value)) {
            map.set(key, new Tile(value.x, value.y, value.rep_x, value.rep_y, value.rot, value.trans));
        } else if (isTreeTileData(value)) {
            map.set(key, new TreeTile());
        } else if (isMountainTileData(value)) {
            map.set(key, new MountainTile(value.x, value.y, value.rep_x, value.rep_y, value.rot, value.corner_type));
        }
    }
    return map;
}

export const TilesetMap = createTilesetMap();
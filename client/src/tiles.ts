import * as THREE from 'three';
import tilesData from '../map_data/tiles.json';
import { Tileset } from './terrain';
import { loadTileGeometry } from './objects';

// Tiles definitions
// // Has a base class tile (never instantiated)
// // Has multiple subclasses which are instantiated with extra data
// Tile subclasses define:
// // geometry data (including scale)
// // rotation enabled (will instantiate 4 copies of the tile rotated 90 degrees)
// // hitbox data
// // Number / size of textures required for instantiation
// // How these textures will be mapped to the geometry
// // depth write/depth test
// // geometry joinability (will only join tiles with the same instantiation parameters)
// // // direction dependent (modified by rotation)
// // // if joined, geometry will be stretched and texture will be repeated
// Doesn't include (specified during instantiation)
// // position on the map
// // tileset indicies used for textures
// // optional repetition of tileset indices
// // optional frame based animation for tiles that have multiple frames
// // material data

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

    async getTileAt(x:number, y:number, z:number) : Promise<THREE.Mesh> {
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

    async getTileAt(x:number, y:number, z:number) : Promise<THREE.Mesh> {
        const mesh = new THREE.Mesh();

        // Create tree as a billboard (sprite) for better performance and appearance
        const treeTexture = new THREE.TextureLoader().load("textures/terrain_tileset.png");
        treeTexture.magFilter = THREE.NearestFilter;
        treeTexture.minFilter = THREE.NearestFilter;
        treeTexture.colorSpace = THREE.SRGBColorSpace;
        
        // Set texture coordinates for the tree sprite
        treeTexture.offset.x = this.x / Tile.tileset_size;
        treeTexture.offset.y = this.y / Tile.tileset_size;
        treeTexture.repeat.x = this.rep_x / Tile.tileset_size;
        treeTexture.repeat.y = this.rep_y / Tile.tileset_size;

        // Create sprite material with proper settings
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: treeTexture,
            transparent: false,
            sizeAttenuation: true,
            depthTest: true,
            depthWrite: true,
            fog: false,
            color: 0xB0B0B0
        });
        
        spriteMaterial.toneMapped = false;
        spriteMaterial.alphaTest = 0.1; // For transparent areas

        // Create the tree sprite
        const treeSprite = new THREE.Sprite(spriteMaterial);
        treeSprite.position.set(x + 0.5, 0.75 + z, y - 1.0625); // Position above ground
        treeSprite.scale.set(4, 3, 1); // Scale to appropriate size
        mesh.add(treeSprite);

        // Add stump tiles at the base (these can stay as regular tiles)
        let T = TilesetMap.get('stump_ul');
        if (T)
            mesh.add(await T.getTileAt(x, y - 1, z));
        T = TilesetMap.get('stump_ur');
        if (T)
            mesh.add(await T.getTileAt(x + 1, y - 1, z));
        T = TilesetMap.get('stump_dl');
        if (T)
            mesh.add(await T.getTileAt(x, y, z));
        T = TilesetMap.get('stump_dr');
        if (T)
            mesh.add(await T.getTileAt(x + 1, y, z));

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

    async getTileAt(x:number, y:number, z:number) : Promise<THREE.Mesh> {
        let geometry: THREE.BufferGeometry;
        
        if (this.corner_type == 1) {
            geometry = await loadTileGeometry('Mountain_Corner');
        } else {
            geometry = await loadTileGeometry('Mountain_Tile');
        }
        
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
        const plane = new THREE.Mesh(geometry, plane_material);
        plane.rotateY(this.rot * Math.PI / 2);
        
        plane.position.setX(x);
        plane.position.setZ(y);
        plane.position.setY(z);

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
export interface ChunkGrid {
    tiles: string[][];  // 16x16 grid of tile types
    heights: number[][]; // 16x16 grid of heights
}

export class ChunkConverter {
    private static readonly CHUNK_SIZE = 16;

    /**
     * Convert chunk data from list format to 16x16 grid format
     * @param chunkData - Array of [count, tileType] pairs
     * @returns 16x16 grid of tiles and heights
     */
    static convertChunkToList(chunkData: any[]): ChunkGrid {
        const tiles: string[][] = Array(this.CHUNK_SIZE).fill(null).map(() => Array(this.CHUNK_SIZE).fill('none'));
        const heights: number[][] = Array(this.CHUNK_SIZE).fill(null).map(() => Array(this.CHUNK_SIZE).fill(0));
        
        let index = 0;
        
        for (let i = 0; i < chunkData.length; i += 2) {
            let count = chunkData[i];
            let height = 0;
            
            // Handle array format [count, height]
            if (Array.isArray(count)) {
                height = count[1];
                count = count[0];
            }
            
            const tileType = chunkData[i + 1];
            
            // Place tiles in the grid
            for (let j = 0; j < count; j++) {
                if (index >= this.CHUNK_SIZE * this.CHUNK_SIZE) {
                    console.warn(`Chunk data overflow at index ${index}`);
                    break;
                }
                
                const x = index % this.CHUNK_SIZE;
                const y = Math.floor(index / this.CHUNK_SIZE);
                
                tiles[y][x] = tileType;
                heights[y][x] = height;
                index++;
            }
        }
        
        return { tiles, heights };
    }

    /**
     * Convert grid format back to list format (for compatibility)
     * @param grid - 16x16 grid of tiles and heights
     * @returns Array in the original [count, tileType] format
     */
    static convertGridToList(grid: ChunkGrid): any[] {
        const result: any[] = [];
        let currentTile = grid.tiles[0][0];
        let currentHeight = grid.heights[0][0];
        let count = 0;
        
        for (let y = 0; y < this.CHUNK_SIZE; y++) {
            for (let x = 0; x < this.CHUNK_SIZE; x++) {
                const tile = grid.tiles[y][x];
                const height = grid.heights[y][x];
                
                if (tile === currentTile && height === currentHeight) {
                    count++;
                } else {
                    // Add the previous run
                    if (currentHeight !== 0) {
                        result.push([count, currentHeight], currentTile);
                    } else {
                        result.push(count, currentTile);
                    }
                    
                    // Start new run
                    currentTile = tile;
                    currentHeight = height;
                    count = 1;
                }
            }
        }
        
        // Add the last run
        if (count > 0) {
            if (currentHeight !== 0) {
                result.push([count, currentHeight], currentTile);
            } else {
                result.push(count, currentTile);
            }
        }
        
        return result;
    }

    /**
     * Get tile at specific coordinates in the grid
     */
    static getTileAt(grid: ChunkGrid, x: number, y: number): { type: string, height: number } {
        if (x < 0 || x >= this.CHUNK_SIZE || y < 0 || y >= this.CHUNK_SIZE) {
            return { type: 'none', height: 0 };
        }
        return {
            type: grid.tiles[y][x],
            height: grid.heights[y][x]
        };
    }

    /**
     * Set tile at specific coordinates in the grid
     */
    static setTileAt(grid: ChunkGrid, x: number, y: number, type: string, height: number = 0): void {
        if (x < 0 || x >= this.CHUNK_SIZE || y < 0 || y >= this.CHUNK_SIZE) {
            console.warn(`Attempted to set tile outside grid bounds: (${x}, ${y})`);
            return;
        }
        grid.tiles[y][x] = type;
        grid.heights[y][x] = height;
    }

    /**
     * Find connected regions of the same tile type in the grid
     * @param grid - 16x16 grid of tiles
     * @param tileType - Type of tile to find regions for
     * @returns Array of rectangular regions
     */
    static findConnectedRegions(grid: ChunkGrid, tileType: string): Array<{x: number, y: number, width: number, height: number}> {
        const regions: Array<{x: number, y: number, width: number, height: number}> = [];
        const visited: boolean[][] = Array(this.CHUNK_SIZE).fill(null).map(() => Array(this.CHUNK_SIZE).fill(false));
        
        for (let y = 0; y < this.CHUNK_SIZE; y++) {
            for (let x = 0; x < this.CHUNK_SIZE; x++) {
                if (visited[y][x] || grid.tiles[y][x] !== tileType) {
                    continue;
                }
                
                // Find the largest rectangle starting at this position
                const region = this.expandRegion(grid, x, y, tileType, visited);
                regions.push(region);
            }
        }
        
        return regions;
    }

    /**
     * Expand a region greedily (down first, then right)
     */
    private static expandRegion(
        grid: ChunkGrid, 
        startX: number, 
        startY: number, 
        tileType: string, 
        visited: boolean[][]
    ): {x: number, y: number, width: number, height: number} {
        // Find maximum height by expanding down
        let maxHeight = 0;
        for (let y = startY; y < this.CHUNK_SIZE; y++) {
            if (grid.tiles[y][startX] !== tileType) break;
            maxHeight = y - startY + 1;
        }
        
        // Find maximum width by expanding right for each row
        let maxWidth = 0;
        for (let y = startY; y < startY + maxHeight; y++) {
            let width = 0;
            for (let x = startX; x < this.CHUNK_SIZE; x++) {
                if (grid.tiles[y][x] !== tileType) break;
                width = x - startX + 1;
            }
            maxWidth = Math.max(maxWidth, width);
        }
        
        // Mark all tiles in this region as visited
        for (let y = startY; y < startY + maxHeight; y++) {
            for (let x = startX; x < startX + maxWidth; x++) {
                visited[y][x] = true;
            }
        }
        
        return {
            x: startX,
            y: startY,
            width: maxWidth,
            height: maxHeight
        };
    }

    /**
     * Print the grid for debugging
     */
    static printGrid(grid: ChunkGrid): void {
        console.log('Chunk Grid:');
        for (let y = 0; y < this.CHUNK_SIZE; y++) {
            let row = '';
            for (let x = 0; x < this.CHUNK_SIZE; x++) {
                const tile = grid.tiles[y][x];
                const height = grid.heights[y][x];
                const symbol = this.getTileSymbol(tile, height);
                row += symbol + ' ';
            }
            console.log(row);
        }
    }

    /**
     * Get a symbol for displaying tiles in console
     */
    private static getTileSymbol(tile: string, height: number): string {
        switch (tile) {
            case 'grass': return height > 0 ? 'G' + height : 'g';
            case 'tree': return 'T';
            case 'path': return 'P';
            case 'path_u': return 'U';
            case 'path_d': return 'D';
            case 'path_l': return 'L';
            case 'path_r': return 'R';
            case 'path_ul': return '1';
            case 'path_ur': return '2';
            case 'path_dl': return '3';
            case 'path_dr': return '4';
            case 'mount_u': return 'M';
            case 'mount_d': return 'm';
            case 'mount_l': return '<';
            case 'mount_r': return '>';
            case 'none': return '.';
            default: return '?';
        }
    }
} 
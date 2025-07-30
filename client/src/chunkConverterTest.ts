import { ChunkConverter, ChunkGrid } from './chunkConverter';

// Test data from chunks.json
const testChunkData = [
    16, "none",
    1, "tree", 1, "none", 1, "tree", 1, "none", 1, "tree", 1, "none", 1, "tree", 1, "none",
    1, "tree", 1, "none", 1, "tree", 1, "none", 1, "tree", 1, "none", 1, "tree", 1, "none",
    16, "none",
    1, "tree", 1, "none", 1, "tree", 1, "none", 1, "tree", 1, "none", 1, "tree", 1, "none",
    1, "tree", 1, "none", 1, "tree", 1, "none", 1, "tree", 1, "none", 1, "tree", 1, "none",
    2, "grass", 12, "mount_d", 2, "grass",
    1, "grass", 1, "mount_l", [2, 1], "grass", 2, "none",
    [1, 1], "grass", [6, 1], "mount_d", [1, 1], "grass", 1, "mount_r", 1, "grass",
    1, "grass", 1, "mount_l", [2, 1], "grass", [1, 1], "tree", 1, "none",
    [1, 1], "mount_l", [6, 2], "grass", [1, 1], "mount_r", 1, "mount_r", 1, "grass",
    1, "grass", 1, "mount_l", [5, 1], "grass",
    [6, 1], "mount_u", [1, 1], "grass", 1, "mount_r", 1, "grass",
    2, "grass", 12, "mount_u", 2, "grass",
    1, "path_ul", 14, "path_u", 1, "path_ur",
    1, "path_l", 14, "path", 1, "path_r",
    1, "path_l", 14, "path", 1, "path_r",
    1, "path_dl", 14, "path_d", 1, "path_dr",
    48, "grass"
];

export function testChunkConverter(): void {
    console.log('Testing ChunkConverter...');
    
    // Convert to grid
    const grid = ChunkConverter.convertChunkToList(testChunkData);
    
    // Print the grid
    ChunkConverter.printGrid(grid);
    
    // Test finding connected regions
    console.log('\nFinding connected regions for grass:');
    const grassRegions = ChunkConverter.findConnectedRegions(grid, 'grass');
    console.log(`Found ${grassRegions.length} grass regions:`);
    grassRegions.forEach((region, index) => {
        console.log(`  Region ${index + 1}: (${region.x}, ${region.y}) size ${region.width}x${region.height}`);
    });
    
    // Test finding connected regions for trees
    console.log('\nFinding connected regions for trees:');
    const treeRegions = ChunkConverter.findConnectedRegions(grid, 'tree');
    console.log(`Found ${treeRegions.length} tree regions:`);
    treeRegions.forEach((region, index) => {
        console.log(`  Region ${index + 1}: (${region.x}, ${region.y}) size ${region.width}x${region.height}`);
    });
    
    // Test converting back to list format
    console.log('\nConverting back to list format...');
    const convertedBack = ChunkConverter.convertGridToList(grid);
    console.log('Converted back data length:', convertedBack.length);
    console.log('First 20 elements:', convertedBack.slice(0, 20));
    
    // Verify the conversion is correct
    console.log('\nVerification:');
    console.log('Original data length:', testChunkData.length);
    console.log('Converted back length:', convertedBack.length);
    
    // Check if the data is equivalent (simplified check)
    const originalSum = testChunkData.reduce((sum: number, val: any, index: number) => {
        if (index % 2 === 0) { // Count values
            const count = Array.isArray(val) ? val[0] : val;
            return sum + (typeof count === 'number' ? count : 0);
        }
        return sum;
    }, 0);
    
    const convertedSum = convertedBack.reduce((sum: number, val: any, index: number) => {
        if (index % 2 === 0) { // Count values
            const count = Array.isArray(val) ? val[0] : val;
            return sum + (typeof count === 'number' ? count : 0);
        }
        return sum;
    }, 0);
    
    console.log('Original total tiles:', originalSum);
    console.log('Converted total tiles:', convertedSum);
    console.log('Conversion successful:', originalSum === convertedSum);
} 
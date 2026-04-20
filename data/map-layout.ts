export interface TileData {
  row: number;
  col: number;
  type: string;
  level: number;
}

const GRID_SIZE = 15;

// Simple seeded random function
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const initialMapTiles: TileData[] = (() => {
  const initialTiles: TileData[] = [];
  const mainCitySet = new Set(['6,5', '7,5', '5,6', '6,6', '7,6', '6,7', '7,7']);
  
  // 1. Generate all required resource combinations (4 types * 9 levels, each 2-3 times)
  const resourceTypes = ['木材', '铁矿', '石头', '粮食'];
  const resourcePool: { type: string, level: number }[] = [];
  let poolSeed = 54321; // Separate seed for pool generation
  for (const type of resourceTypes) {
    for (let level = 1; level <= 9; level++) {
      // Add 2 to 3 instances of each combination
      const count = Math.floor(seededRandom(poolSeed++) * 2) + 2; // 2 or 3
      for (let k = 0; k < count; k++) {
        resourcePool.push({ type, level });
      }
    }
  }

  // 2. Collect all available coordinates (excluding main city)
  const availableCoords: { row: number, col: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const key = `${row},${col}`;
      if (!mainCitySet.has(key)) {
        availableCoords.push({ row, col });
      }
    }
  }

  // 3. Shuffle available coordinates using seeded random for determinism
  let seed = 12345;
  function seededShuffle<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed++) * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  seededShuffle(availableCoords);

  // 4. Assign resources to the shuffled coordinates
  const resourceMap = new Map<string, { type: string, level: number }>();
  for (let i = 0; i < resourcePool.length; i++) {
    const coord = availableCoords[i];
    if (coord) {
      resourceMap.set(`${coord.row},${coord.col}`, resourcePool[i]);
    }
  }

  // 5. Build the final tile list
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const key = `${row},${col}`;
      if (mainCitySet.has(key)) {
        initialTiles.push({ row, col, type: '主城', level: 1 });
      } else {
        const resource = resourceMap.get(key);
        if (resource) {
          initialTiles.push({ row, col, type: resource.type, level: resource.level });
        } else {
          initialTiles.push({ row, col, type: '空地', level: 1 });
        }
      }
    }
  }

  return initialTiles;
})();

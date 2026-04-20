export interface Point {
  row: number;
  col: number;
}

/**
 * Calculates a simple Manhattan path between two points on a grid.
 * This avoids complex A* calculations and guarantees O(N) performance,
 * preventing any infinite loops or UI freezes during path preview.
 */
export function calculatePath(start: Point, end: Point, gridSize: number = 20): Point[] {
  if (!start || !end || typeof start.row !== 'number' || typeof start.col !== 'number' || typeof end.row !== 'number' || typeof end.col !== 'number') {
    console.error('Invalid start or end coordinates', start, end);
    return [];
  }

  const path: Point[] = [];
  let currentRow = start.row;
  let currentCol = start.col;

  // Add the starting point
  path.push({ row: currentRow, col: currentCol });

  // Simple L-shape path: move along rows first, then columns
  while (currentRow !== end.row) {
    currentRow += currentRow < end.row ? 1 : -1;
    // Ensure we don't go out of bounds (just in case)
    if (currentRow < 0 || currentRow >= gridSize) break;
    path.push({ row: currentRow, col: currentCol });
  }

  while (currentCol !== end.col) {
    currentCol += currentCol < end.col ? 1 : -1;
    // Ensure we don't go out of bounds
    if (currentCol < 0 || currentCol >= gridSize) break;
    path.push({ row: currentRow, col: currentCol });
  }

  return path;
}

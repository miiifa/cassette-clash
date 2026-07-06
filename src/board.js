export const WIDTH = 7;
export const HEIGHT = 5;

export const GOALS = {
  p1: "3,0",
  p2: "3,4"
};

export const SPAWNS = {
  p1: ["0,4", "6,4"],
  p2: ["0,0", "6,0"]
};

export function key(x, y) {
  return `${x},${y}`;
}

export function parseKey(cellKey) {
  const [x, y] = cellKey.split(",").map(Number);
  return { x, y };
}

export function isPlayable(x, y) {
  const isOuterRing = x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1;
  const isInnerSquare = x >= 2 && x <= 4 && y >= 1 && y <= 3;
  return isOuterRing || isInnerSquare;
}

export function allCells() {
  const cells = [];
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      cells.push({ x, y, key: key(x, y), playable: isPlayable(x, y) });
    }
  }
  return cells;
}

export function neighbors(cellKey) {
  const { x, y } = parseKey(cellKey);
  const candidates = [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1]
  ];
  return candidates
    .filter(([cx, cy]) => cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && isPlayable(cx, cy))
    .map(([cx, cy]) => key(cx, cy));
}

export function reachableCells(start, mp, occupiedKeys) {
  const visited = new Map([[start, 0]]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift();
    const distance = visited.get(current);
    if (distance >= mp) continue;

    for (const next of neighbors(current)) {
      if (occupiedKeys.has(next)) continue;
      if (visited.has(next)) continue;
      visited.set(next, distance + 1);
      queue.push(next);
    }
  }

  visited.delete(start);
  return [...visited.keys()];
}

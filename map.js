// === HEX GRID & MAZE GENERATION ===

const HEX_SIZE = 35;
let GRID_RADIUS = 3; 
let hexGrid = new Map();
let exitPos = {q: 0, r: 0};
let canvas, ctx; // Will be initialized in game.js

function axialToPixel({q, r}) {
    if (!canvas) return { x: 0, y: 0 };
    const x = HEX_SIZE * (1.5 * q);
    const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    return { x: x + canvas.width / 2, y: y + canvas.height / 2 };
}

function getHexNeighbors({q, r}) {
    return [ 
        {q: q + 1, r: r}, {q: q - 1, r: r}, 
        {q: q, r: r + 1}, {q: q, r: r - 1}, 
        {q: q + 1, r: r - 1}, {q: q - 1, r: r + 1} 
    ];
}

function hexDistance(a, b) {
    return (Math.abs(a.q - b.q) 
          + Math.abs(a.q + a.r - b.q - b.r) 
          + Math.abs(a.r - b.r)) / 2;
}

function generateMaze() {
    hexGrid.clear();
    const currentGridRadius = Math.min(GRID_RADIUS + Math.floor(level / 3), 7);
    
    const allHexes = [];
    for (let q = -currentGridRadius; q <= currentGridRadius; q++) {
        for (let r = -currentGridRadius; r <= currentGridRadius; r++) {
            if (Math.abs(q + r) <= currentGridRadius) {
                allHexes.push({q, r});
            }
        }
    }
    
    const maze = new Set();
    const start = allHexes[Math.floor(Math.random() * allHexes.length)];
    maze.add(`${start.q},${start.r}`);
    
    const walls = new Set(getHexNeighbors(start)
        .filter(n => allHexes.some(h => h.q === n.q && h.r === n.r))
        .map(n => `${n.q},${n.r}`)
    );

    const mazeDensity = Math.min(0.4 + level * 0.03, 0.7);

    while (walls.size > 0) {
        const wallArray = Array.from(walls);
        const randomWallKey = wallArray[Math.floor(Math.random() * wallArray.length)];
        walls.delete(randomWallKey);
        
        const [q, r] = randomWallKey.split(',').map(Number);
        
        const neighbors = getHexNeighbors({q, r});
        const mazeNeighbors = neighbors.filter(n => maze.has(`${n.q},${n.r}`));
        
        if (mazeNeighbors.length === 1 && Math.random() < mazeDensity) {
            maze.add(randomWallKey);
            neighbors.forEach(neighbor => {
                if (allHexes.some(h => h.q === neighbor.q && h.r === neighbor.r) && !maze.has(`${neighbor.q},${neighbor.r}`)) {
                    walls.add(`${neighbor.q},${neighbor.r}`);
                }
            });
        }
    }
    
    while (maze.size < Math.max(8, currentGridRadius * 2)) {
        const remainingHexes = allHexes.filter(hex => !maze.has(`${hex.q},${hex.r}`));
        if (remainingHexes.length === 0) break;
        const randomHex = remainingHexes[Math.floor(Math.random() * remainingHexes.length)];
        maze.add(`${randomHex.q},${randomHex.r}`);
    }

    const mazeArray = Array.from(maze).map(key => {
        const [q, r] = key.split(',').map(Number);
        return {q, r};
    });

    mazeArray.forEach(hex => {
        let type = 'normal';
        if (yellowNodeChance && Math.random() < 0.15) {
            type = 'data';
        }
        hexGrid.set(`${hex.q},${hex.r}`, {
            coords: hex,
            expression: '',
            answer: 0,
            type: type,
            collected: false
        });
    });

    playerPos = mazeArray[Math.floor(Math.random() * mazeArray.length)];

    let bestExit = playerPos;
    let maxDistance = 0;
    mazeArray.forEach(hex => {
        const distance = hexDistance(playerPos, hex);
        if (distance > maxDistance) {
            maxDistance = distance;
            bestExit = hex;
        }
    });
    exitPos = bestExit;

    const exitHexData = hexGrid.get(`${exitPos.q},${exitPos.r}`);
    if (exitHexData) {
        exitHexData.type = 'exit';
    }

    updateValidMoves();
}

// map.js - Handles hex grid logic and procedural maze generation.

const HEX_SIZE = 35; // Defines the visual size of a hex.
const BASE_GRID_RADIUS = 3; // The starting radius of the map.

export function axialToPixel({ q, r }) {
    const x = HEX_SIZE * (1.5 * q);
    const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    return { x, y };
}

function hexDistance(a, b) {
    const dQ = Math.abs(a.q - b.q);
    const dR = Math.abs(a.r - b.r);
    const dS = Math.abs(a.q + a.r - (b.q + b.r));
    return Math.max(dQ, dR, dS);
}

export function getHexNeighbors({ q, r }) {
    return [
        { q: q + 1, r: r }, { q: q - 1, r: r },
        { q: q, r: r + 1 }, { q: q, r: r - 1 },
        { q: q + 1, r: r - 1 }, { q: q - 1, r: r + 1 }
    ];
}

/**
 * Generates a new maze, modifying the gameState object directly.
 * @param {object} gameState The central game state object from main.js.
 */
export function generateMaze(gameState) {
    const { hexGrid, level } = gameState;

    hexGrid.clear();
    
    const finalLevel = 6;
    let currentGridRadius;

    if (level === finalLevel) {
        // Updated to make the final level absurdly large.
        currentGridRadius = 25;
    } else {
        currentGridRadius = Math.min(BASE_GRID_RADIUS + Math.floor(level / 3), 7);
    }
    
    const allHexes = [];
    for (let q = -currentGridRadius; q <= currentGridRadius; q++) {
        for (let r = Math.max(-currentGridRadius, -q - currentGridRadius); r <= Math.min(currentGridRadius, -q + currentGridRadius); r++) {
            allHexes.push({ q, r });
        }
    }
    
    const mazeKeys = new Set();
    const startNode = allHexes[Math.floor(Math.random() * allHexes.length)];
    mazeKeys.add(`${startNode.q},${startNode.r}`);
    
    const wallList = new Set(
        getHexNeighbors(startNode)
            .filter(n => allHexes.some(h => h.q === n.q && h.r === n.r))
            .map(n => `${n.q},${n.r}`)
    );

    while (wallList.size > 0) {
        const wallArray = Array.from(wallList);
        const randomWallKey = wallArray[Math.floor(Math.random() * wallArray.length)];
        wallList.delete(randomWallKey);
        
        const [q, r] = randomWallKey.split(',').map(Number);
        
        const neighbors = getHexNeighbors({ q, r });
        const mazeNeighbors = neighbors.filter(n => mazeKeys.has(`${n.q},${n.r}`));
        
        if (mazeNeighbors.length === 1) {
            mazeKeys.add(randomWallKey);
            neighbors.forEach(neighbor => {
                const nKey = `${neighbor.q},${neighbor.r}`;
                if (allHexes.some(h => `${h.q},${h.r}` === nKey) && !mazeKeys.has(nKey)) {
                    wallList.add(nKey);
                }
            });
        }
    }
    
    const mazeCoords = Array.from(mazeKeys).map(key => {
        const [q, r] = key.split(',').map(Number);
        return { q, r };
    });

    mazeCoords.forEach(coords => {
        hexGrid.set(`${coords.q},${coords.r}`, {
            coords: coords,
            expression: '',
            answer: 0,
            type: 'normal',
            collected: false
        });
    });

    gameState.playerPos = mazeCoords[Math.floor(Math.random() * mazeCoords.length)];

    let bestExit = gameState.playerPos;
    let maxDist = 0;
    mazeCoords.forEach(hex => {
        const distance = hexDistance(gameState.playerPos, hex);
        if (distance > maxDist) {
            maxDist = distance;
            bestExit = hex;
        }
    });
    gameState.exitPos = bestExit;

    const exitHexData = hexGrid.get(`${gameState.exitPos.q},${gameState.exitPos.r}`);
    if (exitHexData) {
        exitHexData.type = 'exit';
    }

    // New logic to place a specific number of data fragments.
    const numDataNodes = Math.max(0, level - 1);
    
    const potentialDataHexes = mazeCoords.filter(coords => {
        const key = `${coords.q},${coords.r}`;
        return key !== `${gameState.playerPos.q},${gameState.playerPos.r}` && 
               key !== `${gameState.exitPos.q},${gameState.exitPos.r}`;
    });

    for (let i = potentialDataHexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [potentialDataHexes[i], potentialDataHexes[j]] = [potentialDataHexes[j], potentialDataHexes[i]];
    }

    for (let i = 0; i < numDataNodes && i < potentialDataHexes.length; i++) {
        const coords = potentialDataHexes[i];
        const hexData = hexGrid.get(`${coords.q},${coords.r}`);
        if (hexData) {
            hexData.type = 'data';
        }
    }
}

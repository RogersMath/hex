// map.js - Handles hex grid logic and procedural maze generation.

import { axialToPixel } from './map.js';

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
    const { hexGrid, level, yellowNodeChance } = gameState;

    hexGrid.clear();
    
    // MODIFIED: Special case for a much larger final level.
    const finalLevel = 6; // Based on the length of the narrative.
    let currentGridRadius;

    if (level === finalLevel) {
        currentGridRadius = 9; // A much larger "boss" maze.
    } else {
        // The grid grows larger as the level increases.
        currentGridRadius = Math.min(BASE_GRID_RADIUS + Math.floor(level / 3), 7);
    }
    
    // 1. Generate a list of all possible hexes within the radius.
    const allHexes = [];
    for (let q = -currentGridRadius; q <= currentGridRadius; q++) {
        for (let r = Math.max(-currentGridRadius, -q - currentGridRadius); r <= Math.min(currentGridRadius, -q + currentGridRadius); r++) {
            allHexes.push({ q, r });
        }
    }
    
    // 2. Use a modified Prim's algorithm to carve a maze.
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

    // 3. Populate the main hexGrid in the gameState with the maze data.
    mazeCoords.forEach(coords => {
        let type = 'normal';
        if (yellowNodeChance && Math.random() < 0.15) {
            type = 'data';
        }
        hexGrid.set(`${coords.q},${coords.r}`, {
            coords: coords,
            expression: '',
            answer: 0,
            type: type,
            collected: false
        });
    });

    // 4. Set player and exit positions in the gameState.
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
}

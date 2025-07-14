// main.js - The updated entry point and central controller for the game.

import { initializeInput } from './input.js';
import { initAudio, playTone } from './audio.js';
import { generateMaze, getHexNeighbors } from './map.js';
import { updateValidMoves, handleMove } from './movement.js';
import { showNarrativeScreen, endGame } from './narrative.js';
import { render } from './render.js';

// === CENTRAL GAME STATE ===
const gameState = {
    // Core state
    gameRunning: false,
    gamePaused: false,
    level: 1,

    // NEW: Accessibility and View state
    zoomLevel: 1.0, // Start with no zoom
    cameraOffset: { x: 0, y: 0 }, // For panning the camera
    
    // Time and performance
    startTime: 0,
    pauseTime: 0,
    totalPausedTime: 0,
    totalPerformanceScore: 0,
    
    // Narrative and collection state
    dataFragments: 0,
    performanceRating: 0,
    yellowNodeChance: false,
    dataFragmentBonus: 0,

    // Map and player data
    hexGrid: new Map(),
    playerPos: { q: 0, r: 0 },
    exitPos: { q: 0, r: 0 },
    validMoves: [],

    // Canvas context
    canvas: null,
    ctx: null,
};

// === NEW: ZOOM AND CAMERA LOGIC ===
function setZoom(newZoom) {
    // Clamp the zoom level between 0.5x and 3x
    gameState.zoomLevel = Math.max(0.5, Math.min(newZoom, 3.0));
    updateUI(); // Update the zoom level display
}

function zoomIn() {
    setZoom(gameState.zoomLevel + 0.2);
}

function zoomOut() {
    setZoom(gameState.zoomLevel - 0.2);
}

// === CORE GAME LOOP & CONTROL ===

function togglePause() {
    if (!gameState.gameRunning && !gameState.gamePaused) return;
    const pauseScreen = document.getElementById('pauseScreen');
    gameState.gamePaused = !gameState.gamePaused;

    if (gameState.gamePaused) {
        gameState.pauseTime = Date.now();
        pauseScreen.style.display = 'flex';
    } else {
        gameState.totalPausedTime += Date.now() - gameState.pauseTime;
        pauseScreen.style.display = 'none';
        requestAnimationFrame(mainRenderLoop);
    }
}

function mainRenderLoop() {
    if (gameState.gamePaused || !gameState.gameRunning) return;
    render(gameState);
    requestAnimationFrame(mainRenderLoop);
}

function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('fragments').textContent = gameState.dataFragments;
    const avgPerf = gameState.totalPerformanceScore > 0 ? Math.round(gameState.totalPerformanceScore) : '--';
    document.getElementById('avgPerf').textContent = avgPerf === '--' ? avgPerf : `${avgPerf}%`;
    
    // UPDATED: Also update zoom display
    document.getElementById('zoomLevelDisplay').textContent = `${Math.round(gameState.zoomLevel * 100)}%`;

    const buttons = document.querySelectorAll('.keypad-btn');
    buttons.forEach((btn, index) => {
        const number = index + 1;
        btn.classList.toggle('valid-move', gameState.validMoves.some(move => move.answer === number));
    });
}

function levelEnd() {
    gameState.gameRunning = false;
    const parTime = 20 + gameState.level * 5;
    const elapsedSeconds = (Date.now() - gameState.startTime - gameState.totalPausedTime) / 1000;
    const roundPerf = Math.max(10, 100 - Math.max(0, elapsedSeconds - parTime));
    gameState.totalPerformanceScore = (gameState.totalPerformanceScore * (gameState.level - 1) + roundPerf) / gameState.level;

    const perfEl = document.getElementById('roundPerformance');
    perfEl.textContent = `PERF: ${Math.floor(roundPerf)}%`;
    perfEl.style.opacity = 1;
    setTimeout(() => { perfEl.style.opacity = 0; }, 2000);
    
    setTimeout(() => { showNarrativeScreen(gameController); }, 2500);
}

function startNextLevel() {
    gameState.gamePaused = false;
    gameState.totalPausedTime = 0;
    generateMaze(gameState);
    updateValidMoves(gameController);
    gameState.gameRunning = true;
    gameState.startTime = Date.now();
    mainRenderLoop();
}

// === GAME CONTROLLER OBJECT ===
const gameController = {
    gameState,
    updateUI,
    startNextLevel,
    levelEnd,
    endGame,
    playTone,
    getHexNeighbors,
};

// === INITIALIZATION ===
function initializeGame() {
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    const resizeCanvas = () => {
        gameState.canvas.width = gameState.canvas.offsetWidth;
        gameState.canvas.height = gameState.canvas.offsetHeight;
        if (gameState.gameRunning) render(gameState);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // UPDATED: Pass zoom functions to the input initializer
    initializeInput({
        onKey: (number) => handleMove(number, gameController),
        onPause: togglePause,
        onAudioUnlock: initAudio,
        onZoomIn: zoomIn,
        onZoomOut: zoomOut,
    });
    
    updateUI(); // Initial UI update to set zoom display
    showNarrativeScreen(gameController);
}

initializeGame();

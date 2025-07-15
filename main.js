// main.js - The updated entry point and central controller for the game.

import { initializeInput, keypadOrder } from './input.js'; // MODIFIED: Import keypadOrder
import { initAudio, playTone } from './audio.js';
import { generateMaze, getHexNeighbors } from './map.js';
import { updateValidMoves, handleMove } from './movement.js';
import { showNarrativeScreen, endGame } from './narrative.js';
import { render } from './render.js';

// === CENTRAL GAME STATE (Unchanged) ===
const gameState = {
    gameRunning: false,
    gamePaused: false,
    level: 1,
    zoomLevel: 1.0,
    cameraOffset: { x: 0, y: 0 },
    startTime: 0,
    pauseTime: 0,
    totalPausedTime: 0,
    sumOfPerformanceScores: 0,
    dataFragments: 0,
    performanceRating: 0,
    yellowNodeChance: false,
    dataFragmentBonus: 0,
    hexGrid: new Map(),
    playerPos: { q: 0, r: 0 },
    exitPos: { q: 0, r: 0 },
    validMoves: [],
    canvas: null,
    ctx: null,
    particles: [],
};

// --- Particle logic is unchanged ---
function createParticle() { /* ... */ }
function initializeParticles() { /* ... */ }
function updateParticles() { /* ... */ }

// === ZOOM AND CAMERA LOGIC ===
function setZoom(newZoom) {
    gameState.zoomLevel = Math.max(0.5, Math.min(newZoom, 3.0));
}

function zoomIn() {
    setZoom(gameState.zoomLevel + 0.2);
    updateUI(); // This will now work correctly.
}

function zoomOut() {
    setZoom(gameState.zoomLevel - 0.2);
    updateUI(); // This will now work correctly.
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
    updateParticles();
    render(gameState);
    requestAnimationFrame(mainRenderLoop);
}

function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('fragments').textContent = gameState.dataFragments;

    const levelsCompleted = gameState.level - 1;
    let avgPerfText = '--';
    if (levelsCompleted > 0) {
        const average = gameState.sumOfPerformanceScores / levelsCompleted;
        avgPerfText = `${Math.round(average)}%`;
    }
    document.getElementById('avgPerf').textContent = avgPerfText;
    
    document.getElementById('zoomLevelDisplay').textContent = `${Math.round(gameState.zoomLevel * 100)}%`;

    // CRITICAL FIX: This logic is now robust and reliable.
    // It reads each button by its ID using the imported keypadOrder.
    keypadOrder.forEach(number => {
        const btn = document.getElementById(`key-${number}`);
        if (btn) {
            const isValid = gameState.validMoves.some(move => move.answer === number);
            btn.classList.toggle('valid-move', isValid);
        }
    });
}

// --- Other functions (levelEnd, startNextLevel, etc.) are unchanged ---

function levelEnd() {
    gameState.gameRunning = false;
    const parTime = 20 + gameState.level * 5;
    const elapsedSeconds = (Date.now() - gameState.startTime - gameState.totalPausedTime) / 1000;
    const roundPerf = Math.max(10, 100 - Math.max(0, elapsedSeconds - parTime));
    gameState.sumOfPerformanceScores += roundPerf;
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

const gameController = {
    gameState,
    updateUI,
    startNextLevel,
    levelEnd,
    endGame,
    playTone,
    getHexNeighbors,
};

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
    initializeParticles();
    initializeInput({
        onKey: (number) => handleMove(number, gameController),
        onPause: togglePause,
        onAudioUnlock: initAudio,
        onZoomIn: zoomIn,
        onZoomOut: zoomOut,
    });
    updateUI();
    showNarrativeScreen(gameController);
}

initializeGame();

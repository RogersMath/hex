// main.js - The new entry point and central controller for the game.

import { initializeInput } from './input.js';
import { initAudio, playTone } from './audio.js';
import { generateMaze, getHexNeighbors } from './map.js';
import { updateValidMoves, handleMove } from './movement.js';
import { showNarrativeScreen, endGame } from './narrative.js';
import { render } from './render.js';

// === CENTRAL GAME STATE ===
// All important variables are stored in one place.
const gameState = {
    // Core state
    gameRunning: false,
    gamePaused: false,
    level: 1,
    
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

    // Canvas context, to be initialized
    canvas: null,
    ctx: null,
};

// === CORE GAME LOOP & CONTROL ===

function togglePause() {
    // Don't allow pausing if the game hasn't started yet
    if (!gameState.gameRunning && !gameState.gamePaused) return;

    const pauseScreen = document.getElementById('pauseScreen');
    gameState.gamePaused = !gameState.gamePaused;

    if (gameState.gamePaused) {
        gameState.pauseTime = Date.now();
        pauseScreen.style.display = 'flex';
    } else {
        gameState.totalPausedTime += Date.now() - gameState.pauseTime;
        pauseScreen.style.display = 'none';
        requestAnimationFrame(mainRenderLoop); // Restart render loop
    }
}

function mainRenderLoop() {
    if (gameState.gamePaused || !gameState.gameRunning) return;
    render(gameState); // Pass the entire state to the render function
    requestAnimationFrame(mainRenderLoop);
}

function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('fragments').textContent = gameState.dataFragments;
    const avgPerf = gameState.totalPerformanceScore > 0 ? Math.round(gameState.totalPerformanceScore) : '--';
    document.getElementById('avgPerf').textContent = avgPerf === '--' ? avgPerf : `${avgPerf}%`;
    
    const buttons = document.querySelectorAll('.keypad-btn');
    buttons.forEach((btn, index) => {
        const number = index + 1;
        // Check validMoves array in gameState to toggle the class
        btn.classList.toggle('valid-move', gameState.validMoves.some(move => move.answer === number));
    });
}

function levelEnd() {
    gameState.gameRunning = false;
    
    const parTime = 20 + gameState.level * 5;
    const elapsedSeconds = (Date.now() - gameState.startTime - gameState.totalPausedTime) / 1000;
    const roundPerf = Math.max(10, 100 - Math.max(0, elapsedSeconds - parTime));
    
    // Update average performance score
    gameState.totalPerformanceScore = (gameState.totalPerformanceScore * (gameState.level - 1) + roundPerf) / gameState.level;

    // Display round performance feedback
    const perfEl = document.getElementById('roundPerformance');
    perfEl.textContent = `PERF: ${Math.floor(roundPerf)}%`;
    perfEl.style.opacity = 1;
    setTimeout(() => { perfEl.style.opacity = 0; }, 2000);
    
    // Show the narrative screen after a delay
    setTimeout(() => {
        showNarrativeScreen(gameController);
    }, 2500);
}

function startNextLevel() {
    // Reset state for the new level
    gameState.gamePaused = false;
    gameState.totalPausedTime = 0;
    
    generateMaze(gameState); // Pass state to maze generator
    updateValidMoves(gameController); // Pass the controller to set up initial moves

    gameState.gameRunning = true;
    gameState.startTime = Date.now();
    mainRenderLoop();
}

// === GAME CONTROLLER OBJECT ===
// This object is passed to other modules. It provides a safe, controlled
// way for them to interact with the game's core logic and state.
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
    
    // Set up canvas resizing
    const resizeCanvas = () => {
        gameState.canvas.width = gameState.canvas.offsetWidth;
        gameState.canvas.height = gameState.canvas.offsetHeight;
        // Re-render if the game is active
        if(gameState.gameRunning) {
            render(gameState);
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Set initial size

    // Set up all user inputs
    initializeInput({
        onKey: (number) => handleMove(number, gameController),
        onPause: togglePause,
        onAudioUnlock: initAudio,
    });

    // Start the game by showing the first narrative screen
    showNarrativeScreen(gameController);
}

// Kick off the entire application
initializeGame();

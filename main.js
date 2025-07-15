// main.js - The updated entry point and central controller for the game.

import { initializeInput } from './input.js';
import { initAudio, playTone } from './audio.js';
import { generateMaze, getHexNeighbors } from './map.js';
import { updateValidMoves, handleMove } from './movement.js';
import { showNarrativeScreen, endGame } from './narrative.js';
import { render } from './render.js';

// === CENTRAL GAME STATE ===
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
function createParticle() {
    return {
        x: gameState.canvas ? Math.random() * gameState.canvas.width : 0,
        y: gameState.canvas ? Math.random() * gameState.canvas.height : 0,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: 1.0,
        decay: Math.random() * 0.005 + 0.001,
    };
}

function initializeParticles() {
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
        gameState.particles.push(createParticle());
    }
}

function updateParticles() {
    if (!gameState.canvas) return;
    const { width, height } = gameState.canvas;
    for (let i = 0; i < gameState.particles.length; i++) {
        const p = gameState.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
            gameState.particles[i] = createParticle();
        }
        if (p.x > width) p.x = 0;
        else if (p.x < 0) p.x = width;
        if (p.y > height) p.y = 0;
        else if (p.y < 0) p.y = height;
    }
}


// === ZOOM AND CAMERA LOGIC ===
function setZoom(newZoom) {
    gameState.zoomLevel = Math.max(0.5, Math.min(newZoom, 3.0));
}

function zoomIn() {
    setZoom(gameState.zoomLevel + 0.2);
    updateUI(); // MODIFIED: Call updateUI to refresh the display.
}

function zoomOut() {
    setZoom(gameState.zoomLevel - 0.2);
    updateUI(); // MODIFIED: Call updateUI to refresh the display.
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

    // MODIFIED: This logic is now correct.
    // It finds each button by its ID (`key-1`, `key-2`, etc.) and toggles the class.
    const buttons = document.querySelectorAll('.keypad-btn');
    buttons.forEach(btn => {
        const number = parseInt(btn.textContent, 10);
        const isValid = gameState.validMoves.some(move => move.answer === number);
        btn.classList.toggle('valid-move', isValid);
    });
}

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

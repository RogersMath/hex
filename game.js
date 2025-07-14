// === GAME STATE & MAIN LOGIC ===

let gameRunning = false;
let gamePaused = false;
let level = 1;
let startTime = 0;
let pauseTime = 0;
let totalPausedTime = 0;
let totalPerformanceScore = 0;
let dataFragments = 0;

// === PAUSE & LEVEL MANAGEMENT ===
function togglePause() {
    if (!gameRunning && !gamePaused) return;

    const pauseScreen = document.getElementById('pauseScreen');
    gamePaused = !gamePaused;

    if (gamePaused) {
        pauseTime = Date.now();
        pauseScreen.style.display = 'flex';
    } else {
        totalPausedTime += Date.now() - pauseTime;
        pauseScreen.style.display = 'none';
        requestAnimationFrame(render); // Resume rendering
    }
}

function endLevel() {
    gameRunning = false;
    
    const parTime = 20 + level * 5;
    const elapsedSeconds = (Date.now() - startTime - totalPausedTime) / 1000;
    const roundPerf = Math.max(10, 100 - Math.max(0, elapsedSeconds - parTime));
    
    totalPerformanceScore = (totalPerformanceScore * (level - 1) + roundPerf) / level;

    const perfEl = document.getElementById('roundPerformance');
    perfEl.textContent = `PERF: ${Math.floor(roundPerf)}%`;
    perfEl.style.opacity = 1;
    setTimeout(() => { perfEl.style.opacity = 0; }, 2000);
    
    setTimeout(() => {
        if (level > narrativeEngine.length) {
            endGame();
        } else {
            showNarrativeScreen(level);
        }
    }, 2500);
}

function startNextLevel() {
    if (level > narrativeEngine.length) {
        endGame();
        return;
    }
    gamePaused = false;
    totalPausedTime = 0;
    generateMaze();
    gameRunning = true;
    startTime = Date.now();
    render();
    updateUI();
}

// === RENDERING & UI ===
function render() {
    if (gamePaused || !gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const visibleHexes = new Set([`${playerPos.q},${playerPos.r}`]);
    validMoves.forEach(m => visibleHexes.add(`${m.coords.q},${m.coords.r}`));
    visibleHexes.add(`${exitPos.q},${exitPos.r}`);

    hexGrid.forEach((hex, key) => {
        if (!visibleHexes.has(key)) {
            // Optionally render a faint grid for context
            const pixel = axialToPixel(hex.coords);
            drawHex(ctx, pixel, HEX_SIZE, 'rgba(0, 255, 255, 0.05)', 1);
            return;
        }
        
        const pixel = axialToPixel(hex.coords);
        let hexColor = '#004466';
        let textColor = '#00ffff';
        
        if (hex.type === 'exit') hexColor = '#ff00ff';
        if (hex.coords.q === playerPos.q && hex.coords.r === playerPos.r) hexColor = '#00ffff';
        if (hex.type === 'data' && !hex.collected) hexColor = '#ffff00';
        if (hex.collected) hexColor = '#888800';
        if (validMoves.some(m => m.coords.q === hex.coords.q && m.coords.r === hex.coords.r)) hexColor = '#00ff7f';
        
        drawHex(ctx, pixel, HEX_SIZE, hexColor, 2);

        if (hex.type === 'exit') {
            drawGlowText(ctx, 'EXIT', pixel.x, pixel.y, '#ffaaff', 14);
        } else if (hex.expression) {
            drawGlowText(ctx, hex.expression, pixel.x, pixel.y, '#ffffff', 12);
        } else if (hex.type === 'data' && !hex.collected) {
            drawGlowText(ctx, '??', pixel.x, pixel.y, '#ffff00', 14);
        }
    });

    requestAnimationFrame(render);
}


function updateUI() {
    document.getElementById('level').textContent = level;
    document.getElementById('fragments').textContent = dataFragments;
    document.getElementById('avgPerf').textContent = totalPerformanceScore > 0 ? `${Math.round(totalPerformanceScore)}%` : '--';
    
    const buttons = document.querySelectorAll('.keypad-btn');
    buttons.forEach((btn, index) => {
        const number = index + 1;
        btn.classList.toggle('valid-move', validMoves.some(move => move.answer === number));
    });
}

// === INITIALIZATION ===
function initializeGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    const keypad = document.getElementById('keypadArea');
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'keypad-btn';
        btn.textContent = i;
        btn.id = `key-${i}`;
        btn.onclick = () => handleMove(i);
        keypad.appendChild(btn);
    }
    
    // Resize canvas
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        if(gameRunning) render();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Attach event listeners
    document.getElementById('pauseBtn').onclick = togglePause;
    document.getElementById('resumeBtn').onclick = togglePause;

    document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '9') {
            handleMove(parseInt(e.key));
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
            e.preventDefault();
            togglePause();
        }
    });
    
    document.body.addEventListener('click', initAudio, { once: true });
    document.body.addEventListener('keydown', initAudio, { once: true });

    // Start with the first narrative scene
    showNarrativeScreen(level);
}

// === START GAME ===
initializeGame();

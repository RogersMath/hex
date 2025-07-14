// movement.js - Handles player movement, expression generation, and move validation.

/**
 * Generates a math expression for a given target answer.
 * @param {number} target The required answer for the expression.
 * @param {number} level The current game level, used for difficulty scaling.
 * @returns {object} An object containing the expression text and its answer.
 */
function generateExpressionForAnswer(target, level) {
    const difficulty = Math.min(level, 5);
    const ops = [];

    // Always allow simple addition and subtraction as options.
    const addB = target - Math.floor(Math.random() * (target - 1)) - 1;
    if (addB > 0) ops.push({ text: `${target - addB}+${addB}` });

    const subB = Math.floor(Math.random() * 9) + 1;
    ops.push({ text: `${target + subB}-${subB}` });

    if (difficulty > 1) {
        // Find multiplication factors.
        for (let i = 2; i <= Math.sqrt(target); i++) {
            if (target % i === 0 && i <= 9 && target / i <= 9) {
                ops.push({ text: `${i}×${target / i}` });
            }
        }
    }
    
    if (difficulty > 2) {
        // Add division problems.
        const divisor = Math.floor(Math.random() * 4) + 2; // Divisors from 2 to 5
        if (target * divisor <= 99) {
             ops.push({ text: `${target * divisor}÷${divisor}` });
        }
    }
    
    if (difficulty > 3) {
        // Add mixed operation problems.
        const a = Math.floor(Math.random() * 3) + 1;
        const b = Math.floor(Math.random() * 3) + 1;
        const c = target - (a * b);
        if (c >= 1 && c <= 9) {
            ops.push({ text: `${a}×${b}+${c}` });
        }
    }

    // Select a random operation from the generated list.
    const selectedOp = ops[Math.floor(Math.random() * ops.length)];
    return { ...selectedOp, answer: target };
}

/**
 * Recalculates valid moves from the player's current position and updates the gameState.
 * @param {object} gameController The central game controller from main.js.
 */
export function updateValidMoves(gameController) {
    const { gameState, getHexNeighbors, playTone, updateUI } = gameController;
    const { playerPos, hexGrid } = gameState;

    // Clear out the old valid moves.
    gameState.validMoves = [];
    
    // Automatically collect fragments from any adjacent data nodes.
    getHexNeighbors(playerPos).forEach(n_coords => {
        const key = `${n_coords.q},${n_coords.r}`;
        const hex = hexGrid.get(key);
        if (hex && hex.type === 'data' && !hex.collected) {
            hex.collected = true;
            gameState.dataFragments++;
            playTone(1200, 0.1, 'triangle');
        }
    });

    const neighbors = getHexNeighbors(playerPos);
    const validNeighborCoords = neighbors.filter(n => hexGrid.has(`${n.q},${n.r}`));
    
    // Create a shuffled list of possible answers (1-9).
    const availableAnswers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => 0.5 - Math.random());
    
    // Assign a unique answer and expression to each valid neighboring hex.
    validNeighborCoords.forEach((coords, index) => {
        if (index >= availableAnswers.length) return;
        
        const answer = availableAnswers[index];
        const expression = generateExpressionForAnswer(answer, gameState.level);
        
        // Update the hex data in the grid.
        const hex = hexGrid.get(`${coords.q},${coords.r}`);
        if (hex) {
            hex.expression = expression.text;
            hex.answer = answer;
        }

        // Add this to the list of valid moves in the gameState.
        gameState.validMoves.push({ coords, answer });
    });

    updateUI(); // Refresh the UI to show new valid move highlights.
}

/**
 * Handles the player's move attempt.
 * @param {number} answer The number the player entered (1-9).
 * @param {object} gameController The central game controller from main.js.
 */
export function handleMove(answer, gameController) {
    const { gameState, levelEnd, playTone } = gameController;

    if (!gameState.gameRunning || gameState.gamePaused) return;
    
    const validMove = gameState.validMoves.find(move => move.answer === answer);
    const button = document.getElementById(`key-${answer}`);
    
    if (validMove) {
        // Correct move
        gameState.playerPos = validMove.coords;
        playTone(880, 0.1, 'square');
        button?.classList.add('correct');
        setTimeout(() => button?.classList.remove('correct'), 600);
        
        // Check for win condition.
        if (gameState.playerPos.q === gameState.exitPos.q && gameState.playerPos.r === gameState.exitPos.r) {
            levelEnd();
        } else {
            updateValidMoves(gameController); // Recalculate next set of moves.
        }
    } else {
        // Incorrect move
        playTone(220, 0.2, 'sawtooth');
        button?.classList.add('incorrect');
        setTimeout(() => button?.classList.remove('incorrect'), 500);
    }
}

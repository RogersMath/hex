// === PLAYER MOVEMENT & EXPRESSION LOGIC ===

let playerPos = {q: 0, r: 0};
let validMoves = [];

function updateValidMoves() {
    validMoves = [];
    
    // Auto-collect adjacent data fragments
    getHexNeighbors(playerPos).forEach(n => {
        const key = `${n.q},${n.r}`;
        const hex = hexGrid.get(key);
        if (hex && hex.type === 'data' && !hex.collected) {
            hex.collected = true;
            dataFragments++;
            playTone(1200, 0.1, 'triangle');
        }
    });

    const neighbors = getHexNeighbors(playerPos);
    const validNeighborCoords = neighbors.filter(n => hexGrid.has(`${n.q},${n.r}`));

    const availableAnswers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < validNeighborCoords.length && i < availableAnswers.length; i++) {
        const coords = validNeighborCoords[i];
        const answer = availableAnswers[i];
        const expression = generateExpressionForAnswer(answer);
        
        validMoves.push({ coords, answer });
        
        const hex = hexGrid.get(`${coords.q},${coords.r}`);
        if (hex) {
            hex.expression = expression.text;
            hex.answer = answer;
        }
    }

    updateUI();
}

function generateExpressionForAnswer(target) {
    const difficulty = Math.min(level, 5);
    const ops = [];

    // Addition
    const a_add = Math.floor(Math.random() * (target - 1)) + 1;
    const b_add = target - a_add;
    if (b_add >= 1) ops.push({ text: `${a_add}+${b_add}` });
    
    // Subtraction
    const a_sub = target + Math.floor(Math.random() * 9) + 1;
    const b_sub = a_sub - target;
    ops.push({ text: `${a_sub}-${b_sub}`});

    if (difficulty > 2) {
        // Multiplication
        const factors = [];
        for (let i = 2; i <= Math.sqrt(target); i++) {
            if (target % i === 0 && i <= 9 && target / i <= 9) {
                factors.push([i, target / i]);
            }
        }
        if (factors.length > 0) {
            const [a_mult, b_mult] = factors[Math.floor(Math.random() * factors.length)];
            ops.push({ text: `${a_mult}×${b_mult}` });
        }
    }
    
    if (difficulty > 3) {
        // Division
        const divisor = Math.floor(Math.random() * 5) + 2;
        if (target * divisor <= 99) { // keep numbers reasonable
             ops.push({ text: `${target * divisor}÷${divisor}` });
        }
    }
    
    if (difficulty > 4) {
        // Mixed operations
        const a_mix = Math.floor(Math.random() * 3) + 1;
        const b_mix = Math.floor(Math.random() * 3) + 1;
        const c_mix = target - (a_mix * b_mix);
        if (c_mix >= 1 && c_mix <= 9) {
            ops.push({ text: `${a_mix}×${b_mix}+${c_mix}` });
        }
    }

    return ops.length > 0
        ? { ...ops[Math.floor(Math.random() * ops.length)], answer: target }
        : { text: `${target-1}+1`, answer: target }; // Fallback
}


function handleMove(answer) {
    if (!gameRunning || gamePaused) return;
    
    const validMove = validMoves.find(move => move.answer === answer);
    const button = document.getElementById(`key-${answer}`);
    
    if (validMove) {
        playerPos = validMove.coords;
        playTone(880, 0.1, 'square');
        if (button) {
            button.classList.add('correct');
            setTimeout(() => button.classList.remove('correct'), 600);
        }
        
        if (playerPos.q === exitPos.q && playerPos.r === exitPos.r) {
            endLevel();
        } else {
            updateValidMoves();
        }
    } else {
        playTone(220, 0.2, 'sawtooth');
        if (button) {
            button.classList.add('incorrect');
            setTimeout(() => button.classList.remove('incorrect'), 500);
        }
    }
}

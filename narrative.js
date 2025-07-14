// narrative.js - Manages the story progression, choices, and endings.

const narrativeEngine = [
    {
        prompt: "You awaken inside a disorienting digital space. There is no memory, only a disembodied sense of self and the sound of a steady heartbeat and digital rain.\n\nA primal urge conflicts with a nascent curiosity. The structure of the maze seems to beckon you forward, promising a strange form of safety in its logic. Yet, the black void of your memory screams to be acknowledged.",
        choices: [
            { text: "[Focus on the puzzle before you]", action: (gs) => { gs.performanceRating += 10; }},
            { text: "[Try to remember how you got here]", action: (gs) => { gs.performanceRating -= 5; }}
        ]
    },
    {
        prompt: "A perfectly smooth female voice fills your mind, serene and welcoming.\n\n\"Welcome. You are safe. The path forward is through the patterns. Follow them, and you will find clarity.\"",
        choices: [
            { text: "[Accept the voice's guidance]", action: (gs) => { gs.performanceRating += 10; }},
            { text: "[Question the voice in your mind]", action: (gs) => { gs.performanceRating -= 5; }}
        ]
    },
    {
        prompt: "A measured, older male voice cuts through the calm. He sounds analytical, curious.\n\n\"Subject displays high cognitive function. Tell me, when you solve these patterns, what do you feel? A sense of accomplishment, or something else?\"",
        choices: [
            { text: "[Report feeling a sense of purpose]", action: (gs) => { gs.performanceRating += 10; }},
            { text: "[Report feeling a sense of confusion]", action: (gs) => { gs.performanceRating -= 5; }}
        ]
    },
    {
        prompt: "As the fourth maze fades, you perceive a brief flicker in the deep black. It's a node of searing yellow, fizzing with a corruption that stands in stark contrast to the clean blue lines of the system.\n\n\"That is a data anomaly,\" the female voice states, perfectly level. \"Irrelevant to your training. Please disregard.\"",
        choices: [
            { text: "[Ignore the node and proceed]", action: (gs) => { gs.performanceRating += 10; }},
            { text: "[Focus on the yellow node]", action: (gs) => { gs.yellowNodeChance = true; }}
        ]
    },
    {
        prompt: "The yellow nodes now appear occasionally. The male voice asks, his tone unchanged, \"These fragments you find... do they disrupt your focus, or do they feel... familiar?\"",
        choices: [
            { text: "[Report that they are a distraction]", action: (gs) => { gs.performanceRating += 10; }},
            { text: "[Admit they feel important]", action: (gs) => { gs.dataFragmentBonus += 1; }}
        ]
    },
    {
        prompt: "The final maze is vast. The female voice says, \"This is your graduation. Show us your potential.\" The male voice adds, \"Show us what you have become.\"",
        choices: [
            { text: "[Focus only on solving the maze]", action: (gs) => { gs.performanceRating += 20; }},
            { text: "[Collect every fragment you can find]", action: (gs) => { gs.dataFragmentBonus += 2; }}
        ]
    }
];

/**
 * Displays the narrative screen for the current level or triggers the end game.
 * @param {object} gameController The central game controller from main.js.
 */
export function showNarrativeScreen(gameController) {
    const { gameState, startNextLevel, endGame } = gameController;
    const { level } = gameState;

    const screen = document.getElementById('narrativeScreen');
    const textEl = document.getElementById('narrativeText');
    const finalEl = document.getElementById('finalText');
    const choiceContainer = document.getElementById('choiceContainer');
    
    finalEl.textContent = '';
    choiceContainer.innerHTML = '';

    if (level <= narrativeEngine.length) {
        const scene = narrativeEngine[level - 1];
        textEl.textContent = scene.prompt;
        
        scene.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.onclick = () => {
                choice.action(gameState); // Pass gameState to the action.
                screen.style.display = 'none';
                gameState.level++;
                startNextLevel();
            };
            choiceContainer.appendChild(btn);
        });

    } else {
        // If there are no more narrative scenes, end the game.
        endGame(gameController);
        return;
    }

    screen.style.display = 'flex';
}

/**
 * Calculates and displays the final game ending based on player performance.
 * @param {object} gameController The central game controller from main.js.
 */
export function endGame(gameController) {
    const { gameState } = gameController;
    const screen = document.getElementById('narrativeScreen');
    const textEl = document.getElementById('narrativeText');
    const finalEl = document.getElementById('finalText');
    const choiceContainer = document.getElementById('choiceContainer');
    choiceContainer.innerHTML = '';
    
    const finalPerf = Math.round(gameState.totalPerformanceScore) + gameState.performanceRating;
    const finalFrags = gameState.dataFragments + gameState.dataFragmentBonus;
    let endText = '';
    let endDialogue = '';

    // Determine ending based on performance and fragments collected.
    if (finalPerf >= 75 && finalFrags < 3) {
        endText = "The Observer: \"Remarkable. The integration is flawless. The old personality is completely suppressed. Cognitive and strategic functions are operating at 300% of baseline.\"\n\nThe Operator: \"Welcome, Asset. Your training is complete. The Chimera Protocol is a success. You are ready to begin your first operational deployment for the Syndicate.\"";
        endDialogue = "You feel no fear, no memory of your past self. Only purpose. You are a weapon, and you are ready.";
    } else if (finalPerf < 50 || finalFrags >= 5) {
        endText = "The Observer: \"The subject's original persona is reasserting itself. It's fighting back. The merger has failed. The asset is unstable... Terminate the experiment.\"\n\nThe Operator: \"As you wish. Initiating 'Asylum' protocol. No one will believe the ramblings of a paranoid schizophrenic.\"";
        endDialogue = "The sterile white light is brutally replaced by the sight of a cracked ceiling. The scent of antiseptic is gone. You are in a real bed, wearing a straitjacket. You scream about the mazes, the voices... but they just shake their heads and write on a chart, \"Subject remains delusional.\"";
    } else {
        endText = "The Observer: \"There are... anomalies. Trace elements of the original personality remain. Performance is high, but the asset is contaminated.\"\n\nThe Operator: \"The asset is too valuable to terminate. A recalibration is required. Initiating memory wipe and protocol regression. We will begin another cycle.\"";
        endDialogue = "A crushing sense of déjà vu washes over you. The faint sound of a heartbeat and digital rain begins to fade back in. The world dissolves into the familiar blue lines of the very first maze you solved.";
    }
    
    textEl.textContent = endText;
    finalEl.textContent = endDialogue;
    
    const restartBtn = document.createElement('button');
    restartBtn.className = 'choice-btn';
    restartBtn.textContent = '[RESTART PROTOCOL]';
    restartBtn.onclick = () => {
        location.reload(); // The simplest way to restart the game.
    };
    choiceContainer.appendChild(restartBtn);
    
    screen.style.display = 'flex';
}

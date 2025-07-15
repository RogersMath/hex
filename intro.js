// intro.js - A self-contained, promise-based intro/title screen module.

/**
 * Injects the necessary CSS for the intro screen into the document's head.
 * It's self-contained to make the module reusable and prevent style conflicts.
 */
function injectCSS() {
    // Prevents injecting styles more than once
    if (document.getElementById('intro-styles')) return;

    const styles = `
        #introContainer {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: #000;
            color: #ccc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', Courier, monospace;
            z-index: 1000;
            padding: 20px;
        }
        .intro-prompt {
            max-width: 600px;
            text-align: center;
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 40px;
            color: #00ffff;
            text-shadow: 0 0 8px rgba(0, 255, 255, 0.7);
        }
        .intro-button {
            background: transparent;
            border: 2px solid #ff00ff;
            color: #ff00ff;
            font-family: inherit;
            font-size: 1.1rem;
            font-weight: bold;
            padding: 15px 30px;
            margin: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
        }
        .intro-button:hover {
            background: rgba(255, 0, 255, 0.1);
            color: #fff;
            box-shadow: 0 0 25px rgba(255, 0, 255, 0.8);
            transform: scale(1.05);
        }
        .intro-hex-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .intro-hex-svg {
            width: 66.67vw; /* Occupies middle 2/3 of horizontal space */
            max-width: 500px;
            filter: drop-shadow(0 0 15px #ff00ff) drop-shadow(0 0 25px #ff00ff);
            overflow: visible; /* Important for the glow */
        }
        .intro-hex-path {
            stroke: #ff00ff;
            stroke-width: 5;
            fill: none;
        }
        .intro-text-anim {
            position: absolute;
            font-size: clamp(1.5rem, 5vw, 3rem);
            font-weight: bold;
            opacity: 0;
            transition: opacity 1s ease-in-out;
            color: #fff;
            text-shadow: 0 0 8px #fff;
        }
        .intro-text-anim.fade-in {
            opacity: 1;
        }
        .intro-text-anim .green {
            color: #00ff7f;
            text-shadow: 0 0 8px #00ff7f;
        }
        .intro-text-anim .purple {
            color: #ff88ff;
            text-shadow: 0 0 8px #ff88ff;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.id = 'intro-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

/**
 * A helper function to pause execution, making animation sequences readable.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Runs the title animation sequence.
 * @param {HTMLElement} container - The main container for the intro.
 */
async function runAnimation(container) {
    // Clear the initial prompt
    container.innerHTML = ''; 

    // Create animation elements
    const hexContainer = document.createElement('div');
    hexContainer.className = 'intro-hex-container';

    // Using SVG for a perfect, scalable hexagon
    hexContainer.innerHTML = `
        <svg class="intro-hex-svg" viewBox="0 0 100 86.6">
          <polygon class="intro-hex-path" points="50,0 100,25 100,75 50,86.6 0,75 0,25" />
        </svg>
    `;

    const textEl = document.createElement('div');
    textEl.className = 'intro-text-anim';
    hexContainer.appendChild(textEl);
    container.appendChild(hexContainer);

    // Animation sequence
    await sleep(500); // Give a moment before the first text

    textEl.textContent = "Rogersmath Presents";
    textEl.classList.add('fade-in');
    await sleep(3000); // Show for 2s, fade for 1s
    textEl.classList.remove('fade-in');
    await sleep(1000); // Wait for fade-out

    textEl.textContent = "A Jesse Rogers Production";
    textEl.classList.add('fade-in');
    await sleep(3000);
    textEl.classList.remove('fade-in');
    await sleep(1000);

    textEl.innerHTML = '<span class="green">H</span><span class="purple">EX</span>';
    textEl.classList.add('fade-in');
    await sleep(2500);

    textEl.innerHTML = '<span class="green">H</span><span class="purple">EXIT</span>';
    await sleep(3000);
    textEl.classList.remove('fade-in');
    
    await sleep(1000); // Final fade before finishing
}

/**
 * Displays the intro screen and returns a Promise that resolves when the intro is complete.
 * @param {function} onStart - A callback function that is fired IMMEDIATELY on the first user interaction
 * to unlock the Web Audio API and start the music.
 * @returns {Promise<void>}
 */
export function showIntro(onStart) {
    injectCSS();

    return new Promise(resolve => {
        const container = document.createElement('div');
        container.id = 'introContainer';

        const prompt = document.createElement('p');
        prompt.className = 'intro-prompt';
        prompt.textContent = "We can teach you to code if you're already strong in math. If not, welcome. You've come to the right place, and your journey begins now.";

        const startButton = document.createElement('button');
        startButton.className = 'intro-button';
        startButton.textContent = '[Start Game]';

        const teachButton = document.createElement('button');
        teachButton.className = 'intro-button';
        teachButton.textContent = '[Teach Me to Code Games Like This]';
        
        container.append(prompt, startButton, teachButton);
        document.body.appendChild(container);
        
        teachButton.onclick = () => {
            if (onStart) onStart(); // Fire the callback to start audio.
            window.open('https://www.youtube.com/@rogersmath1939', '_blank');
        };

        startButton.onclick = async () => {
            if (onStart) onStart(); // Fire the callback to start audio.
            
            // Run the animation sequence.
            await runAnimation(container);
            
            // Clean up and resolve the promise to start the main game.
            document.body.removeChild(container);
            resolve();
        };
    });
}

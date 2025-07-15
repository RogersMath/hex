// intro.js - A self-contained, promise-based intro/title screen module.

function injectCSS() {
    if (document.getElementById('intro-styles')) return;

    const styles = `
        #introContainer {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', Courier, monospace;
            z-index: 1000;
        }
        /* NEW: A styled box for the initial dialog */
        .intro-dialog-box {
            background: linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(191, 0, 255, 0.05));
            border: 2px solid #ff00ff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 25px rgba(255, 0, 255, 0.4), inset 0 0 20px rgba(255, 0, 255, 0.1);
            max-width: 90vw;
            width: 500px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .intro-prompt {
            text-align: center;
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 30px; /* Spacing between text and buttons */
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
            margin-top: 15px; /* Spacing between buttons */
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
            width: 100%; /* Make buttons full-width of the dialog box */
        }
        .intro-button:hover {
            background: rgba(255, 0, 255, 0.1);
            color: #fff;
            transform: scale(1.02);
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
            width: 75vw;
            max-width: 600px;
            filter: drop-shadow(0 0 15px #ff00ff) drop-shadow(0 0 25px #ff00ff);
            overflow: visible;
        }
        .intro-hex-path {
            stroke: #ff00ff;
            stroke-width: 4;
            fill: none;
        }
        .intro-text-anim {
            /* CRITICAL FIX: Robust centering for absolutely positioned elements */
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%; /* Ensure the container has width to center text within */
            text-align: center; /* Center the text inside the container */
            font-size: clamp(2rem, 8vw, 4.5rem);
            font-weight: bold;
            opacity: 0;
            transition: opacity 1.5s ease-in-out;
        }
        .intro-text-anim.fade-in { opacity: 1; }
        .letter { transition: color 1.5s ease-in-out, opacity 1.5s ease-in-out; }
        .green { color: #00ff7f; text-shadow: 0 0 8px #00ff7f; }
        .purple { color: #ff88ff; text-shadow: 0 0 8px #ff88ff; }
        .transparent { opacity: 0; }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.id = 'intro-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runAnimation(container) {
    container.innerHTML = ''; 

    const hexContainer = document.createElement('div');
    hexContainer.className = 'intro-hex-container';

    // MODIFIED: Switched to a flat-top hexagon SVG for game consistency.
    // The viewBox is now wider than it is tall.
    hexContainer.innerHTML = `
        <svg class="intro-hex-svg" viewBox="0 0 100 86.6">
          <polygon class="intro-hex-path" points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3" />
        </svg>
    `;

    const textEl = document.createElement('div');
    textEl.className = 'intro-text-anim';
    hexContainer.appendChild(textEl);
    container.appendChild(hexContainer);

    // --- Sequence Part 1: Producer Credits ---
    await sleep(500);
    textEl.textContent = "Rogersmath Presents";
    textEl.classList.add('fade-in');
    await sleep(3000);
    textEl.classList.remove('fade-in');
    await sleep(1500);

    textEl.textContent = "A Jesse Rogers Production";
    textEl.classList.add('fade-in');
    await sleep(3000);
    textEl.classList.remove('fade-in');
    await sleep(1500);

    // --- Sequence Part 2: HEXIT Animation ---
    
    // Create the full "HEXIT" structure, with each letter in a separate span
    textEl.innerHTML = `
        <span class="letter" id="h-letter">H</span><span class="letter" id="e-letter">E</span><span class="letter" id="x-letter">X</span><span class="letter" id="i-letter">I</span><span class="letter" id="t-letter">T</span>
    `;

    // Get handles to each letter
    const h = document.getElementById('h-letter');
    const e = document.getElementById('e-letter');
    const x = document.getElementById('x-letter');
    const i = document.getElementById('i-letter');
    const t = document.getElementById('t-letter');

    // Set the initial state: "HEX" is green, "IT" is transparent
    h.className = 'letter green';
    e.className = 'letter green';
    x.className = 'letter green';
    i.className = 'letter purple transparent';
    t.className = 'letter purple transparent';
    
    // Fade in the initial "HEX"
    textEl.classList.add('fade-in');
    await sleep(2500);

    // Trigger the transition:
    // Change E and X to purple. The CSS transition will handle the color blend.
    e.className = 'letter purple';
    x.className = 'letter purple';
    // Make I and T visible. The CSS transition will handle the fade-in.
    i.className = 'letter purple';
    t.className = 'letter purple';
    
    // Hold on the final "HEXIT" title
    await sleep(3000);
    
    // Fade out everything to end the intro
    textEl.classList.remove('fade-in');
    await sleep(1500);
}


export function showIntro(onStart) {
    injectCSS();

    return new Promise(resolve => {
        const container = document.createElement('div');
        container.id = 'introContainer';

        // NEW: Create the dialog box wrapper
        const dialogBox = document.createElement('div');
        dialogBox.className = 'intro-dialog-box';

        const prompt = document.createElement('p');
        prompt.className = 'intro-prompt';
        // Use the new, better hook text
        prompt.textContent = "Already strong in math? Let us teach you to code. Otherwise, start the game to build your foundation.";

        const startButton = document.createElement('button');
        startButton.className = 'intro-button';
        startButton.textContent = '[Start Game]';

        const teachButton = document.createElement('button');
        teachButton.className = 'intro-button';
        teachButton.textContent = '[Teach Me to Code Games Like This]';
        
        // Append elements to the new dialog box
        dialogBox.append(prompt, teachButton, startButton);
        container.appendChild(dialogBox);
        document.body.appendChild(container);
        
        teachButton.onclick = () => {
            if (onStart) onStart();
            window.open('https://www.youtube.com/@rogersmath1939', '_blank');
        };

        startButton.onclick = async () => {
            if (onStart) onStart();
            
            // For the animation, we replace the dialog with the hex animation container
            container.innerHTML = ''; // Clear the dialog box
            await runAnimation(container);
            
            document.body.removeChild(container);
            resolve();
        };
    });
}

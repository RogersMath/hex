// intro.js - A self-contained, promise-based intro/title screen module.

/**
 * Injects the necessary CSS for the intro screen into the document's head.
 */
function injectCSS() {
    if (document.getElementById('intro-styles')) return;

    const styles = `
        /* NEW: Define custom fonts directly within the intro's CSS. */
        /* This ensures they are available immediately, before style.css loads. */
        @font-face {
          font-family: 'Orbitron';
          src: url('fonts/Orbitron-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }

        @font-face {
          font-family: 'Orbitron';
          src: url('fonts/Orbitron-Bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }

        #introContainer {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            /* FIX: Use Orbitron as the primary font for the entire intro container. */
            font-family: 'Orbitron', 'Courier New', Courier, monospace;
            z-index: 1000;
        }
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
            margin-bottom: 30px;
            color: #00ffff;
            text-shadow: 0 0 8px rgba(0, 255, 255, 0.7);
            font-weight: 400; /* Use regular font weight */
        }
        .intro-button {
            background: transparent;
            border: 2px solid #ff00ff;
            color: #ff00ff;
            font-family: inherit; /* This will now inherit Orbitron */
            font-size: 1.1rem;
            font-weight: 700; /* Use bold font weight */
            padding: 15px 30px;
            margin-top: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
            width: 100%;
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
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            text-align: center;
            font-size: clamp(2rem, 8vw, 4.5rem);
            font-weight: 700; /* Use bold font weight */
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
    textEl.innerHTML = `
        <span class="letter" id="h-letter">H</span><span class="letter" id="e-letter">E</span><span class="letter" id="x-letter">X</span><span class="letter" id="i-letter">I</span><span class="letter" id="t-letter">T</span>
    `;

    const h = document.getElementById('h-letter');
    const e = document.getElementById('e-letter');
    const x = document.getElementById('x-letter');
    const i = document.getElementById('i-letter');
    const t = document.getElementById('t-letter');

    h.className = 'letter green';
    e.className = 'letter green';
    x.className = 'letter green';
    i.className = 'letter purple transparent';
    t.className = 'letter purple transparent';
    
    textEl.classList.add('fade-in');
    await sleep(2500);

    e.className = 'letter purple';
    x.className = 'letter purple';
    i.className = 'letter purple';
t.className = 'letter purple';
    
    await sleep(3000);
    
    textEl.classList.remove('fade-in');
    await sleep(1500);
}

export function showIntro(onStart) {
    injectCSS();

    return new Promise(resolve => {
        const container = document.createElement('div');
        container.id = 'introContainer';

        const dialogBox = document.createElement('div');
        dialogBox.className = 'intro-dialog-box';

        const prompt = document.createElement('p');
        prompt.className = 'intro-prompt';
        prompt.textContent = "Already strong in math? Let us teach you to code. Otherwise, start the game to build your foundation.";

        const startButton = document.createElement('button');
        startButton.className = 'intro-button';
        startButton.textContent = 'Start Game';

        const teachButton = document.createElement('button');
        teachButton.className = 'intro-button';
        teachButton.textContent = 'Teach Me to Code Games Like This';
        
        dialogBox.append(prompt, teachButton, startButton);
        container.appendChild(dialogBox);
        document.body.appendChild(container);
        
        teachButton.onclick = () => {
            if (onStart) onStart();
            window.open('https://www.youtube.com/@rogersmath1939', '_blank');
        };

        startButton.onclick = async () => {
            if (onStart) onStart();
            
            container.innerHTML = '';
            await runAnimation(container);
            
            document.body.removeChild(container);
            resolve();
        };
    });
}

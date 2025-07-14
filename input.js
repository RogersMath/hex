// input.js - Sets up all user input event listeners for the game.

/**
 * Defines the shape of the callbacks object required by the input initializer.
 * This provides strong typing and autocompletion in supported IDEs.
 * @typedef {object} InputCallbacks
 * @property {function(number): void} onKey - Callback for when a number key is pressed or keypad is clicked.
 * @property {function(): void} onPause - Callback to toggle the game's pause state.
 * @property {function(): void} onAudioUnlock - Callback for the first user interaction to enable the Web Audio API.
 * @property {function(): void} onZoomIn - Callback to increase the zoom level.
 * @property {function(): void} onZoomOut - Callback to decrease the zoom level.
 */

/**
 * Initializes all user input listeners.
 * @param {InputCallbacks} callbacks The object containing all necessary callback functions.
 */
export function initializeInput(callbacks) {
    // Generate the keypad buttons and attach click listeners
    const keypadArea = document.getElementById('keypadArea');
    keypadArea.innerHTML = ''; // Clear any previous buttons
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'keypad-btn';
        btn.textContent = i;
        btn.id = `key-${i}`;
        btn.onclick = () => callbacks.onKey(i);
        keypadArea.appendChild(btn);
    }

    // Attach listeners to the pause/resume buttons
    document.getElementById('pauseBtn').onclick = callbacks.onPause;
    document.getElementById('resumeBtn').onclick = callbacks.onPause;

    // Attach listeners to the zoom buttons
    document.getElementById('zoomInBtn').onclick = callbacks.onZoomIn;
    document.getElementById('zoomOutBtn').onclick = callbacks.onZoomOut;

    // Attach keyboard listener to the document
    document.addEventListener('keydown', (e) => {
        // Handle number inputs (1-9)
        if (e.key >= '1' && e.key <= '9') {
            callbacks.onKey(parseInt(e.key, 10));
        } 
        // Handle pause inputs (Escape or P key)
        else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
            e.preventDefault(); // Prevents default browser actions
            callbacks.onPause();
        }
    });

    // Attach one-time listeners to the body to unlock the Web Audio API.
    // This is required by modern browsers.
    document.body.addEventListener('click', callbacks.onAudioUnlock, { once: true });
    document.body.addEventListener('keydown', callbacks.onAudioUnlock, { once: true });
}

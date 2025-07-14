// input.js - Sets up all user input event listeners for the game.

// Initializes all user input listeners.
@param {object} // callbacks An object containing the callback functions from main.js.
@param {function} // callbacks.onKey A function to call when a number key (1-9) is pressed or keypad is clicked.
@param {function} // callbacks.onPause A function to call to toggle the pause state.
@param {function} // callbacks.onAudioUnlock A function to call on the first user interaction to enable audio.

export function initializeInput(callbacks) {
    // Generate the keypad buttons and attach click listeners
    const keypadArea = document.getElementById('keypadArea');
    keypadArea.innerHTML = ''; // Clear any previous buttons
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'keypad-btn';
        btn.textContent = i;
        btn.id = `key-${i}`;
        // Call the handleMove callback provided by main.js
        btn.onclick = () => callbacks.onKey(i);
        keypadArea.appendChild(btn);
    }

    // Attach listeners to the pause/resume buttons
    document.getElementById('pauseBtn').onclick = callbacks.onPause;
    document.getElementById('resumeBtn').onclick = callbacks.onPause;

    // Attach keyboard listener to the document
    document.addEventListener('keydown', (e) => {
        // Handle number inputs (1-9)
        if (e.key >= '1' && e.key <= '9') {
            callbacks.onKey(parseInt(e.key, 10));
        } 
        // Handle pause inputs (Escape or P key)
        else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
            e.preventDefault(); // Prevents default browser actions (like printing)
            callbacks.onPause();
        }
    });

    // Attach one-time listeners to the body to unlock the Web Audio API.
    // This is required by modern browsers.
    document.body.addEventListener('click', callbacks.onAudioUnlock, { once: true });
    document.body.addEventListener('keydown', callbacks.onAudioUnlock, { once: true });
}

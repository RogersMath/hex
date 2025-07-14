/**
 * Sets up all user input event listeners for the game.
 * This function is called once by the main game module.
 * @param {object} callbacks An object containing the callback functions.
 * @param {function} callbacks.onKey A function to call when a number key (1-9) is pressed or keypad is clicked.
 * @param {function} callbacks.onPause A function to call to toggle the pause state.
 * @param {function} callbacks.onAudioUnlock A function to call on the first user interaction to enable audio.
 */
const initializeInput = (callbacks) => {
    // Generate the keypad and attach click listeners
    const keypad = document.getElementById('keypadArea');
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'keypad-btn';
        btn.textContent = i;
        btn.id = `key-${i}`;
        // Call the handleMove callback when a keypad button is clicked
        btn.onclick = () => callbacks.onKey(i);
        keypad.appendChild(btn);
    }

    // Attach listeners to the pause/resume buttons
    document.getElementById('pauseBtn').onclick = callbacks.onPause;
    document.getElementById('resumeBtn').onclick = callbacks.onPause;

    // Attach keyboard listener
    document.addEventListener('keydown', (e) => {
        // Handle number inputs
        if (e.key >= '1' && e.key <= '9') {
            callbacks.onKey(parseInt(e.key));
        } 
        // Handle pause inputs
        else if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
            e.preventDefault(); // Prevents default browser actions
            callbacks.onPause();
        }
    });

    // Attach one-time listeners to unlock the Web Audio API
    document.body.addEventListener('click', callbacks.onAudioUnlock, { once: true });
    document.body.addEventListener('keydown', callbacks.onAudioUnlock, { once: true });
};

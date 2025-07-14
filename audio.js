// audio.js - Handles Web Audio API initialization, music playback, and sound effects.

import { generateSong } from './sonantx.js';

let audioContext;
let masterGain;

/**
 * Initializes the Web Audio API context. Must be called after a user interaction.
 */
export async function initAudio() {
    if (audioContext) return; // Prevent re-initialization
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a master gain node for global volume control
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.3; // Default volume (30%)
        masterGain.connect(audioContext.destination);

        // Link the volume slider to the master gain node
        document.getElementById('volumeSlider').addEventListener('input', e => {
            if (masterGain) {
                masterGain.gain.value = e.target.value / 100;
            }
        });

        // Start playing the background music
        await playBackgroundMusic();

    } catch (e) {
        console.error('Web Audio API initialization failed:', e);
    }
}

/**
 * Fetches, generates, and plays the looping background music.
 */
async function playBackgroundMusic() {
    if (!audioContext) return;
    try {
        // Fetch the song data from the JSON file
        const response = await fetch('music.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch music.json: ${response.statusText}`);
        }
        const songData = await response.json();
        
        // Generate the audio buffer using the SonantX engine
        const buffer = await generateSong(songData, audioContext.sampleRate);
        
        // Create a buffer source to play the song
        const bufferSource = audioContext.createBufferSource();
        bufferSource.buffer = buffer;
        bufferSource.loop = true; // Make the music loop forever
        bufferSource.connect(masterGain);
        bufferSource.start();

    } catch (e) {
        console.error('Background music failed to load:', e);
    }
}

/**
 * Plays a simple procedural sound tone.
 * @param {number} freq The frequency of the tone in Hz.
 * @param {number} dur The duration of the tone in seconds.
 * @param {string} type The oscillator type ('sine', 'square', 'sawtooth', 'triangle').
 */
export function playTone(freq, dur, type) {
    if (!audioContext || !masterGain) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    
    // Simple ADSR-like envelope
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + dur); // Decay/Release
    
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + dur + 0.1);
}

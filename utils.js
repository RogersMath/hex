// Game-wide utility functions for audio and rendering.

let audioContext, masterGain;

// Initializes the Web Audio API and starts background music on first user interaction.
const initAudio = async () => {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.3;
        masterGain.connect(audioContext.destination);

        document.getElementById('volumeSlider').addEventListener('input', e => {
            masterGain.gain.value = e.target.value / 100;
        });

        await playBackgroundMusic();
    } catch (e) {
        console.error('Audio init failed:', e);
    }
};

// Fetches song data and uses the sonantx library to generate and play music.
const playBackgroundMusic = async () => {
    if (!audioContext) return;
    try {
        const response = await fetch('music.json');
        const songData = await response.json();

        // generateSong() is from the loaded sonantx.js library.
        const buffer = await generateSong(songData, audioContext.sampleRate);
        
        const bufferSource = audioContext.createBufferSource();
        bufferSource.buffer = buffer;
        bufferSource.loop = true;
        bufferSource.connect(masterGain);
        bufferSource.start();
    } catch (e) {
        console.error('Music load failed:', e);
    }
};

// Plays a simple UI sound effect using the Web Audio API.
const playTone = (freq, dur, type) => {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + dur);
    
    osc.start();
    osc.stop(audioContext.currentTime + dur);
};

// Draws a hexagon outline on the canvas.
const drawHex = (ctx, center, size, color, lineWidth = 2) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const x = center.x + size * Math.cos(angle);
        const y = center.y + size * Math.sin(angle);
        ctx[i === 0 ? 'moveTo' : 'lineTo'](x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
};

// Draws centered text with a glow effect.
const drawGlowText = (ctx, text, x, y, color, size = 16) => {
    ctx.font = `bold ${size}px 'Courier New'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    
    ctx.fillText(text, x, y);
    
    ctx.shadowBlur = 0; // Reset for subsequent drawing.
};

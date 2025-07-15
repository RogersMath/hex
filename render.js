// render.js - Contains all Canvas rendering logic for the game.

import { axialToPixel } from './map.js';

const HEX_SIZE = 35;

/**
 * Draws the background particle system.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {Array<object>} particles The array of particle objects.
 */
function drawParticles(ctx, particles) {
    ctx.save();
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${p.life * 0.5})`;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 5;
        ctx.fill();
    });
    ctx.restore();
}

/**
 * Draws a single hexagon outline on the canvas.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {object} center The center pixel coordinate { x, y }.
 * @param {number} size The current radius of the hex.
 * @param {string} color The stroke color.
 * @param {number} lineWidth The width of the outline.
 */
function drawHex(ctx, center, size, color, lineWidth = 2) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6; // Rotated for flat top
        const x = center.x + size * Math.cos(angle);
        const y = center.y + size * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth / ctx.getTransform().a;
    ctx.stroke();
}

/**
 * Draws centered text with a glowing effect.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {string} text The text to draw.
 * @param {object} center The center pixel coordinate { x, y }.
 * @param {string} color The text color.
 * @param {number} size The font size.
 */
function drawGlowText(ctx, text, center, color, size = 16) {
    // CRITICAL FIX: Changed 'Courier New' to 'Orbitron' to match the rest of the game.
    // We must specify 'bold' to match the bold version of the font file.
    ctx.font = `bold ${size}px 'Orbitron'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.fillText(text, center.x, center.y);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
}

/**
 * The main render function. Applies camera transforms and draws the scene.
 * @param {object} gameState The central game state object from main.js.
 */
export function render(gameState) {
    const { ctx, canvas, hexGrid, playerPos, exitPos, validMoves, zoomLevel, particles } = gameState;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawParticles(ctx, particles);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoomLevel, zoomLevel);
    const playerPixelPos = axialToPixel(playerPos);
    ctx.translate(-playerPixelPos.x, -playerPixelPos.y);

    hexGrid.forEach((hex) => {
        const pixel = axialToPixel(hex.coords);
        let hexColor = '#004466';
        let textColor = '#ffffff';
        let textContent = hex.expression || '';
        let currentHexSize = HEX_SIZE;
        
        const isPlayer = (hex.coords.q === playerPos.q && hex.coords.r === playerPos.r);
        const isExit = (hex.type === 'exit');
        const isValidMove = validMoves.some(m => m.coords.q === hex.coords.q && m.coords.r === hex.coords.r);

        if (isPlayer) {
            hexColor = '#00ffff';
            textContent = '';
        } else if (isExit) {
            const pulse = 1 + 0.1 * Math.sin(Date.now() * 0.008);
            currentHexSize = HEX_SIZE * pulse;
            hexColor = '#ff00ff';
            textColor = '#ffaaff';
            textContent = 'EXIT';
        } else if (isValidMove) {
            const pulse = 1 + 0.05 * Math.sin(Date.now() * 0.005);
            currentHexSize = HEX_SIZE * pulse;
            hexColor = '#00ff7f';
        } else if (hex.type === 'data' && !hex.collected) {
            hexColor = '#ffff00';
            textColor = '#ffff00';
            textContent = '??';
        } else if (hex.collected) {
            hexColor = '#888800';
            textContent = '';
        } else {
             textContent = '';
        }
        
        drawHex(ctx, pixel, currentHexSize, hexColor, isPlayer ? 4 : 2);
        
        if (textContent) {
            drawGlowText(ctx, textContent, pixel, textColor, 14);
        }
    });

    ctx.restore();
}

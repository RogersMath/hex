// render.js - Contains all Canvas rendering logic for the game.

const HEX_SIZE = 35; // The size of the hexagons in pixels.

/**
 * Converts axial hex coordinates to pixel coordinates on the canvas.
 * @param {HTMLCanvasElement} canvas The canvas element.
 * @param {object} coords The axial coordinates { q, r }.
 * @returns {object} The pixel coordinates { x, y }.
 */
function axialToPixel(canvas, { q, r }) {
    const x = HEX_SIZE * (1.5 * q);
    const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
    // Center the grid on the canvas
    return { x: x + canvas.width / 2, y: y + canvas.height / 2 };
}

/**
 * Draws a single hexagon outline on the canvas.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {object} center The center pixel coordinate { x, y }.
 * @param {number} size The size of the hex.
 * @param {string} color The stroke color.
 * @param {number} lineWidth The width of the outline.
 */
function drawHex(ctx, center, size, color, lineWidth = 2) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
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
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

/**
 * Draws centered text with a glowing effect.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {string} text The text to draw.
 * @param {number} x The center x-coordinate.
 * @param {number} y The center y-coordinate.
 * @param {string} color The text color.
 * @param {number} size The font size.
 */
function drawGlowText(ctx, text, x, y, color, size = 16) {
    ctx.font = `bold ${size}px 'Courier New'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // The glow is created using a shadow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    
    ctx.fillText(text, x, y);
    
    // Reset shadow to prevent it from affecting other elements
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
}

/**
 * The main render function. Clears and redraws the entire game canvas based on the current state.
 * @param {object} gameState The central game state object from main.js.
 */
export function render(gameState) {
    const { ctx, canvas, hexGrid, playerPos, exitPos, validMoves } = gameState;

    if (!ctx || !canvas) return;
    
    // Clear the canvas for the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Determine which hexes should be visible (player, exit, and valid moves)
    const visibleHexKeys = new Set([
        `${playerPos.q},${playerPos.r}`,
        `${exitPos.q},${exitPos.r}`
    ]);
    validMoves.forEach(move => visibleHexKeys.add(`${move.coords.q},${move.coords.r}`));

    // Iterate over all hexes in the grid and draw them if visible
    hexGrid.forEach((hex, key) => {
        if (!visibleHexKeys.has(key)) {
            return; // Skip drawing for non-visible hexes
        }
        
        const pixel = axialToPixel(canvas, hex.coords);
        
        // Determine hex color and text based on its properties
        let hexColor = '#004466'; // Default color
        let textColor = '#ffffff';
        let textContent = hex.expression || '';
        
        const isPlayer = (hex.coords.q === playerPos.q && hex.coords.r === playerPos.r);
        const isExit = (hex.type === 'exit');
        const isValidMove = validMoves.some(m => m.coords.q === hex.coords.q && m.coords.r === hex.coords.r);

        if (isPlayer) {
            hexColor = '#00ffff';
            textContent = ''; // Player hex has no text
        } else if (isExit) {
            hexColor = '#ff00ff';
            textColor = '#ffaaff';
            textContent = 'EXIT';
        } else if (isValidMove) {
            hexColor = '#00ff7f';
        } else if (hex.type === 'data' && !hex.collected) {
            hexColor = '#ffff00';
            textColor = '#ffff00';
            textContent = '??';
        } else if (hex.collected) {
            hexColor = '#888800'; // Dim color for collected nodes
            textContent = '';
        }
        
        // Pulse effect for exit hex
        const size = isExit ? HEX_SIZE * (1 + 0.1 * Math.sin(Date.now() * 0.005)) : HEX_SIZE;

        // Draw the hex outline
        drawHex(ctx, pixel, size, hexColor, isPlayer ? 4 : 2);
        
        // Draw the text inside the hex if there is any
        if (textContent) {
            drawGlowText(ctx, textContent, pixel.x, pixel.y, textColor, 14);
        }
    });
}

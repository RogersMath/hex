/**
 * The main render function. Applies camera transforms and draws the scene.
 * @param {object} gameState The central game state object from main.js.
 */
export function render(gameState) {
    const { ctx, canvas, hexGrid, playerPos, exitPos, validMoves, zoomLevel } = gameState;
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // --- UPDATED: CAMERA TRANSFORM ---
    ctx.save(); // Save the default state

    // 1. Move canvas origin to the center of the screen.
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // 2. Apply the zoom level.
    ctx.scale(zoomLevel, zoomLevel);

    // 3. Pan the camera to keep the player-controlled hex in the center.
    const playerPixelPos = axialToPixel(playerPos);
    ctx.translate(-playerPixelPos.x, -playerPixelPos.y);

    // --- DRAWING LOGIC (Now happens inside the transformed context) ---
    hexGrid.forEach((hex) => {
        const pixel = axialToPixel(hex.coords);
        let hexColor = '#004466';
        let textColor = '#ffffff';
        let textContent = hex.expression || '';
        
        const isPlayer = (hex.coords.q === playerPos.q && hex.coords.r === playerPos.r);
        const isExit = (hex.type === 'exit');
        const isValidMove = validMoves.some(m => m.coords.q === hex.coords.q && m.coords.r === hex.coords.r);

        if (isPlayer) {
            hexColor = '#00ffff';
            textContent = '';
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
            hexColor = '#888800';
            textContent = '';
        } else {
             // For hexes that aren't special, don't draw text.
             textContent = '';
        }
        
        drawHex(ctx, pixel, hexColor, isPlayer ? 4 : 2);
        
        if (textContent) {
            drawGlowText(ctx, textContent, pixel, textColor, 14);
        }
    });

    ctx.restore(); // Restore the context to its default state for the next frame.
} // <-- THIS CLOSING BRACE WAS MISSING

import { shipState, saveGameState, formatSpeed } from "../../everywhere.js";
import { updateTitleAndMeta } from "../../Birdhouse/src/main.js";

export default async function SpeedControl() {
    setTimeout(setupEventHandlers, 0);

    return `
        <div id="speed-control">
            <h2>Speed Control</h2>
            <p>Target Speed: <span id="targetSpeedDisplay">${formatSpeed(shipState.targetSpeed)}</span></p>
            <p>Current Speed: <span id="currentSpeedDisplay">${shipState.energy > 0 ? formatSpeed(shipState.currentSpeed) : 'No power'}</span></p>
            <label><input type="range" id="speedSlider" min="0" max="5" value="${shipState.targetSpeed}" step="0.1"><label>
        </div>
    `;
}

let targetSpeedDisplay = null;
let currentSpeedDisplay = null;

function setupEventHandlers() {
    const speedSlider = document.getElementById('speedSlider');
    targetSpeedDisplay = document.getElementById('targetSpeedDisplay');
    currentSpeedDisplay = document.getElementById('currentSpeedDisplay');

    speedSlider.addEventListener('input', (event) => {
        const newSpeed = parseFloat(event.target.value);
        updateSpeed(newSpeed)
    });

    document.addEventListener('energyStateChanged', (event) => {
        updateSpeed(shipState.targetSpeed);
    });

    document.addEventListener('updateSpeedControl', (event) => {
        updateSpeed(shipState.targetSpeed);
    });
}

export function updateSpeed(newSpeed) {
    shipState.targetSpeed = newSpeed;
    targetSpeedDisplay.textContent = formatSpeed(newSpeed);
    currentSpeedDisplay.textContent = shipState.energy > 0 ? formatSpeed(shipState.currentSpeed) : 'No power';

    const speedChangeEvent = new CustomEvent('updateSpeed');
    document.dispatchEvent(speedChangeEvent);
}
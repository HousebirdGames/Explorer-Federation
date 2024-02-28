import { alertPopup, updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { shipState, saveGameState, formatSpeed } from "../../everywhere.js";

export default async function SpeedControl() {
    setupEventHandlers();

    return `
        <div id="speed-control">
            <h2>Speed Control</h2>
            <p>Target Speed: <span id="targetSpeedDisplay">${formatSpeed(shipState.targetSpeed)}</span></p>
            <p>Current Speed: <span id="currentSpeedDisplay">${shipState.energy > 0 ? formatSpeed(shipState.currentSpeed) : formatSpeed(shipState.currentSpeed) + ' (No power)'}</span></p>
            <label><input type="range" id="speedSlider" min="0" max="5" value="${shipState.targetSpeed}" step="0.1"><label>
            <button id="engageButton">Engage</button>
            <button id="fullStopButton">Full Stop</button>
        </div>
    `;
}

function setupEventHandlers() {
    action({
        type: 'input', selector: '#speedSlider', handler: (e) => {
            const newSpeed = parseFloat(e.target.value);
            updateSpeed(newSpeed);
        }
    });

    action({
        type: 'click', selector: '#engageButton', handler: (e) => {
            if (shipState.course == null) {
                alertPopup('No course set');
                return;
            }
            else if (shipState.course.x === shipState.position.x && shipState.course.y === shipState.position.y && (shipState.targetPlanet == null || shipState.targetPlanet === shipState.currentPlanet)) {
                alertPopup('Already at destination');
                return;
            }
            else if (shipState.targetSpeed === 0) {
                alertPopup('No speed set');
                return;
            }
            else if (shipState.energy <= 0) {
                alertPopup('No power');
                return;
            }
            shipState.engage = true;
        }
    });

    action({
        type: 'click', selector: '#fullStopButton', handler: () => {
            updateSpeed(0);
            const speedSlider = document.getElementById('speedSlider');
            speedSlider.value = 0;
        }
    });

    action({
        type: 'energyStateChanged', handler: (e) => {
            updateSpeed(shipState.targetSpeed);
        }
    });

    action({
        type: 'updateSpeedControl', handler: (e) => {
            updateSpeed(shipState.targetSpeed);
        }
    });
}

export function updateSpeed(newSpeed) {
    const targetSpeedDisplay = document.getElementById('targetSpeedDisplay');
    const currentSpeedDisplay = document.getElementById('currentSpeedDisplay');
    shipState.targetSpeed = newSpeed;
    targetSpeedDisplay.textContent = formatSpeed(newSpeed);
    currentSpeedDisplay.textContent = shipState.energy > 0 ? formatSpeed(shipState.currentSpeed) : formatSpeed(shipState.currentSpeed) + ' (No power)';

    const speedChangeEvent = new CustomEvent('updateSpeed');
    document.dispatchEvent(speedChangeEvent);
}
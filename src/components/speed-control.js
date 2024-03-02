import { alertPopup, updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { shipState, saveGameState, formatSpeed } from "../../everywhere.js";

export default async function SpeedControl() {
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
        type: 'updateUI', handler: (e) => {
            updateSpeed(shipState.targetSpeed);
        }
    });

    return `
        <div class="panel" id="speed-control">
            <h2>Speed Control</h2>
            <div class="panelRow">
                <div class="panel">
                    <h3>Helms Control</h3>
                    <p>Target Speed: <span id="targetSpeedDisplay">${formatSpeed(shipState.targetSpeed)}</span></p>
                    <p>Current Speed: <span id="currentSpeedDisplay">${shipState.energy > 0 ? formatSpeed(shipState.currentSpeed) : formatSpeed(shipState.currentSpeed) + ' (No power)'}</span></p>
                    <label><input type="range" id="speedSlider" min="0" max="5" value="${shipState.targetSpeed}" step="0.1"></label>
                    <div class="buttonPanel">
                        <button id="engageButton" class="colored">Engage</button>
                        <button id="fullStopButton" class="colored">Full Stop</button>
                    </div>
                </div>
            </div>
        </div>
    `;
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
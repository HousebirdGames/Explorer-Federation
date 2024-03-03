import { alertPopup, action } from "../../Birdhouse/src/main.js";
import { shipState } from "../../everywhere.js";
import { formatSpeed } from "../game/utils.js";

export default async function SpeedControl() {
    action({
        type: 'input', selector: '#speedSlider', handler: (e) => {
            const newSpeed = parseFloat(e.target.value);
            updateSpeed(newSpeed);
        }
    });

    action({
        type: 'click', selector: '.setSpeedButton', handler: (e) => {
            setTargetSpeed(e)
        }
    });

    action({
        type: 'click', selector: '#speedControlButton', handler: (e) => {
            const button = e.target;
            if (button.textContent === "Engage") {
                if (shipState.course == null) {
                    alertPopup('No course set');
                    return;
                } else if (shipState.course.x === shipState.position.x && shipState.course.y === shipState.position.y && (shipState.targetPlanet == null || shipState.targetPlanet === shipState.currentPlanet)) {
                    alertPopup('Already at destination');
                    return;
                } else if (shipState.targetSpeed === 0) {
                    alertPopup('No speed set');
                    return;
                } else if (shipState.energy <= 0) {
                    alertPopup('No power');
                    return;
                }
                shipState.engage = true;
                button.textContent = "Full Stop";
            } else {
                shipState.engage = false;
                button.textContent = "Engage";
                updateSpeed(0);
            }
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
                    <label><input type="range" id="speedSlider" min="0" max="${shipState.maxSpeed}" value="${shipState.targetSpeed}" step="0.1"></label>
                    <div class="buttonPanel">
                        <button id="speedControlButton" class="colored">${shipState.targetSpeed > 0 ? "Full Stop" : "Engage"}</button>
                        <button class="setSpeedButton colored" data-speed="0.1">Minimum Impulse</button>
                        <button class="setSpeedButton colored" data-speed="0.9">Maximum Impulse</button>
                        <button class="setSpeedButton colored" data-speed="${shipState.maxSpeed}">Maximum Warp</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function updateSpeed(newSpeed, newSliderValue = null) {
    const targetSpeedDisplay = document.getElementById('targetSpeedDisplay');
    const currentSpeedDisplay = document.getElementById('currentSpeedDisplay');
    const speedSlider = document.getElementById('speedSlider');

    speedSlider.max = shipState.impulseEnabled ? (shipState.maxSpeed > 0.9 ? shipState.maxSpeed : 0.9) : 0;

    if (newSliderValue != null) {
        speedSlider.value = newSliderValue;
    }

    setTimeout(() => { speedSlider.value = speedSlider.value > speedSlider.max ? speedSlider.max : speedSlider.value }, 0);

    shipState.targetSpeed = newSpeed > speedSlider.max ? speedSlider.max : newSpeed;
    targetSpeedDisplay.textContent = shipState.impulseEnabled ? formatSpeed(shipState.targetSpeed) : 'No Impulse Drive available';
    currentSpeedDisplay.textContent = shipState.energy > 0 ? formatSpeed(shipState.currentSpeed) : formatSpeed(shipState.currentSpeed) + ' (No power)';

    const speedControlButton = document.getElementById('speedControlButton');
    speedControlButton.textContent = (shipState.targetSpeed > 0 && shipState.currentSpeed > 0) ? "Full Stop" : "Engage";

    const speedChangeEvent = new CustomEvent('updateSpeed');
    document.dispatchEvent(speedChangeEvent);
}

function setTargetSpeed(event) {
    const newSpeed = parseFloat(event.target.getAttribute('data-speed'));

    if (!shipState.impulseEnabled) {
        alertPopup('Impulse disabled');
        return;
    }
    else if (newSpeed > shipState.maxSpeed) {
        alertPopup('This speed is currently not available');
        return;
    }


    updateSpeed(newSpeed, newSpeed);
}
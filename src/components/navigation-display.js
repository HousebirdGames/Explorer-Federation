import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";
import { etaCurrentSpeed, etaTargetSpeed } from "../game/game-loop.js";
import { findDestinationSystemByCoords } from "../game/utils.js";

export default async function NavigationDisplay() {

    action({
        type: 'courseChange',
        handler: displayPositionsAndDestinations
    });
    action({
        type: 'updateUI',
        handler: displayPositionsAndDestinations
    });

    action(displayPositionsAndDestinations);

    return `
        <div id="nav-display"></div>
    `;
}

function displayPositionsAndDestinations() {
    const currentPos = shipState.position;
    const coursePos = shipState.course;
    const destination = findDestinationSystemByCoords(coursePos);

    const display = `
        <div class="panel">
        <h2>Navigation Information</h2>
            <div class="panelRow">
                <div class="panel">
                    <h3>Ship Position</h3>
                    <p>Current Position: X: ${Math.round(currentPos.x)}, Y: ${Math.round(currentPos.y)}</p>
                    <p>${shipState.currentPlanet ? 'Currently orbiting ' + shipState.currentPlanet : 'Not orbiting a planet'}</p>
                </div>
                <div class="panel">
                    <h3>Travel</h3>
                    ${destination.name ? `<p>Destination System: ${destination.name}</p>` : '<p>Empty Space</p>'}
                    <p>Destination Coordinates: X: ${Math.round(coursePos.x)}, Y: ${Math.round(coursePos.y)}</p>
                    <p>Destination Planet: ${shipState.targetPlanet ? `${shipState.targetPlanet.name}` : (destination.discovered ? 'No planet set.' : 'Destination system not discovered.')}</p>
                    <p>ETA at current speed: ${formatTime(etaCurrentSpeed)}</p>
                    <p>ETA at target speed: ${formatTime(etaTargetSpeed)}</p>
                </div>
            </div>
        </div>
    `;

    const navDisplay = document.getElementById('nav-display');
    if (navDisplay) {
        navDisplay.innerHTML = display;
    }
}

function formatTime(time) {
    if (time === 'N/A') {
        return time;
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.round(time % 60);

    if (time == 0) {
        return '-';
    }
    else if (minutes > 0) {
        return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds} Minutes`;
    } else {
        return `${seconds} Seconds`;
    }
}
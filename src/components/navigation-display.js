import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { shipState, starSystems } from "../../everywhere.js";
import { etaCurrentSpeed, etaTargetSpeed } from "../game/game-loop.js";
import { getDestinationByCoords } from "../game/utils.js";

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
    const currentLocation = getDestinationByCoords(currentPos);
    const destination = getDestinationByCoords(coursePos);

    const display = `
        <div class="panel">
        <h2>Navigation Information</h2>
            <div class="panelRow">
                <div class="panel">
                    <h3>Ship Position</h3>
                    <p>Current Position: ${Math.round(currentPos.x)}:${Math.round(currentPos.y)},${Math.round(currentPos.z)}</p>
                    <p>${currentLocation.planet != null ? 'Currently orbiting ' + currentLocation.planet.name : 'Not orbiting a planet'}</p>
                </div>
                <div class="panel">
                    <h3>Travel</h3>
                    ${destination.system != null ? `<p>Destination System: ${destination.system.name}</p>` : '<p>Empty Space</p>'}
                    <p>Destination Coordinates: ${Math.round(coursePos.x)}:${Math.round(coursePos.y)},${Math.round(coursePos.z)}</p>
                    <p>Destination Planet: ${destination.planet != null ? `${destination.planet.name}` : (destination.system.discovered ? 'No planet set' : 'Destination system not discovered.')}</p>
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
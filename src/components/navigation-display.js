import { updateTitleAndMeta } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems, findDestinationSystemByCoords, etaCurrentSpeed, etaTargetSpeed } from "../../everywhere.js";

export default async function NavigationDisplay() {
    setTimeout(setupEventHandlers, 0);

    return `
        <div id="nav-display"></div>
    `;
}

function setupEventHandlers() {
    displayPositionsAndDestinations();

    document.addEventListener('courseChange', (event) => {
        displayPositionsAndDestinations();
    });

    document.addEventListener('shipStatusUpdated', (event) => {
        displayPositionsAndDestinations();
    });

    document.addEventListener('updateSpeedControl', (event) => {
        displayPositionsAndDestinations();
    });
}

function displayPositionsAndDestinations() {
    const currentPos = shipState.position;
    const coursePos = shipState.course;
    const destination = findDestinationSystemByCoords(coursePos);

    const display = `
        <h2>Navigation Display</h2>
        <p>Current Position: X: ${Math.round(currentPos.x)}, Y: ${Math.round(currentPos.y)}</p>
        <p>Current Planet: ${shipState.currentPlanet ? shipState.currentPlanet : 'Not orbiting a planet'}</p>
        ${destination.name ? `<p>Destination System: ${destination.name}</p>` : '<p>Empty Space</p>'}
        <p>Destination Coordinates: X: ${Math.round(coursePos.x)}, Y: ${Math.round(coursePos.y)}</p>
        <p>Destination Planet: ${shipState.targetPlanet ? `${shipState.targetPlanet.name}` : (destination.discovered ? 'No planet set.' : 'Destination system not discovered.')}</p>
        <p>ETA at current speed: ${formatTime(etaCurrentSpeed)}</p>
        <p>ETA at target speed: ${formatTime(etaTargetSpeed)}</p>
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
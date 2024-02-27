import { updateTitleAndMeta } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems, findDestinationSystemByCoords } from "../../everywhere.js";

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

    // Calculate the distance to the destination
    const dx = coursePos.x - currentPos.x;
    const dy = coursePos.y - currentPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the ETA at current speed
    const speed = shipState.currentSpeed;
    const eta = speed > 0 ? distance / speed : 'N/A';

    // Calculate the ETA at target speed
    const targetSpeed = shipState.targetSpeed;
    const etaAtTargetSpeed = targetSpeed > 0 ? distance / targetSpeed : 'N/A';

    const display = `
        <h2>Navigation Display</h2>
        <p>Current Position: X: ${Math.round(currentPos.x)}, Y: ${Math.round(currentPos.y)}</p>
        <p>Current Planet: ${shipState.currentPlanet}</p>
        ${destination.name ? `<p>Destination System: ${destination.name}</p>` : '<p>Empty Space</p>'}
        <p>Destination Coordinates: X: ${Math.round(coursePos.x)}, Y: ${Math.round(coursePos.y)}</p>
        ${shipState.targetPlanet ? `<p>Destination Planet: ${shipState.targetPlanet.name}</p>` : (destination.discovered ? '<p>No planet set.</p>' : '<p>Destination system not discovered.</p>')}
        <p>ETA at current speed: ${formatTime(eta)}</p>
        <p>ETA at target speed: ${formatTime(etaAtTargetSpeed)}</p>
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

    if (minutes > 0) {
        return `${minutes}:${seconds} Minutes`;
    } else {
        return `${seconds} Seconds`;
    }
}
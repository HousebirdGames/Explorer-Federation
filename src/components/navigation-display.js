import { updateTitleAndMeta } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems, findDestinationNameByCoords } from "../../everywhere.js";

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
}

function displayPositionsAndDestinations() {
    const currentPos = shipState.position;
    const coursePos = shipState.course;
    const destination = findDestinationNameByCoords(coursePos);

    const display = `
        <h2>Navigation Display</h2>
        <p>Current Position: X: ${Math.round(currentPos.x)}, Y: ${Math.round(currentPos.y)}</p>
        ${destination.name ? `<p>Destination System: ${destination.name}</p>` : '<p>Empty Space</p>'}
        <p>Destination Coordinates: X: ${Math.round(coursePos.x)}, Y: ${Math.round(coursePos.y)}</p>
        ${shipState.targetPlanet ? `<p>Destination Planet: ${shipState.targetPlanet.name}</p>` : (destination.discovered ? '<p>No planet set.</p>' : '<p>Destination system not discovered.</p>')}
    `;

    const navDisplay = document.getElementById('nav-display');
    if (navDisplay) {
        navDisplay.innerHTML = display;
    }
}
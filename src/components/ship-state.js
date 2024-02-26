import { shipState, saveGameState, formatSpeed } from "../../everywhere.js";

export default async function ShipState() {
    setTimeout(setupEventHandlers, 0);

    return `
        <div id="ship-state">
        </div>
    `;
}

function setupEventHandlers() {
    displayPositionsAndDestinations();

    document.addEventListener('shipStateChanged', (event) => {
        displayPositionsAndDestinations();
    });
}

function displayPositionsAndDestinations() {
    const crewSize = shipState.crew.length;

    const display = `
    <h2>Ship Status</h2>
    <p>Energy: ${shipState.energy.toFixed(2)}</p>
    <p>Energy Required: ~${shipState.lastConsumption.toFixed(2)}</p>
    <p>Hull Integrity: ${shipState.health}</p>
    <p>Shields: ${shipState.shields}</p>
    <p>Crew Size: ${crewSize}</p>
    <p>Current Speed: ${formatSpeed(shipState.currentSpeed)}</p>
`;

    const shipStateDisplay = document.getElementById('ship-state');
    if (shipStateDisplay) {
        shipStateDisplay.innerHTML = display;
    }
}
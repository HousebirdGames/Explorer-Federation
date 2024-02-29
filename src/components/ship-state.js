import { shipState, saveGameState, formatSpeed } from "../../everywhere.js";
import { action } from "../../Birdhouse/src/main.js";

export default async function ShipState() {
    action(displayPositionsAndDestinations);
    action({ type: 'updateUI', handler: displayPositionsAndDestinations });


    return `
        <div id="ship-state">
        </div>
    `;
}

function displayPositionsAndDestinations() {
    const crewSize = shipState.crew.length;

    const energyFlow = shipState.lastConsumption.toFixed(2);

    const display = `
    <h2>Ship Status</h2>
    <p>Fuel: ${shipState.fuel.toFixed(2)}</p>
    <p>Fuel Capacity: ${shipState.fuelCapacity.toFixed(2)}</p>
    <p>Energy: ${shipState.energy.toFixed(2)}</p>
    <p>Energy Capacity: ${shipState.energyCapacity.toFixed(2)}</p>
    <p>Energy Flow: ${energyFlow == 0 ? 'No flow' : (energyFlow > 0 ? `Negative ~${energyFlow}` : `Positive ~${energyFlow * -1}`)}</p>
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
import { factions, npcShips, shipState } from "../../everywhere.js";
import { action } from "../../Birdhouse/src/main.js";
import { getDestinationByCoords, getShipsAtCurrentPosition, getShipsAtCurrentSystem, hash } from "../game/utils.js";

export default async function Ships() {
    action(displayShips);
    action({ type: 'updateUI', handler: displayShips });

    return `
        <div class="panel">
        <h2>Ships at current position</h2>
        <div class="panelRow" id="shipsOverview">
        </div>
        <div class="panelRow" id="shipsDetails">
        </div>
        </div>
    `;
}

function displayShips() {
    const npcShipsAtCurrentXY = getShipsAtCurrentSystem();

    const currentSystem = getDestinationByCoords(shipState.position).system;

    let shipsByPlanet = npcShipsAtCurrentXY.reduce((map, ship) => {
        const orbitingPlanet = currentSystem.planets[ship.position.z - 1] ? currentSystem.planets[ship.position.z - 1].name : 'Empty Space';
        const shipName = `${ship.faction != null ? factions[ship.faction].identifier + ' ' : ''}${ship.name}${ship.destroyed ? ' (destroyed)' : ''}`;

        if (!map[orbitingPlanet]) {
            map[orbitingPlanet] = [];
        }

        map[orbitingPlanet].push(shipName);

        return map;
    }, {});

    let shortDisplay = '<div class="panel"><h3>Ships in System</h3><ul>' + Object.entries(shipsByPlanet).map(([planet, ships]) => {
        return `<li><strong>${planet}:</strong> ${ships.join(', ')}</li>`;
    }).join('') + '</ul></div>';

    if (currentSystem && !currentSystem.discovered) {
        shortDisplay = '<p>System not scanned</p>';
    }
    else if (Object.keys(shipsByPlanet).length === 0) {
        shortDisplay = '<p>No other ships in this system</p>';
    }

    const shipsOverview = document.getElementById('shipsOverview');
    if (shipsOverview) {
        shipsOverview.innerHTML = shortDisplay;
    }

    displayShipsDetails('shipsDetails');
}

let previousHash;
export function resetPreviousShipsHash() {
    previousHash = null;
}

export function displayShipsDetails(containerID, targetButtons = false) {
    const npcShipsAtCurrentPosition = getShipsAtCurrentPosition(shipState.position);
    const currentHash = hash(npcShipsAtCurrentPosition);

    if (currentHash !== previousHash) {
        previousHash = currentHash;
    }
    else {
        return;
    }

    let detailedDisplay = npcShipsAtCurrentPosition.map((ship) => {
        const index = npcShips.findIndex(npcShip => npcShip === ship);
        return displayShipDetails(ship, index, targetButtons);
    }).join('');

    if (detailedDisplay === '') {
        detailedDisplay = '<p>No other ships in this orbit</p>';
    }

    const shipsDetails = document.getElementById(containerID);
    if (shipsDetails) {
        shipsDetails.innerHTML = detailedDisplay;
    }
}

export function displayShipDetails(ship, index, targetButton = false) {
    const currentSystem = getDestinationByCoords(shipState.position).system;
    return `
    <div class="panel">
        <h3>${ship.faction != null ? factions[ship.faction].identifier + ' ' : ''}${ship.name}${ship.destroyed ? ' (destroyed)' : ''}</h3>
        <p>Faction: ${ship.faction != null ? factions[ship.faction].name : 'None'}</p>
        ${currentSystem.planets[ship.position.z - 1] ? `<p>Orbiting: ${currentSystem.planets[ship.position.z - 1].name}</p>` : ''}
        <p>Current Speed: ${ship.speed}</p>
        <p>Course: ${Math.round(ship.course.x)}:${Math.round(ship.course.y)},${Math.round(ship.course.z)}</p>
        <p>Maximum Speed: ${ship.maxSpeed}</p>
        <p>Hull Integrity: ${ship.health}</p>
        <p>Shields: ${ship.shields}</p>
        <p>Energy: ${ship.energy}</p>
        <p>Energy Capacity: ${ship.energyCapacity}</p>
        ${targetButton ? `<button class="colored target-button" data-ship-index="${index}">${shipState.shipTarget != index ? 'Target' : 'Targeted'}</button>` : ''}
    </div>
    `;
}
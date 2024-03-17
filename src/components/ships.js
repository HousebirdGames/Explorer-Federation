import { factions, npcShips, shipState } from "../../everywhere.js";
import { action } from "../../Birdhouse/src/main.js";
import { getDestinationByCoords } from "../game/utils.js";

export default async function Ships() {
    action(displayShips);
    action({ type: 'updateUI', handler: displayShips });

    return `
        <div class="panel">
        <h2>Ships at current position</h2>
        <div class="panelRow" id="ships">
        </div>
        </div>
    `;
}

function displayShips() {
    const npcShipsAtCurrentXY = npcShips.filter(ship => {
        return ship.position.x === shipState.position.x &&
            ship.position.y === shipState.position.y;
    });


    const npcShipsAtCurrentZ = npcShipsAtCurrentXY.filter(ship => {
        return ship.position.z === shipState.position.z;
    });

    const currentSystem = getDestinationByCoords(shipState.position).system;

    let shipsByPlanet = npcShipsAtCurrentXY.reduce((map, ship) => {
        const orbitingPlanet = currentSystem.planets[ship.position.z - 1] ? currentSystem.planets[ship.position.z - 1].name : 'Empty Space';
        const shipName = `${ship.faction != null ? factions[ship.faction].identifier + ' ' : ''}${ship.name}`;

        if (!map[orbitingPlanet]) {
            map[orbitingPlanet] = [];
        }

        map[orbitingPlanet].push(shipName);

        return map;
    }, {});

    let shortDisplay = '<div class="panel"><h3>Ships in System</h3><ul>' + Object.entries(shipsByPlanet).map(([planet, ships]) => {
        return `<li><strong>${planet}:</strong> ${ships.join(', ')}</li>`;
    }).join('') + '</ul></div>';

    let detailedDisplay = npcShipsAtCurrentZ.map(ship => {
        return `
        <div class="panel">
            <h3>${ship.faction != null ? factions[ship.faction].identifier + ' ' : ''}${ship.name}</h3>
            <p>Faction: ${factions[ship.faction].name}</p>
            ${currentSystem.planets[ship.position.z - 1] ? `<p>Orbiting: ${currentSystem.planets[ship.position.z - 1].name}</p>` : ''}
            <p>Current Speed: ${ship.speed}</p>
            <p>Course: ${Math.round(ship.course.x)}:${Math.round(ship.course.y)},${Math.round(ship.course.z)}</p>
            <p>Maximum Speed: ${ship.maxSpeed}</p>
            <p>Hull Integrity: ${ship.health}</p>
            <p>Shields: ${ship.shields}</p>
            <p>Energy: ${ship.energy}</p>
            <p>Energy Capacity: ${ship.energyCapacity}</p>
        </div>
        `;
    }).join('');

    if (currentSystem && !currentSystem.discovered) {
        shortDisplay = '<p>System not scanned</p>';
    }
    else if (Object.keys(shipsByPlanet).length === 0) {
        shortDisplay = '<p>No other ships in this system</p>';
    }

    if (detailedDisplay === '') {
        detailedDisplay = '<p>No other ships in this orbit</p>';
    }

    const shipsDisplay = document.getElementById('ships');
    if (shipsDisplay) {
        shipsDisplay.innerHTML = shortDisplay + detailedDisplay;
    }
}
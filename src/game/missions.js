import { alertPopup } from "../../Birdhouse/src/main.js";
import { playerState, shipState, starSystems, factions, npcShips } from "../../everywhere.js";
import { addLog, getDestinationByCoords } from "./utils.js";

class Mission {
    constructor(type, reputation = 10, location = null, description = null, targetShip = null) {
        this.type = type;
        this.reputation = reputation
        this.location = location;
        this.targetShip = targetShip;
        this.description = description ? description : `${type}${this.location ? ` at ${this.location}` : ''}${targetShip ? ` > ${npcShips[targetShip].name}` : ''}`;
        this.state = 'Active';
    }
}

const missionTypes = ['Discover System', 'Patrol System', 'Patrol Planet', 'Destroy Ship'];

export function checkCompletion(mission) {
    let state = 'Active';
    switch (mission.type) {
        case 'Discover System':
            const system = getDestinationByCoords(mission.location).system;
            if (system.discovered) {
                state = 'Completed';
            }
            break;
        case 'Patrol System':
            if (shipState.position.x === mission.location.x && shipState.position.y === mission.location.y) {
                state = 'Completed';
            }
            break;
        case 'Patrol Planet':
            if (shipState.position.x === mission.location.x && shipState.position.y === mission.location.y && shipState.position.z === mission.location.z) {
                state = 'Completed';
            }
            break;
        case 'Destroy Ship':
            if (npcShips[mission.targetShip].destroyed) {
                state = 'Completed';
            }
            break;
        default:
            throw new Error(`Unsupported mission type (completion): ${mission.type}`);
    }
    mission.state = state;
    if (state != 'Active') {
        if (state === 'Completed') {
            playerState.reputation += mission.reputation;
        }
        shipState.missionHistory.unshift(mission);
        shipState.mission = null;
        const location = getDestinationByCoords(mission.location);
        addLog('Comms', `Mission ${state}. ${mission.type}: ${mission.targetShip ? `<strong>${npcShips[mission.targetShip].name}</strong> at ` : ''} ${location.planet ? `Planet <strong>${location.planet.name}</strong> in the ` : ''}<strong>${location.system.name}</strong> System. ${state === 'Completed' ? `Gained ${mission.reputation} reputation.` : ''}`);
    }
}

export function generateMission() {
    let mission = null;
    let i = 0;

    while (mission == null && i < 10) {
        mission = getMission();
        i++
    }

    if (mission == null) {
        addLog('Comms', 'No missions available.');
    }
    else {
        shipState.mission = mission;
        addLog('Comms', `New mission assigned. <strong>${mission.type}</strong>: ${mission.description}`);
    }
}

function getMission() {
    let missionType = missionTypes[Math.floor(Math.random() * missionTypes.length)];
    let mission = null;

    switch (missionType) {
        case 'Discover System':
            const discoverMission = generateDiscoverSystemMission();
            if (discoverMission) {
                mission = discoverMission;
                break;
            } else {
                missionType = 'Patrol';
            }
        case 'Patrol System':
            mission = generatePatrolSystemMission();
            break;
        case 'Patrol Planet':
            mission = generatePatrolPlanetMission();
            break;
        case 'Destroy Ship':
            mission = generateDestroyShipMission();
            break;
        default:
            throw new Error(`Unsupported mission type (generation): ${missionType}`);
    }

    return mission;
}

function generateDiscoverSystemMission() {
    const undiscoveredSystem = starSystems.find(system => !system.discovered && system.position !== shipState.position);

    if (undiscoveredSystem) {
        return new Mission('Discover System', 20, undiscoveredSystem.coordinates, `Travel to the <strong>${undiscoveredSystem.name}</strong> system and scan it.`);
    } else {
        return null;
    }
}

function generatePatrolSystemMission() {
    const otherSystems = starSystems.filter(system => system.position !== shipState.position);

    if (otherSystems.length === 0) {
        console.error('No other systems available for patrol mission.');
        return null;
    }

    const systemIndex = Math.floor(Math.random() * otherSystems.length);
    const system = otherSystems[systemIndex];
    return new Mission('Patrol System', 10, system.coordinates, `Travel to the <strong>${system.name}</strong> system.`);
}

function generatePatrolPlanetMission() {
    const discoveredSystems = starSystems.filter(system => system.discovered && system.position !== shipState.position);

    if (discoveredSystems.length === 0) {
        console.error('No discovered systems with planets available for patrol mission.');
        return null;
    }

    const systemIndex = Math.floor(Math.random() * discoveredSystems.length);
    const system = discoveredSystems[systemIndex];

    if (!system.planets || system.planets.length === 0) {
        console.error('Selected discovered system has no planets.');
        return null;
    }

    const planetIndex = Math.floor(Math.random() * system.planets.length);

    return new Mission('Patrol Planet', 15, { x: system.coordinates.x, y: system.coordinates.y, z: planetIndex + 1 }, `Travel to the planet <strong>${system.planets[planetIndex].name}</strong> in the <strong>${system.name}</strong> system.`);
}

function generateDestroyShipMission() {
    const filteredNpcShips = npcShips.filter(ship => ship.faction != null && factions[ship.faction].warWith.includes(shipState.faction));

    if (filteredNpcShips.length === 0) {
        console.error('No NPC ships available for destroy mission.');
        return null;
    }

    const shipIndex = Math.floor(Math.random() * filteredNpcShips.length);
    const ship = filteredNpcShips[shipIndex];

    const enemyLocation = getDestinationByCoords(ship.position);

    return new Mission('Destroy Ship', 50, ship.position, `Destroy the ${ship.name} of the ${factions[ship.faction].name}. The ship is located at the ${enemyLocation.system.name} system.`, npcShips.indexOf(ship));
}
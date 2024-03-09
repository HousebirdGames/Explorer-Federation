import { alertPopup } from "../../Birdhouse/src/main.js";
import { playerState, shipState, starSystems } from "../../everywhere.js";
import { addLog, getDestinationByCoords } from "./utils.js";

class Mission {
    constructor(type, reputation = 10, location = null, description = null, target = null) {
        this.type = type;
        this.reputation = reputation
        this.location = location;
        this.target = target;
        this.description = description ? description : `${type}${this.location ? ` at ${this.location}` : ''}${target ? ` > ${target}` : ''}`;
        this.state = 'Active';
    }
}

const missionTypes = ['Discover System', 'Patrol System', 'Patrol Planet'];

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
        default:
            throw new Error(`Unsupported mission type: ${mission.type}`);
    }
    mission.state = state;
    if (state != 'Active') {
        if (state === 'Completed') {
            playerState.reputation += mission.reputation;
        }
        shipState.missionHistory.unshift(mission);
        shipState.mission = null;
        addLog('Comms', `Mission ${state}. ${mission.type}: <strong>${mission.target}</strong>. ${state === 'Completed' ? `Gained ${mission.reputation} reputation.` : ''}`);
    }
}

export function generateMission() {
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
        default:
            throw new Error(`Unsupported mission type: ${missionType}`);
    }

    shipState.mission = mission;
    addLog('Comms', `New mission assigned. <strong>${mission.type}</strong>: ${mission.description}`);
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
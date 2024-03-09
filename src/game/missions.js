import { alertPopup } from "../../Birdhouse/src/main.js";
import { playerState, shipState, starSystems } from "../../everywhere.js";
import { addLog } from "./utils.js";

class Mission {
    constructor(type, target, reputation = 10, description = null) {
        this.type = type;
        this.reputation = reputation
        this.target = target;
        this.description = description ? description : `${type} > ${target}`;
        this.state = 'Active';

        //alertPopup(`New mission`, `${this.description}`);
    }
}

const missionTypes = ['Discover System', 'Patrol System', 'Patrol Planet'];

export function checkCompletion(mission) {
    let state = 'Active';
    let system = null;
    switch (mission.type) {
        case 'Discover System':
            if (starSystems.find(system => system.name === mission.target).discovered) {
                state = 'Completed';
            }
            break;
        case 'Patrol System':
            system = starSystems.find(system => system.name === mission.target);
            if (shipState.position.x === system.coordinates.x && shipState.position.y === system.coordinates.y) {
                state = 'Completed';
            }
            break;
        case 'Patrol Planet':
            if (shipState.currentPlanet === mission.target) {
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
        return new Mission('Discover System', undiscoveredSystem.name, 20, `Travel to the <strong>${undiscoveredSystem.name}</strong> system and scan it.`);
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
    return new Mission('Patrol System', system.name, 10, `Travel to the <strong>${system.name}</strong> system.`);
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
    const planet = system.planets[planetIndex];

    return new Mission('Patrol Planet', planet.name, 15, `Travel to <strong>${planet.name}</strong> in the <strong>${system.name}</strong> system.`);
}
import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";

class Mission {
    constructor(type, target, description = null) {
        this.type = type;
        this.target = target;
        this.description = description ? description : `${type} > ${target}`;
        this.state = 'Active';

        alertPopup(`New mission`, `${this.description}`);
    }
}

const missionTypes = ['Discover System', 'Patrol System', 'Patrol Planet'];

export function checkCompletion(mission) {
    let state = 'Active';
    let system = null;
    switch (mission.type) {
        case 'Discover System':
            if (solarSystems.find(system => system.name === mission.target).discovered) {
                state = 'Completed';
            }
            break;
        case 'Patrol System':
            system = solarSystems.find(system => system.name === mission.target);
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
        shipState.missionHistory.unshift(mission);
        shipState.mission = null;
        alertPopup(`Mission ${state}: ${mission.type}`);
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
}

function generateDiscoverSystemMission() {
    const undiscoveredSystem = solarSystems.find(system => !system.discovered && system.position !== shipState.position);

    if (undiscoveredSystem) {
        return new Mission('Discover System', undiscoveredSystem.name, `Travel to the ${undiscoveredSystem.name} system and scan it.`);
    } else {
        return null;
    }
}

function generatePatrolSystemMission() {
    const otherSystems = solarSystems.filter(system => system.position !== shipState.position);

    if (otherSystems.length === 0) {
        console.error('No other systems available for patrol mission.');
        return null;
    }

    const systemIndex = Math.floor(Math.random() * otherSystems.length);
    const system = otherSystems[systemIndex];
    return new Mission('Patrol System', system.name, `Travel to the ${system.name} system.`);
}

function generatePatrolPlanetMission() {
    const discoveredSystems = solarSystems.filter(system => system.discovered && system.position !== shipState.position);

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

    return new Mission('Patrol Planet', planet.name, `Travel to ${planet.name} in the ${system.name} system.`);
}
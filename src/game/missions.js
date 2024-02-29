import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";

class Mission {
    constructor(type, target) {
        this.type = type;
        this.target = target;
        this.state = 'Active';
    }
}

const missionTypes = ['Discover System', 'Patrol'];

export function checkCompletion(mission) {
    let state = 'Active';
    switch (mission.type) {
        case 'Discover System':
            if (solarSystems.find(system => system.name === mission.target).discovered) {
                state = 'Completed';
            }
            break;
        case 'Patrol':
            const system = solarSystems.find(system => system.name === mission.target);
            if (shipState.position.x === system.coordinates.x && shipState.position.y === system.coordinates.y) {
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
        case 'Patrol':
            mission = generatePatrolMission();
            break;
        default:
            throw new Error(`Unsupported mission type: ${missionType}`);
    }

    shipState.mission = mission;
}

function generateDiscoverSystemMission() {
    const undiscoveredSystem = solarSystems.find(system => !system.discovered);

    if (undiscoveredSystem) {
        return new Mission('Discover System', undiscoveredSystem.name);
    } else {
        return null;
    }
}

function generatePatrolMission() {
    const system = solarSystems[Math.floor(Math.random() * solarSystems.length)];
    return new Mission('Patrol', system.name);
}
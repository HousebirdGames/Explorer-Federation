import { shipState, starSystems, playerState, npcShips } from '../../everywhere.js';

export function formatSpeed(speed) {
    return (speed > 0 && speed < 0.1) ? 'Sub-Impulse' : (speed > 0 ? (speed > 0.9 ? `Warp ${speed.toFixed(1)}` : `Impulse ${Math.round(speed * 10)}`) : '-');
}

export function formatCamelCase(text) {
    const result = text.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function addLog(type, message) {
    shipState.crewLog.unshift({
        type,
        message,
        stardate: playerState.stardate
    });
}

export function updateShipHealth(amount) {
    shipState.health += amount;
    main.alertPopup(`Ship health updated: ${shipState.health}`);
}

export function updateShipFuel(amount) {
    shipState.fuel += amount;
    main.alertPopup(`Ship fuel updated: ${shipState.fuel}`);
}

export function addCrewMember(member) {
    crewState.members.push(member);
    main.alertPopup(`Crew member added: ${member.name}`);
}

export function removeCrewMember(name) {
    crewState.members = crewState.members.filter(member => member.name !== name);
    main.alertPopup(`Crew member removed: ${name}`);
}

export function getDestinationByCoords(coords) {
    let destinationSystemIndex = starSystems.findIndex(system => system.coordinates.x === coords.x && system.coordinates.y === coords.y);
    let destinationSystem = starSystems[destinationSystemIndex] || null;

    let destinationPlanet = null;
    let destinationPlanetIndex = -1;

    if (destinationSystem && coords.z > 0) {
        destinationPlanetIndex = coords.z - 1;
        destinationPlanet = destinationSystem.planets[destinationPlanetIndex] || null;
    }

    return {
        system: destinationSystem,
        systemIndex: destinationSystemIndex,
        planet: destinationPlanet,
        planetIndex: destinationPlanetIndex
    };
}

export function getShipsAtCurrentPosition() {
    return npcShips.filter(ship => {
        return ship.position.x === shipState.position.x &&
            ship.position.y === shipState.position.y &&
            ship.position.z === shipState.position.z;
    });
}

export function getShipsAtCurrentSystem() {
    return npcShips.filter(ship => {
        return ship.position.x === shipState.position.x &&
            ship.position.y === shipState.position.y;
    });
}

export function filterShipsByPlanetIndex(ships, planetIndex) {
    return ships.filter(ship => {
        return ship.position.z === planetIndex;
    });
}

export function arraysAreEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function hash(obj) {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}
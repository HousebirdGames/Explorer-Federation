import { shipState, starSystems, playerState } from '../../everywhere.js';

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
    // Find the destination system and its index
    let destinationSystemIndex = starSystems.findIndex(system => system.coordinates.x === coords.x && system.coordinates.y === coords.y);
    let destinationSystem = starSystems[destinationSystemIndex] || null;

    let destinationPlanet = null;
    let destinationPlanetIndex = -1; // Default to -1 to indicate not found

    if (destinationSystem && coords.z > 0) {
        // Adjust for 0-based index since coords.z starts from 1 for the first planet
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

/* export function findDestinationIndexByCoords(coords) {
    const index = starSystems.findIndex(system => system.coordinates.x === coords[0] && system.coordinates.y === coords[1]);

    if (index === -1) {
        return null;
    }

    return index;
} */
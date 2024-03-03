import { shipState, solarSystems } from '../../everywhere.js';

export function formatSpeed(speed) {
    return speed > 0 ? (speed >= 1 ? `Warp ${speed.toFixed(1)}` : `Impulse ${Math.round(speed * 10)}`) : '-';
}

export function formatCamelCase(text) {
    const result = text.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

export function findDestinationSystemByCoords(coords) {
    for (const system of solarSystems) {
        if (system.coordinates.x === coords.x && system.coordinates.y === coords.y) {
            return system;
        }
    }

    console.error('Destination not found');
    let thisEmptySpace = emptySpace;
    thisEmptySpace.coordinates = { x: coords.x, y: coords.y };
    return thisEmptySpace;
}

export function findDestinationIndexByCoords(coords) {
    const index = solarSystems.findIndex(system => system.coordinates.x === coords[0] && system.coordinates.y === coords[1]);

    if (index === -1) {
        return null;
    }

    return index;
}
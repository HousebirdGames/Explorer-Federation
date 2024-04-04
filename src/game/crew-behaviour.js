import { alertPopup, goToRoute } from "../../Birdhouse/src/main.js";
import { playerState, shipState, starSystems, npcShips } from "../../everywhere.js";
import { formatSpeed, getDestinationByCoords, addLog, hash, getShipsAtCurrentPosition } from "../game/utils.js";
import { getModulesOfType, getModuleInformation } from "./modules.js";
import { setDestinationSystemByCoords } from "../components/course-selection.js";

export const crewTypes = {
    Engineering: 'Engineering',
    Navigation: 'Navigation',
    Science: 'Science',
    Medical: 'Medical',
    Security: 'Security',
    Tactical: 'Tactical'
};

let hashes = {};

export function resetHashes() {
    hashes = {};
}

export function getSuggestionsForCrewType(type, containerId = null) {
    const crewMember = crewTypes[type];
    if (!crewMember) {
        console.error("Crew member type doesn't exist");
        return;
    }

    const suggestions = analyzeSituation(type);

    const suggestionHash = hash(suggestions);
    if (hashes[type] === suggestionHash) {
        return;
    }

    hashes[type] = suggestionHash;
    displaySuggestions(type, suggestions, containerId);
}

function displaySuggestions(type, suggestions, containerId = null) {
    const suggestionTexts = suggestions.map((suggestion, index) => {
        if (typeof suggestion === 'string') {
            return `<li>${suggestion}</li>`;
        } else if (typeof suggestion === 'object' && typeof suggestion.text === 'string' && typeof suggestion.action === 'function') {
            return `<li>We could <span class="action" id="${type}-suggestion-action-${index}">${suggestion.text}</span>.</li>`;
        } else {
            console.error('Invalid suggestion format');
            return '<li>I have nothing to say right now.</li>';
        }
    }).join('');

    if (containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<ul>${suggestionTexts}</ul>`;
        } else {
            console.error("Specified container ID doesn't exist");
        }
    } else {
        alertPopup(`Suggestions from ${type}`, `<ul>${suggestionTexts}</ul>`);
    }

    suggestions.forEach((suggestion, index) => {
        const actionButton = document.getElementById(`${type}-suggestion-action-${index}`);
        if (actionButton && typeof suggestion === 'object' && typeof suggestion.action === 'function') {
            actionButton.addEventListener('click', () => {
                suggestion.action();
                if (!containerId) {
                    alertPopup('Aye, Captain.', `We will ${suggestion.text}.`);
                }
                const message = `Captain ${playerState.name} approved that we ${suggestion.text}.`;
                addLog(type, message);
            });
        }
    });
}

function analyzeSituation(type) {
    switch (type) {
        case 'Engineering':
            return analyzeEngineering();
        case 'Navigation':
            return analyzeNavigation();
        case 'Science':
            return analyzeScience();
        case 'Medical':
            return analyzeMedical();
        case 'Security':
            return analyzeSecurity();
        case 'Tactical':
            return analyzeTactical();
        default:
            console.error('Unknown crew member type');
            return [];
    }
}

function analyzeEngineering() {
    const suggestions = [];

    const energyGenerators = getModulesOfType('energyGenerator');

    if (shipState.energy < shipState.energyCapacity * 0.2) {
        suggestions.push(`Energy reserves at ${Math.round(shipState.energy / shipState.energyCapacity * 100)}%.`);
    }

    if (shipState.energy < shipState.energyCapacity * 0.5) {
        if (energyGenerators.length === 0) {
            suggestions.push('We need an energy generator.');
        }
        else {
            let mostEfficientGenerator = energyGenerators[0];
            energyGenerators.forEach(energyGenerator => {
                if (energyGenerator.efficiency > mostEfficientGenerator.efficiency && !energyGenerator.enabled) {
                    mostEfficientGenerator = energyGenerator;
                }
            });
            if (!mostEfficientGenerator.enabled) {
                suggestions.push({
                    text: `activate the ${mostEfficientGenerator.name} energy generator`,
                    action: mostEfficientGenerator.onEnable
                });
            }
        }
    }

    if (suggestions.length === 0) {
        suggestions.push(`There is nothing I can do right now, Captain ${playerState.name}.`);
    }
    return suggestions;
}

function analyzeNavigation() {
    const suggestions = [];

    if (shipState.currentSpeed <= 0) {
        suggestions.push('We are not moving.');
    }
    else {
        suggestions.push('We are moving at ' + formatSpeed(shipState.currentSpeed) + '.');
    }

    if (shipState.mission != null) {
        if (shipState.mission.location.x !== shipState.course.x ||
            shipState.mission.location.y !== shipState.course.y ||
            shipState.mission.location.z !== shipState.course.z) {
            const location = getDestinationByCoords(shipState.mission.location);
            suggestions.push({
                text: `set course to ${location.planet ? location.planet.name + ' in the ' : 'the '}${location.system.name} system`,
                action: () => {
                    setDestinationSystemByCoords(shipState.mission.location);
                }
            });
        }
    }

    if (shipState.currentSpeed < shipState.targetSpeed && !shipState.engage) {
        suggestions.push({
            text: 'engage the ship',
            action: () => {
                shipState.engage = true;
            }
        });
    }

    if (shipState.currentSpeed > 0.9 && shipState.targetSpeed > 0.9) {
        suggestions.push({
            text: 'reduce the speed to maximum impulse',
            action: () => { shipState.targetSpeed = 0.9; }
        });
    }
    else if (shipState.currentSpeed > 0) {
        suggestions.push({
            text: 'stop the ship',
            action: () => { shipState.engage = false; }
        });
    }

    if (shipState.targetSpeed < shipState.maxSpeed) {
        suggestions.push({
            text: 'set our target speed to ' + formatSpeed(shipState.maxSpeed),
            action: () => { shipState.targetSpeed = shipState.maxSpeed; }
        });
    }

    if (suggestions.length === 0) {
        suggestions.push('I don\'t have any suggestions right now.');
    }
    return suggestions;
}

import { scanCurrentSystem } from "../components/scanner.js";
function analyzeScience() {
    const suggestions = [];

    const destinationSystem = getDestinationByCoords(shipState.course).system;
    if (destinationSystem) {
        if (destinationSystem.discovered === false) {
            if (destinationSystem.coordinates.x === shipState.position.x && destinationSystem.coordinates.y === shipState.position.y) {
                suggestions.push({
                    text: 'scan this star system',
                    action: scanCurrentSystem
                });
            }
            else {
                suggestions.push('We are heading to an undiscovered star system.');
            }
        }
        else {
            suggestions.push(`We have already scanned the ${destinationSystem.name} system.`);
        }
    }
    else {
        suggestions.push('We don\'t have a destination system set.');
    }

    if (suggestions.length === 0) {
        suggestions.push('There is nothing to scan right now.');
    }
    return suggestions;
}

function analyzeMedical() {
    const suggestions = [];

    if (suggestions.length === 0) {
        suggestions.push('I don\'t have any suggestions right now.');
    }
    return suggestions;
}

function analyzeSecurity() {
    const suggestions = [];

    if (suggestions.length === 0) {
        suggestions.push('I don\'t have any suggestions right now.');
    }
    return suggestions;
}

function analyzeTactical() {
    const suggestions = [];

    const phasersBanks = getModulesOfType('phaserBank');
    let phasersEnabled = false;
    phasersBanks.forEach(phaser => {
        if (phaser.enabled) {
            phasersEnabled = true;
        }
    });

    if (!phasersEnabled) {
        suggestions.push('All phasers are offline.');
    }

    const targetedShip = shipState.shipTarget != null ? npcShips[shipState.shipTarget] : null;
    if (targetedShip && !shipState.attacking && phasersEnabled) {
        suggestions.push({
            text: `attack the ${targetedShip.name}`,
            action: () => { shipState.attacking = true; }
        });
    }
    else if (shipState.attacking) {
        suggestions.push({
            text: 'stop attacking',
            action: () => { shipState.attacking = false; }
        });
    }

    const shipsAtCurrentPosition = getShipsAtCurrentPosition(shipState.position);

    if (shipsAtCurrentPosition.length > 0) {
        shipsAtCurrentPosition.forEach(ship => {

            if (shipState.shipTarget != npcShips.indexOf(ship)) {
                suggestions.push({
                    text: `target the ${ship.name}`,
                    action: () => { shipState.shipTarget = npcShips.indexOf(ship); }
                });
            }
        });
    }

    if (shipState.shields <= 0) {
        suggestions.push('Our shields are down.');
    }
    else if (shipState.shields < shipState.shieldsCapacity * 0.8) {
        suggestions.push(`Shields at ${Math.round(shipState.shields / shipState.shieldsCapacity * 100)}%.`);
    }

    if (suggestions.length === 0) {
        suggestions.push('Everything is fine here, Captain. Nothing to report.');
    }
    return suggestions;
}
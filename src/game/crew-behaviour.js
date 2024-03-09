import { alertPopup, goToRoute } from "../../Birdhouse/src/main.js";
import { playerState, shipState, starSystems } from "../../everywhere.js";
import { formatSpeed, getDestinationByCoords, addLog } from "../game/utils.js";
import { getModulesOfType, getModuleInformation } from "./modules.js";

export const crewTypes = {
    Engineering: 'Engineering',
    Navigation: 'Navigation',
    Science: 'Science',
    Medical: 'Medical',
    Security: 'Security',
    Tactical: 'Tactical'
};

export function selectCrewMember(type) {
    const crewMember = crewTypes[type];
    if (!crewMember) {
        console.error("Crew member type doesn't exist");
        return;
    }

    const suggestions = analyzeSituation(type);
    displaySuggestions(type, suggestions);
}

function displaySuggestions(type, suggestions) {
    console.log('displaySuggestions', type, suggestions);

    const suggestionTexts = suggestions.slice(0, 3).map((suggestion, index) => {
        if (typeof suggestion === 'string') {
            return suggestion;
        } else if (typeof suggestion === 'object' && typeof suggestion.text === 'string' && typeof suggestion.action === 'function') {
            return `<p>We could <span class="action" id="${type}-suggestion-action-${index}">${suggestion.text}</span>.</p>`;
        } else {
            console.error('Invalid suggestion format');
            return 'I have nothing to say right now.';
        }
    });

    alertPopup(`Suggestions from ${type}`, suggestionTexts.join('\n'));

    suggestions.slice(0, 3).forEach((suggestion, index) => {
        const button = document.getElementById(`${type}-suggestion-action-${index}`);
        if (button && typeof suggestion === 'object' && typeof suggestion.action === 'function') {
            button.addEventListener('click', () => {
                suggestion.action();
                alertPopup('Aye, Captain.', `We will ${suggestion.text}.`);
                const message = `Captain ${playerState.name} approved that we ${suggestion.text}`;
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
    if (shipState.energy < shipState.energyCapacity * 0.5) {
        if (energyGenerators.length === 0) {
            suggestions.push('We need an energy generator.');
        }
        else {
            let mostEfficientGenerator = energyGenerators[0];
            energyGenerators.forEach(energyGenerator => {
                if (energyGenerator.efficiency > mostEfficientGenerator.efficiency && !energyGenerator.isActive) {
                    mostEfficientGenerator = energyGenerator;
                }
            });
            suggestions.push({
                text: `activate the ${mostEfficientGenerator.name} energy generator`,
                action: mostEfficientGenerator.onEnable
            });
        }
    }

    if (suggestions.length === 0) {
        suggestions.push('I don\'t have any suggestions right now.');
    }
    return suggestions;
}

function analyzeNavigation() {
    const suggestions = [];

    /* if(shipState.mission != null){
        if (shipState.mission.target != shipState.destinationIndex) {
            Hier implementieren, korrekt Kurs zu setzen
    } */

    if (shipState.currentSpeed < shipState.targetSpeed && !shipState.engage) {
        suggestions.push({
            text: 'engage the ship',
            action: () => {
                shipState.engage = true;
            }
        });
    }

    if (shipState.currentSpeed <= 0) {
        suggestions.push('We are not moving.');
    }
    else {
        suggestions.push('We are moving at ' + formatSpeed(shipState.currentSpeed) + '.');
    }

    if (shipState.currentSpeed > 0.9) {
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

    const destinationSystem = starSystems[shipState.destinationIndex];
    if (destinationSystem) {
        if (destinationSystem.discovered === false) {
            if (destinationSystem.position.x === shipState.position.x && destinationSystem.position.y === shipState.position.y) {
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
        suggestions.push('I don\'t have any suggestions right now.');
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

    if (suggestions.length === 0) {
        suggestions.push('I don\'t have any suggestions right now.');
    }
    return suggestions;
}
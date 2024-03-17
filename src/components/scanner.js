import { factions, shipState, starSystems } from "../../everywhere.js";
import { alertPopup, updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { formatSpeed, getDestinationByCoords } from "../game/utils.js";
import Ships from "./ships.js";

export default async function Scanner() {
    action({
        type: 'click',
        handler: () => {
            scanCurrentSystem();
        },
        selector: '#scanSystemButton'
    });

    action(updateTexts);
    action({ type: 'updateUI', handler: updateTexts });

    return `
        <div class="panel">
            <h2>Scanner</h2>
            <div class="panelRow">
                <div class="panel">
                <h3>Current Solar System</h3>
                <p>System: <span id="systemNameText"></span></p>
                <p>System discovered: <span id="systemDiscoveredText"></span></p>
                <p>System Info: <span id="systemInfoText"></span></p>
                <button id="scanSystemButton" class="colored">Scan System</button>
                </div>
            </div>
        </div>
        ${await Ships()}
    `;
}

export function scanCurrentSystem() {
    if (shipState.energy <= 0) {
        alertPopup('No Power');
        return;
    }

    const currentLocation = getDestinationByCoords(shipState.position);

    if (currentLocation == null) {
        alertPopup('No System found');
        return;
    }

    if (currentLocation.system.discovered) {
        alertPopup(currentLocation.system.name + ' system already scanned');
        return;
    }

    starSystems[currentLocation.systemIndex].discovered = true;
    alertPopup(`Successfully scanned the ${currentLocation.system.name} system`);
    updateTexts();
}

export function updateTexts() {
    const systemNameText = document.getElementById('systemNameText');
    const systemDiscoveredText = document.getElementById('systemDiscoveredText');
    const systemInfoText = document.getElementById('systemInfoText');

    if (!systemNameText || !systemDiscoveredText || !systemInfoText) {
        return;
    }

    let currentLocation = getDestinationByCoords(shipState.position);

    if (currentLocation.system == null) {
        systemNameText.textContent = 'Not in a system';
        systemDiscoveredText.textContent = '-';
        systemInfoText.textContent = '-';
        return;
    }

    systemNameText.textContent = currentLocation.system.name;
    systemDiscoveredText.textContent = currentLocation.system.discovered ? 'Yes' : 'No';

    if (currentLocation.system.discovered) {
        systemInfoText.textContent = (factions[currentLocation.system.faction] ? factions[currentLocation.system.faction].name : 'No Faction') + ', Planets: ' + currentLocation.system.planets.length;
    }
    else {
        systemInfoText.textContent = 'Unknown';
    }
}
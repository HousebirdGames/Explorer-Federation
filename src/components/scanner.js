import { shipState, solarSystems, formatSpeed, findDestinationIndexByCoords } from "../../everywhere.js";
import { alertPopup, updateTitleAndMeta } from "../../Birdhouse/src/main.js";

export default async function Scanner() {
    setTimeout(setupEventHandlers, 0);

    return `
        <h2>Speed Control</h2>
        <p>System: <span id="systemNameText"></span></p>
        <p>System discovered: <span id="systemDiscoveredText"></span></p>
        <button id="scanSystemButton">Scan System</button>
    `;
}

let systemNameText = null;
let systemDiscoveredText = null;
let currentSystemIndex = null;

function setupEventHandlers() {
    systemNameText = document.getElementById('systemNameText');
    systemDiscoveredText = document.getElementById('systemDiscoveredText');
    const scanSystemButton = document.getElementById('scanSystemButton');
    currentSystemIndex = findDestinationIndexByCoords([shipState.position.x, shipState.position.y]);

    scanSystemButton.addEventListener('click', () => {
        if (shipState.energy <= 0) {
            alertPopup('No Power');
            return;
        }

        if (currentSystemIndex == null) {
            alertPopup('No System found');
            return;
        }

        if (solarSystems[currentSystemIndex].discovered) {
            alertPopup('System already scanned');
            return;
        }

        solarSystems[currentSystemIndex].discovered = true;
        alertPopup('System scanned');
        updateTexts();
    });

    document.addEventListener('updateSpeedControl', (event) => {
        updateTexts();
    });

    updateTexts();
}

export function updateTexts() {
    if (currentSystemIndex == null) {
        currentSystemIndex = findDestinationIndexByCoords([shipState.position.x, shipState.position.y]);
    }

    if (currentSystemIndex == null) {
        return;
    }

    systemNameText.textContent = solarSystems[currentSystemIndex].name;
    systemDiscoveredText.textContent = solarSystems[currentSystemIndex].discovered ? 'Yes' : 'No';
}
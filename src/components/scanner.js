import { shipState, solarSystems } from "../../everywhere.js";
import { alertPopup, updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { formatSpeed, findDestinationIndexByCoords } from "../game/utils.js";

export default async function Scanner() {
    action({
        type: 'click',
        handler: () => {
            if (shipState.energy <= 0) {
                alertPopup('No Power');
                return;
            }

            const currentSystemIndex = findDestinationIndexByCoords([shipState.position.x, shipState.position.y]);

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
    `;
}

export function updateTexts() {
    const systemNameText = document.getElementById('systemNameText');
    const systemDiscoveredText = document.getElementById('systemDiscoveredText');
    let currentSystemIndex = findDestinationIndexByCoords([shipState.position.x, shipState.position.y]);
    const systemInfoText = document.getElementById('systemInfoText');

    if (currentSystemIndex == null) {
        currentSystemIndex = findDestinationIndexByCoords([shipState.position.x, shipState.position.y]);
    }

    if (currentSystemIndex == null) {
        systemNameText.textContent = 'Not in a system';
        systemDiscoveredText.textContent = '-';
        systemInfoText.textContent = '-';
        return;
    }

    systemNameText.textContent = solarSystems[currentSystemIndex].name;
    systemDiscoveredText.textContent = solarSystems[currentSystemIndex].discovered ? 'Yes' : 'No';

    if (solarSystems[currentSystemIndex].discovered) {
        systemInfoText.textContent = (solarSystems[currentSystemIndex].faction ? solarSystems[currentSystemIndex].faction : 'No Faction') + ', Planets: ' + solarSystems[currentSystemIndex].planets.length;
    }
    else {
        systemInfoText.textContent = 'Unknown';
    }
}
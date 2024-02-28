import { shipState, solarSystems, formatSpeed, findDestinationIndexByCoords } from "../../everywhere.js";
import { alertPopup, updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";

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
        <h2>Speed Control</h2>
        <p>System: <span id="systemNameText"></span></p>
        <p>System discovered: <span id="systemDiscoveredText"></span></p>
        <button id="scanSystemButton">Scan System</button>
    `;
}

export function updateTexts() {
    const systemNameText = document.getElementById('systemNameText');
    const systemDiscoveredText = document.getElementById('systemDiscoveredText');
    const currentSystemIndex = findDestinationIndexByCoords([shipState.position.x, shipState.position.y]);

    if (currentSystemIndex == null) {
        currentSystemIndex = findDestinationIndexByCoords([shipState.position.x, shipState.position.y]);
    }

    if (currentSystemIndex == null) {
        return;
    }

    systemNameText.textContent = solarSystems[currentSystemIndex].name;
    systemDiscoveredText.textContent = solarSystems[currentSystemIndex].discovered ? 'Yes' : 'No';
}
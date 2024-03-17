import { updateTitleAndMeta, alertPopup, action } from "../../Birdhouse/src/main.js";
import { shipState, starSystems, npcShips, factions } from "../../everywhere.js";
import { getDestinationByCoords } from "../game/utils.js";
import { displayShipsDetails, resetPreviousShipsHash } from "./ships.js";
import Log from "./log.js";

export default async function Tactical() {
    action({
        type: 'click',
        handler: (event) => {
            const targetIndex = event.target.getAttribute('data-ship-index');

            if (targetIndex == shipState.shipTarget) {
                shipState.shipTarget = null;
                event.target.innerHTML = 'Target';
                return;
            }

            shipState.shipTarget = targetIndex;
            event.target.innerHTML = 'Targeted';

            const targetButtons = document.querySelectorAll('.target-button');
            targetButtons.forEach(button => {
                if (button.getAttribute('data-ship-index') !== targetIndex) {
                    button.innerHTML = 'Target';
                }
            });
        },
        selector: '.target-button'
    });
    action({
        type: 'updateUI',
        handler: () => {
            displayShipsDetails('targetList', true);
        }
    });
    action({
        type: 'updateUI',
        handler: displayCurrentTarger
    });

    return `
        <h1>Tactical Overview</h1>
        ${await Log('Tactical')}
        <div class="panel">
        <h2>Target Selection</h2>
        <p id="currentTarget"></p>
        <div class="panelRow" id="targetList">
        
            </div>
        </div>
        `;
}

function displayCurrentTarger() {
    const currentTarget = document.getElementById('currentTarget');
    if (currentTarget) {
        const ship = shipState.shipTarget != null ? npcShips[shipState.shipTarget] : null;
        currentTarget.innerHTML = shipState.shipTarget != null ? `Current Target: ${ship.faction != null ? factions[ship.faction].identifier + ' ' : ''}${ship.name} ` : 'No Target';
    }
}
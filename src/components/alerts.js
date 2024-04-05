import { updateTitleAndMeta, alertPopup, action } from "../../Birdhouse/src/main.js";
import { shipState, starSystems } from "../../everywhere.js";
import { addLog, getDestinationByCoords } from "../game/utils.js";

export default async function Alerts() {
    action(() => {
        document.getElementById('alertLevel').innerText = shipState.alert;
    });

    action({
        type: 'click',
        handler: (event) => {
            const alert = event.target.getAttribute('data-alert');
            setAlert(alert);
        },
        selector: '.alertButton'
    });

    /* action({
        type: 'updatedLogic',
        handler: 
    }); */

    return `
        <div class="panel">
            <h2>Alerts</h2>

            <p>Current alert level: <span id="alertLevel">None</span></p>

            <div class="panelRow">

                <div class="panel">
                    <h3>Set alert level</h3>
                    <button class="alertButton colored" data-alert="None">None</button>
                    <button class="alertButton yellow" data-alert="Yellow">Yellow</button>
                    <button class="alertButton red" data-alert="Red">Red</button>
                    <button class="alertButton black" data-alert="Black">Black</button>
                </div>

                <div class="panel">
                    <h3>Information</h3>
                    <p>No alert: All systems normal</p>
                    <p>Red alert: All crew to battle stations</p>
                    <p>Yellow alert: Standby for action</p>
                    <p>Black alert: Shut all systems down</p>
                </div>

            </div>
        </div>
        `;
}

export function setAlert(alert) {
    shipState.alert = alert;
    shipState.lastAlert = null;
    const alertLevelText = document.getElementById('alertLevel')
    if (alertLevelText) {
        alertLevelText.innerText = alert;
    }

    if (alert == 'None') {
        addLog('Captain', `We returned to normal operations.`);
    }
    else {
        addLog('Captain', `We've gone to ${alert} Alert.`);
    }
}
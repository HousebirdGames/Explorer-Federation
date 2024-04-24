import { updateTitleAndMeta, alertPopup, action, roundToFull } from "../../Birdhouse/src/main.js";
import { playerState, shipState, starSystems } from "../../everywhere.js";

export default async function Overview() {
    action(() => updateOverview());

    action({
        type: 'updatedLogic',
        handler: updateOverview
    });

    return `
    <div class="panel">
    <h4>Overview</h4>
    <p class="alertInfo">Alert: ${shipState.alert}</p>
    <p class="shieldsInfo">Shields: ${roundToFull(shipState.shields)}/${shipState.shieldCapacity}</p>
    <p class="stardateInfo">Stardate: ${playerState.stardate}</p>
    </div>
        `;
}

function updateOverview() {
    const shields = document.querySelectorAll('.shieldsInfo');
    shields.forEach(shield => {
        shield.innerHTML = `Shields: ${shipState.shieldCapacity <= 0 ? 'Offline' : `${roundToFull(shipState.shields)}/${shipState.shieldCapacity}`}`;
    });

    const stardate = document.querySelectorAll('.stardateInfo');
    stardate.forEach(date => {
        date.innerHTML = `Stardate: ${playerState.stardate}`;
    });

    const alert = document.querySelectorAll('.alertInfo');
    alert.forEach(alert => {
        alert.innerHTML = `Alert: ${shipState.alert}`;
    });
}
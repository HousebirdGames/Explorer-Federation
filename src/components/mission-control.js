import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { playerState, shipState, starSystems, npcShips } from "../../everywhere.js";
import { getDestinationByCoords } from "../game/utils.js";

export default async function MissionControl() {
    action(updateMissions);
    action({
        type: 'updatedLogic',
        handler: updateMissions
    });

    return `
    <h1>Mission Control</h1>
    <div class="panel" id="mission-control">
            <p>Reputation: <span id="reputation"></span></p>
            <div class="panelRow">
                <div class="panel">
                    <h3>Active Mission</h3>
                    <div id="missionCurrent" class="panelRow"></div>
                </div>
                <div class="panel">
                    <h3>Mission Log</h3>
                    <ul id="missionHistory"></ul>
                </div>
        </div>
    </div>
    `;
}

function updateMissions() {
    document.getElementById('reputation').innerHTML = playerState.reputation;
    const missionLocation = getDestinationByCoords(shipState.mission.location);
    document.getElementById('missionCurrent').innerHTML = shipState.mission === null ? '<p>No mission</p>' : `
    <p>Your current mission: ${shipState.mission.description}</p>
    <ul>
    <li>Mission: <strong>${shipState.mission.type}</strong></li>
    ${shipState.mission.targetShip ? `<li>Target Ship: <strong>${npcShips[shipState.mission.targetShip].name}</strong></li>` : ''}
    ${missionLocation ? `<li>Location: ${missionLocation.planet ? `Planet <strong>${missionLocation.planet.name}</strong> in the ` : ''}<strong>${missionLocation.system.name}</strong> System</li>` : ''}
    <li>Reward: <strong>${shipState.mission.reputation}</strong> Reputation</li>
    </ul>
    `;
    document.getElementById('missionHistory').innerHTML = shipState.missionHistory.length <= 0
        ? '<p>No mission history</p>'
        : '<ul>' + shipState.missionHistory.map(mission => {
            const location = getDestinationByCoords(mission.location);
            return `
            <li>${mission.type}: ${mission.targetShip ? `<strong>${npcShips[mission.targetShip].name}</strong> at ` : ''}${location.planet ? `Planet <strong>${location.planet.name}</strong> in the ` : ''}<strong>${location.system.name}</strong> System (${mission.state} | Reward: ${mission.reputation} Reputation)</li>
            `;
        }).join('') + '</ul>';
}
import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { playerState, shipState, starSystems } from "../../everywhere.js";

export default async function MissionControl() {
    action(updateMissions);
    action({
        type: 'updateUI',
        handler: updateMissions
    });

    return `
    <div class="panel" id="mission-control">
            <h2>Mission Control</h2>
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
    document.getElementById('missionCurrent').innerHTML = shipState.mission === null ? '<p>No mission</p>' : `
    <p>Your current mission: ${shipState.mission.description}</p>
    <ul>
    <li>Mission: ${shipState.mission.type}</li>
    <li>Target: ${shipState.mission.target}</li>
    <li>Reward: ${shipState.mission.reputation} Reputation</li>
    </ul>
    `;
    document.getElementById('missionHistory').innerHTML = shipState.missionHistory.length <= 0 ? '<p>No mission history</p>' :
        '<ul>' + shipState.missionHistory.map(mission => `
        <li>${mission.type}: ${mission.target} (${mission.state} | Reward: ${mission.reputation} Reputation)</li>
        `).join('') + '</ul>';
}
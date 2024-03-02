import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";

export default async function MissionControl() {
    action(updateMissions);
    action({
        type: 'updateUI',
        handler: updateMissions
    });

    return `
    <div class="panel" id="mission-control">
            <h2>Mission Control</h2>
            <div class="panelRow">
                <div class="panel">
                    <h3>Active Mission</h3>
                    <p>Current Mission: <span id="missionCurrent"></span></p>
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
    document.getElementById('missionCurrent').innerHTML = shipState.mission === null ? 'No mission' : `${shipState.mission.type} (${shipState.mission.target}) > ${shipState.mission.description}`;
    document.getElementById('missionHistory').innerHTML = shipState.missionHistory.length <= 0 ? 'No mission history' : shipState.missionHistory.map(mission => `<li>${mission.type}: ${mission.target} (${mission.state})</li>`).join('');
}
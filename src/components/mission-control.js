import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";

export default async function MissionControl() {
    action(updateMissions);
    action({
        type: 'updateUI',
        handler: updateMissions
    });

    return `
        <div id="mission-control">
            <h2>Mission Control</h2>
            <p>Current Mission: <span id="missionCurrent"></span></p>
            <p>Mission History:</p>
            <ul id="missionHistory"></ul>
        </div>
    `;
}

function updateMissions() {
    document.getElementById('missionCurrent').innerHTML = shipState.mission === null ? 'No mission' : `${shipState.mission.type} (${shipState.mission.target}) > ${shipState.mission.description}`;
    document.getElementById('missionHistory').innerHTML = shipState.missionHistory.length <= 0 ? 'No mission history' : shipState.missionHistory.map(mission => `<li>${mission.type}: ${mission.target} (${mission.state})</li>`).join('');
}
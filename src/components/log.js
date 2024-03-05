import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { shipState, playerState } from "../../everywhere.js";

const pages = {};

export default async function Log(type = null, logsPerPage = 5) {
    const currentType = type;
    if (!pages[currentType]) {
        pages[currentType] = { currentPage: 0, logsPerPage };
    }
    action(() => { updateLog(currentType); });
    action({
        type: 'updateUI',
        handler: () => { updateLog(currentType); }
    });

    action({
        type: 'click',
        handler: () => {
            pages[currentType].currentPage--;
            updateLog(currentType);
        },
        selector: `#prevPage${currentType != null && `-${currentType}`}`
    });

    action({
        type: 'click',
        handler: () => {
            pages[currentType].currentPage++;
            updateLog(currentType);
        },
        selector: `#nextPage${currentType != null && `-${currentType}`}`
    });

    return `
            <div class="panelRow">
                <div class="panel">
                <h3>${currentType != null ? currentType + '\'s' : 'Ship\'s'} Log</h3>
                    <div id="crewLog${currentType != null && `-${currentType}`}" class="panelRow"></div>
                        <div class="panelRow">
                            <button id="prevPage${currentType != null && `-${currentType}`}">Previous Page</button>
                            <span id="currentLogPage${currentType != null && `-${currentType}`}"></span>
                            <button id="nextPage${currentType != null && `-${currentType}`}">Next Page</button>
                        </div>
                    </div>
            </div>
    `;
}

function updateLog(currentType = null) {
    const currentPage = pages[currentType].currentPage;
    const logsPerPage = pages[currentType].logsPerPage;
    const start = currentPage * logsPerPage;
    const end = start + logsPerPage;
    const logs = shipState.crewLog.filter(log => log.type == currentType || !currentType);

    const filteredLogs = logs.filter(log => log.type == currentType || !currentType).slice(start, end);

    document.getElementById(`crewLog${currentType != null && `-${currentType}`}`).innerHTML = filteredLogs.length <= 0 ? '<p>No logs</p>' :
        '<ul>' + filteredLogs.map(log => `
        <li>[Stardate ${log.stardate}] ${currentType == null ? `${log.type}: ` : ''}${log.message}</li>
        `).join('') + '</ul>';

    document.getElementById(`prevPage${currentType != null && `-${currentType}`}`).disabled = currentPage === 0;
    document.getElementById(`nextPage${currentType != null && `-${currentType}`}`).disabled = end >= logs.length;
    document.getElementById(`currentLogPage${currentType != null && `-${currentType}`}`).innerText = logs.length > 0 ? `Page ${currentPage + 1}/${Math.ceil(logs.length / logsPerPage)}` : '-';
}
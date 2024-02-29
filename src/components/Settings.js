import { updateTitleAndMeta, action, alertPopup } from "../../Birdhouse/src/main.js";
import { resetGame } from "../../everywhere.js";

export default async function Settings() {
    action({
        type: 'click',
        handler: openResetPopup,
        selector: '#resetGameButton'
    });

    action({
        type: 'click',
        handler: resetGame,
        selector: '#confirmResetGameButton'
    });

    return `
        <div id="">
            <h1>Settings</h1>
            <button id="resetGameButton">Reset Game</button>
        </div>
    `;
}

function openResetPopup() {
    alertPopup('Reset Game', '<p>Are you sure you want to reset the game? Your progress will be lost.</p><br><button id="confirmResetGameButton">Confirm</button><button class="closePopup">Abort</button>', false);
}
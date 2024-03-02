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
        <div class="panel">
        <h1>Settings</h1>
        <div class="panel">
            <h3>General</h3>
            <p>Here you can reset your game, deleting all progress.</p>
            <button id="resetGameButton">Reset Game</button>
            </div>
        </div>
    `;
}

function openResetPopup() {
    alertPopup('Reset Game', '<p>Are you sure you want to reset the game? Your progress will be lost.</p><br><div class="buttonRow"><button id="confirmResetGameButton">Confirm</button><button class="closePopup">Abort</button></div>', false);
}
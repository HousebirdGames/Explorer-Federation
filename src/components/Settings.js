import { updateTitleAndMeta, action, alertPopup } from "../../Birdhouse/src/main.js";
import { displayError } from "../../Birdhouse/src/modules/input-validation.js";
import { resetGame, saveGameState } from "../game/state.js";
import { settings, defaultSettings } from "../../everywhere.js";

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

    action({
        type: 'input',
        handler: setFramerate,
        selector: '#framerateSlider'
    });

    action({
        type: 'click',
        handler: (e) => {
            settings.chunkyAnimations = !settings.chunkyAnimations;
            e.target.innerHTML = settings.chunkyAnimations ? 'Enabled' : 'Disabled';
            saveGameState();
        },
        selector: '#chunkyAnimations'
    });

    action({
        type: 'click',
        handler: () => location.reload(),
        selector: '#reloadPageButton'
    });

    action({
        type: 'click',
        handler: () => {
            for (let key in settings) {
                delete settings[key];
            }
            Object.assign(settings, defaultSettings);
            saveGameState();
            location.reload();
        },
        selector: '#resetSettingsButton'
    });

    return `
        <h1>Settings</h1>
        <div class="panel">
            <div class="panelRow">
                <div class="panel">
                    <h3>General</h3>
                    <p>Here you can reset your game, deleting all progress.</p>
                    <button id="resetGameButton">Reset Game</button>
                    <button id="resetSettingsButton">Reset Settings</button>
                </div>
                <div class="panel">
                    <h3>Graphics</h3>
                    <p>Manage the graphics settings of the game to fit your current device and preferences.</p>

                    <br>
                    <p>Framerate: ${settings.framerate} FPS<span id="newFramerate"></span></p>
                    <label><input type="range" id="framerateSlider" min="1" max="265" value="${settings.framerate}" step="1"></label>

                    <br>
                    <p>Chunky animations</p>
                    <label><button id="chunkyAnimations" class="colored">${settings.chunkyAnimations ? 'Enabled' : 'Disabled'}</button>
                    <div class="error-message">Reload the page to apply the changes.</div>
                    </label>
                    
                    <br>
                    <div class="panelRow">
                            <button id="reloadPageButton">Reload Page</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function openResetPopup() {
    alertPopup('Reset Game', '<p>Are you sure you want to reset the game? Your progress will be lost.</p><br><div class="buttonRow"><button id="confirmResetGameButton">Confirm</button><button class="closePopup">Abort</button></div>', false);
}

function setFramerate(e) {
    settings.framerate = parseInt(e.target.value);
    document.getElementById('newFramerate').innerHTML = ` > ${settings.framerate} FPS`;
    saveGameState();
}
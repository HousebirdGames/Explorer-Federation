import { updateTitleAndMeta, goToRoute, action } from "../../Birdhouse/src/main.js";
import { shipState, starSystems, playerState } from "../../everywhere.js";
import StarMap from "./starmap.js";
import { crewTypes, getSuggestionsForCrewType } from "../game/crew-behaviour.js";
import Log from "./log.js";

export default async function Bridge() {
    updateTitleAndMeta('Bridge', `The bridge of the ${shipState.name}`);

    action({
        type: 'click', handler: () => {
            goToRoute('scanner');
        },
        selector: '#scienceConsole'
    });

    action({
        type: 'click', handler: () => {
            goToRoute('engineering');
        },
        selector: '#engineeringConsole'
    });

    action({
        type: 'click', handler: () => {
            goToRoute('navigation');
        },
        selector: '#navigationConsole'
    });

    action({
        type: 'click', handler: () => {
            goToRoute('starmap');
        },
        selector: '#starmapConsole'
    });

    action({
        type: 'click', handler: () => {
            getSuggestionsForCrewType(crewTypes.Engineering);
        },
        selector: '#engineer'
    });

    action({
        type: 'click', handler: () => {
            getSuggestionsForCrewType(crewTypes.Navigation);
        },
        selector: '#navigator'
    });

    action({
        type: 'click', handler: () => {
            getSuggestionsForCrewType(crewTypes.Tactical);
        },
        selector: '#tactical'
    });

    action({
        type: 'click', handler: () => {
            getSuggestionsForCrewType(crewTypes.Science);
        },
        selector: '#scientist'
    });

    action({
        type: 'updatedLogic',
        handler: () => {
            getSuggestionsForCrewType(crewTypes.Science, 'scienceSuggestions');
            getSuggestionsForCrewType(crewTypes.Tactical, 'tacticalSuggestions');
            getSuggestionsForCrewType(crewTypes.Navigation, 'navigationSuggestions');
            getSuggestionsForCrewType(crewTypes.Engineering, 'engineerSuggestions');
        }
    });

    return `
    <h1>Bridge</h1>
    <div class="panelRow unsetWidth">
        ${await StarMap()}
        <div class="screen">
        </div>
        ${await Log(null, 3)}
    </div>
    <div class="crewSection">
        <div class="crewStation">
            <div class="column">
                <div class="console" id="navigationConsole">
                    <p>Navigation Console</p>
                </div>
                <div class="crew" id="navigator">
                    <p>Navigator</p>
                </div>
            </div>
            <div class="suggestions" id="navigationSuggestions">
            </div>
        </div>
        <div class="crewStation">
            <div class="column">
                <div class="console" id="tacticalonsole">
                    <p>Tactical Console</p>
                </div>
                <div class="crew" id="tactical">
                    <p>Tactical Officer</p>
                </div>
            </div>
            <div class="suggestions" id="tacticalSuggestions">
            </div>
        </div>
        <div class="crewStation">
            <div class="column">
                <div class="console" id="engineeringConsole">
                    <p>Engineering Console</p>
                </div>
                <div class="crew" id="engineer">
                    <p>Engineer</p>
                </div>
            </div>
            <div class="suggestions" id="engineerSuggestions">
            </div>
        </div>
        <div class="crewStation">
            <div class="column">
                <div class="console" id="scienceConsole">
                    <p>Science Console</p>
                </div>
                <div class="crew" id="scientist">
                    <p>Scientist</p>
                </div>
            </div>
            <div class="suggestions" id="scienceSuggestions">
            </div>
        </div>
    </div>
`;
}
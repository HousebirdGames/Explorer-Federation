import { updateTitleAndMeta, goToRoute, action } from "../../Birdhouse/src/main.js";
import { shipState, starSystems, playerState } from "../../everywhere.js";
import StarMap from "./starmap.js";
import { crewTypes, selectCrewMember } from "../game/crew-behaviour.js";

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
            selectCrewMember(crewTypes.Engineering);
        },
        selector: '#engineer'
    });

    action({
        type: 'click', handler: () => {
            selectCrewMember(crewTypes.Navigation);
        },
        selector: '#navigator'
    });

    action({
        type: 'click', handler: () => {
            selectCrewMember(crewTypes.Tactical);
        },
        selector: '#tactical'
    });

    action({
        type: 'click', handler: () => {
            selectCrewMember(crewTypes.Science);
        },
        selector: '#scientist'
    });

    return `
    <h1>Bridge</h1>
    <div class="room-container">
        <div class="room left">
            <div class="top">
            </div>
            <div class="sideConsole" id="engineeringConsole">
                <img class="crew" id="engineer" src="img/graphics/Crew-Standing.png"/>
            </div>
        </div>
        
        <div class="room center">
            <div class="screen">

            </div>
            <div class="centerConsole">
                <div class="console" id="navigationConsole">
                    <img class="crew" id="navigator" src="img/graphics/Crew-Sitting.png"/>
                </div>  
                <div class="console" id="starmapConsole">
                    ${await StarMap(false, true)}
                </div>  
                <div class="console" id="tacticalConsole">
                    <img class="crew" id="tactical" src="img/graphics/Crew-Sitting.png"/>
                </div>  
            </div>
        </div>

        <div class="room right">
            <div class="top">
            </div>
            <div class="sideConsole" id="scienceConsole">
                <img class="crew" id="scientist" src="img/graphics/Crew-Standing.png"/>
            </div>
        </div>
    </div>
`;
}
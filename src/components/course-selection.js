import { updateTitleAndMeta, alertPopup, action } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";

const courseChangeEvent = new CustomEvent('courseChange');

export default async function CourseSelection() {
    action(() => setDestinationSystem(shipState.destinationIndex));
    action({
        type: 'click',
        handler: (event) => {
            const index = event.target.getAttribute('data-index');
            setDestinationSystem(index);
        },
        selector: '.course-btn'
    });
    action({
        type: 'updateUI',
        handler: updateDestinationSystemText
    });
    action({
        type: 'click',
        handler: updateDestinationSystemText,
        selector: '.course-btn'
    });
    action({
        type: 'click',
        handler: resetCourse,
        selector: '#resetCourseButton'
    });

    return `
        <div class="panel">
            <h2>Course Selection</h2>
            <div class="panelRow">
                <div class="panel">
                    <h3>Destination Planet</h3>
                    <div class="buttonPanel" id="planets">
                    <button disabled>Not discovered</button>
                    </div>
                </div>
                <div class="panel">
                    <h3>Destination System</h3>
                    <p id="destinationSystemChosen">Choose destination solar system</p>
                    <button id="resetCourseButton" class="colored">Return to Sol</button>    
                    <div class="buttonPanel">${solarSystems.map((system, index) => `<button class="course-btn informationButton ${system.discovered ? 'discovered' : ''}" data-index="${index}">${system.name}</button>`).join('')}</div>
                </div>
            </div>
        </div>
        `;
}

function updateDestinationSystemText() {
    const destinationSystemChosen = document.getElementById('destinationSystemChosen');
    if (destinationSystemChosen) {
        const destinationSystem = solarSystems[shipState.destinationIndex].name;
        destinationSystemChosen.innerHTML = destinationSystem ? `Selected Destination: ${destinationSystem}` : 'Choose destination solar system';
    }
}

function resetCourse() {
    shipState.course = { x: 0, y: 0 };
    shipState.destinationIndex = 0;
    shipState.targetPlanet = null;
    document.dispatchEvent(courseChangeEvent);
}

export function setDestinationSystem(index) {
    if (index == null) {
        return;
    }

    const destinationSystem = solarSystems[index];
    shipState.course = destinationSystem.coordinates;
    shipState.destinationIndex = index;
    document.dispatchEvent(courseChangeEvent);
    //alertPopup(`Course set to: ${destinationSystem.name} at ${JSON.stringify(destinationSystem.coordinates)}`);

    shipState.targetPlanet = null;

    const planetsDiv = document.getElementById('planets');
    if (!planetsDiv) {
        return;
    }
    if (shipState.destinationIndex == null) {
        planetsDiv.innerHTML = '<p>No Solar System</p>';
    }
    else if (destinationSystem.discovered) {
        planetsDiv.innerHTML = destinationSystem.planets.length > 0 ? (destinationSystem.planets.map((planet, i) => `
        <button class="planet-btn" data-index="${i}">${planet.name}</button>
    `).join('')) : '-';
        setupPlanetEventHandlers(destinationSystem);
    } else {
        planetsDiv.innerHTML = '<button disabled>Not discovered</button>';
    }
    shipState.isMoving = true;
    shipState.engage = false;
}

export function setDestinationCoordinates(x, y) {
    shipState.course = { x, y };
    shipState.destinationIndex = null;
    shipState.targetPlanet = null;
    document.dispatchEvent(courseChangeEvent);
    shipState.isMoving = true;
    shipState.engage = false;
}

function setupPlanetEventHandlers(solarSystem) {
    document.querySelectorAll('.planet-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.getAttribute('data-index');
            const targetPlanet = solarSystem.planets[index];
            shipState.targetPlanet = targetPlanet;
            document.dispatchEvent(courseChangeEvent);
            //alertPopup(`Target planet set to: ${targetPlanet.name}`);
        });
    });
}
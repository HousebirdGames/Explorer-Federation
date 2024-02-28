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

    return `
        <h2 id="test">Select Your Course</h2>
        <div class="hugeSelection" id="planets"><p>Planets: Not discovered</p></div>
        <p>Choose destination solar system:</p>
        <div class="hugeSelection">${solarSystems.map((system, index) => `<button class="course-btn" data-index="${index}">${system.name}</button>`).join('')}</div>
    `;
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
        planetsDiv.innerHTML = '<p>Planets:</p>' + (destinationSystem.planets.length > 0 ? (destinationSystem.planets.map((planet, i) => `
        <button class="planet-btn" data-index="${i}">${planet.name}</button>
    `).join('')) : '<p>-</p>');
        setupPlanetEventHandlers(destinationSystem);
    } else {
        planetsDiv.innerHTML = '<p>Planets: Not discovered</p>';
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
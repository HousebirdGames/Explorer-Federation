import { updateTitleAndMeta, alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";

const courseChangeEvent = new CustomEvent('courseChange');

export default async function CourseSelection() {
    setTimeout(setupEventHandlers, 0);

    return `
        <h2>Select Your Course</h2>
        <div class="hugeSelection" id="planets"><p>Planets: Not discovered</p></div>
        <p>Choose destination solar system:</p>
        <div class="hugeSelection">${solarSystems.map((system, index) => `<button class="course-btn" data-index="${index}">${system.name}</button>`).join('')}</div>
    `;
}

function setupEventHandlers() {
    setDestinationSystem(shipState.destinationIndex);
    document.querySelectorAll('.course-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.getAttribute('data-index');
            setDestinationSystem(index);
        });
    });
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
        planetsDiv.innerHTML = destinationSystem.planets.map((planet, i) => `
                    <button class="planet-btn" data-index="${i}">${planet.name}</button>
                `).join('');
        setupPlanetEventHandlers(destinationSystem);
    } else {
        planetsDiv.innerHTML = '<p>Planets: Not discovered</p>';
    }
    shipState.isMoving = true;
}

export function setDestinationCoordinates(x, y) {
    shipState.course = { x, y };
    shipState.destinationIndex = null;
    shipState.targetPlanet = null;
    document.dispatchEvent(courseChangeEvent);
    shipState.isMoving = true;
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
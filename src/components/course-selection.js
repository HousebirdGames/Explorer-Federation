import { updateTitleAndMeta, alertPopup } from "../../Birdhouse/src/main.js";
import { saveGameState, shipState, solarSystems } from "../../everywhere.js";

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
    SetDestinationSystem(0);

    document.querySelectorAll('.course-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.getAttribute('data-index');
            SetDestinationSystem(index);
            shipState.isMoving = true;
        });
    });
}

function SetDestinationSystem(index) {
    const destinationSystem = solarSystems[index];
    shipState.course = destinationSystem.coordinates;
    document.dispatchEvent(courseChangeEvent);
    //alertPopup(`Course set to: ${destinationSystem.name} at ${JSON.stringify(destinationSystem.coordinates)}`);

    const planetsDiv = document.getElementById('planets');
    shipState.targetPlanet = null;
    if (destinationSystem.discovered) {
        planetsDiv.innerHTML = destinationSystem.planets.map((planet, i) => `
                    <button class="planet-btn" data-index="${i}">${planet.name}</button>
                `).join('');
        setupPlanetEventHandlers(destinationSystem);
    } else {
        planetsDiv.innerHTML = '<p>Planets: Not discovered</p>';
    }
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
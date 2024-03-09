import { updateTitleAndMeta, alertPopup, action } from "../../Birdhouse/src/main.js";
import { shipState, starSystems } from "../../everywhere.js";
import { getDestinationByCoords } from "../game/utils.js";

const courseChangeEvent = new CustomEvent('courseChange');

export default async function CourseSelection() {
    action(() => setDestinationSystemByCoords(shipState.course));
    action({
        type: 'click',
        handler: (event) => {
            const index = event.target.getAttribute('data-index');
            setDestinationSystemByCoords(starSystems[index].coordinates);
        },
        selector: '.course-btn'
    });
    action({
        type: 'updateUI',
        handler: updateDestinationSystemText
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
                    <p>System not discovered</p>
                    </div>
                </div>
                <div class="panel">
                    <h3>Destination System</h3>
                    <p id="destinationSystemChosen">Choose destination star system</p>
                    <button id="resetCourseButton" class="colored">Return to Earth</button>    
                    <div class="buttonPanel">${starSystems.map((system, index) => `<button class="course-btn informationButton ${system.discovered ? 'discovered' : ''}" data-index="${index}">${system.name}</button>`).join('')}</div>
                </div>
            </div>
        </div>
        `;
}

function updateDestinationSystemText() {
    const destinationSystemChosen = document.getElementById('destinationSystemChosen');
    if (destinationSystemChosen) {
        const destinationSystem = getDestinationByCoords(shipState.course).system;
        destinationSystemChosen.innerHTML = destinationSystem != null ? `Selected Destination: ${destinationSystem.name}` : 'Choose destination star system';
    }
}

function resetCourse() {
    setDestinationSystemByCoords({ x: 0, y: 0, z: 3 });
    document.dispatchEvent(courseChangeEvent);
}

export function setDestinationSystemByCoords(coords) {
    if (coords == null) {
        console.error('No coordinates given');
        return;
    }

    shipState.course = coords;

    const destinationSystem = getDestinationByCoords(coords).system;
    document.dispatchEvent(courseChangeEvent);

    const planetsDiv = document.getElementById('planets');
    if (!planetsDiv) {
        return;
    }
    if (destinationSystem == null) {
        planetsDiv.innerHTML = '<p>No Solar System</p>';
        return;
    }

    shipState.course = { x: destinationSystem.coordinates.x, y: destinationSystem.coordinates.y, z: (coords.z ? coords.z : 0) };
    if (destinationSystem.discovered) {
        planetsDiv.innerHTML = destinationSystem.planets.length > 0 ? (destinationSystem.planets.map((planet, i) => `
        <button class="planet-btn" data-index="${i}">${planet.name}</button>
    `).join('')) : '-';
        setupPlanetEventHandlers(destinationSystem);
    } else {
        planetsDiv.innerHTML = '<p>System not discovered</p>';
    }
}

function setupPlanetEventHandlers(starSystem) {
    document.querySelectorAll('.planet-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const zCoord = parseInt(event.target.getAttribute('data-index')) + 1;
            shipState.course = { x: starSystem.coordinates.x, y: starSystem.coordinates.y, z: zCoord };
            document.dispatchEvent(courseChangeEvent);
            //alertPopup(`Target planet set to: ${targetPlanet.name}`);
        });
    });
}
import { updateTitleAndMeta } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems, findDestinationSystemByCoords, findDestinationIndexByCoords } from "../../everywhere.js";
import { setDestinationSystem, setDestinationCoordinates } from "./course-selection.js";

export default async function StarMap() {
    setTimeout(setupEventHandlers, 0);

    return '<svg id="starMap" viewBox="0 0 1000 1000"></svg>';
}

function setupEventHandlers() {
    displayStarMap();

    document.addEventListener('shipStatusUpdated', (event) => {
        displayStarMap();
    });

    document.addEventListener('courseChange', (event) => {
        displayStarMap();
    });

    const starMap = document.getElementById('starMap');
    if (starMap) {
        starMap.addEventListener('wheel', zoom);
        starMap.addEventListener('mousedown', startPan);
        starMap.addEventListener('mouseup', endPan);
        starMap.addEventListener('mouseout', endPan);
        starMap.addEventListener('mousemove', pan);

        // Add click event listener
        starMap.addEventListener('click', (event) => {
            const target = event.target;

            // Check if the clicked element is a circle
            if (target.tagName === 'circle') {
                // Log the coordinates stored in the data attribute
                let coords = target.getAttribute('data-coordinates').split(',').map(Number);
                setDestinationSystem(findDestinationIndexByCoords(coords));
            } else {
                // Calculate the clicked coordinates relative to the SVG element
                const rect = starMap.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                //setDestinationCoordinates(x - 500, y - 500);
            }
        });
    }
}

let zoomLevel = 1;
let panStart = { x: 0, y: 0 };
let panOffset = { x: 0, y: 0 };
let panning = false;

function zoom(event) {
    event.preventDefault();

    const scale = event.deltaY < 0 ? 1.1 : 0.9;
    zoomLevel *= scale;

    const starMap = document.getElementById('starMap');
    if (starMap) {
        const viewBox = starMap.getAttribute('viewBox').split(' ').map(Number);
        const rect = starMap.getBoundingClientRect();
        const dx = (event.clientX - rect.left) / (rect.right - rect.left) * viewBox[2];
        const dy = (event.clientY - rect.top) / (rect.bottom - rect.top) * viewBox[3];

        if (zoomLevel >= 1) {
            viewBox[0] += dx * (1 - 1 / scale);
            viewBox[1] += dy * (1 - 1 / scale);
        }

        viewBox[2] /= scale;
        viewBox[3] /= scale;

        // Prevent zooming out beyond the original view
        if (viewBox[2] > 1000) {
            viewBox[2] = 1000;
            viewBox[3] = 1000;
            zoomLevel = 1;
        }

        starMap.setAttribute('viewBox', viewBox.join(' '));
    }
}

function pan(event) {
    event.preventDefault();
    if (!panning) return;

    const starMap = document.getElementById('starMap');
    if (starMap) {
        const viewBox = starMap.getAttribute('viewBox').split(' ').map(Number);
        const rect = starMap.getBoundingClientRect();

        // Calculate the aspect ratio of the viewBox
        const aspectRatio = viewBox[2] / viewBox[3];

        // Calculate the change in mouse position as a fraction of the SVG element's size
        const dx = (event.clientX - panStart.x) / rect.width * aspectRatio;
        const dy = (event.clientY - panStart.y) / rect.height;

        // Adjust the viewBox coordinates based on the change in mouse position and the viewBox size
        viewBox[0] -= dx * viewBox[2];
        viewBox[1] -= dy * viewBox[3];

        starMap.setAttribute('viewBox', viewBox.join(' '));

        panStart = { x: event.clientX, y: event.clientY };
    }
}

function startPan(event) {
    panning = true;
    panStart = { x: event.clientX, y: event.clientY };
}

function endPan() {
    panning = false;
}

function displayStarMap() {
    let svgContent = ``;

    svgContent += `
        <circle cx="${shipState.position.x + 500}" cy="${shipState.position.y + 500}" r="10" fill="blue">
            <title>Ship</title>
        </circle>
        <text x="${shipState.position.x + 487}" y="${shipState.position.y + 485}" fill="lightblue">You</text>
    `;

    for (const system of solarSystems) {
        const fillColor = system.coordinates === shipState.course ? 'red' : 'white';
        svgContent += `
            <circle cx="${system.coordinates.x + 500}" cy="${system.coordinates.y + 500}" r="5" fill="${fillColor}" data-coordinates="${system.coordinates.x},${system.coordinates.y}">
                <title>${system.name}</title>
            </circle>
            <text x="${system.coordinates.x + 515}" y="${system.coordinates.y + 505}" fill="grey">${system.name}</text>
        `;
    }

    // If the target is a solar system or empty space, draw a dotted line from the ship to the target
    if (shipState.destinationIndex !== null || shipState.course) {
        const targetX = shipState.destinationIndex !== null ? solarSystems[shipState.destinationIndex].coordinates.x : shipState.course.x;
        const targetY = shipState.destinationIndex !== null ? solarSystems[shipState.destinationIndex].coordinates.y : shipState.course.y;

        svgContent += `
            <line x1="${shipState.position.x + 500}" y1="${shipState.position.y + 500}" x2="${targetX + 500}" y2="${targetY + 500}" stroke="red" stroke-dasharray="5,5">
                <title>Course</title>
            </line>
        `;
    }

    // If the target is empty space, mark it with a red box
    if (shipState.destinationIndex === null) {
        svgContent += `
            <rect x="${shipState.course.x + 500 - 5}" y="${shipState.course.y + 500 - 5}" width="10" height="10" fill="red">
                <title>Target</title>
            </rect>
        `;
    }

    const starMap = document.getElementById('starMap');
    if (starMap) {
        starMap.innerHTML = svgContent;
    }
}
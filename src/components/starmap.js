import { updateTitleAndMeta, action } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems, findDestinationSystemByCoords, findDestinationIndexByCoords } from "../../everywhere.js";
import { setDestinationSystem, setDestinationCoordinates } from "./course-selection.js";

let isInteractable = false;
export default async function StarMap(interactable = false) {
    isInteractable = interactable;

    action(displayStarMap);
    action('updateUI', displayStarMap);
    action('courseChange', displayStarMap);

    if (isInteractable) {
        const actions = [
            { type: 'wheel', handler: zoomEvent, passive: false },
            { type: 'mousedown', handler: startPan, passive: true },
            { type: 'mouseup', handler: endPan, passive: true },
            { type: 'mouseout', handler: endPan, passive: true },
            { type: 'mousemove', handler: pan, passive: true },
            { type: 'touchstart', handler: startPan, passive: true },
            { type: 'touchend', handler: endPan, passive: true },
            { type: 'touchcancel', handler: endPan, passive: true },
            { type: 'touchmove', handler: pan, passive: true },
            { type: 'click', handler: (event) => zoom(1.1), selector: '#zoom-in' },
            { type: 'click', handler: (event) => zoom(0.9), selector: '#zoom-out' },
            { type: 'click', handler: click },
            { type: 'touchstart', handler: click, passive: true },
        ];

        for (const a of actions) {
            action(a);
        }
    }

    return `<svg id="starMap" class="noSelect" viewBox="${shipState.position.x} ${shipState.position.y} 1000 1000"></svg>
    ${isInteractable ? `<div id="zoom-controls">
    <button id="zoom-in">+</button>
    <button id="zoom-out">-</button>
    </div>` : ''}
    `;
}

function click(event) {
    const target = event.target;

    if (target.tagName === 'circle') {
        let coords = target.getAttribute('data-coordinates').split(',').map(Number);
        setDestinationSystem(findDestinationIndexByCoords(coords));
    } else {
        const rect = starMap.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    }
}

let zoomLevel = 1;
let panStart = { x: 0, y: 0 };
let panOffset = { x: 0, y: 0 };
let panning = false;

function zoomEvent(event) {
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

        if (viewBox[2] > 1000) {
            resetViewBox();
        } else if (zoomLevel > 5) {
            zoomLevel = 5;
        } else {
            starMap.setAttribute('viewBox', viewBox.join(' '));
        }
    }
}

function zoom(scale) {
    zoomLevel *= scale;

    const starMap = document.getElementById('starMap');
    if (starMap) {
        let viewBox = starMap.getAttribute('viewBox').split(' ').map(Number);

        const centerX = viewBox[0] + viewBox[2] / 2;
        const centerY = viewBox[1] + viewBox[3] / 2;

        if (zoomLevel >= 1) {
            viewBox[0] = centerX - (viewBox[2] / scale) / 2;
            viewBox[1] = centerY - (viewBox[3] / scale) / 2;
        }

        viewBox[2] /= scale;
        viewBox[3] /= scale;

        if (viewBox[2] > 1000) {
            resetViewBox();
        } else if (zoomLevel > 5) {
            zoomLevel = 5;
        } else {
            starMap.setAttribute('viewBox', viewBox.join(' '));
        }
    }
}

function resetViewBox() {
    const starMap = document.getElementById('starMap');
    if (starMap) {
        starMap.setAttribute('viewBox', `${shipState.position.x} ${shipState.position.y} 1000 1000`);
        zoomLevel = 1;
    }
}

function startPan(event) {
    panning = true;
    const start = event.touches ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : { x: event.clientX, y: event.clientY };
    panStart = start;
}

function pan(event) {
    if (!panning) return;

    let currentX, currentY;
    if (event.touches) {
        currentX = event.touches[0].clientX;
        currentY = event.touches[0].clientY;
    } else {
        currentX = event.clientX;
        currentY = event.clientY;
    }

    const dx = (currentX - panStart.x);
    const dy = (currentY - panStart.y);

    const starMap = document.getElementById('starMap');
    if (starMap) {
        let viewBox = starMap.getAttribute('viewBox').split(' ').map(Number);
        const scaleFactorX = viewBox[2] / starMap.clientWidth;
        const scaleFactorY = viewBox[3] / starMap.clientHeight;

        viewBox[0] -= dx * scaleFactorX;
        viewBox[1] -= dy * scaleFactorY;

        starMap.setAttribute('viewBox', viewBox.join(' '));

        panStart = { x: currentX, y: currentY };
    }
}


function endPan() {
    panning = false;
}

function displayStarMap() {
    let svgContent = ``;

    if (shipState.destinationIndex !== null || shipState.course) {
        const targetX = shipState.destinationIndex !== null ? solarSystems[shipState.destinationIndex].coordinates.x : shipState.course.x;
        const targetY = shipState.destinationIndex !== null ? solarSystems[shipState.destinationIndex].coordinates.y : shipState.course.y;

        svgContent += `
            <line x1="${shipState.position.x + 500}" y1="${shipState.position.y + 500}" x2="${targetX + 500}" y2="${targetY + 500}" stroke="red" stroke-dasharray="5,5">
                <title>Course</title>
            </line>
        `;
    }

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
        if (!isInteractable) {
            starMap.setAttribute('viewBox', `${shipState.position.x} ${shipState.position.y} 1000 1000`);
        }
    }
}
import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems, factions, settings, deltaTime, setDeltaTime } from "../../everywhere.js";
import { generateMission, checkCompletion } from "./missions.js";
import { saveGameState } from "./state.js";
import { findDestinationSystemByCoords } from "./utils.js";

let FIXED_TIMESTEP = 1000 / 60;

let lastLogicUpdate = performance.now();

const updateUI = new CustomEvent('updateUI');

export function startGameLoop() {
    let lastTime = performance.now();
    let uiAccumulator = 0;
    const uiUpdateInterval = 1000 / (settings.framerate ? settings.framerate : 60);

    setInterval(() => {
        updateGameLogic();
    }, FIXED_TIMESTEP);

    function loop(currentTime) {
        const deltaTimeUI = currentTime - lastTime;
        lastTime = currentTime;

        uiAccumulator += deltaTimeUI;
        if (uiAccumulator >= uiUpdateInterval) {
            document.dispatchEvent(updateUI);
            uiAccumulator -= uiUpdateInterval;
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

function updateGameLogic() {
    const now = performance.now();
    setDeltaTime((now - lastLogicUpdate) / 1000);
    lastLogicUpdate = now;

    validateShipState();

    updateModules();

    ShipMovement();
    shipState.lastConsumption = shipState.energyTemp - shipState.energy;
    updateEnergyFlow();
    shipState.energyTemp = shipState.energy;

    if (shipState.mission == null) {
        generateMission();
    } else {
        checkCompletion(shipState.mission);
    }

    saveGameState();
}

let energyConsumptions = [];
export let averageEnergyConsumption = 0;
function updateEnergyFlow() {
    energyConsumptions.push(shipState.lastConsumption);

    if (energyConsumptions.length > 100) {
        energyConsumptions.shift();
    }

    averageEnergyConsumption = (energyConsumptions.reduce((a, b) => a + b, 0) / energyConsumptions.length).toFixed(2);
}

function validateShipState() {

}

function updateModules() {
    shipState.maxSpeed = 0;
    shipState.acceleration = 0;
    shipState.impulseEnabled = false;

    shipState.modules?.forEach((module, index) => {
        if (!module.currentHealth && module.currentHealth !== 0) {
            console.error('Invalid module detected:', module);
            return;
        }

        if (module.currentHealth <= 0 && module.enabled) {
            module.information = 'Module has been disabled due to critical damage.';
            module.onDisable();
            alertPopup(`${module.name} has been disabled due to critical damage.`);
        }
        else if (module.enabled) {
            if (module.type == 'impulseDrive') {
                shipState.impulseEnabled = true;
                if (shipState.maxSpeed < 0.9) {
                    shipState.maxSpeed = 0.9;
                }
            }
            else if (module.type == 'warpDrive') {
                if (shipState.maxSpeed < module.properties.warpSpeed) {
                    shipState.maxSpeed = module.properties.warpSpeed;
                }
            }

            module.tickEffect();
        }
    });

    if (!shipState.impulseEnabled) {
        shipState.maxSpeed = 0;
    }
}

function ShipMovement() {
    updateShipPositionAndEnergy();
}

let travelTime = 0;
let targetPlanet = '';
const defaultPlanetTravelTime = 20000;
const defaultDistancePerTick = 0.1;
let distancePerTick = defaultDistancePerTick;

function updateShipPositionAndEnergy() {
    const defaultDeceleration = 0.1 * deltaTime;

    if (shipState.engage && shipState.acceleration <= 0) {
        alertPopup('Unable to accelerate or maintain speed.');
        shipState.engage = false;
    }

    if (shipState.targetSpeed > shipState.maxSpeed) {
        shipState.targetSpeed = shipState.maxSpeed;
    }

    if (shipState.engage && shipState.currentSpeed <= shipState.targetSpeed && shipState.acceleration > 0) {
        shipState.currentSpeed += shipState.acceleration;

        if (shipState.currentSpeed > shipState.targetSpeed) {
            shipState.currentSpeed = shipState.targetSpeed;
        }
    }
    else if (!shipState.engage || shipState.currentSpeed > shipState.targetSpeed || shipState.currentSpeed > shipState.maxSpeed || shipState.acceleration <= 0) {
        shipState.currentSpeed -= defaultDeceleration;
    }

    if (shipState.currentSpeed < 0) {
        shipState.currentSpeed = 0;
    }

    const system = findDestinationSystemByCoords(shipState.course);

    const travelToPlanet = (system && shipState.targetPlanet && system.planets.some(planet => planet.name === shipState.targetPlanet.name)) || false;

    if (shipState.engage && shipState.targetPlanet && targetPlanet != shipState.targetPlanet.name && travelToPlanet && shipState.position.x === shipState.course.x && shipState.position.y === shipState.course.y) {
        targetPlanet = shipState.targetPlanet.name;
        travelTime = defaultPlanetTravelTime;
    }

    const deltaX = shipState.course.x - shipState.position.x;
    const deltaY = shipState.course.y - shipState.position.y;
    const distanceToDestination = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (shipState.engage && shipState.targetPlanet && shipState.targetPlanet.name == shipState.currentPlanet) {
        shipState.engage = false;
        console.log('Arrived at planet');
        shipState.currentSpeed = 0;
        shipState.targetPlanet = null;
        travelTime = 0;
        alertPopup(`Already at ${shipState.currentPlanet}`);
    }
    else if (shipState.engage && travelTime > 0 && travelToPlanet && shipState.targetPlanet.name != shipState.currentPlanet) {
        shipState.position.x = shipState.course.x;
        shipState.position.y = shipState.course.y;
        travelTime -= FIXED_TIMESTEP * shipState.currentSpeed * deltaTime;

        if (travelTime <= 0) {
            shipState.currentPlanet = shipState.targetPlanet.name;
            shipState.targetPlanet = null;
            shipState.engage = false;
            shipState.currentSpeed = 0;
            travelTime = 0;
            alertPopup(`Arrived at ${shipState.currentPlanet}`);
        }
    }
    else if (shipState.engage && distanceToDestination <= distancePerTick * shipState.currentSpeed) {
        shipState.position.x = shipState.course.x;
        shipState.position.y = shipState.course.y;

        if (!travelToPlanet) {
            shipState.engage = false;
            shipState.currentSpeed = 0;
        }

        let alertMessage = '';
        if (system.faction && system.faction == 'Federation') {
            alertMessage = `Arrived at the ${system.name} system`, `You are now in Federation space and have been refuled`;
            shipState.fuel = shipState.fuelCapacity;
        }
        else {
            alertMessage = `Arrived at the ${system.name} system`;
        }

        if (travelToPlanet) {
            alertMessage += ` and are now taveling to ${shipState.targetPlanet.name}`;
            targetPlanet = shipState.targetPlanet.name;
            travelTime = defaultPlanetTravelTime;
        }

        alertPopup(alertMessage);
    } else if (shipState.engage || shipState.currentSpeed > 0) {
        shipState.currentPlanet = null;

        const angleToDestination = Math.atan2(deltaY, deltaX);
        shipState.position.x += Math.cos(angleToDestination) * distancePerTick * shipState.currentSpeed;
        shipState.position.y += Math.sin(angleToDestination) * distancePerTick * shipState.currentSpeed;
    }

    calculateETA();
}

export let etaCurrentSpeed = 0;
export let etaTargetSpeed = 0;
function calculateETA() {
    const deltaDistancePerTick = distancePerTick * deltaTime;
    const system = findDestinationSystemByCoords(shipState.course);
    const travelToPlanet = (system && shipState.targetPlanet && system.planets.some(planet => planet.name === shipState.targetPlanet.name)) || false;

    const deltaX = shipState.course.x - shipState.position.x;
    const deltaY = shipState.course.y - shipState.position.y;
    const distanceToSystem = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    etaCurrentSpeed = shipState.currentSpeed > 0 ? (distanceToSystem / (deltaDistancePerTick * shipState.currentSpeed)) / 60 * deltaTime : Infinity;
    etaTargetSpeed = shipState.targetSpeed > 0 ? (distanceToSystem / (deltaDistancePerTick * shipState.targetSpeed)) / 60 * deltaTime : Infinity;

    if (travelToPlanet) {
        const defaultTravelTimeInSeconds = (travelTime > 0 ? travelTime : defaultPlanetTravelTime) / 1000;
        const planetTravelTimeAtCurrentSpeed = shipState.currentSpeed ? defaultTravelTimeInSeconds / shipState.currentSpeed : defaultTravelTimeInSeconds;
        const planetTravelTimeAtTargetSpeed = shipState.targetSpeed ? defaultTravelTimeInSeconds / shipState.targetSpeed : defaultTravelTimeInSeconds;

        etaCurrentSpeed += planetTravelTimeAtCurrentSpeed;
        etaTargetSpeed += planetTravelTimeAtTargetSpeed;

        if (shipState.targetPlanet.name == shipState.currentPlanet) {
            etaTargetSpeed = 0;
        }
    }

    etaCurrentSpeed = isFinite(etaCurrentSpeed) ? Math.max(etaCurrentSpeed, 0) : 0;
    etaTargetSpeed = isFinite(etaTargetSpeed) ? Math.max(etaTargetSpeed, 0) : 0;
}
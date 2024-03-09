import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, starSystems, factions, settings, deltaTime, setDeltaTime, playerState } from "../../everywhere.js";
import { generateMission, checkCompletion } from "./missions.js";
import { saveGameState } from "./state.js";
import { getDestinationByCoords, addLog } from "./utils.js";

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

    playerState.stardate += deltaTime;
    playerState.stardate = parseFloat(playerState.stardate.toFixed(2));

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
            addLog('Engineering', `${module.name} has been disabled due to critical damage.`);
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

function updateShipPositionAndEnergy() {
    const defaultDeceleration = 0.1 * deltaTime;

    if (shipState.engage && shipState.acceleration <= 0) {
        addLog('Navigation', 'Unable to accelerate or maintain speed.');
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

    if (shipState.engage) {
        const deltaX = shipState.course.x - shipState.position.x;
        const deltaY = shipState.course.y - shipState.position.y;
        const deltaZ = shipState.course.z - shipState.position.z;

        const distanceToDestination = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);

        const dirX = deltaX / distanceToDestination;
        const dirY = deltaY / distanceToDestination;
        const dirZ = deltaZ / distanceToDestination;

        const speedModifier = shipState.currentSpeed * deltaTime;

        if (distanceToDestination > speedModifier) {
            shipState.position.x += dirX * speedModifier;
            shipState.position.y += dirY * speedModifier;
            shipState.position.z += dirZ * speedModifier;
        } else {
            shipState.position.x = shipState.course.x;
            shipState.position.y = shipState.course.y;
            shipState.position.z = shipState.course.z;
            shipState.engage = false;
            shipState.currentSpeed = 0;
            const destination = getDestinationByCoords(shipState.position);
            const message = destination.planet ? `Now orbiting ${destination.planet.name} in the ${destination.system.name} system.` : `Entered the ${destination.system.name} system.`
            alertPopup(`Arrived at the destination`, message);
            addLog('Navigation', `${message}`);
        }
    }

    calculateETA();
}

export let etaCurrentSpeed = 0;
export let etaTargetSpeed = 0;
function calculateETA() {
    const deltaX = shipState.course.x - shipState.position.x;
    const deltaY = shipState.course.y - shipState.position.y;
    const deltaZ = shipState.course.z - shipState.position.z;

    const distanceToDestination = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);

    etaCurrentSpeed = shipState.currentSpeed > 0 ? distanceToDestination / shipState.currentSpeed : Infinity;
    etaTargetSpeed = shipState.targetSpeed > 0 ? distanceToDestination / shipState.targetSpeed : Infinity;

    etaCurrentSpeed = isFinite(etaCurrentSpeed) ? Math.max(etaCurrentSpeed, 0) : 0;
    etaTargetSpeed = isFinite(etaTargetSpeed) ? Math.max(etaTargetSpeed, 0) : 0;
}
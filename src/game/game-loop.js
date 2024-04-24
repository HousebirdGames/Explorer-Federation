import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, starSystems, factions, settings, deltaTime, setDeltaTime, playerState, npcShips } from "../../everywhere.js";
import { getModulesOfType, toggleModulesOfType } from "../game/modules.js";
import { generateMission, checkCompletion } from "./missions.js";
import NPCShip, { resetShip } from "./npc-ship.js";
import { saveGameState } from "./state.js";
import { getDestinationByCoords, addLog, getShipsAtCurrentSystem } from "./utils.js";

let FIXED_TIMESTEP = 1000 / 60;

let lastLogicUpdate = performance.now();

const updateUI = new CustomEvent('updateUI');
const updatedLogic = new CustomEvent('updatedLogic');

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

    updateShipAlert();

    updateModules();

    updateShipFunctions();

    ShipMovement();
    shipState.lastConsumption = shipState.energyTemp - shipState.energy;
    updateEnergyFlow();
    shipState.energyTemp = shipState.energy;

    if (shipState.mission == null) {
        generateMission();
    } else {
        checkCompletion(shipState.mission);
    }

    if (npcShips[shipState.shipTarget] != null && (npcShips[shipState.shipTarget].position.x != shipState.position.x || npcShips[shipState.shipTarget].position.y != shipState.position.y || npcShips[shipState.shipTarget].position.z != shipState.position.z)) {
        const targetName = (npcShips[shipState.shipTarget].faction != null ? factions[npcShips[shipState.shipTarget].faction].identifier + ' ' : '') + npcShips[shipState.shipTarget].name;
        shipState.attacking = false;
        shipState.shipTarget = null;
        addLog('Tactical', `Lost target lock on the ${targetName}.`);
    }

    document.dispatchEvent(updatedLogic);
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


function updateShipAlert() {
    if (shipState.alert == null) {
        console.error('No alert state set');
        shipState.alert = 'None';
    }

    setAlertClass('content', shipState.alert);

    if (shipState.alert == shipState.lastAlert) {
        return;
    }

    shipState.lastAlert = shipState.alert;

    switch (shipState.alert) {
        case 'Red':
            toggleModulesOfType('phaserBank', true);
            toggleModulesOfType('shieldGenerator', true);
            break;
        case 'Yellow':
            toggleModulesOfType('phaserBank', false);
            toggleModulesOfType('shieldGenerator', true);
            break;
        case 'Black':
            toggleModulesOfType('impulseDrive', false);
            toggleModulesOfType('warpDrive', false);
            break;
        default:
            toggleModulesOfType('phaserBank', false);
            toggleModulesOfType('shieldGenerator', false);
            toggleModulesOfType('impulseDrive', true);
            toggleModulesOfType('warpDrive', true);
            break;
    }
}

function setAlertClass(elementId, className) {
    const element = document.getElementById(elementId);
    const classes = ['None', 'Red', 'Yellow', 'Black'];

    classes.forEach((cls) => {
        if (element.classList.contains(cls) && cls !== className) {
            element.classList.remove(cls);
        }
    });

    if (!element.classList.contains(className)) {
        element.classList.add(className);
    }
}

function updateShipFunctions() {
    if (shipState.attacking) {
        const phasers = getModulesOfType('phaserBank');
        if (phasers.length > 0) {
            phasers.forEach(phaser => {
                if (phaser.enabled && phaser.properties.energyLevel >= phaser.properties.energyCapacity) {
                    phaser.functions.shoot.action(phaser, shipState);
                }
            })
        }
    }
}

function ShipMovement() {
    updateShipPositionAndEnergy();
}

function updateShipPositionAndEnergy() {
    const defaultDeceleration = 0.1 * deltaTime * settings.shipSpeedModifier;
    let canMove = shipState.engage;

    if (shipState.engage && shipState.acceleration <= 0) {
        canMove = false;
    }

    if (shipState.targetSpeed > shipState.maxSpeed) {
        shipState.targetSpeed = shipState.maxSpeed;
    }

    if (canMove && shipState.currentSpeed <= shipState.targetSpeed && shipState.acceleration > 0) {
        shipState.currentSpeed += shipState.acceleration * settings.shipSpeedModifier;

        if (shipState.currentSpeed > shipState.targetSpeed) {
            shipState.currentSpeed = shipState.targetSpeed;
        }
    }
    else if (!canMove || shipState.currentSpeed > shipState.targetSpeed || shipState.currentSpeed > shipState.maxSpeed || shipState.acceleration <= 0) {
        shipState.currentSpeed -= defaultDeceleration;
    }

    if (shipState.currentSpeed < 0) {
        shipState.currentSpeed = 0;
    }

    const deltaX = shipState.course.x - shipState.position.x;
    const deltaY = shipState.course.y - shipState.position.y;
    const deltaZ = shipState.course.z - shipState.position.z;

    const distanceToDestination = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);

    const dirX = deltaX / distanceToDestination;
    const dirY = deltaY / distanceToDestination;
    const dirZ = deltaZ / distanceToDestination;

    const speedModifier = shipState.currentSpeed * deltaTime * settings.shipSpeedModifier;

    if (distanceToDestination > speedModifier) {
        shipState.position.x += dirX * speedModifier;
        shipState.position.y += dirY * speedModifier;
        shipState.position.z += dirZ * speedModifier;
    } else if (shipState.engage) {
        shipState.position.x = shipState.course.x;
        shipState.position.y = shipState.course.y;
        shipState.position.z = shipState.course.z;
        shipState.engage = false;
        shipState.currentSpeed = 0;
        const destination = getDestinationByCoords(shipState.position);
        const message = destination.planet ? `Now orbiting ${destination.planet.name} in the ${destination.system.name} system.` : `Entered the ${destination.system.name} system.`
        alertPopup(`Arrived at the destination`, message);
        addLog('Navigation', `${message}`);

        const shipsAtCurrentSystem = getShipsAtCurrentSystem();
        shipsAtCurrentSystem.forEach(npcShip => {
            resetShip(npcShip);
        });

        if (destination.planet.faction != null && destination.planet.faction == shipState.faction) {
            shipState.fuel = shipState.fuelCapacity;
            shipState.energy = shipState.energyCapacity;
            addLog('Engineering', `Orbiting friendly planet. Fuel and energy reserves replenished.`);
        }

        saveGameState();
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

    etaCurrentSpeed = shipState.currentSpeed > 0 ? distanceToDestination / (shipState.currentSpeed * settings.shipSpeedModifier) : Infinity;
    etaTargetSpeed = shipState.targetSpeed > 0 ? distanceToDestination / (shipState.targetSpeed * settings.shipSpeedModifier) : Infinity;

    etaCurrentSpeed = isFinite(etaCurrentSpeed) ? Math.max(etaCurrentSpeed, 0) : 0;
    etaTargetSpeed = isFinite(etaTargetSpeed) ? Math.max(etaTargetSpeed, 0) : 0;
}
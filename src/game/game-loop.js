import { shipState, solarSystems, factions } from "../../everywhere.js";
import { generateMission, checkCompletion } from "./missions.js";
import { saveGameState } from "./state.js";

const updateInterval = 1000;

const updateUI = new CustomEvent('updateUI');
export function startGameLoop() {

    const intervalId = setInterval(() => {
        validateShipState();

        updateModules();

        ShipMovement();
        shipState.lastConsumption = shipState.energyTemp - shipState.energy;
        shipState.energyTemp = shipState.energy;

        if (shipState.mission == null) {
            generateMission();
        }
        else {
            checkCompletion(shipState.mission);
        }

        saveGameState();

        document.dispatchEvent(updateUI);
    }, updateInterval);
}

function validateShipState() {

}

function updateModules() {
    shipState.maxSpeed = 0;
    shipState.modules?.forEach((module, index) => {
        if (!module.currentHealth && module.currentHealth !== 0) {
            console.error('Invalid module detected:', module);
            return;
        }
        if (module.currentHealth <= 0 && module.enabled) {
            module.onDisable();
            main.alertPopup(`${module.name} has been disabled due to critical damage.`);
        }
        else if (module.enabled) {
            module.tickEffect();
        }
    });
}

function ShipMovement() {
    updateShipPositionAndEnergy();
}

let travelTime = 0;
export let etaCurrentSpeed = 0;
export let etaTargetSpeed = 0;
const defaultTravelTime = 20;
let goingToPlanet = '';

function updateShipPositionAndEnergy() {
    const distancePerTick = 2;
    const accelerationRate = 0.1;
    shipState.accelerating = false;

    let enableImpulse;
    shipState.modules.forEach(module => {
        if (module.type == 'impulseDrive' && module.enabled) {
            enableImpulse = true;
        }
    });
    shipState.impulseEnabled = enableImpulse;

    let maxSpeed = shipState.impulseEnabled ? 0.9 : 0;
    if (shipState.impulseEnabled && shipState.maxSpeed > 0.9) {
        maxSpeed = shipState.maxSpeed;
    }
    else {
        shipState.maxSpeed = maxSpeed;
    }

    if (shipState.targetSpeed > maxSpeed) {
        shipState.targetSpeed = maxSpeed;
    }

    let onlyCalculateETA = false;
    if (shipState.currentSpeed === 0 && !shipState.engage) {
        onlyCalculateETA = true;
    }
    else {
        if (shipState.engage && shipState.targetPlanet != null && solarSystems[shipState.destinationIndex].planets.some(planet => planet.name === shipState.targetPlanet.name)) {
            const atTargetSystem = shipState.course.x === shipState.position.x && shipState.course.y === shipState.position.y;
            if ((shipState.targetPlanet.name == shipState.currentPlanet && atTargetSystem) || atTargetSystem && shipState.targetPlanet == null) {
                main.alertPopup('Already at destination');
                shipState.engage = false;
            }
            else {
                console.log('Setting course to', shipState.targetPlanet.name);
                goingToPlanet = shipState.targetPlanet.name;
                travelTime = defaultTravelTime;
                shipState.isMoving = true;
            }
        }
        shipState.engage = false;
    }

    if (!shipState.isMoving || shipState.energy <= 0) {
        shipState.isMoving = false;
        if (shipState.currentSpeed > 0) {
            shipState.currentSpeed -= accelerationRate * 2;
            if (shipState.currentSpeed <= 0) {
                shipState.currentSpeed = 0;
            }
        }
    }

    const deltaX = shipState.course.x - shipState.position.x;
    const deltaY = shipState.course.y - shipState.position.y;
    const distanceToDestination = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (shipState.currentSpeed > 0) {
        etaCurrentSpeed = (distanceToDestination / distancePerTick) / shipState.currentSpeed;
    }
    else {
        etaCurrentSpeed = 0;
    }

    if (shipState.targetSpeed > 0) {
        etaTargetSpeed = (distanceToDestination / distancePerTick) / shipState.targetSpeed;
    }
    else {
        etaTargetSpeed = 0;
    }

    if (onlyCalculateETA) {
        return;
    }

    if (shipState.currentSpeed < shipState.targetSpeed) {
        shipState.currentSpeed += accelerationRate;
        shipState.accelerating = true;
        if (shipState.currentSpeed > shipState.targetSpeed) {
            shipState.currentSpeed = shipState.targetSpeed;
        }
    } else if (shipState.currentSpeed > shipState.targetSpeed) {
        shipState.currentSpeed -= accelerationRate * 2;
        if (shipState.currentSpeed < shipState.targetSpeed) {
            shipState.currentSpeed = shipState.targetSpeed;
        }
    }

    if (shipState.targetSpeed > 0 && shipState.course.x == shipState.position.x && shipState.course.y == shipState.position.y && shipState.targetPlanet !== null && travelTime > 0) {
        if (shipState.targetPlanet.name != goingToPlanet) {
            travelTime = defaultTravelTime;
            goingToPlanet = shipState.targetPlanet.name;
        }

        travelTime -= updateInterval / 1000 * shipState.currentSpeed;

        if (travelTime < defaultTravelTime * 0.75) {
            shipState.currentPlanet = null;
        }

        if (travelTime <= 0 || shipState.targetPlanet.name == shipState.currentPlanet) {
            shipState.currentPlanet = shipState.targetPlanet.name;
            shipState.targetPlanet = null;
            shipState.isMoving = false;
            shipState.currentSpeed = 0;
            main.alertPopup(`Now orbiting ${shipState.currentPlanet}`);
            etaCurrentSpeed = 0;
            etaTargetSpeed = 0;
        }
        else {
            etaCurrentSpeed = travelTime / shipState.currentSpeed;
            etaTargetSpeed = travelTime / shipState.targetSpeed;
        }
    }
    else if (distanceToDestination <= distancePerTick * shipState.currentSpeed) {
        shipState.position.x = shipState.course.x;
        shipState.position.y = shipState.course.y;
        const system = findDestinationSystemByCoords(shipState.course);

        if (system.faction && system.faction == 'Federation') {
            main.alertPopup(`Arrived at ${system.name}`, `You are now in Federation space and have been refuled`);
            shipState.fuel = shipState.fuelCapacity;
        }
        else {
            main.alertPopup(`Arrived at ${system.name}`);
        }

        const atTargetSystem = shipState.course.x === shipState.position.x && shipState.course.y === shipState.position.y;
        const shouldTravelToPlanet = !(shipState.targetPlanet && (shipState.targetPlanet.name == shipState.currentPlanet && atTargetSystem) || atTargetSystem && shipState.targetPlanet == null);
        if (shouldTravelToPlanet && shipState.targetPlanet != null && solarSystems[shipState.destinationIndex].planets.some(planet => planet.name === shipState.targetPlanet.name)) {
            goingToPlanet = shipState.targetPlanet.name;
            travelTime = defaultTravelTime;
        }
        else {
            if (shipState.targetPlanet) {
                main.alertPopup('Already orbiting ' + shipState.targetPlanet.name);
            }
            shipState.isMoving = false;
            shipState.currentSpeed = 0;
        }

        etaCurrentSpeed = 0;
        etaTargetSpeed = 0;
    } else {
        shipState.currentPlanet = null;

        const angleToDestination = Math.atan2(deltaY, deltaX);
        shipState.position.x += Math.cos(angleToDestination) * distancePerTick * shipState.currentSpeed;
        shipState.position.y += Math.sin(angleToDestination) * distancePerTick * shipState.currentSpeed;

        if (shipState.energy < 0 && shipState.isMoving) {
            shipState.energy = 0;
            shipState.isMoving = false;
        }
    }
}
import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems, factions } from "../../everywhere.js";
import { generateMission, checkCompletion } from "./missions.js";
import { saveGameState } from "./state.js";
import { findDestinationSystemByCoords } from "./utils.js";

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
    shipState.acceleration = 0;
    shipState.impulseEnabled = false;

    shipState.modules?.forEach((module, index) => {
        if (!module.currentHealth && module.currentHealth !== 0) {
            console.error('Invalid module detected:', module);
            return;
        }

        if (module.currentHealth <= 0 && module.enabled) {
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
}

function ShipMovement() {
    updateShipPositionAndEnergy();
}

let travelTime = 0;
let targetPlanet = '';
const defaultPlanetTravelTime = 10000;

function updateShipPositionAndEnergy() {
    const distancePerTick = 2;
    const defaultDecerleration = 0.2;

    if (shipState.engage && shipState.currentSpeed < shipState.targetSpeed) {
        shipState.currentSpeed += shipState.acceleration;
        if (shipState.currentSpeed > shipState.targetSpeed) {
            shipState.currentSpeed = shipState.targetSpeed;
        }
    }
    else if (!shipState.engage || shipState.currentSpeed > shipState.targetSpeed || shipState.energy <= 0) {
        shipState.currentSpeed -= defaultDecerleration;
        if (shipState.currentSpeed < 0) {
            shipState.currentSpeed = 0;
        }
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

    if (shipState.engage && travelTime > 0 && travelToPlanet && shipState.targetPlanet.name != shipState.currentPlanet) {
        shipState.position.x = shipState.course.x;
        shipState.position.y = shipState.course.y;
        travelTime -= updateInterval * shipState.currentSpeed;

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

        if (shipState.targetPlanet.name == shipState.currentPlanet) {
            shipState.targetPlanet = null;
            alertPopup(`Already at ${shipState.currentPlanet}`);
        }
        else if (system.faction && system.faction == 'Federation') {
            alertPopup(`Arrived at ${system.name}`, `You are now in Federation space and have been refuled`);
            shipState.fuel = shipState.fuelCapacity;
        }
        else {
            alertPopup(`Arrived at ${system.name}`);
        }
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
    const system = findDestinationSystemByCoords(shipState.course);
    const travelToPlanet = (system && shipState.targetPlanet && system.planets.some(planet => planet.name === shipState.targetPlanet.name)) || false;

    const deltaX = shipState.course.x - shipState.position.x;
    const deltaY = shipState.course.y - shipState.position.y;
    const distanceToSystem = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    etaCurrentSpeed = shipState.currentSpeed > 0 ? distanceToSystem / shipState.currentSpeed : Infinity;
    etaTargetSpeed = shipState.targetSpeed > 0 ? distanceToSystem / shipState.targetSpeed : Infinity;

    if (travelToPlanet) {
        const defaultTravelTimeInSeconds = (travelTime > 0 ? travelTime : defaultPlanetTravelTime) / 1000;
        const planetTravelTimeAtCurrentSpeed = defaultTravelTimeInSeconds / (shipState.currentSpeed || 1);
        const planetTravelTimeAtTargetSpeed = defaultTravelTimeInSeconds / (shipState.targetSpeed || 1);

        etaCurrentSpeed += planetTravelTimeAtCurrentSpeed;
        etaTargetSpeed += planetTravelTimeAtTargetSpeed;
    }

    etaCurrentSpeed = isFinite(etaCurrentSpeed) ? etaCurrentSpeed : 0;
    etaTargetSpeed = isFinite(etaTargetSpeed) ? etaTargetSpeed : 0;
}
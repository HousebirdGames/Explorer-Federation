import { alertPopup, urlPrefix } from "../../Birdhouse/src/main.js";
import { playerState, shipState, solarSystems, factions, settings } from "../../everywhere.js";
import { generateFactions, generateSolarSystems } from "./generation.js";
import * as modules from "./modules.js";

let resetting = false;

const defaultShipState = {
    health: 100,
    shields: 100,
    fuel: 0,
    fuelCapacity: 0,
    modules: [],
    crew: [],
    currentSpeed: 0,
    targetSpeed: 0,
    maxSpeed: 0,
    engage: false,
    energy: 0,
    energyCapacity: 0,
    energyTemp: 0,
    fuelConsumption: 0,
    efficiency: 0,
    lastConsumption: 0,
    acceleration: 0,
    position: { x: 0, y: 0 },
    destinationIndex: 0,
    course: { x: 0, y: 0 },
    currentPlanet: 'Earth',
    targetPlanet: null,
    mission: null,
    missionHistory: [],
    generatedNames: [],
    impulseEnabled: false,
};

export const initialSolarSystem = {
    name: "Sol",
    coordinates: { x: 0, y: 0 },
    discovered: true,
    faction: "Federation",
    planets: [
        { name: "Mercury", type: "Terrestrial", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Venus", type: "Terrestrial", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Earth", type: "Terrestrial", fauna: "Diverse", flora: "Diverse", population: 20400000000, civilization: "Highly Advanced" },
        { name: "Mars", type: "Terrestrial", fauna: "None", flora: "Sparse", population: 140000, civilization: "Highly Advanced" },
        { name: "Jupiter", type: "Gas Giant", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Saturn", type: "Gas Giant", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Uranus", type: "Ice Giant", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Neptune", type: "Ice Giant", fauna: "None", flora: "None", population: 0, civilization: "None" }
    ]
};

export const initialFactions = [
    { name: "Federation", color: "blue", alliedWith: [], warWith: [] },
];

export function saveGameState() {
    if (resetting) {
        return;
    }
    localStorage.setItem('ef_settings', JSON.stringify(settings));
    localStorage.setItem('playerState', JSON.stringify(playerState));
    localStorage.setItem('shipState', JSON.stringify(shipState));
    localStorage.setItem('factions', JSON.stringify(factions));
    localStorage.setItem('solarSystems', JSON.stringify(solarSystems));
}

export function resetGame() {
    resetting = true;
    alertPopup('Reseting game...');
    localStorage.removeItem('playerState');
    localStorage.removeItem('shipState');
    localStorage.removeItem('factions');
    localStorage.removeItem('solarSystems');
    window.location.href = urlPrefix + '/?message=Game+reset+successful';
}

export function loadGameState() {
    const savedSettings = JSON.parse(localStorage.getItem('ef_settings'));
    if (savedSettings) {
        Object.assign(settings, savedSettings);
    }

    const savedPlayerState = JSON.parse(localStorage.getItem('playerState'));
    if (savedPlayerState) {
        Object.assign(playerState, savedPlayerState);
    }

    const savedShipState = JSON.parse(localStorage.getItem('shipState'));
    if (savedShipState) {
        Object.assign(shipState, savedShipState);
        modules.reattachFunctionsAndBehaviors();
    }

    const savedFactionsState = JSON.parse(localStorage.getItem('factions'));
    if (savedFactionsState) {
        Object.assign(factions, savedFactionsState);
    }

    const savedSolarSystemsState = JSON.parse(localStorage.getItem('solarSystems'));
    if (savedSolarSystemsState) {
        Object.assign(solarSystems, savedSolarSystemsState);
    }

    if (Object.keys(shipState).length === 0 || Object.keys(factions).length <= 1 || Object.keys(solarSystems).length <= 1) {
        console.log('No saved game state found');
        localStorage.removeItem('playerState');
        localStorage.removeItem('shipState');
        localStorage.removeItem('factions');
        localStorage.removeItem('solarSystems');
        initializeNewGame();
    }
}

function initializeNewGame() {
    console.log('Starting new game');
    Object.keys(shipState).forEach(key => delete shipState[key]);
    Object.assign(shipState, defaultShipState);

    modules.addModuleToShip('fuelTankS1');
    modules.addModuleToShip('batteryS1');
    modules.addModuleToShip('batteryS1');
    modules.addModuleToShip('energyGeneratorS1');
    modules.addModuleToShip('impulseDriveS1');
    modules.addModuleToShip('warpDriveS1');

    shipState.fuel = shipState.fuelCapacity;

    if (factions.length <= 1) {
        generateFactions(3);
    }

    if (solarSystems.length <= 1) {
        generateSolarSystems(100);
    }
}
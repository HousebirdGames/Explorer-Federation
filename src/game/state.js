import { alertPopup, urlPrefix } from "../../Birdhouse/src/main.js";
import { playerState, shipState, starSystems, factions, settings, npcShips } from "../../everywhere.js";
import { generateFactions, generateStarSystems, generateNPCShips } from "./generation.js";
import * as modules from "./modules.js";

let resetting = false;

export const defaultShipState = {
    name: 'Ocean',
    faction: 0,
    level: 1,
    health: 100,
    shields: 100,
    shieldsCapacity: 100,
    fuel: 0,
    fuelCapacity: 0,
    modules: [],
    crew: [],
    currentSpeed: 0,
    targetSpeed: 0,
    maxSpeed: 0,
    engage: false,
    attacking: false,
    shipTarget: null,
    energy: 0,
    energyCapacity: 0,
    energyTemp: 0,
    fuelConsumption: 0,
    efficiency: 0,
    lastConsumption: 0,
    acceleration: 0,
    position: { x: 0, y: 0, z: 3 },
    course: { x: 0, y: 0, z: 3 },
    mission: null,
    missionHistory: [],
    generatedNames: [],
    impulseEnabled: false,
    crewLog: [],
    alert: 'None',
    lastAlert: 'None',
};

export const defaultPlayerState = {
    name: 'Player',
    stardate: 0,
    reputation: 0
};

export const initialStarSystem = {
    name: "Sol",
    coordinates: { x: 0, y: 0 },
    discovered: true,
    faction: 0,
    planets: [
        { name: "Mercury", type: "Terrestrial", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Venus", type: "Terrestrial", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Earth", type: "Terrestrial", fauna: "Diverse", flora: "Diverse", population: 20400000000, civilization: "Highly Advanced" },
        { name: "Mars", type: "Terrestrial", fauna: "None", flora: "Sparse", population: 140000, civilization: "Highly Advanced" },
        { name: "Jupiter", type: "Gas Giant", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Saturn", type: "Gas Giant", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Uranus", type: "Ice Giant", fauna: "None", flora: "None", population: 0, civilization: "None" },
        { name: "Neptune", type: "Ice Giant", fauna: "None", flora: "None", population: 0, civilization: "None" }
    ],
    ships: [],
    stations: []
};

export const initialFactions = [
    { name: "Federation", color: "blue", identifier: 'F.S.S.', alliedWith: [], warWith: [] },
];

export function saveGameState() {
    if (resetting) {
        return;
    }
    localStorage.setItem('ef_settings', JSON.stringify(settings));
    localStorage.setItem('playerState', JSON.stringify(playerState));
    localStorage.setItem('shipState', JSON.stringify(shipState));
    localStorage.setItem('npcShips', JSON.stringify(npcShips));
    localStorage.setItem('factions', JSON.stringify(factions));
    localStorage.setItem('starSystems', JSON.stringify(starSystems));
}

export function resetGame() {
    resetting = true;
    alertPopup('Reseting game...');
    localStorage.removeItem('playerState');
    localStorage.removeItem('shipState');
    localStorage.removeItem('factions');
    localStorage.removeItem('npcShips');
    localStorage.removeItem('starSystems');
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

    const savedStarSystemsState = JSON.parse(localStorage.getItem('starSystems'));
    if (savedStarSystemsState) {
        Object.assign(starSystems, savedStarSystemsState);
    }

    const savedNpcShips = JSON.parse(localStorage.getItem('npcShips'));
    if (savedNpcShips) {
        Object.assign(npcShips, savedNpcShips);
    }

    if (Object.keys(shipState).length === 0 || Object.keys(factions).length <= 1 || Object.keys(starSystems).length <= 1) {
        console.log('No saved game state found');
        localStorage.removeItem('playerState');
        localStorage.removeItem('shipState');
        localStorage.removeItem('factions');
        localStorage.removeItem('starSystems');
        initializeNewGame();
    }
}

function initializeNewGame() {
    console.log('Starting new game');
    Object.keys(shipState).forEach(key => delete shipState[key]);
    Object.assign(shipState, defaultShipState);

    Object.keys(playerState).forEach(key => delete playerState[key]);
    Object.assign(playerState, defaultPlayerState);

    modules.addModuleToShip('fuelTankS1');
    modules.addModuleToShip('batteryS1');
    modules.addModuleToShip('batteryS1');
    modules.addModuleToShip('energyGeneratorS1');
    modules.addModuleToShip('impulseDriveS1');
    modules.addModuleToShip('warpDriveS1');
    modules.addModuleToShip('phaserBankS1');

    shipState.fuel = shipState.fuelCapacity;

    if (factions.length <= 1) {
        generateFactions(3);
    }

    if (starSystems.length <= 1) {
        generateStarSystems(100);
    }

    if (npcShips.length <= 0) {
        generateNPCShips();
    }
}
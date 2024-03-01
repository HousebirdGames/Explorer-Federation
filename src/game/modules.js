import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";

// To Do: Decouple module system from shipState to be usable by other ships
// To Do: Make fully compatible with game state saving and loading

/* class ShipModule {
    constructor(type, name, maxHealth, weight, startEnabled = false, properties = {}) {
        this.type = type;
        this.name = name;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.weight = weight;
        this.enabled = false;
        this.startEnabled = startEnabled;
        this.properties = properties;
        this.activeEffects = [];

        Object.assign(this, properties);

        this.functions = {};
        this.friendlyFunctionNames = {};

        if (moduleTypes[type] && moduleTypes[type].functions) {
            for (const functionName in moduleTypes[type].functions) {
                const funcObj = moduleTypes[type].functions[functionName];
                this.functions[functionName] = funcObj.action.bind(this);
                this.friendlyFunctionNames[functionName] = funcObj.friendlyName;
            }
        } else {
            console.error(`Module type ${type} does not exist.`);
        }

        if (moduleTypes[type]) {
            this.onEnable = moduleTypes[type].onEnable ? moduleTypes[type].onEnable.bind(this) : this.onEnable;
            this.onDisable = moduleTypes[type].onDisable ? moduleTypes[type].onDisable.bind(this) : this.onDisable;
            this.tickEffect = moduleTypes[type].tickEffect ? moduleTypes[type].tickEffect.bind(this) : this.tickEffect;
        }
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.onEnable();
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.onDisable();
        }
    }

    onEnable() {
        // Placeholder for enabling logic, to be overridden by specific module types
    }

    onDisable() {
        // Placeholder for disabling logic, to be overridden by specific module types
    }

    tickEffect() {
        // Placeholder for tick effect logic, to be overridden by specific module types
    }

    performFunction(functionName, ...args) {
        if (this.functions[functionName]) {
            this.functions[functionName](...args);
        } else {
            console.error(`Function ${functionName} does not exist on module ${this.name}.`);
        }
    }

    getAvailableFunctions() {
        return Object.entries(this.friendlyFunctionNames).map(([functionCode, friendlyName]) => ({
            code: functionCode,
            name: friendlyName
        }));
    }
} */

const moduleTypes = {
    fuelTank: {
        startEnabled: true,
        onEnable: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                moduleInstance.enabled = true;
                ship.fuelCapacity += moduleInstance.properties.capacity;
            }
        },
        onDisable: (moduleInstance, ship) => {
            if (moduleInstance.enabled) {
                moduleInstance.enabled = false;
                ship.fuelCapacity -= moduleInstance.properties.capacity;
            }
        },
        tickEffect: (moduleInstance, ship) => {
            // Example: Decrease fuel if there's a leak
        },
        functions: {
            ejectFuel: (moduleInstance, ship, amount) => {
                if (ship.fuel >= amount) {
                    ship.fuel -= amount;
                    alertPopup(`Fuel ejected: ${amount}`);
                    return true;
                } else {
                    alertPopup(`Not enough fuel to eject ${amount}.`);
                    return false;
                }
            }
        }
    },
    battery: {
        startEnabled: true,
        onEnable: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                moduleInstance.enabled = true;
                ship.energyCapacity += moduleInstance.properties.capacity;
            }
        },
        onDisable: (moduleInstance, ship) => {
            if (moduleInstance.enabled) {
                moduleInstance.enabled = false;
                ship.energyCapacity -= moduleInstance.properties.capacity;
            }
        },
        tickEffect: (moduleInstance, ship) => {
            // Example: Check for battery efficiency reduction over time
        },
        functions: {
            charge: (moduleInstance, ship, amount) => {
                if (ship.energy < ship.energyCapacity) {
                    ship.energy = Math.min(ship.energy + amount, ship.energyCapacity);
                    alertPopup(`Energy charged: ${amount}`);
                    return true;
                } else {
                    alertPopup(`Energy already at maximum capacity.`);
                    return false;
                }
            }
        }
    },
    energyGenerator: {
        startEnabled: true,
        onEnable: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                moduleInstance.enabled = true;
            }
        },
        onDisable: (moduleInstance, ship) => {
            if (moduleInstance.enabled) {
                moduleInstance.enabled = false;
            }
        },
        tickEffect: (moduleInstance, ship) => {
            if (ship.energy >= ship.energyCapacity) {
                return false;
            }

            let consumptionRate = moduleInstance.properties.consumptionRate;
            if (moduleInstance.overclocked) {
                consumptionRate *= 2;
                moduleInstance.currentHealth -= 1;
                if (moduleInstance.currentHealth <= 0) {
                    moduleInstance.onDisable();
                    moduleInstance.currentHealth = 0;
                    alertPopup(`Energy generator ${moduleInstance.name} has been disabled due to overheating.`);
                    return false;
                }
            }

            if (moduleInstance.properties.consumptionRate < ship.fuel && moduleInstance.properties.consumptionRate * moduleInstance.properties.efficiency <= ship.energyCapacity - ship.energy) {
                ship.fuel -= moduleInstance.properties.consumptionRate;
                ship.energy += moduleInstance.properties.consumptionRate * moduleInstance.properties.efficiency;

                if (ship.energy > ship.energyCapacity) {
                    ship.energy = ship.energyCapacity;
                }
            }
            return true;
        },
        functions: {
            overclock: (moduleInstance, ship) => {
                moduleInstance.properties.overclocked = !moduleInstance.properties.overclocked;
                const status = moduleInstance.properties.overclocked ? 'overclocked' : 'normal operation';
                alertPopup(`Energy generator is now in ${status}.`);
                return moduleInstance.properties.overclocked;
            }
        }
    }
};


// Specific module models with default properties
const moduleModels = {
    fuelTankS1: { type: 'fuelTank', name: 'S1 Fuel Tank', maxHealth: 20, weight: 4, properties: { capacity: 400 } },
    batteryS1: { type: 'battery', name: 'S1 Battery', maxHealth: 10, weight: 1, properties: { capacity: 50 } },
    energyGeneratorS1: { type: 'energyGenerator', name: 'S1 Reactor', maxHealth: 40, weight: 5, properties: { efficiency: 0.5, consumptionRate: 5, overclocked: false } }
};

export function addModuleToShip(modelId, ship = shipState) {
    console.log(`Adding module ${modelId} to ship.`);
    const model = moduleModels[modelId];
    if (!model) {
        console.error(`Model ${modelId} not found.`);
        return;
    }

    const moduleInstance = { ...model, currentHealth: model.maxHealth, enabled: false };
    ship.modules.push(moduleInstance);

    // Setup module instance with type-specific behaviors and functions
    const type = moduleTypes[moduleInstance.type];
    if (!type) {
        console.error(`Module type ${moduleInstance.type} not found.`);
        return;
    }

    console.log('Start enabled:', type.startEnabled)

    attachSharedBehavioursAndFunctions(moduleInstance, type, ship);

    // Automatically enable the module if startEnabled is true
    if (type.startEnabled) {
        console.log(`Module ${moduleInstance.name} is enabled.`);
        moduleInstance.onEnable();
    }
}

// Reattach functions and behaviors after loading ship state
export function reattachFunctionsAndBehaviors(ship = shipState) {
    ship.modules.forEach(moduleInstance => {
        const type = moduleTypes[moduleInstance.type];
        if (!type) {
            console.error(`Module type ${moduleInstance.type} not found.`);
            return;
        }

        attachSharedBehavioursAndFunctions(moduleInstance, type, ship);
    });
}

function attachSharedBehavioursAndFunctions(moduleInstance, type, ship) {
    Object.assign(moduleInstance, {
        onEnable: () => type.onEnable(moduleInstance, ship),
        onDisable: () => type.onDisable(moduleInstance, ship),
        tickEffect: () => type.tickEffect(moduleInstance, ship),
        functions: Object.keys(type.functions).reduce((acc, functionName) => {
            acc[functionName] = (...args) => type.functions[functionName](moduleInstance, ship, ...args);
            return acc;
        }, {})
    });
}
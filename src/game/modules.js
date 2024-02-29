import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";

// To Do: Decouple module system from shipState to be usable by other ships
// To Do: Make fully compatible with game state saving and loading

class ShipModule {
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
}

const moduleTypes = {
    fuelTank: {
        onEnable: function () {
            shipState.fuelCapacity += this.properties.capacity;
        },
        onDisable: function () {
            shipState.fuelCapacity -= this.properties.capacity;
        },
        tickEffect: function () {
            // Idea: Check for leaks each tick, reducing fuel
        },
        functions: {
            ejectFuel: {
                friendlyName: "Eject Fuel",
                action: function (amount) {
                    if (shipState.fuel >= amount) {
                        shipState.fuel -= amount;
                        alertPopup(`Fuel ejected: ${amount}`);
                        return true;
                    } else {
                        alertPopup(`Not enough fuel to eject ${amount}.`);
                        return false;
                    }
                }
            }
        },
    },
    battery: {
        onEnable: function () {
            shipState.energyCapacity += this.properties.capacity;
        },
        onDisable: function () {
            shipState.energyCapacity -= this.properties.capacity;
        },
        tickEffect: function () {
            // Idea: Have a chance to short-circuit, reducing energy or add heat that needs to be dissipated
        },
        functions: {
            charge: {
                friendlyName: "Charge",
                action: function (amount) {
                    if (shipState.energy < shipState.energyCapacity) {
                        shipState.energy += amount;
                        alertPopup(`Energy charged: ${amount}`);
                        return true;
                    } else {
                        alertPopup(`Energy already at maximum capacity.`);
                        return false;
                    }
                }
            }
        },
    },
    energyGenerator: {
        overclocked: false,
        onEnable: function () {
        },
        onDisable: function () {
        },
        tickEffect: function () {
            if (shipState.energy >= shipState.energyCapacity) {
                return false;
            }

            let consumptionRate = this.properties.consumptionRate;
            if (this.overclocked) {
                consumptionRate *= 2;
                this.currentHealth -= 1;
                if (this.currentHealth <= 0) {
                    this.disable();
                    this.currentHealth = 0;
                    alertPopup(`Energy generator ${this.name} has been disabled due to overheating.`);
                    return false;
                }
            }

            if (this.properties.consumptionRate < shipState.fuel && this.properties.consumptionRate * this.properties.efficiency < shipState.energyCapacity - shipState.energy) {
                shipState.fuel -= this.properties.consumptionRate;
                shipState.energy += this.properties.consumptionRate * this.properties.efficiency;

                if (shipState.energy > shipState.energyCapacity) {
                    shipState.energy = shipState.energyCapacity;
                }
            }
            return true;
        },
        functions: {
            overclock: {
                friendlyName: "Overclock",
                action: function () {
                    this.overclocked = !this.overclocked;
                    alertPopup(`Energy generator ${this.overclocked ? 'overclocked' : 'returned to normal operation'}.`);
                    return this.overclocked;
                }
            }
        }
    }
};

export const modules = {
    fuelTankS1: () => new ShipModule('fuelTank', 'S1 Fuel Tank', 20, 4, true, { capacity: 400 }),
    energyGeneratorS1: () => new ShipModule('energyGenerator', 'S1 Reactor', 40, 5, true, { efficiency: 0.5, consumptionRate: 5 }),
    batteryS1: () => new ShipModule('battery', 'S1 Battery', 10, 1, true, { capacity: 50 }),
};

/* setTimeout(() => {

    const availableFunctions = fuelTankInstance.getAvailableFunctions();
    console.log(`Available functions for ${fuelTankInstance.name}:`, availableFunctions);

    fuelTankInstance.performFunction('ejectFuel', 10);
}, 1000); */
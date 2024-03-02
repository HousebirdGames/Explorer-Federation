import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, solarSystems } from "../../everywhere.js";

const moduleTypes = {
    fuelTank: {
        startEnabled: true,
        onEnable: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                moduleInstance.enabled = true;
                ship.fuelCapacity += moduleInstance.properties.fuelCapacity;
            }
        },
        onDisable: (moduleInstance, ship) => {
            if (moduleInstance.enabled) {
                moduleInstance.enabled = false;
                ship.fuelCapacity -= moduleInstance.properties.fuelCapacity;
            }

            if (ship.fuel > ship.fuelCapacity) {
                alertPopup(`Fuel tank ${moduleInstance.name} has been emptied and ${ship.fuel - ship.fuelCapacity} fuel has been lost.`);
                ship.fuel = ship.fuelCapacity;
            }
        },
        tickEffect: (moduleInstance, ship) => {
            // Example: Decrease fuel if there's a leak
        },
        functions: {
            ejectFuel: {
                friendlyName: 'Eject Fuel',
                action: (moduleInstance, ship, amount) => {
                    if (amount === undefined) amount = prompt('How much fuel do you want to eject?', 0);

                    if (amount === null || amount <= 0) {
                        alertPopup('Ejection cancelled.');
                        return false;
                    }

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
        properties: {
            fuelCapacity: 100
        }
    },
    battery: {
        startEnabled: true,
        onEnable: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                moduleInstance.enabled = true;
                ship.energyCapacity += moduleInstance.properties.energyCapacity;
            }
        },
        onDisable: (moduleInstance, ship) => {
            if (moduleInstance.enabled) {
                moduleInstance.enabled = false;
                ship.energyCapacity -= moduleInstance.properties.energyCapacity;

                if (ship.energy > ship.energyCapacity) {
                    alertPopup(`Energy capacity reduced. Discharged battery and lost ${ship.energy - ship.energyCapacity} energy.`);
                    ship.energy = ship.energyCapacity;
                }
            }
        },
        tickEffect: (moduleInstance, ship) => {
            // Example: Check for battery efficiency reduction over time, damage if short-circuited
        },
        functions: {
            discharge: {
                friendlyName: 'Discharge',
                action: (moduleInstance, ship, amount) => {
                    if (amount === undefined) amount = prompt('How much energy do you want to discharge?', 0);

                    if (amount === null || amount <= 0) {
                        alertPopup('Discharge cancelled.');
                        return false;
                    }

                    if (ship.energy >= amount) {
                        ship.energy -= amount;
                        alertPopup(`Energy discharged: ${amount}`);
                        return true;
                    } else {
                        alertPopup(`Not enough energy to discharge ${amount}.`);
                        return false;
                    }
                }
            }
        },
        properties: {
            energyCapacity: 100
        }
    },
    energyGenerator: {
        startEnabled: false,
        onEnable: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                moduleInstance.enabled = true;
            }
        },
        onDisable: (moduleInstance, ship) => {
            if (moduleInstance.enabled) {
                moduleInstance.enabled = false;
                moduleInstance.properties.overclocked = false;
            }
        },
        tickEffect: (moduleInstance, ship) => {
            if (ship.energy >= ship.energyCapacity) {
                return false;
            }

            let consumptionRate = moduleInstance.properties.fuelConsumptionRate;

            if (moduleInstance.properties.overclocked) {
                consumptionRate *= 2;
                moduleInstance.currentHealth -= 1;
                if (moduleInstance.currentHealth <= 0) {
                    moduleInstance.onDisable();
                    moduleInstance.currentHealth = 0;
                    alertPopup(`Energy generator ${moduleInstance.name} has been disabled due to overheating.`);
                    return false;
                }
            }

            if (consumptionRate < ship.fuel && consumptionRate * moduleInstance.properties.efficiency <= ship.energyCapacity - ship.energy) {
                ship.fuel -= consumptionRate;
                ship.energy += consumptionRate * moduleInstance.properties.efficiency;

                if (ship.energy > ship.energyCapacity) {
                    ship.energy = ship.energyCapacity;
                }
            }
            return true;
        },
        functions: {
            overclock: {
                friendlyName: 'Toggle Overclock',
                action: (moduleInstance, ship) => {
                    moduleInstance.properties.overclocked = !moduleInstance.properties.overclocked;
                    const status = moduleInstance.properties.overclocked ? 'overclocked' : 'normal operation';
                    alertPopup(`Energy generator is now in ${status}.`);
                    return moduleInstance.properties.overclocked;
                }
            }
        },
        properties: {
            efficiency: 1,
            fuelConsumptionRate: 1,
            overclocked: false
        }
    },
    impulseDrive: {
        startEnabled: false,
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
            if (moduleInstance.enabled && ship.isMoving && ship.currentSpeed > 0 && ship.currentSpeed <= 0.9) {
                const energyConsumptionRate = moduleInstance.properties.energyConsumptionRate * Math.pow(ship.currentSpeed, 2);
                ship.energy -= energyConsumptionRate;
            }
        },
        functions: {

        }
    },
    warpDrive: {
        startEnabled: false,
        onEnable: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                moduleInstance.enabled = true;
                if (moduleInstance.properties.warpSpeed >= ship.maxSpeed) {
                    ship.maxSpeed = moduleInstance.properties.warpSpeed;
                }
            }
        },
        onDisable: (moduleInstance, ship) => {
            if (moduleInstance.enabled) {
                moduleInstance.enabled = false;
                moduleInstance.properties.overclocked = false;
                ship.maxSpeed = 0;
            }
        },
        tickEffect: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                return;
            }

            let consumptionRate = moduleInstance.properties.energyConsumptionRate;
            let newMaxSpeed = moduleInstance.properties.warpSpeed;

            if (moduleInstance.properties.overclocked) {
                consumptionRate *= 2;
                newMaxSpeed = moduleInstance.properties.warpSpeed * 1.2;
            }

            if (newMaxSpeed > ship.maxSpeed) {
                ship.maxSpeed = newMaxSpeed;
            }

            if (shipState.accelerating && shipState.currentSpeed > 0.9 && ship.energy >= consumptionRate) {

                if (moduleInstance.properties.overclocked) {
                    moduleInstance.currentHealth -= 1;

                    if (ship.currentSpeed < ship.maxSpeed) {
                        ship.currentSpeed += moduleInstance.properties.overclockedAcceleration;
                        if (ship.currentSpeed > ship.maxSpeed) {
                            ship.currentSpeed = ship.maxSpeed;
                        }
                    }

                    if (moduleInstance.currentHealth <= 0) {
                        alertPopup(`Warp drive ${moduleInstance.name} has been disabled due to damage.`);
                        this.onDisable(moduleInstance, ship);
                    }
                }

                ship.energy -= consumptionRate;
            }
        },
        functions: {
            overclock: {
                friendlyName: 'Toggle Overclock',
                action: (moduleInstance, ship) => {
                    moduleInstance.properties.overclocked = !moduleInstance.properties.overclocked;
                    const status = moduleInstance.properties.overclocked ? 'overclocked' : 'in normal operation';
                    alertPopup(`Warp drive is now ${status}.`);
                }
            }
        },
        properties: {
            warpSpeed: 3,
            energyConsumptionRate: 1,
            overclockedAcceleration: 0.2,
            overclocked: false
        }
    },
};


// Specific module models with default properties
const moduleModels = {
    fuelTankS1: { type: 'fuelTank', name: 'S1 Fuel Tank', maxHealth: 20, weight: 4, properties: { fuelCapacity: 400 } },
    batteryS1: { type: 'battery', name: 'S1 Battery', maxHealth: 10, weight: 1, properties: { energyCapacity: 50 } },
    energyGeneratorS1: { type: 'energyGenerator', name: 'S1 Reactor', maxHealth: 40, weight: 5, properties: { efficiency: 0.5, fuelConsumptionRate: 5, overclocked: false } },
    impulseDriveS1: { type: 'impulseDrive', name: 'S1 Impulse Drive', maxHealth: 50, weight: 3, properties: { energyConsumptionRate: 0.1 } },
    warpDriveS1: { type: 'warpDrive', name: 'S1 Warp Drive', maxHealth: 100, weight: 5, properties: { warpSpeed: 5, overclockedAcceleration: 0.2, energyConsumptionRate: 0.5, overclocked: false } },
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

    const type = moduleTypes[moduleInstance.type];
    if (!type) {
        console.error(`Module type ${moduleInstance.type} not found.`);
        return;
    }

    console.log('Start enabled:', type.startEnabled)

    attachSharedBehavioursAndFunctions(moduleInstance, type, ship);

    if (type.startEnabled) {
        console.log(`Module ${moduleInstance.name} is enabled.`);
        moduleInstance.onEnable();
    }
}

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
            const friendlyName = type.functions[functionName].friendlyName || functionName;
            acc[functionName] = {
                action: (...args) => type.functions[functionName].action(moduleInstance, ship, ...args),
                friendlyName: friendlyName
            };
            return acc;
        }, {})
    });
}

export function getAllFunctionsForModule(moduleName) {
    const moduleInstance = shipState.modules.find(module => module.name === moduleName);
    if (!moduleInstance) {
        console.error(`Module ${moduleName} not found.`);
        return;
    }

    const functionsWithFriendlyNames = Object.entries(moduleInstance.functions).map(([key, value]) => {
        return {
            functionName: key,
            friendlyName: value.friendlyName
        };
    });

    return functionsWithFriendlyNames;
}
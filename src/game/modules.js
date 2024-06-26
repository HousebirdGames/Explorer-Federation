import { alertPopup } from "../../Birdhouse/src/main.js";
import { shipState, starSystems, deltaTime, npcShips } from "../../everywhere.js";
import { addLog } from "./utils.js";
import { damage } from "./npc-ship.js";

export const moduleTypes = {
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
                addLog('Engineering', `Fuel tank ${moduleInstance.name} has been emptied and ${ship.fuel - ship.fuelCapacity} fuel has been lost.`);
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
                        addLog('Engineering', 'Ejection cancelled.');
                        return false;
                    }

                    if (ship.fuel >= amount) {
                        ship.fuel -= amount;
                        addLog('Engineering', `Fuel ejected: ${amount}`);
                        return true;
                    } else {
                        addLog('Engineering', `Not enough fuel to eject ${amount}.`);
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
                    addLog('Engineering', `Energy capacity reduced. Discharged battery and lost ${ship.energy - ship.energyCapacity} energy.`);
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
                        addLog('Engineering', 'Discharge cancelled.');
                        return false;
                    }

                    if (ship.energy >= amount) {
                        ship.energy -= amount;
                        addLog('Engineering', `Energy discharged: ${amount}`);
                        return true;
                    } else {
                        addLog('Engineering', `Not enough energy to discharge ${amount}.`);
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
        startEnabled: true,
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
            if (moduleInstance.properties.overclocked) {
                moduleInstance.information = 'Doubled throughput rate, while module is taking damage.';
            }
            else {
                moduleInstance.information = 'In normal operation';
            }

            if (ship.energy >= ship.energyCapacity) {
                return false;
            }

            let consumptionRate = moduleInstance.properties.fuelConsumptionRate * deltaTime;

            if (moduleInstance.properties.overclocked) {
                consumptionRate *= 2;
                moduleInstance.currentHealth -= 1 * deltaTime;
                if (moduleInstance.currentHealth <= 0) {
                    moduleInstance.onDisable();
                    moduleInstance.currentHealth = 0;
                    addLog('Engineering', `${moduleInstance.name} has been disabled due to overheating.`);
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
                    addLog('Engineering', `${moduleInstance.name} is now in ${status}.`);
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
            if (moduleInstance.properties.overclocked) {
                moduleInstance.information = 'Overclocked: Doubled energy consumption and acceleration rate, while module is taking damage.';
            }
            else {
                moduleInstance.information = 'In normal operation';
            }


            if (moduleInstance.enabled && ship.currentSpeed <= 0.9 && ship.targetSpeed > 0 && ship.engage) {
                let energyConsumptionRate = Math.max(moduleInstance.properties.energyConsumptionRate * ship.currentSpeed, 0.1) * deltaTime;
                let acceleration = moduleInstance.properties.accelerationRate * deltaTime;

                if (moduleInstance.properties.overclocked) {
                    energyConsumptionRate *= 2;
                    acceleration *= 2;
                }

                if (ship.energy >= energyConsumptionRate) {
                    ship.acceleration += acceleration;
                    ship.energy -= energyConsumptionRate;
                }
            }
        },
        functions: {
            overclock: {
                friendlyName: 'Toggle Overclock',
                action: (moduleInstance, ship) => {
                    moduleInstance.properties.overclocked = !moduleInstance.properties.overclocked;
                    const status = moduleInstance.properties.overclocked ? 'overclocked' : 'in normal operation';
                    addLog('Engineering', `${moduleInstance.name} is now ${status}.`);
                }
            }
        },
        properties: {
            energyConsumptionRate: 0.1,
            accelerationRate: 1,
            overclocked: false
        }
    },
    warpDrive: {
        startEnabled: true,
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
            let maxWarp = moduleInstance.properties.warpSpeed;
            if (moduleInstance.properties.overclocked) {
                maxWarp = maxWarp * 1.2;
                moduleInstance.information = `Doubled energy consumption and acceleration rate, while module is taking damage. Max warp speed increased by 20% to Warp ${maxWarp}.`;
            }
            else {
                moduleInstance.information = 'In normal operation';
            }

            if (!moduleInstance.enabled) {
                return;
            }

            if (moduleInstance.properties.overclocked) {
                if (maxWarp > ship.maxSpeed) {
                    ship.maxSpeed = maxWarp;
                }
            }

            if (ship.currentSpeed > 0.9 && ship.engage) {
                let energyConsumptionRate = Math.max(moduleInstance.properties.energyConsumptionRate * Math.pow(ship.currentSpeed, 2), 0.1) * deltaTime;
                let acceleration = moduleInstance.properties.accelerationRate * deltaTime;

                if (moduleInstance.properties.overclocked) {
                    energyConsumptionRate *= 2;
                    acceleration *= 2;
                }

                if (ship.energy >= energyConsumptionRate) {
                    if (moduleInstance.properties.overclocked) {

                        moduleInstance.currentHealth -= 1 * deltaTime;

                        if (moduleInstance.currentHealth <= 0) {
                            addLog('Engineering', `Warp drive ${moduleInstance.name} has been disabled due to damage.`);
                            this.onDisable(moduleInstance, ship);
                        }
                    }

                    ship.acceleration += acceleration;
                    ship.energy -= energyConsumptionRate;
                }
            }
        },
        functions: {
            overclock: {
                friendlyName: 'Toggle Overclock',
                action: (moduleInstance, ship) => {
                    moduleInstance.properties.overclocked = !moduleInstance.properties.overclocked;
                    const status = moduleInstance.properties.overclocked ? 'overclocked' : 'in normal operation';
                    addLog('Engineering', `${moduleInstance.name} is now ${status}.`);
                }
            }
        },
        properties: {
            warpSpeed: 3,
            energyConsumptionRate: 0.5,
            accelerationRate: 1,
            overclocked: false
        }
    },
    phaserBank: {
        startEnabled: false,
        onEnable: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                moduleInstance.enabled = true;
            }
        },
        onDisable: (moduleInstance, ship) => {
            if (moduleInstance.enabled) {
                moduleInstance.properties.energyLevel = 0;
                moduleInstance.enabled = false;
            }
        },
        tickEffect: (moduleInstance, ship) => {
            moduleInstance.properties.currentTarget = null;
            if (!moduleInstance.enabled) {
                return;
            }

            if (ship.shipTarget != null) {
                moduleInstance.properties.currentTarget = npcShips[ship.shipTarget].name;
            }

            let energyConsumptionRate = moduleInstance.properties.energyConsumptionRate * deltaTime;

            if (ship.energy >= energyConsumptionRate && moduleInstance.properties.energyLevel < moduleInstance.properties.energyCapacity) {
                moduleInstance.properties.energyLevel += energyConsumptionRate;
                ship.energy -= energyConsumptionRate;

                if (moduleInstance.properties.energyLevel >= moduleInstance.properties.energyCapacity) {
                    moduleInstance.properties.energyLevel = moduleInstance.properties.energyCapacity;
                }
            }
        },
        functions: {
            shoot: {
                friendlyName: 'Fire Phasers',
                action: (moduleInstance, ship) => {
                    if (moduleInstance.properties.energyLevel >= moduleInstance.properties.energyCapacity && ship.shipTarget !== null) {
                        moduleInstance.properties.energyLevel = 0;
                        if (Math.random() < moduleInstance.properties.accuracy) {
                            addLog('Tactical', `Phasers successfully fired at the ${npcShips[ship.shipTarget].name}.`);
                            damage(npcShips[ship.shipTarget], moduleInstance.properties.firepower);
                        }
                        else {
                            addLog('Tactical', `Phasers fired, but missed the ${npcShips[ship.shipTarget].name}.`);
                        }
                    }
                    else if (ship.shipTarget === null) {
                        alertPopup('Unable to fire phasers', 'No target selected.');
                    }
                    else {
                        alertPopup('Unable to fire phasers', 'Energy level below capacity.');
                    }
                }
            }
        },
        properties: {
            currentTarget: null,
            firepower: 10,
            accuracy: 80,
            energyLevel: 0,
            energyCapacity: 40,
            energyConsumptionRate: 2,
        }
    },
    shieldGenerator: {
        startEnabled: false,
        onEnable: (moduleInstance, ship) => {
            if (!moduleInstance.enabled) {
                moduleInstance.enabled = true;
                ship.shieldCapacity += moduleInstance.properties.shieldCapacity;
                addLog('Engineering', `Shield generator enabled. Shield capacity increased by ${moduleInstance.properties.shieldCapacity}.`);
            }
        },
        onDisable: (moduleInstance, ship) => {
            if (moduleInstance.enabled) {
                moduleInstance.enabled = false;
                ship.shieldCapacity -= moduleInstance.properties.shieldCapacity;
                if (ship.shields > ship.shieldCapacity) {
                    addLog('Engineering', `Shield generator disabled. Shield capacity reduced. Lost ${ship.shields - ship.shieldCapacity} shield.`);
                    ship.shields = ship.shieldCapacity;
                }
                if (ship.shields <= 0) {
                    addLog('Tactical', `Shields offline.`);
                }
            }
        },
        tickEffect: (moduleInstance, ship) => {
            const energyConsumption = moduleInstance.properties.energyConsumptionRate * deltaTime;
            if (ship.energy >= energyConsumption) {
                ship.energy -= energyConsumption;
                if (ship.shields < ship.shieldCapacity) {
                    ship.shields += energyConsumption * moduleInstance.properties.efficiency;
                    if (ship.shields > ship.shieldCapacity) {
                        ship.shields = ship.shieldCapacity;
                    }
                }
            } else {
                moduleInstance.onDisable();
            }
        },
        functions: {
        },
        properties: {
            shieldCapacity: 100,
            energyConsumptionRate: 2,
            efficiency: 1,
            dischargeRate: 1
        }
    },

};

const moduleModels = {
    fuelTankS1: { type: 'fuelTank', name: 'S1 Fuel Tank', maxHealth: 20, weight: 4, properties: { fuelCapacity: 10000 } },
    batteryS1: { type: 'battery', name: 'S1 Battery', maxHealth: 10, weight: 1, properties: { energyCapacity: 100 } },
    energyGeneratorS1: { type: 'energyGenerator', name: 'S1 Reactor', maxHealth: 40, weight: 5, properties: { efficiency: 0.7, fuelConsumptionRate: 10, overclocked: false } },
    impulseDriveS1: { type: 'impulseDrive', name: 'S1 Impulse Drive', maxHealth: 50, weight: 3, properties: { energyConsumptionRate: 0.2, accelerationRate: 0.1, overclocked: false } },
    warpDriveS1: { type: 'warpDrive', name: 'S1 Warp Drive', maxHealth: 100, weight: 5, properties: { warpSpeed: 5, accelerationRate: 0.3, energyConsumptionRate: 0.4, overclocked: false } },
    phaserBankS1: { type: 'phaserBank', name: 'S1 Phaser Bank', maxHealth: 30, weight: 2, properties: { firepower: 40, accuracy: 0.8, energyLevel: 0, energyCapacity: 40, energyConsumptionRate: 2 } },
    shieldGeneratorS1: { type: 'shieldGenerator', name: 'S1 Shield Generator', maxHealth: 50, weight: 10, properties: { shieldCapacity: 100, energyConsumptionRate: 2, efficiency: 0.7, dischargeRate: 2 } },
};

export function addModuleToShip(modelId, ship = shipState) {
    const model = moduleModels[modelId];
    if (!model) {
        console.error(`Model ${modelId} not found.`);
        return;
    }

    const moduleInstance = { ...model, currentHealth: model.maxHealth, enabled: false, information: 'In normal operation' };
    ship.modules.push(moduleInstance);

    const type = moduleTypes[moduleInstance.type];
    if (!type) {
        console.error(`Module type ${moduleInstance.type} not found.`);
        return;
    }

    attachSharedBehavioursAndFunctions(moduleInstance, type, ship);

    if (type.startEnabled) {
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

export function getModuleInformation(moduleName, ship = shipState) {
    const moduleInstance = ship.modules.find(module => module.name === moduleName);
    if (!moduleInstance) {
        console.error(`Module ${moduleName} not found.`);
        return;
    }

    return moduleInstance.information;
}

export function getModulesOfType(type, ship = shipState) {
    if (!ship.modules) {
        console.error('ship.modules is undefined');
        return [];
    }

    return ship.modules.filter(module => module.type === type);
}

export function toggleModulesOfType(moduleType, enable, ship = shipState) {
    const modules = getModulesOfType(moduleType, ship);
    modules.forEach(module => {
        if (enable) {
            module.onEnable();
        } else if (!enable) {
            module.onDisable();
        }
    });
}
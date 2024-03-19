import { addLog } from "./utils.js";

export default class NPCShip {
    constructor(name, position, course, faction, multiplier = 1) {
        this.multiplier = multiplier;
        this.name = name;
        this.position = position;
        this.course = course;
        this.faction = faction;
        resetShip(this);
    }
}

export function resetShip(ship) {
    ship.destroyed = false;
    ship.speed = 0;
    ship.maxSpeed = (1.7 * ship.multiplier).toFixed(0);
    ship.energyCapacity = 124 * ship.multiplier * 10;
    ship.energy = ship.energyCapacity;
    ship.shieldsCapacity = 110 * ship.multiplier;
    ship.shields = ship.shieldsCapacity;
    ship.weaponsStrength = 50 * ship.multiplier * 0.5;
    ship.maxHealth = 120 * ship.multiplier;
    ship.health = ship.maxHealth;
    ship.attackTime = 10000 / ship.multiplier;
}

export function damage(npcShip, damageAmount, specialTarget = null) {
    if (npcShip.destroyed) return;

    if (npcShip.shields > 0) {
        if (npcShip.shields >= damageAmount) {
            npcShip.shields -= damageAmount;
            damageAmount = 0;
        } else {
            damageAmount -= npcShip.shields;
            npcShip.shields = 0;
        }
    }

    if (damageAmount > 0) {
        if (specialTarget) {
            if (specialTarget === 'engines') {
                npcShip.maxSpeed = Math.max(0, npcShip.maxSpeed - damageAmount);
            } else if (specialTarget === 'shields' && npcShip.shieldsCapacity > 0) {
                npcShip.shieldsCapacity = Math.max(0, npcShip.shieldsCapacity - damageAmount);
                addLog('Tactical', `The shields of the ${npcShip.name} are disabled.`);
            } else if (specialTarget === 'weapons' && npcShip.weaponsStrength > 0) {
                npcShip.weaponsStrength = Math.max(0, npcShip.weaponsStrength - damageAmount);
                addLog('Tactical', `The weapons of the ${npcShip.name} are disabled.`);
            } else if (specialTarget === 'power' && npcShip.energyCapacity > 0) {
                npcShip.energyCapacity = Math.max(0, npcShip.energyCapacity - damageAmount);
                addLog('Tactical', `The energy systems of the ${npcShip.name} are disabled.`);
            }
        } else {
            npcShip.health = Math.max(0, npcShip.health - damageAmount);
            if (npcShip.health === 0) {
                npcShip.destroyed = true;
                addLog('Tactical', `The ${npcShip.name} has been destroyed.`);
            }
        }
    }
}
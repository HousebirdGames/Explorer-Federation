import { addLog } from "./utils.js";

export default class NPCShip {
    constructor(name, position, course, faction) {
        this.destroyed = false;
        this.name = name;
        this.position = position;
        this.course = course;
        this.speed = 0;
        this.maxSpeed = 10;
        this.faction = faction;
        this.energy = 100;
        this.energyCapacity = 100;
        this.shields = 100;
        this.shieldsCapacity = 100;
        this.weaponsStrength = 100;
        this.health = 100;
        this.maxHealth = 100;
        this.attackTime = 5000;
    }
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
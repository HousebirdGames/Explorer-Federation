import { npcShips } from "../../everywhere.js";

export default class NPCShip {
    // When shieldsCapacity, energyCapacity, maxSpeed, weaponsStrength are 0, they are disabled
    constructor(name, position, course, faction) {
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
    }
}
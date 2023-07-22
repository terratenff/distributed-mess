import { setupShips, addShip as addDbShip, removeShip as removeDbShip, updateShips } from "./db/dbShip.js";
import { Ship } from "./ship.js";

const delay = ms => new Promise(res => setTimeout(res, ms));
const SHIP_DATABASE_UPDATE_INTERVAL = 60;
const LOOP_DELAY = 1000;

export async function initializeShipCollective() {
    await ShipCollective.initialize();
    let i = 1;
    while (true) {
        await delay(LOOP_DELAY);
        const ships = ShipCollective.getInstance().getShips();
        for (const shipId in ships) {
            ships[shipId].move();
        }
        ShipCollective.getInstance().removeInboundShips();

        if (i >= SHIP_DATABASE_UPDATE_INTERVAL && Ship.useDb) {
            i = 1;
            updateShips(ShipCollective.getInstance().getShips());
        }
        i++;
    }
}

export class ShipCollective {
    static #initialized = false;
    static #initializing = false;
    static #collectiveInstance = null;
    #ships = {};

    static async initialize() {
        if (!ShipCollective.#initialized) {
            ShipCollective.#initializing = true;
            ShipCollective.#collectiveInstance = new ShipCollective();
            ShipCollective.#initializing = false;
            ShipCollective.#initialized = true;

            if (Ship.useDb) {
                ShipCollective.#collectiveInstance.#ships = await setupShips(false);
            }

            console.log("Ship Collective has been initialized.")
        }
    }

    static getInstance() {
        return ShipCollective.#collectiveInstance;
    }

    constructor() {
        if (!ShipCollective.#initializing) {
            throw new Error("Private constructor.");
        }
    }

    addShip(ship) {
        if (this.#ships[ship.id] !== undefined) {
            console.log(`ERROR: Ship with id ${ship.id} already exists.`);
            return;
        }
        this.#ships[ship.id] = ship;
        ship.addShipLog(`${ship.name} has entered space.`);
        ship.addMissionEvent(`${ship.name} has entered space. Its objective is ${ship.mission.objective}.`);

        if (Ship.useDb) {
            addDbShip(ship);
        }
    }

    removeShip(ship) {
        if (Ship.useDb) {
            removeDbShip(ship);
        }

        delete this.#ships[ship.id];
    }

    getShips() {
        return this.#ships;
    }

    getShip(id) {
        return this.#ships[id];
    }

    removeInboundShips() {
        for (let id in this.#ships) {
            if (this.#ships[id].status === "INBOUND") {
                if (Ship.useDb) {
                    removeDbShip(this.#ships[id]);
                }

                delete this.#ships[id];
            }
        }
    }
}
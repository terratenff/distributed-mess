import http from "http";

import { checkConnection } from "./db/dbCommon.js";
import { initializeSpace } from "./space.js";
import { setupShips, addShip as addDbShip, removeShip as removeDbShip, updateShips } from "./db/dbShip.js";

/**
 * Convenience function for delaying execution.
 * @param {number} ms Delay time in milliseconds.
 */
const delay = ms => new Promise(res => setTimeout(res, ms));

const SHIP_DATABASE_UPDATE_INTERVAL = 60;
const LOOP_DELAY = 1000;

/**
 * Initializes the ship collective entity, and starts the loop for ship movement
 * iterations.
 */
export async function initializeShipCollective() {

    // Determine whether database features can be used.
    await checkConnection();
    initializeSpace();
    await delay(100);

    await ShipCollective.initialize();
    
    let i = 1;

    // Initiate loop where each ship is iterated for movement.
    while (true) {
        await delay(LOOP_DELAY);

        // Check that database connection can still be acquired.
        await checkConnection();

        const ships = ShipCollective.getInstance().getShips();
        for (const shipId in ships) {
            ships[shipId].move();
        }
        ShipCollective.getInstance().removeInboundShips();

        if (i >= SHIP_DATABASE_UPDATE_INTERVAL) {
            i = 1;
            updateShips(ShipCollective.getInstance().getShips());
        }
        i++;
    }
}

/**
 * Ship collective. Manages ship objects.
 */
export class ShipCollective {
    static #initialized = false;
    static #initializing = false;
    static #collectiveInstance = null;
    #ships = {};

    /**
     * Initializes the ship collective.
     */
    static async initialize() {
        if (!ShipCollective.#initialized) {
            ShipCollective.#initializing = true;
            ShipCollective.#collectiveInstance = new ShipCollective();
            ShipCollective.#initializing = false;
            ShipCollective.#initialized = true;
            ShipCollective.#collectiveInstance.#ships = await setupShips(false);

            console.log("shipCollective - Ship Collective has been initialized.")
        }
    }

    /**
     * Ship collective getter.
     * @returns Singleton ship collective instance.
     */
    static getInstance() {
        return ShipCollective.#collectiveInstance;
    }

    /**
     * Private constructor.
     */
    constructor() {
        if (!ShipCollective.#initializing) {
            throw new Error("Private constructor.");
        }
    }

    /**
     * Adds a ship entity into the collective. If the ship has an ID number
     * that is already in use, the add operation is aborted.
     * @param {Ship} ship Ship subject to being added.
     */
    addShip(ship) {
        if (this.#ships[ship.id] !== undefined) {
            console.log(`shipCollective - ERROR: Ship with id ${ship.id} already exists.`);
            return;
        }
        this.#ships[ship.id] = ship;
        ship.addShipLog(`${ship.name} has entered space.`);
        ship.addMissionEvent(`${ship.name} has entered space. Its objective is ${ship.mission.objective}.`);
        addDbShip(ship);
    }

    /**
     * Removes a ship from the collective.
     * @param {Ship} ship Ship subject to being removed.
     */
    removeShip(ship) {
        removeDbShip(ship);
        delete this.#ships[ship.id];
    }

    /**
     * @returns All of the ships in the collective.
     */
    getShips() {
        return this.#ships;
    }

    /**
     * @param {number} id Ship ID number.
     * @returns Ship with matching ID number, or undefined, if it cannot be found.
     */
    getShip(id) {
        return this.#ships[id];
    }

    /**
     * Removes all those ships from the collective that have finished their
     * missions in space.
     */
    removeInboundShips() {
        for (let id in this.#ships) {
            if (this.#ships[id].status === "INBOUND") {
                removeDbShip(this.#ships[id]);
                this.sendShipToSurface(this.#ships[id]);
                delete this.#ships[id];
            }
        }
    }

    /**
     * Attempts to connect "surface" module in order to send an inbound ship
     * back there.
     * @param {*} ship Inbound ship. 
     */
    sendShipToSurface(ship) {
        // TODO
    }
}
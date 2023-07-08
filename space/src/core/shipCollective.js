const delay = ms => new Promise(res => setTimeout(res, ms));

export async function initializeShipCollective() {
    ShipCollective.initialize();
    const SHIP_DATABASE_UPDATE_INTERVAL = 10;
    let i = 1;
    while (true) {
        await delay(1000);
        const ships = ShipCollective.getInstance().getShips();
        for (const shipId in ships) {
            ships[shipId].move();
        }
        ShipCollective.getInstance().removeInboundShips();

        if (i >= SHIP_DATABASE_UPDATE_INTERVAL) {
            i = 1;
            console.log("Updating ship database...");
        }
        i++;
    }
}

export class ShipCollective {
    static #initialized = false;
    static #initializing = false;
    static #collectiveInstance = null;
    #ships = {};

    static initialize() {
        if (!ShipCollective.#initialized) {
            ShipCollective.#initializing = true;
            ShipCollective.#collectiveInstance = new ShipCollective();
            ShipCollective.#initializing = false;
            ShipCollective.#initialized = true;
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
        ship.addShipLog(`Ship '${ship.name}' has entered space.`);
        ship.addMissionEvent(`Ship '${ship.name}' has entered space. Its objective is ${ship.mission.objective}.`);
    }

    removeShip(ship) {
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
                delete this.#ships[id];
            }
        }
    }
}
const delay = ms => new Promise(res => setTimeout(res, ms));

export async function initializeShipCollective() {
    ShipCollective.initialize();
    while (true) {
        await delay(1000);
        const ships = ShipCollective.getInstance().getShips();
        for (const ship of ships.values()) {
            ship.move();
        }
        ShipCollective.getInstance().removeInboundShips();
    }
}

export class ShipCollective {
    static #initialized = false;
    static #initializing = false;
    static #collectiveInstance = null;
    #ships = new Map();

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
        if (this.#ships.get(ship.id) !== undefined) {
            console.log(`ERROR: Ship with id ${ship.id} already exists.`);
            return;
        }
        this.#ships.set(ship.id, ship);
        ship.addShipLog(`Ship '${ship.name}' has entered space.`);
        ship.addMissionEvent(`Ship '${ship.name}' has entered space. Its objective is ${ship.mission.objective}.`);
    }

    removeShip(ship) {
        this.#ships.delete(ship.id);
    }

    getShips() {
        return this.#ships;
    }

    getShip(id) {
        return this.#ships.get(id);
    }

    removeInboundShips() {
        let ids = this.#ships.keys();
        for (const id of ids) {
            if (this.#ships.get(id).status === "INBOUND") {
                this.#ships.delete(id);
            }
        }
    }
}
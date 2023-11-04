import express from "express";

import { Ship } from "../core/ship.js";
import { ShipCollective } from "../core/shipCollective.js";

export var shipController = express.Router();

shipController.use(express.json());

shipController.get("/", (request, response) => {
    response.json(ShipCollective.getInstance().getShips());
});

shipController.get("/logs/", (request, response) => {
    let ships = ShipCollective.getInstance().getShips();
    let logs = []
    for (const shipId in ships) {
        const ship = ships[shipId];
        logs.push(...ship.logs);
    }
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    let selectedLogs = logs;

    const pageStr = request.query["page"];
    if (pageStr !== "all") {
        const page = Number(pageStr);
        if (page !== NaN) {
            const quantity = 10;
            selectedLogs = logs.slice(page * quantity, (page + 1) * quantity);
        }
    }
    response.json(selectedLogs);
});

shipController.get("/missions/", (request, response) => {
    let ships = ShipCollective.getInstance().getShips();
    let missions = []
    for (const shipId in ships) {
        const mission = ships[shipId].mission;
        missions.push(mission);
    }
    missions.sort((a, b) => b.id - a.id);
    let selectedMissions = missions;

    const pageStr = request.query["page"];
    if (pageStr !== "all") {
        const page = Number(pageStr);
        if (page !== NaN) {
            const quantity = 10;
            selectedMissions = missions.slice(page * quantity, (page + 1) * quantity);
        }
    }
    response.json(selectedMissions);
});

shipController.get("/mission-events/", (request, response) => {
    let ships = ShipCollective.getInstance().getShips();
    let events = []
    for (const shipId in ships) {
        const mission = ships[shipId].mission;
        events.push(...mission.events);
    }
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    let selectedEvents = events;

    const pageStr = request.query["page"];
    if (pageStr !== "all") {
        const page = Number(pageStr);
        if (page !== NaN) {
            const quantity = 10;
            selectedEvents = events.slice(page * quantity, (page + 1) * quantity);
        }
    }
    response.json(selectedEvents);
});

shipController.get("/:id", (request, response) => {
    response.json(ShipCollective.getInstance().getShips()[request.params.id]);
});

shipController.post("/", (request, response) => {
    ShipCollective.getInstance().addShip(new Ship(request.body));
    response.json(request.body);
});
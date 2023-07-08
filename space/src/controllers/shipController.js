import express from "express";

import { Ship } from "../core/ship.js";
import { ShipCollective } from "../core/shipCollective.js";
import { mapReplacer } from "../util.js";

export var shipController = express.Router();

shipController.use(express.json());

shipController.get("/", (request, response) => {
    response.json(JSON.stringify(ShipCollective.getInstance().getShips(), mapReplacer));
});

shipController.get("/:id([0-9])", (request, response) => {

});

shipController.post("/", (request, response) => {
    ShipCollective.getInstance().addShip(new Ship(request.body));
    response.json(request.body);
});
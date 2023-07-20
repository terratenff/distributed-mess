import express from "express";

import { Ship } from "../core/ship.js";
import { ShipCollective } from "../core/shipCollective.js";

export var shipController = express.Router();

shipController.use(express.json());

shipController.get("/", (request, response) => {
    response.json(ShipCollective.getInstance().getShips());
});

shipController.get("/:id([0-9])", (request, response) => {
    response.json(ShipCollective.getInstance().getShips()[request.params.id]);
});

shipController.post("/", (request, response) => {
    ShipCollective.getInstance().addShip(new Ship(request.body));
    response.json(request.body);
});
import express from "express";

import { Space } from "../core/space.js";

export var spaceController = express.Router();

spaceController.use(express.json());

spaceController.get("/", (request, response) => {
    response.json(Space.getPoints());
});

import { initializeShipCollective } from "./core/shipCollective.js";
import { initializeSpace } from "./core/space.js";

import { shipController } from "./controllers/shipController.js";
import { spaceController } from "./controllers/spaceController.js";

import express from "express";
var app = express();

var requestCount = 0;

app.use("/ships", shipController);
app.use("/space", spaceController);

app.use(express.json());

app.use((request, response, next) => {
    requestCount++;
    next();
});

app.get("/", (request, response) => {
    const generalData = {
        requestCount: requestCount,
        activeShips: 0,
        destroyedShips: 0
    };
    response.json(generalData);
});

// Initializing ship and space related functions.
initializeShipCollective();
initializeSpace();
app.listen(3000);

import { Space } from "./space.js";
import { Mission } from "./mission.js";
import { currentDate } from "../util.js";

const DETECTION_RANGE = 10.0;

export class Ship {
    id = 0;
    name = "Sample Ship";
    description = "Sample Ship Description";
    status = "ACTIVE";
    condition = 100;
    mission = null;
    logs = []
    position = {x: 0, y: 0, z: 0};
    currentDestination = {x: 0, y: 0, z: 0};
    directionVector = {x: 0, y: 0, z: 0};
    destinations = [];
    distanceToDestination = 0.0;
    prospectiveSpacePoints = [];

    constructor(shipData) {
        this.id = shipData.id;
        this.name = shipData.name;
        this.description = shipData.description;
        this.status = "ACTIVE";
        this.condition = shipData.condition;
        this.mission = new Mission(shipData.mission);
        this.logs = shipData.logs;

        this.generateDestinations();
        this.generateProspectiveSpacePoints();
        this.calculateDirectionVector();
    }

    getData() {
        return {
            name: this.name,
            description: this.description,
            condition: this.condition,
            mission: this.mission
        };
    }

    addMissionEvent(eventMsg) {
        this.mission.addEvent(eventMsg);
        console.log(eventMsg);
    }

    addShipLog(shipLog) {
        this.logs.push({"timestamp": currentDate(), "description": shipLog});
    }

    generateDestinations() {
        for (var i = 0; i < 5; i++) {
            while (true) {
                const x1 = this.mission.center["x"];
                const y1 = this.mission.center["y"];
                const z1 = this.mission.center["z"];
                const x2 = x1 + Math.floor(Math.random() * 2 * this.mission.radius) - this.mission.radius;
                const y2 = y1 + Math.floor(Math.random() * 2 * this.mission.radius) - this.mission.radius;
                const z2 = z1 + Math.floor(Math.random() * 2 * this.mission.radius) - this.mission.radius;
                let destination = {
                    x: x2,
                    y: y2,
                    z: z2
                };

                const d = Math.sqrt(
                    Math.pow(x2 - x1, 2) +
                    Math.pow(y2 - y1, 2) + 
                    Math.pow(z2 - z1, 2)
                );
                
                if (d < this.mission.radius) {
                    this.destinations.push(destination);
                    break;
                }
            }
        }

        this.currentDestination = this.destinations[0];
    }

    generateProspectiveSpacePoints() {
        this.prospectiveSpacePoints = Space.getNearbyPoints(
            this.mission.center,
            this.mission.radius
        );
    }

    calculateDirectionVector() {
        const x1 = this.position["x"];
        const y1 = this.position["y"];
        const z1 = this.position["z"];
        const x2 = this.currentDestination["x"];
        const y2 = this.currentDestination["y"];
        const z2 = this.currentDestination["z"];

        const d = Math.sqrt(
            Math.pow(x2 - x1, 2) +
            Math.pow(y2 - y1, 2) + 
            Math.pow(z2 - z1, 2)
        );

        this.directionVector["x"] = (x2 - x1) / d;
        this.directionVector["y"] = (y2 - y1) / d;
        this.directionVector["z"] = (z2 - z1) / d;
    }

    getNearbyProspectiveSpacePoints() {
        return Space.getNearbyPoints(
            this.position,
            DETECTION_RANGE,
            this.prospectiveSpacePoints
        );
    }

    isNearDestination() {
        const x1 = this.position["x"];
        const y1 = this.position["y"];
        const z1 = this.position["z"];
        const x2 = this.currentDestination["x"];
        const y2 = this.currentDestination["y"];
        const z2 = this.currentDestination["z"];

        const d = Math.sqrt(
            Math.pow(x2 - x1, 2) +
            Math.pow(y2 - y1, 2) + 
            Math.pow(z2 - z1, 2)
        );

        if (d > this.distanceToDestination) {
            this.calculateDirectionVector();
        }

        this.distanceToDestination = d;

        return d < DETECTION_RANGE;
    }

    move() {
        if (this.status === "INBOUND") {
            return;
        }
        this.position["x"] += this.directionVector["x"];
        this.position["y"] += this.directionVector["y"];
        this.position["z"] += this.directionVector["z"];

        const nearbyPoints = this.getNearbyProspectiveSpacePoints();
        
        if (this.isNearDestination() && this.status === "INBOUND_SPACE") {

            this.status = "INBOUND";
            this.addMissionEvent(`Ship '${this.name}' has left space. It is now inbound.`);

        } else if (nearbyPoints.length > 0) {

            const pointCount = nearbyPoints.length;
            const selectedIndex = Math.floor(Math.random() * 2 * pointCount) - pointCount;
            const point = this.prospectiveSpacePoints[selectedIndex];
            this.prospectiveSpacePoints.splice(selectedIndex, 1);

            this.addMissionEvent(`Ship ${this.name} has discovered space point ${point.name}!`);
            Space.addVisitCount(point);

        } else if (this.isNearDestination()) {

            const arrivalPoint = this.destinations.shift();
            const coordinateString = `(${arrivalPoint.x}, ${arrivalPoint.y}, ${arrivalPoint.z})`;

            if (this.destinations.length === 0) {
                this.destinations.push({"x": 0.0, "y": 0.0, "z": 0.0});
                this.status = "INBOUND_SPACE";
                this.addMissionEvent(`Ship '${this.name}' has arrived at its final subdestination coordinates ${coordinateString}, and is now returning.`)
            } else {
                this.addMissionEvent(`Ship '${this.name}' has arrived at subdestination coordinates ${coordinateString}.`);
            }

            this.calculateDirectionVector();
            this.currentDestination = this.destinations[0];

        }
    }
}
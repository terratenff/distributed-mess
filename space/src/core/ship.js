import { Space } from "./space.js";
import { Mission } from "./mission.js";
import { currentDate } from "../util.js";

const SUBDESTINATION_FACTOR = 5;
const DETECTION_RANGE = 10.0;
const SCAN_DETECTION_RANGE = 30.0;
const SCAN_FREQUENCY = 25;
const VELOCITY = 5;

export class Ship {

    static useDb = true;

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
    spacePointScanCounter = 0;

    constructor(shipData) {
        this.id = shipData.id;
        this.name = shipData.name;
        this.description = shipData.description;
        this.status = "ACTIVE";
        this.condition = shipData.condition;
        this.mission = new Mission(shipData.mission);
        this.logs = shipData.logs;

        if (shipData.position !== undefined && shipData.position !== null) {
            this.position = shipData.position;
        }

        if (shipData.destinations !== undefined && shipData.destinations !== null &&
            shipData.currentDestination !== undefined && shipData.currentDestination !== null) {
            this.destinations = shipData.destinations;
            this.currentDestination = shipData.currentDestination;
        } else {
            this.generateDestinations();
        }

        if (shipData.prospectiveSpacePoints !== undefined &&
            shipData.prospectiveSpacePoints !== null) {
            this.prospectiveSpacePoints = shipData.prospectiveSpacePoints;
        } else {
            this.generateProspectiveSpacePoints();
        }

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
        const subdestinationCount = Math.ceil(this.mission.radius / SUBDESTINATION_FACTOR);
        for (var i = 0; i < subdestinationCount; i++) {
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
        if (this.spacePointScanCounter >= SCAN_FREQUENCY) {

            this.spacePointScanCounter = 0;
            return Space.getNearbyPoints(
                this.position,
                SCAN_DETECTION_RANGE
            );

        } else {

            ++this.spacePointScanCounter;
            return Space.getNearbyPoints(
                this.position,
                DETECTION_RANGE,
                this.prospectiveSpacePoints
            );

        }
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
        this.position["x"] += this.directionVector["x"] * VELOCITY;
        this.position["y"] += this.directionVector["y"] * VELOCITY;
        this.position["z"] += this.directionVector["z"] * VELOCITY;

        const nearbyPoints = this.getNearbyProspectiveSpacePoints();
        
        if (this.isNearDestination() && this.status === "INBOUND_SPACE") {

            this.status = "INBOUND";
            this.addMissionEvent(`Ship ${this.name} has left space. It is now inbound.`);

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
                this.addMissionEvent(`Ship ${this.name} has arrived at its final subdestination coordinates ${coordinateString}, and is now returning.`)
            } else {
                this.addMissionEvent(`Ship ${this.name} has arrived at subdestination coordinates ${coordinateString}.`);
            }

            this.calculateDirectionVector();
            this.currentDestination = this.destinations[0];

        }
    }
}
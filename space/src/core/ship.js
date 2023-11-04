import { Space } from "./space.js";
import { Mission } from "./mission.js";
import { currentDate, randomInteger } from "../util.js";
import { createShipLogMessage, createMissionEventMessage } from "./logDistributor.js";

const SUBDESTINATION_FACTOR = 5;
const DETECTION_RANGE = 10.0;
const SCAN_DETECTION_RANGE = 30.0;
const SCAN_FREQUENCY = 25;
const VELOCITY = 5;
const CONDITION_DEGRADATION_PROBABILITY = 0.001;
const SHIP_LOG_PROBABILITY = 0.0001;
const MISSION_EVENT_PROBABILITY = 0.0001;

/**
 * Ship entity representation. It simulates movement in space.
 */
export class Ship {

    static useDb = true;

    // Dummy ID values for the surface module, so that data objects have unique IDs.
    static pseudoLogId = -1;

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

    /**
     * Ship entity constructor. Generates destinations and prospective space points
     * if they are not available. Current position is set to (0, 0, 0) if not
     * defined.
     * @param {object} shipData Ship data that the entity is to be based on.
     * The following details are expected:
     * * id
     * * name
     * * description
     * * condition (not peak condition)
     * * mission
     * * position (defaults to origin coordinates)
     * * destinations (randomly generated, if missing)
     * * currentDestinations (randomly generated, if missing)
     * * prospectiveSpacePoints (generated, if missing)
     */
    constructor(shipData) {
        this.id = shipData.id;
        this.name = shipData.name;
        this.description = shipData.description;
        this.status = "ACTIVE";
        this.condition = shipData.condition;
        this.mission = new Mission(shipData.mission);

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

    /**
     * Adds a mission event for the ship's mission.
     * @param {string} eventMsg Event message.
     */
    addMissionEvent(eventMsg) {
        this.mission.addEvent(eventMsg);
        console.log(eventMsg);
    }

    /**
     * Adds a ship log for the ship.
     * @param {string} shipLog Log message.
     */
    addShipLog(shipLog) {
        this.logs.push({"id": Ship.pseudoLogId, "timestamp": currentDate(), "description": shipLog});
        Ship.pseudoLogId -= 1;
    }

    /**
     * Generates random destination coordinates for the ship to follow.
     * The greater the mission radius, the more destinations are created.
     */
    generateDestinations() {
        let subdestinationCount = Math.ceil(this.mission.radius / SUBDESTINATION_FACTOR);
        if (subdestinationCount === 0) {
            subdestinationCount = 1;
        }
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
                
                if (d < this.mission.radius || this.mission.radius < SUBDESTINATION_FACTOR) {
                    this.destinations.push(destination);
                    break;
                }
            }
        }

        this.currentDestination = this.destinations[0];
    }

    /**
     * Generates prospective space points. These are the space points that
     * can be found within the mission area.
     */
    generateProspectiveSpacePoints() {
        this.prospectiveSpacePoints = Space.getNearbyPoints(
            this.mission.center,
            this.mission.radius
        );
    }

    /**
     * Calculates the unit vector that determines what direction the ship should go.
     * It will be aimed at the ship's current destination.
     */
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

        if (d < 1) {
            this.directionVector["x"] = x2 - x1;
            this.directionVector["y"] = y2 - y1;
            this.directionVector["z"] = z2 - z1;
        } else {
            this.directionVector["x"] = (x2 - x1) / d;
            this.directionVector["y"] = (y2 - y1) / d;
            this.directionVector["z"] = (z2 - z1) / d;
        }

    }

    /**
     * Fetches prospective space points that are near the ship, or occasionally
     * any space point that is caught in a scan.
     * @returns Space points that are near the ship.
     */
    getNearbyProspectiveSpacePoints() {
        if (this.spacePointScanCounter >= SCAN_FREQUENCY) {

            // Perform a scan: try to find any nearby space point.
            this.spacePointScanCounter = 0;
            return Space.getNearbyPoints(
                this.position,
                SCAN_DETECTION_RANGE
            );

        } else {

            // Try to find nearby prospective space points.
            ++this.spacePointScanCounter;
            return Space.getNearbyPoints(
                this.position,
                DETECTION_RANGE,
                this.prospectiveSpacePoints
            );

        }
    }

    /**
     * Determines whether ship is near its current destination. Also corrects the ship's
     * direction vector, if distance to current destination increased from previous
     * iteration.
     * @returns true/false.
     */
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

    /**
     * Ship movement iteration function.
     */
    move() {
        if (this.status === "INBOUND") {
            // Ship has left space. Iteration is unnecessary.
            return;
        }

        this.conditionDegradation();

        this.position["x"] += this.directionVector["x"] * VELOCITY;
        this.position["y"] += this.directionVector["y"] * VELOCITY;
        this.position["z"] += this.directionVector["z"] * VELOCITY;

        const nearbyPoints = this.getNearbyProspectiveSpacePoints();
        
        if (this.isNearDestination() && this.status === "INBOUND_SPACE") {

            // Ship has arrived at the space entry point (origin coordinates).
            this.status = "INBOUND";
            this.addMissionEvent(`${this.name} has left space. It is now inbound.`);

        } else if (nearbyPoints.length > 0) {

            // Ship is near prospective space points.
            const pointCount = nearbyPoints.length;
            const selectedIndex = randomInteger(0, pointCount); // Select one random space point.
            const point = this.prospectiveSpacePoints[selectedIndex];
            this.prospectiveSpacePoints.splice(selectedIndex, 1);

            if (point !== undefined && point !== null) {
                this.addMissionEvent(`${this.name} has discovered space point ${point.name}! Total visits: ${point.visit_count}.`);
                Space.addVisitCount(point);
            }

        } else if (this.isNearDestination()) {

            // Ship has arrived at its current destination. Proceed to move on to the next.
            const arrivalPoint = this.destinations.shift();
            const coordinateString = `(${arrivalPoint.x}, ${arrivalPoint.y}, ${arrivalPoint.z})`;

            if (this.destinations.length === 0) {
                this.destinations.push({"x": 0.0, "y": 0.0, "z": 0.0});
                this.status = "INBOUND_SPACE";
                this.addMissionEvent(`${this.name} has arrived at its final subdestination coordinates ${coordinateString}, and is now returning.`)
            } else {
                this.addMissionEvent(`${this.name} has arrived at subdestination coordinates ${coordinateString}.`);
            }

            this.calculateDirectionVector();
            this.currentDestination = this.destinations[0];

        } else {
            this.generateShipLog();
            this.generateMissionEvent();
        }
    }

    /**
     * Roll for condition degradation. On success, reduce condition value by 1.
     */
    conditionDegradation() {
        if (Math.random() < CONDITION_DEGRADATION_PROBABILITY && this.condition > 0) {
            this.condition--;
        }
    }

    /**
     * Roll for ship log. On success, generate a random ship log.
     */
    generateShipLog() {
        if (Math.random() < SHIP_LOG_PROBABILITY) {
            this.addShipLog(createShipLogMessage(this));
        }
    }

    /**
     * Roll for mission event. On success, generate a random mission event.
     */
    generateMissionEvent() {
        if (Math.random() < MISSION_EVENT_PROBABILITY) {
            this.addMissionEvent(createMissionEventMessage(this));
        }
    }
}
import { setupSpace, updateSpacePointVisit } from "./db/dbSpace.js";
import { randomLetters } from "../util.js";

/**
 * Convenience function for delaying execution.
 * @param {number} ms Delay time in milliseconds.
 */
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Initializes space class.
 */
export function initializeSpace() {
    Space.initialize();
}

/**
 * Space. Houses a collection of space points that act as places for ship entities
 * to visit.
 */
export class Space {
    static useDb = true;
    static spacePoints = [];

    /**
     * Initializes space class.
     */
    static async initialize() {
        Space.#initializeSpacePoints();
        if (Space.useDb) {
            Space.spacePoints = await setupSpace(Space.spacePoints, false);
        }
    }

    /**
     * Generates 100 random space points.
     */
    static #initializeSpacePoints() {
        for (var i = 0; i < 100; i++) {
            let spacePoint = {};
            let prefix = randomLetters(3);
            let suffix = Math.floor(Math.random() * 1000).toString();
            spacePoint["name"] = prefix + "-" + suffix;
            spacePoint["x"] = Math.floor(Math.random() * 2000) - 1000;
            spacePoint["y"] = Math.floor(Math.random() * 2000) - 1000;
            spacePoint["z"] = Math.floor(Math.random() * 2000) - 1000;
            spacePoint["visit_count"] = 0;
            this.spacePoints.push(spacePoint);
        }
    }

    /**
     * @returns Space points.
     */
    static getPoints() {
        return this.spacePoints;
    }

    /**
     * Getter for space points that are near specified coordinates.
     * @param {object} coordinates Coordinates from which nearby space points are selected.
     * @param {number} radius Distance to coordinates: a space point is considered near
     * the coordinates if distance between them is less than this.
     * @param {Array<object>} spacePointSet List of space points that the comparison is
     * done on. If not defined, every single space point is checked.
     * @returns List of space points that are considered to be near specified coordinates.
     */
    static getNearbyPoints(coordinates, radius, spacePointSet = null) {
        let nearbyPoints = [];
        let prospectiveSpacePoints = this.spacePoints;

        if (spacePointSet !== undefined && spacePointSet !== null) {
            prospectiveSpacePoints = spacePointSet;
        }

        for (var i = 0; i < prospectiveSpacePoints.length; i++) {
            const spacePoint = prospectiveSpacePoints[i];
            const x1 = coordinates["x"];
            const y1 = coordinates["y"];
            const z1 = coordinates["z"];
            const x2 = spacePoint["x"];
            const y2 = spacePoint["y"];
            const z2 = spacePoint["z"];
            const d = Math.sqrt(
                Math.pow(x2 - x1, 2) +
                Math.pow(y2 - y1, 2) + 
                Math.pow(z2 - z1, 2)
            );
            
            if (radius > d) {
                nearbyPoints.push(spacePoint);
            }
        }

        return nearbyPoints;
    }

    /**
     * Increments selected space point's visit count by 1.
     * @param {object} spacePoint Target space point.
     */
    static addVisitCount(spacePoint) {
        spacePoint.visit_count = spacePoint.visit_count + 1;
        if (Space.useDb) {
            updateSpacePointVisit(spacePoint);
        }
    }
}
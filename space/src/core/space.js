import { setupSpace } from "./db/dbSpace.js";
import { randomLetters } from "../util.js";

export function initializeSpace() {
    Space.initialize();
}

export class Space {
    static useDb = true;
    static spacePoints = [];

    static async initialize() {
        Space.#initializeSpacePoints();
        setupSpace(Space.spacePoints, true);
    }

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

    static getNearbyPoints(coordinates, radius) {
        let nearbyPoints = [];
        for (var i = 0; i < this.spacePoints.length; i++) {
            const spacePoint = this.spacePoints[i];
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
}
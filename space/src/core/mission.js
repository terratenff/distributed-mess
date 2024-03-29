import { currentDate } from "../util.js";

/**
 * Mission entity. Describes what designated ship is supposed to do.
 */
export class Mission {

    // Dummy ID values for the surface module, so that data objects have unique IDs.
    static pseudoEventId = -1;

    id = 0;
    title = "Mission title"
    objective = "Exploration";
    description = "Mission Description";
    center = {x: 0, y: 0, z: 0};
    radius = 0;
    events = [];

    constructor(missionData) {
        this.id = missionData.id;
        this.title = missionData.title;
        this.objective = missionData.objective;
        this.description = missionData.description;
        this.center["x"] = missionData.centerX;
        this.center["y"] = missionData.centerY;
        this.center["z"] = missionData.centerZ;
        this.radius = missionData.radius;
    }

    /**
     * Adds an event for the mission.
     * @param {string} eventDescription Event message.
     */
    addEvent(eventDescription) {
        this.events.push({"id": Mission.pseudoEventId, "timestamp": currentDate(), "description": eventDescription});
        Mission.pseudoEventId -= 1;
    }
}
export class Event {
    id = 0;
    timestamp = null;
    description = "Event Description";

    constructor(id, timestamp, description) {
        this.id = id;
        this.timestamp = timestamp;
        this.description = description;
    }
}
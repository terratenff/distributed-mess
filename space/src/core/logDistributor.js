import { randomInteger } from "../util.js";

export function createShipLogMessage(ship) {
    const i = randomInteger(0, 3);
    switch (i) {
    case 0:
        return `Static noise is received: communication devices on ${ship.name} are experiencing technical difficulties.`;
    case 1:
        return `The crew of ${ship.name} witnesses a breathtaking view of a collection of starts. Crew morale is improved.`;
    case 2:
        return `An asteroid passes by ${ship.name}. There is plenty of distance between the two; nonetheless, the crew is startled.`;
    default:
        if (ship.condition <= 0) {
            return `${ship.name} is malfunctioning, yet it is on course... somehow. The crew is apathetic, as if the end has already come.`;
        } else {
            return `The hull of ${ship.name} is creaking. The crew is attempting to resolve the issue. Duct tape won't last long...`;
        }
    }
}

export function createMissionEventMessage(ship) {
    const i = randomInteger(0, 3);
    switch (i) {
    case 0:
        return `Mission update: ${ship.name} missed a turn, causing a slight delay.`;
    case 1:
        return `Mission update: ${ship.name} found a shortcut through an asteroid field, prompting a foolhardy endeavor.`;
    case 2:
        return `Mission update: The crew of ${ship.name} thought to have sighted another ship in the distance. Turns out it was a star.`;
    default:
        if (ship.condition <= 0) {
            return `The mission is proceeding smoothly, despite ${ship.name} being effectively broken.`;
        } else {
            return `The mission, undertaken by ${ship.name}, is proceeding smoothly.`;
        }
    }
}
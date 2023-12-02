import { sleep } from "../../util.js";
import { establishConnection } from "./dbCommon.js";

import { Ship } from "../ship.js";

const TABLE_NAME = "ships";

/**
 * Initializes ships. If a database is used, initialization is done by fetching
 * every row and converting them into ship entities that continue from where they
 * left off. If database is not used, empty map of ships is returned.
 * @param {boolean} reset If true, recreates the ships table, removing ship
 * data in the process. This is relevant only if a database is used.
 * @returns Ships that are saved in a database, or an empty map.
 */
export async function setupShips(reset) {
    let alreadyInitialized = false;
    let returnShips = {};

    if (reset === true && Ship.useDb) {
        resetShips();

        // NOTE: This is a hacky fix to an issue where sequential operations on
        // MySQL database could not be accomplished.
        await sleep(100);
    }

    if (Ship.useDb) {
        alreadyInitialized = await createTable();
    
        if (alreadyInitialized) {
            returnShips = await getShips();
        }
    }

    return returnShips;
}

/**
 * Removes ships table from the database.
 */
async function resetShips() {
    let sqlStr = `DROP TABLE IF EXISTS ${TABLE_NAME};`;
    console.log("dbShip - Resetting ships...");

    let con = await establishConnection();

    await con.query(sqlStr).then(() => {
        console.log("dbShip - Reset done.");
    });

    con.end();
}

/**
 * Creates ships table for the database.
 * @returns true, if the table already existed. false otherwise.
 */
async function createTable() {
    console.log("dbShip - Initializing ships...");
    let sqlStr = `CREATE TABLE ${TABLE_NAME} (
        id INTEGER,
        name VARCHAR(255),
        description VARCHAR(255),
        status VARCHAR(255),
        current_condition INTEGER,
        mission JSON,
        logs JSON,
        position JSON,
        current_destination JSON,
        destinations JSON,
        prospective_space_points JSON
    );`;

    let alreadyInitialized = false;
    let con = await establishConnection();

    await con.query(sqlStr).catch(() => {
        console.log("dbShip - Table exists.");
        alreadyInitialized = true;
    }).finally(() => {
        console.log("dbShip - Creation done.");
    });

    con.end();
    return alreadyInitialized;
}

/**
 * Adds a ship entity to the database.
 * @param {Ship} ship Ship to be added.
 */
export async function addShip(ship) {

    if (!Ship.useDb) {
        return;
    }

    console.log("dbShip - Adding ship...");
    let sqlStr = `INSERT INTO ${TABLE_NAME} (
        id,
        name,
        description,
        status,
        current_condition,
        mission,
        logs,
        position,
        current_destination,
        destinations,
        prospective_space_points
    ) 
    VALUES (
        ${ship.id},
        '${ship.name}',
        '${ship.description}',
        '${ship.status}',
        ${ship.condition},
        '${JSON.stringify(ship.mission)}',
        '${JSON.stringify(ship.logs)}',
        '${JSON.stringify(ship.position)}',
        '${JSON.stringify(ship.currentDestination)}',
        '${JSON.stringify(ship.destinations)}',
        '${JSON.stringify(ship.prospectiveSpacePoints)}'
    );`;
    
    let con = await establishConnection();

    await con.query(sqlStr).catch((err) => {
        throw err;
    }).finally(() => {
        console.log("dbShip - Ship added.");
    });

    con.end();
}

/**
 * Removes a ship entity from the database.
 * @param {Ship} ship Ship to be removed. Its ID is used to search and remove.
 */
export async function removeShip(ship) {

    if (!Ship.useDb) {
        return;
    }

    console.log("dbShip - Removing ship...");
    let sqlStr = `DELETE FROM ${TABLE_NAME} WHERE id = ${ship.id}`;

    let con = await establishConnection();
    
    await con.query(sqlStr).catch((err) => {
        if (err) throw err;
        else {
            console.log(`dbShip - Ship '${ship.name}' updated.`);
        }
    });

    con.end();
}

/**
 * Fetches every ship entity from the database.
 * @returns All rows from table "ships".
 */
async function getShips() {
    console.log("dbShip - Fetching Ships...");
    let sqlStr = `SELECT * FROM ${TABLE_NAME};`;

    let con = await establishConnection();

    let [rows] = await con.query(sqlStr).catch((err) => {
        if (err) throw err;
    }).finally(() => {
        console.log("dbShip - Ship fetching done.");
    });

    con.end();

    let results = {};
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        row.mission.centerX = row.mission.center.x;
        row.mission.centerY = row.mission.center.y;
        row.mission.centerZ = row.mission.center.z;
        row.condition = row.current_condition;
        results[row.id] = new Ship(row);
    }
    
    return results;
}

/**
 * Updates selected ships. Ship ID numbers are used to match them.
 * @param {Map<number, Ship>} ships Ship entities (keys are ships' ID numbers) that
 * are to be updated.
 */
export async function updateShips(ships) {

    if (!Ship.useDb) {
        return;
    }

    console.log("dbShip - Updating ships...");

    if (ships.length === 0) {
        console.log("dbShip - No ships to update.");
        return;
    }

    let con = await establishConnection();
    
    for (const shipId in ships) {
        const ship = ships[shipId];
        let sqlStr = `UPDATE ${TABLE_NAME} 
        SET 
        name = '${ship.name}',
        description = '${ship.description}',
        status = '${ship.status}',
        current_condition = ${ship.condition},
        mission = '${JSON.stringify(ship.mission)}',
        logs = '${JSON.stringify(ship.logs)}',
        position = '${JSON.stringify(ship.position)}',
        current_destination = '${JSON.stringify(ship.currentDestination)}',
        destinations = '${JSON.stringify(ship.destinations)}',
        prospective_space_points = '${JSON.stringify(ship.prospectiveSpacePoints)}'
        WHERE 
        id = ${ship.id}`;
    
        await con.query(sqlStr).catch((err) => {
            if (err) throw err;
            else {
                console.log(`dbShip - Ship '${ship.name}' updated.`);
            }
        });
    }

    con.end();
}
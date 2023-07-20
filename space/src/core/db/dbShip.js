import { sleep } from "../../util.js";
import { establishConnection } from "./dbCommon.js";

import { Ship } from "../ship.js";

const TABLE_NAME = "ships";

export async function setupShips(reset) {
    let alreadyInitialized = false;
    let returnShips = {};

    if (reset === true) {
        resetShips();

        // NOTE: This is a hacky fix to an issue where sequential operations on
        // MySQL database could not be accomplished.
        await sleep(100);
    }

    alreadyInitialized = await createTable();

    if (alreadyInitialized) {
        returnShips = await getShips();
    }

    return returnShips;
}

async function resetShips() {
    let sqlStr = `DROP TABLE IF EXISTS ${TABLE_NAME};`;
    console.log("dbShip - Resetting ships...");

    let con = await establishConnection();

    await con.query(sqlStr).then(() => {
        console.log("dbShip - Reset done.");
    });

    con.end();
}

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

export async function addShip(ship) {
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

export async function removeShip(ship) {
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

export async function updateShips(ships) {
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
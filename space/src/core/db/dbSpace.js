import { sleep } from "../../util.js";
import { establishConnection } from "./dbCommon.js";

import { Space } from "../space.js";

const TABLE_NAME = "space";

/**
 * Initializes space points. If a database is used, initialization is done by fetching
 * every row and converting them into space points. If database is not used,
 * 100 randomly generated space points are returned.
 * @param {Array<object>} spacePoints Space points that are utilized if space table
 * does not exist, or if a database is not used.
 * @param {boolean} reset If true, recreates the space table, removing space
 * point data in the process. This is relevant only if a database is used.
 * @returns Space points that are saved in a database, or provided space points.
 */
export async function setupSpace(spacePoints, reset) {

    let alreadyInitialized = false;
    let returnSpacePoints = [];

    if (reset === true) {
        resetSpace();

        // NOTE: This is a hacky fix to an issue where sequential operations on
        // MySQL database could not be accomplished.
        await sleep(100);
    }

    if (Space.useDb) {
        alreadyInitialized = await createTable();
    
        if (alreadyInitialized) {
            returnSpacePoints = getSpacePoints();
        } else {
            returnSpacePoints = spacePoints;
            populateSpace(spacePoints);
        }
        
    } else {
        returnSpacePoints = spacePoints;
    }

    return returnSpacePoints;
}

/**
 * Removes space point table from the database.
 */
async function resetSpace() {
    let sqlStr = `DROP TABLE IF EXISTS ${TABLE_NAME};`;
    console.log("dbSpace - Resetting space...");

    let con = await establishConnection();

    await con.query(sqlStr).then(() => {
        console.log("dbSpace - Reset done.");
    });

    con.end();
}

/**
 * Creates space table for the database.
 * @returns true, if the table already existed. false otherwise.
 */
async function createTable() {
    let sqlStr = `CREATE TABLE ${TABLE_NAME} (name VARCHAR(30), x INTEGER, y INTEGER, z INTEGER, visit_count INTEGER);`;
    console.log("dbSpace - Initializing space...");

    let alreadyInitialized = false;
    let con = await establishConnection();

    await con.query(sqlStr).catch(() => {
        console.log("dbSpace - Table exists.");
        alreadyInitialized = true;
    }).finally(() => {
        console.log("dbSpace - Creation done.");
    });

    con.end();
    return alreadyInitialized;
}

/**
 * Adds specified space points to the database.
 * @param {Array<object>} spacePoints Space points to be added.
 */
async function populateSpace(spacePoints) {
    console.log("dbSpace - Populating space...");
    let sqlStr = `INSERT INTO ${TABLE_NAME} VALUES `;
    spacePoints.forEach(spacePoint => {
        sqlStr += `('${spacePoint.name}', ${spacePoint.x}, ${spacePoint.y}, ${spacePoint.z}, ${spacePoint.visit_count}), `;
    });
    sqlStr += ";";
    sqlStr = sqlStr.replace("), ;", ");");

    let con = await establishConnection();

    await con.query(sqlStr).catch((err) => {
        throw err;
    }).finally(() => {
        console.log("dbSpace - Population done.");
    });

    con.end();
}

/**
 * Fetches every space point from the database.
 * @returns All rows from table "space".
 */
async function getSpacePoints() {
    console.log("dbSpace - Fetching space...");
    let sqlStr = `SELECT * FROM ${TABLE_NAME};`;

    let con = await establishConnection();

    let [rows] = await con.query(sqlStr).catch((err) => {
        if (err) throw err;
    }).finally(() => {
        console.log("dbSpace - Space fetching done.");
    });

    con.end();
    return rows;
}

/**
 * Increments visit count on specified space point.
 * @param {object} spacePoint Target space point.
 */
export async function updateSpacePointVisit(spacePoint) {
    console.log("dbSpace - Adding a visit to a space point...");
    let sqlStr = `UPDATE ${TABLE_NAME} SET visit_count = ${spacePoint.visit_count} WHERE name = '${spacePoint.name}'`;

    let con = await establishConnection();

    await con.query(sqlStr).catch((err) => {
        if (err) throw err;
        else {
            console.log(`dbSpace - Visit to ${spacePoint.name} has been recorded. It has been visited ${spacePoint.visit_count} times.`);
        }
    });

    con.end();
}
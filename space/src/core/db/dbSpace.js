import { sleep } from "../../util.js";
import { establishConnection } from "./dbCommon.js";

const TABLE_NAME = "space";

export async function setupSpace(spacePoints, reset) {

    let alreadyInitialized = false;
    let returnSpacePoints = [];

    if (reset === true) {
        resetSpace();

        // NOTE: This is a hacky fix to an issue where sequential operations on
        // MySQL database could not be accomplished.
        await sleep(100);
    }

    alreadyInitialized = await createTable();

    if (alreadyInitialized) {
        returnSpacePoints = getSpacePoints();
    } else {
        returnSpacePoints = spacePoints;
        populateSpace(spacePoints);
    }
}

async function resetSpace() {
    let sqlStr = `DROP TABLE IF EXISTS ${TABLE_NAME};`;
    console.log("dbSpace - Resetting space...");

    let alreadyInitialized = false;
    let con = await establishConnection();

    await con.query(sqlStr).then(() => {
        console.log("Reset done.");
    });

    con.end();
    return alreadyInitialized;
}

async function createTable() {
    let sqlStr = `CREATE TABLE ${TABLE_NAME} (name VARCHAR(30), x INTEGER, y INTEGER, z INTEGER, visit_count INTEGER);`;
    console.log("dbSpace - Initializing space...");

    let alreadyInitialized = false;
    let con = await establishConnection();

    await con.query(sqlStr).catch(() => {
        console.log("Table exists.");
        alreadyInitialized = true;
    }).finally(() => {
        console.log("Creation done.");
    });

    con.end();
    return alreadyInitialized;
}

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
        console.log("Population done.");
    });

    con.end();
}

async function getSpacePoints() {
    console.log("dbSpace - Fetching space...");
    let sqlStr = "SELECT * FROM space;";

    let con = await establishConnection();

    let [rows] = await con.query(sqlStr).catch((err) => {
        if (err) throw err;
    });

    con.end();
    return rows;
}

export async function updateSpacePointVisit(spacePoint) {
    console.log("dbSpace - Adding a visit to a space point...");
    let sqlStr = `UPDATE space SET visit_count = ${spacePoint.visit_count} WHERE name = '${spacePoint.name}'`;

    let con = await establishConnection();

    await con.query(sqlStr).catch((err) => {
        if (err) throw err;
        else {
            console.log(`Visit to ${spacePoint.name} has been recorded. It has been visited ${spacePoint.visit_count} times.`);
        }
    });

    con.end();
}
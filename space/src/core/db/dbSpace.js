import mysql from "mysql2";

import { establishConnection } from "./dbCommon.js";

const TABLE_NAME = "space";

export async function setupSpace(reset) {
    if (reset === true) {
        resetSpace();
    }

    let sqlStr = `CREATE TABLE ${TABLE_NAME} (name VARCHAR(30), x INTEGER, y INTEGER, z INTEGER, visit_count INTEGER);`;
    console.log("dbSpace - Initializing space...");
    let alreadyInitialized = false;

    let con = establishConnection();

    con.query(sqlStr, function(err, result) {
        if (err) {
            alreadyInitialized = true;
        };
    });

    con.end();

    return alreadyInitialized;
}

export function resetSpace() {
    let sqlStr = `DROP TABLE IF EXISTS ${TABLE_NAME};`;
    console.log("dbSpace - Resetting space...");

    let con = establishConnection();

    con.query(sqlStr, function(err, result) {
        if (err) {
            alreadyInitialized = true;
        };
    });

    con.end();
}

export function populateSpace(spacePoints) {
    console.log("dbSpace - Populating space...");
    let sqlStr = `INSERT INTO ${TABLE_NAME} VALUES `;
    spacePoints.forEach(spacePoint => {
        sqlStr += `('${spacePoint.name}', ${spacePoint.x}, ${spacePoint.y}, ${spacePoint.z}), `;
    });
    sqlStr += ";";
    sqlStr = sqlStr.replace("), ;", ");");

    let con = establishConnection();

    con.query(sqlStr, function(err, result) {
        if (err) throw err;
    });

    con.end();
}

export function getSpacePoints() {
    console.log("dbSpace - Fetching space...");
    let sqlStr = "SELECT * FROM space;";

    let con = establishConnection();

    con.query(sqlStr, function(err, result, fields) {
        if (err) throw err;
    });

    con.end();

    return [];
}

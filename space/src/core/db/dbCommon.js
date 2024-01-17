import mysql from "mysql2/promise";

import { sleep } from "../../util.js";
import { Space } from "../space.js";
import { Ship } from "../ship.js";

import config from "../../config.js";

const HOST = config.host;
const PORT = config.port;
const USER = config.user;
const PASSWORD = config.password;
const DATABASE = config.database;

const CHECK_CONNECTION_ATTEMPTS = 5;
const CHECK_CONNECTION_DELAY = 1000;

/**
 * Checks whether it is possible to connect to the database.
 * If connecting to the database has failed, the application has switched
 * to offline mode, in which case this function does nothing.
 */
export async function checkConnection() {

    // Check first if the application is in offline mode.
    if (!Space.useDb || !Ship.useDb) {
        return;
    }

    for (let i = 0; i <= CHECK_CONNECTION_ATTEMPTS; i++) {
        let con = await establishConnection();
        if (con !== null) {
            con.end();
            Space.useDb = true;
            Ship.useDb = true;
            return;
        }

        if (i !== CHECK_CONNECTION_ATTEMPTS) {
            console.log(`dbCommon - Could not connect to database. Attempting to reconnect ${CHECK_CONNECTION_ATTEMPTS - i} more times.`);
            await sleep(CHECK_CONNECTION_DELAY);
        }
    }
    console.log("dbCommon - Attempts to connect to database have failed. Switching to offline mode.");
}

/**
 * Creates a connection to the database. If this fails,
 * database-related functions are disabled for the session.
 * @returns Connection to the database, or null if the connection failed.
 */
export async function establishConnection() {

    const hideErrorMsg = !Space.useDb || Ship.useDb;

    let con = null;
    try {
        con = await mysql.createConnection({
            host: HOST,
            port: PORT,
            user: USER,
            password: PASSWORD,
            database: DATABASE
        });
    } catch (err) {
        Space.useDb = false;
        Ship.useDb = false;
        if (!hideErrorMsg) {
            console.log("dbCommon - ERROR: Could not connect to database (Connection refused). "
             + "Ships and space points will not be saved for this session.")
        }
    }

    if (con !== null) {
        await con.connect(function(err) {
            if (err) {
                Space.useDb = false;
                Ship.useDb = false;
                if (!hideErrorMsg) {
                    console.log("dbCommon - ERROR: Could not connect to database. "
                    + "Ships and space points will not be saved for this session.");
                }
                con = null;
            }
        });
    }

    return con;
}
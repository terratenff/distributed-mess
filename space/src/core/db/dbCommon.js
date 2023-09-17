import mysql from "mysql2/promise";

import { sleep } from "../../util.js";
import { Space } from "../space.js";
import { Ship } from "../ship.js";

// Development configuration.
//const HOST = "localhost";
//const PORT = 8004;

const HOST = "dbs";
const PORT = 3306;
const USER = "sample-user";
const PASSWORD = "sample-password";
const DATABASE = "sample-db";

const CHECK_CONNECTION_ATTEMPTS = 5;
const CHECK_CONNECTION_DELAY = 1000;

/**
 * Checks whether it is possible to connect to the database.
 * @returns true, if connection can be made. false otherwise.
 */
export async function checkConnection() {
    for (const i = 0; i < CHECK_CONNECTION_ATTEMPTS; i++) {
        let con = await establishConnection();
        if (con !== null) {
            con.end();
            return true;
        }

        if (i !== CHECK_CONNECTION_ATTEMPTS - 1) {
            sleep(CHECK_CONNECTION_DELAY);
        }
    }

    return false;
}

/**
 * Creates a connection to the database. If this fails,
 * database-related functions are disabled for the session.
 * @returns Connection to the database, or null if the connection failed.
 */
export async function establishConnection() {
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
        console.log("ERROR: Could not connect to database (Connection refused). "
         + "Ships and space points will not be saved for this session.")
    }

    if (con !== null) {
        await con.connect(function(err) {
            if (err) {
                Space.useDb = false;
                Ship.useDb = false;
                console.log("ERROR: Could not connect to database. "
                + "Ships and space points will not be saved for this session.");
                con = null;
            }
        });
    }

    return con;
}
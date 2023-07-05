import mysql from "mysql2/promise";

import { Space } from "../space.js";

const HOST = "localhost";
const PORT = 8004;
const USER = "sample-user";
const PASSWORD = "sample-password";
const DATABASE = "sample-db";

export async function establishConnection() {
    var con = await mysql.createConnection({
        host: HOST,
        port: PORT,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    await con.connect(function(err) {
        if (err) {
            Space.useDb = false;
            console.log("ERROR: Could not connect to database.");
        }
    });

    return con;
}